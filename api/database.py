from pymongo import MongoClient, DESCENDING,  ReturnDocument
import json
from models import ArticleReadingTime, ArticleHistory
from passlib.context import CryptContext
from bson import json_util
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


def get_feed(category, filter):
    articles_list = []
    sites = ["AP", "NBC", "CNN", "NPR"]

    if category == "latest":
        pipeline = [
            {
                "$sort": {
                    "datetime": -1
                }
            }, {
                "$group": {
                    "_id": "$new_site", 
                    "documents": {
                        "$push": "$$ROOT"
                    }
                }
            }, {
                "$project": {
                    "_id": 1, 
                    "documents": {
                        "$slice": [
                            "$documents", 10
                        ]
                    }
                }
            }, {
                "$group": {
                    "_id": None, 
                    "allDocuments": {
                        "$push": "$documents"
                    }
                }
            }, {
                "$project": {
                    "allDocuments": {
                        "$reduce": {
                            "input": "$allDocuments", 
                            "initialValue": [], 
                            "in": {
                                "$concatArrays": [
                                    "$$value", "$$this"
                                ]
                            }
                        }
                    }
                }
            }
        ]
        
        print("LATEST PIPELINE")
        response = articles.aggregate(pipeline)
        articles_list = parse_json(response)[0]["allDocuments"]

    elif category == "trend":
        pipeline = [
            {
                "$project": {
                    "trend_score": 1
                }
            }, {
                "$lookup": {
                    "from": "articles", 
                    "localField": "_id", 
                    "foreignField": "_id", 
                    "as": "article"
                }
            }, {
                "$unwind": {
                    "path": "$article"
                }
            }, {
                "$replaceRoot": {
                    "newRoot": {
                        "$mergeObjects": [
                            "$article", "$$ROOT"
                        ]
                    }
                }
            }, {
                "$project": {
                    "article": 0
                }
            }, {
                "$sort": {
                    "trend_score": -1
                }
            }, {
                "$limit": 40
            }
        ]
        response = articles_scores.aggregate(pipeline)
        articles_list = parse_json(response)

    elif category == "personalized":
        pass

    return articles_list


def update_view_history(data: dict, username: str):
    valid_aid = data["aid"]
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
                settings.update_one(
                    {"_id": hour_id},
                    {"$push": {
                        "to_update": {
                            "aid": valid_aid,
                            "new_views": 1
                        }
                    }}
                )
            
            else:
                settings.update_one(
                    {"_id": hour_id,
                     "to_update.aid": valid_aid
                     },
                    {
                        "$inc": {
                            "to_update.$.new_views": 1
                        },
                    })

            print("did not creare time id")
        
        ah = ArticleHistory(aid=data["aid"], category=data["category"])
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


def like(data: dict):
    username, article_id = data["username"], data["aid"]
    print(username, "liked", article_id)
    get_record = users.find_one(
        {"username": username},
        {
            "reads_history": {
                "$elemMatch": {"aid": article_id}
            }
        }
    )
    is_liked = parse_json(get_record)["reads_history"][0]["is_liked"]

    if is_liked:

        users.update_one(
            {
                "username": username,
                "reads_history.aid": article_id
            },
            {
                "$set": {"reads_history.$.is_liked":  False},

            },
        )

        articles.update_one(
            {
                "_id": article_id
            },
            {
                "$pull": {"liked_by": username},
            },
        )
       
        articles_scores.update_one(
            {
                "_id": article_id
            },
            {
                "$inc": {"likes": -1}
            }
        )

    else:
        users.update_one(
            {
                "username": username,
                "reads_history.aid": article_id
            },
            {
                "$set": {"reads_history.$.is_liked":  True},

            })
    
        articles.update_one(
            {
                "_id": article_id
            },
            {
                "$addToSet": {"liked_by": username},
            },
        )

        articles_scores.update_one(
            {
                "_id": article_id
            },
            {
                "$inc": {"likes": 1}
            }
            )



def add_read_time(data: dict, username: str):
    aid, read_time, ert = data["aid"], round(data["time_spent"]), data["estimated_rt"]
    get_record = users.find_one(
        {
            "username": username,
        "reading_times.aid": aid
        },
        {
            "reading_times": {
                "$elemMatch": {"aid": aid}
            }
        }
    )
    
    if get_record is not None:
        parsed_record = parse_json(get_record)["reading_times"][0]

        new_rt = parsed_record["reading_time"] + read_time
        if new_rt >= ert:       
            users.update_one(
                {
                    "username": username,
                    "reading_times.aid": aid
                },
                {
                    "$set": {
                        "reading_times.$.reading_time" : new_rt,
                        "reading_times.$.score" : 1
                    }
                },
            )
        else:
            users.update_one(
                {
                    "username": username,
                    "reading_times.aid": aid
                },
                {
                    "$set": {
                        "reading_times.$.reading_time" : new_rt,
                        "reading_times.$.score" : new_rt / ert
                    }
                },
            )


    else:
        art = ArticleReadingTime(aid=aid, 
                                 reading_time=read_time, 
                                 estimated_rt=ert, 
                                 score=(read_time/ert if read_time<ert else 1))
        print(art)
        users.update_one(
           {
                "username": username,
            },
            {
                "$push": {
                    "reading_times" : dict(art)
                }
            },
            
        )
    
    print("INSERTED - READ TIME IS", read_time)


def get_article(aid):
    response = articles.find_one({"_id": aid})
    return parse_json(response)


def parse_json(data):
    return json.loads(json_util.dumps(data))