"""
Various scripts for computing scores
"""

from pymongo import MongoClient, UpdateMany
import json
from bson import json_util
from helpers import parse_json
from find_recommendations import main
from datetime import datetime, timedelta

client = MongoClient("localhost", 27017)
db = client["Test11-full"]
articles = db["articles"]
articles_scores = db["articles_scores"]
authors = db["authors"]
settings = db["settings"]
users = db["users"]
users_recs = db["users_recommendations"]

DECAY_CONSTANT = -0.1
RECENCY_WEIGHT = 0.6
LIKES_WEIGHT = 0.3
VIEWS_WEIGHT = 0.1
SCORING_HOURS = 5 * 24


def update_views():
    not_updated_views = settings.find(
        {"updated": False},
    )

    for update_date in not_updated_views:
        requests: list = []
        for ud in update_date['to_update']:
            requests.append(
                UpdateMany(
                    {
                        "_id": ud["aid"]
                    },
                    {
                        "$inc": {
                            "views": ud["new_views"], 
                        },
                    }
                )
            )
        
        result = articles_scores.bulk_write(requests)
        if result.bulk_api_result['writeErrors'] == []:
            settings.find_one_and_update(
                {"_id": update_date["_id"]},
                {"$set": {"updated": True}}
            )


def update_recency_score():
    d = datetime.today() - timedelta(days=7)

    pipeline = [
        {
            '$match': {
                'datetime': {
                    '$gte': d
                }
            }
        }, {
            '$addFields': {
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
        }, {
            '$project': {
                'dateDifference': 0
            }
        }, {
            '$merge': {
                'into': 'articles_scores', 
                'on': '_id', 
                'whenMatched': 'merge', 
                'whenNotMatched': 'discard'
            }
        }
    ]
    
    cursor = articles_scores.aggregate(pipeline)
    parsed_cursos = parse_json(cursor)
    print(parsed_cursos)


def update_views_score():
    max_views: int = find_max_views_from_last_n_days(7)
    d = datetime.today() - timedelta(days=7)

    pipeline = [
        {
            '$match': {
                'datetime': {
                    '$gte': d
                }
            }
        }, {
            '$addFields': {
                'views_score': {
                    '$divide': [
                        '$views', max_views
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
    ]

    articles_scores.aggregate(pipeline)


def update_likes_score():
    max_likes: int = find_max_likes_from_last_n_days(7)
    d = datetime.today() - timedelta(days=7)

    pipeline = [
        {
            '$match': {
                'datetime': {
                    '$gte': d
                }
            }
        }, {
            '$addFields': {
                'likes_score': {
                    '$divide': [
                        '$likes', max_likes
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
    ]

    articles_scores.aggregate(pipeline)


def generate_recommendation_scores():
    response = users.aggregate([
        {
            '$addFields': {
                'total_read': {
                    '$size': '$reads_history'
                }
            }
        }, {
            '$match': {
                'total_read': {
                    '$gt': 100
                }
            }
        }
    ])

    for u in parse_json(response):
        res = users_recs.find_one({"username": u["username"]})
        if res is None:
            main(u["username"])
            print("Generated recommendations for", u["username"])

        else:
            print(u["username"], "has already recommendations!")


def update_trend_score():
    d = datetime.today() - timedelta(days=7)
    pipeline = [
        {
            '$match': {
                'datetime': {
                    '$gt': d
                }
            }
        }, {
            '$addFields': {
                'trend_score': {
                    '$sum': [
                        {
                            '$multiply': [
                                '$recency_score', 0.6
                            ]
                        }, {
                            '$multiply': [
                                '$likes_score', 0.3
                            ]
                        }, {
                            '$multiply': [
                                '$views_score', 0.1
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
    ]

    articles_scores.aggregate(pipeline)


def find_max_likes_from_last_n_days(days: int):
    pipeline = [
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
                    '$lte': days*24
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
    ]

    response = articles_scores.aggregate(pipeline)
    return parse_json(response)[0]["likes"]


def find_max_views_from_last_n_days(days: int):
    pipeline = [
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
                    '$lte': days * 24
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
    ]

    response = articles_scores.aggregate(pipeline)
    return parse_json(response)[0]["views"]


# uncomment and execute
# update_views_score()
# update_views()
# update_recency_score()
# update_likes_score()
# update_trend_score()
# generate_recommendation_scores()
