from models import *
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
from fastapi.middleware.cors import CORSMiddleware
import database as db
from typing import List
from random import shuffle

app = FastAPI()

origins = [
    "http://localhost:3000",
    "localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

oauth2_sceme = OAuth2PasswordBearer(tokenUrl="token")

# JWT Configuration
SECRET_KEY = "da37c6dab39d3e7bef899734d9157dec16473455c6c177187c9391e80518854b"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


def verify_token(token: str = Depends(oauth2_sceme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"}
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
       
        if username is None:
            raise credentials_exception
        
        print("Verified")
        return payload
    
    except JWTError:
        print("rejected verification")
        raise credentials_exception
    

def format_to_datetime(article_dt: str):
    dt = datetime.strptime(article_dt, "%Y-%m-%dT%H:%M:%SZ")
    formatted_time = dt.strftime("%d/%m/%Y, %I:%M %p") + " EEST"
    return formatted_time


@app.get("/feed", response_model=List[List[Article]])
def retrieve_feed(category: str = "latest", filter: str = "all", current_user: dict = Depends(verify_token)):
    print(category, filter)
    feed: List = db.get_feed(category, filter)

    for f in feed:
        f["datetime"] = format_to_datetime(f["datetime"]["$date"])

    articles = [Article(**a) for a in feed]
    splitted_articles = [articles[i:i+10] for i in range(0, len(articles), 10)]

    return splitted_articles


@app.get("/article/{aid}", response_model=Article)
def retrieve_article(aid: str):
    response = db.get_article(aid)

    if response:
        raise HTTPException(status_code=400, detail=f"Did not find article with aid = [{aid}]")

    response["datetime"] = format_to_datetime(response["datetime"]["$date"])
    

    return Article(response)


@app.post("/register")
def register_user(user: User):
    db_user = db.find_user_by_username(user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered!")
    
    response = db.create_user(user)
    return {"Registered": "OK!"}


@app.post("/token")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    print("here", form_data.username)
    user = db.authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    access_token = create_access_token(
        data={"sub": user['username']}
    )

    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/verify-token/{token}")
async def verify_user_token(token: str):
    response = verify_token(token=token)
    return response


@app.get("/user")
def read_root(current_user: dict = Depends(verify_token)):
    user = db.find_user_by_username(current_user["sub"])

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"}
    )

    results = {
        "id": user["_id"],
        "username": user["username"],
        "email": user["email"],

    }
    return {"data": results}


@app.post("/update_views")
async def update_view(data: dict, current_user: dict = Depends(verify_token)):
    db.update_view_history(data, current_user["sub"])
    print(f"[UPDATE VIEW] {current_user['sub']} VIEWED ARTICLE '{ data['aid'] }'")
    return "OK"


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

