from models import *
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
from fastapi.middleware.cors import CORSMiddleware
import database as db

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



@app.get("/user")
def read_root():
    a= db.find_user_by_username("ss")
    return a


@app.post("/register")
def register_user(user: User):
    db_user = db.find_user_by_username(user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered!")
    
    response = db.create_user(user)
    return {"Registered": "OK!"}


@app.post("/token")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
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
    verify_token(token=token)
    return {"message": "Valid token"}


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
        
        return payload
    
    except JWTError:
        raise credentials_exception
    

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

