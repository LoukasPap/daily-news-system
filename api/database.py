from pymongo import MongoClient, DESCENDING
import json
from models import User
from passlib.context import CryptContext
from bson import json_util
from random import shuffle


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


client = MongoClient("localhost", 27017)
db = client["EarlyBird"]
articles = db["articles"]
authors = db["authors"]
users = db["users"]


def create_user(user):
    hashed_pwd = pwd_context.hash(user.password)
    user.password = hashed_pwd
    users.insert_one(dict(user))


def authenticate_user(username: str, password: str):
    user = users.find_one({"username": username})
    
    if not user:
        return False

    if not pwd_context.verify(password, user["password"]):
        return False
    
    return user


def find_user_by_username(username):
    response = users.find_one({
        "username": username
    })
    return parse_json(response)


def get_feed(filter, category):

    articles_list = []
    sites = ["AP", "NBC", "CNN", "NPR"]
    for s in sites:
        response = articles.find(
            filter={"new_site": s},
            limit=10).sort("datetime", DESCENDING)
            
        # if filter == "latest":
            
        articles_list += parse_json(response)
    shuffle(articles_list)
    return articles_list


def get_article(aid):
    response = articles.find_one({"_id": aid})
    return parse_json(response)


def parse_json(data):
    return json.loads(json_util.dumps(data))