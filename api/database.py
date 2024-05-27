from pymongo import MongoClient, DESCENDING
import json
from models import User, ArticleHistory
from passlib.context import CryptContext
from bson import json_util
from random import shuffle
from datetime import datetime


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


client = MongoClient("localhost", 27017)
db = client["EarlyBird"]
articles = db["articles"]
articles_scores = db["articles_scores"]
authors = db["authors"]
settings = db["settings"]
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


def update_view_history(data: dict, username: str):
    valid_aid = data['aid']
    response = articles.update_one(
        {
            "_id": data["aid"]
        },
        {
            "$addToSet": {"read_by": username},
        },

        upsert=True
    )

    article_score = parse_json(articles_scores.find_one({"_id": data["aid"]}))
    print("Article score\n", article_score)
    print("Modified", mod_count := response.modified_count)
    
    if mod_count > 0:
        hour_id = datetime.today().replace(minute=0, second=0, microsecond=0)
        
        hour_id_exists = settings.find_one({"_id": hour_id})
        if hour_id_exists is None:
            print("creating new time id")
            settings.insert_one({
                "_id": hour_id,
                "to_update": [
                    {
                        "aid": valid_aid,
                        "new_views": 1
                    },
                ],
                "updated": False
            })
        else:
            record_exists = db.settings.find_one({
                    "_id": hour_id,
                    "to_update.aid": valid_aid
                })
            
            if record_exists is None:
                db.settings.update_one(
                    {"_id": hour_id},
                    {"$push": {
                        "to_update": {
                            "aid": valid_aid,
                            "new_views": 1
                        }
                    }}
                )
            
            else:
                db.settings.update_one(
                    {"_id": hour_id,
                     "to_update.aid": valid_aid
                     },
                    {
                        "$inc": {
                            "to_update.$.new_views": 1
                        },
                    })



            print("did not creare time id")
        
        ah = ArticleHistory(url=data['aid'], category=data['category'])
        print("Article History", ah)
        users.update_one(
            {
                "username": username
            },
            {
                "$addToSet": {"reads_history":  dict(ah)},
                "$inc": {"reads_per_category." + data['category'] : 1}

            },
        )
    else:
        print("Already read by this user.")

    return True

def get_article(aid):
    response = articles.find_one({"_id": aid})
    return parse_json(response)


def parse_json(data):
    return json.loads(json_util.dumps(data))