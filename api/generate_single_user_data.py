"""
This script is for testing purposes
"""

from pymongo import MongoClient
from bson import json_util
from faker import Faker
from models import User, ArticleHistory, ArticleReadingTime
import json
from recommender.helpers import parse_json
from random import randrange

client = MongoClient("localhost", 27017)
db = client["Test11-full"] # name of DB
articles = db["articles"]
articles_scores = db["articles_scores"]
authors = db["authors"]
settings = db["settings"]
users = db["users"]

fake = Faker()

def main():
    username = "<username>"

    # take 100 sample - 60 entertainment, 40 others
    response = articles.aggregate([
        {
            '$match': {
                'category': 'entertainment'
            }
        }, {
            '$sample': {
                'size': 20
            }
        }, {
            '$unionWith': {
                'coll': 'articles', 
                'pipeline': [
                    {
                        '$match': {
                            'category': {
                                '$not': {
                                    '$eq': 'entertainment'
                                }
                            }
                        }
                    }, {
                        '$sample': {
                            'size': 80
                        }
                    }
                ]
            }
        }
    ])


    print(f'Generating data for user: {username}')
    samples_100 = parse_json(response)
    
    for sample in samples_100:

        # add user to read_by list
        response = articles.update_one(
            {"_id": sample["_id"]},
            {"$addToSet": {"read_by": username},},
            upsert=True)
        
        # increase article views by 1
        response = articles_scores.update_one(
            {"_id": sample["_id"]},
            {"$inc": {"views": 1},},
            upsert=True)
        
        # check if like happens
        will_like = fake.pybool(truth_probability=65)
        if will_like:
            # add user to liked_by list
            response = articles.update_one(
                {"_id": sample["_id"]},
                {"$addToSet": {"liked_by": username},})
            
            # increase article likes by 1
            response = articles_scores.update_one(
                {"_id": sample["_id"]},
                {"$inc": {"likes": 1}})
            

        # add article to user history and,
        # add category to reads_per_category
        ah = ArticleHistory(aid=sample["_id"], category=sample["category"], is_liked=will_like)
        # print("Article History", ah)
        response = users.update_one(
            {"username": username},
            {
                "$addToSet": {"reads_history":  dict(ah)},
                "$inc": {"reads_per_category." + sample['category'] : 1}
            })
        

        # add random reading time to user reading_times
        random_rt = randrange(5, sample["estimated_reading_time"])
        ert = sample["estimated_reading_time"]
        r_score = (random_rt/ert if random_rt<ert else 1)
        art = ArticleReadingTime(aid=sample["_id"],
                                 reading_time=random_rt, 
                                 estimated_rt=ert,
                                 score=r_score)
        response = users.update_one(
            {"username": username,},
            {"$push": {"reading_times" : dict(art)}})
    
    print(f"Finished adding user [{username}]")
    # break


def calculate_scores():
    # take maximum likes in the last week
    max_likes_unparsed = articles_scores.aggregate([
        {
            '$addFields': {
                'dateDifference': {
                    '$abs': {
                        '$dateDiff': {
                            'startDate': '$datetime', 
                            'endDate': '$$NOW', 
                            'unit': 'hour', 
                            'timezone': '+07', 
                            'startOfWeek': 'mon'
                        }
                    }
                }
            }
        }, {
            '$match': {
                'dateDifference': {
                    '$lte': 168 # 24 hours * 7 days = 168 hours = 1 week 
                }
            }
        }, {
            '$sort': {
                'likes': -1
            }
        }, {
            '$limit': 1
        }, {
            '$project': {
                '_id': 0, 
                'likes': 1
            }
        }
    ])
    parsed_likes = parse_json(max_likes_unparsed)
    max_likes = parsed_likes[0]["likes"]

    # take maximum views in the last week
    max_views_unparsed = articles_scores.aggregate([
        {
            '$addFields': {
                'dateDifference': {
                    '$abs': {
                        '$dateDiff': {
                            'startDate': '$datetime', 
                            'endDate': '$$NOW', 
                            'unit': 'hour', 
                            'timezone': '+07', 
                            'startOfWeek': 'mon'
                        }
                    }
                }
            }
        }, {
            '$match': {
                'dateDifference': {
                    '$lte': 168 # 24 hours * 7 days = 168 hours = 1 week 
                }
            }
        }, {
            '$sort': {
                'views': -1
            }
        }, {
            '$limit': 1
        }, {
            '$project': {
                '_id': 0, 
                'views': 1
            }
        }
    ])
    parsed_views = parse_json(max_views_unparsed)
    max_views = parsed_views[0]["views"]

    # # calculate likes_score & views_score & recency_score
    response = articles_scores.aggregate([
        {
            '$addFields': {
                'likes_score': {
                    '$divide': ['$likes', max_likes]
                }, 
                'views_score': {
                    '$divide': ['$views', max_views]
                },
                'recency_score': {
                    '$sum': [
                        {
                            '$exp': {
                                '$multiply': [
                                    {
                                        '$abs': {
                                            '$dateDiff': {
                                                'startDate': '$datetime', 
                                                'endDate': '$$NOW', 
                                                'unit': 'hour', 
                                                'timezone': '+07', 
                                                'startOfWeek': 'mon'
                                            }
                                        }
                                    }, -0.1
                                ]
                            }
                        }
                    ]
                }
            }
        }, 
        {
            '$merge': {
                'into': 'articles_scores', 
                'on': '_id', 
                'whenMatched': 'merge', 
                'whenNotMatched': 'discard'
            }
        }
    ])

    # calculate trend_score
    response = articles_scores.aggregate([
        {
            '$addFields': {
                'trend_score': {
                    '$sum': [
                        {
                            '$multiply': [
                                '$recency_score', 0.6
                            ]
                        }, {
                            '$multiply': [
                                '$views_score', 0.1
                            ]
                        }, {
                            '$multiply': [
                                '$likes_score', 0.3
                            ]
                        }
                    ]
                }
            }
        }, {
            '$merge': {
                'into': 'articles_scores', 
                'on': '_id', 
                'whenMatched': 'merge', 
                'whenNotMatched': 'discard'
            }
        }
    ])






main()
calculate_scores()