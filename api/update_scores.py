"""
This script must be executed every night 
when the site traffic is low to update 
all the recommendation scores
"""
from pymongo import MongoClient, UpdateOne, UpdateMany
import json
from bson import json_util

client = MongoClient("localhost", 27017)
db = client["EarlyBird"]
articles = db["articles"]
articles_scores = db["articles_scores"]
authors = db["authors"]
settings = db["settings"]
users = db["users"]

DECAY_CONSTANT = -0.1
RECENCY_WEIGHT = 0.6
VIEWS_WEIGHT = 0.4
SCORING_HOURS = 5 * 24

def parse_json(data):
    return json.loads(json_util.dumps(data))

vmax = parse_json(settings.find_one({"_id": "vmax"}))

def update_views_score():

    not_updated_views = settings.find(
        {"updated": False},
    )

    for update_date in not_updated_views:
        print("in")
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
                            "views_score": ud["new_views"]/vmax["value"]
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
                    '$lte': 120
                }
            }
        }, {
            '$lookup': {
                'from': 'settings', 
                'as': 'vmax', 
                'localField': '1', 
                'foreignField': '1'
            }
        }, {
            '$addFields': {
                'vmax': {
                    '$arrayElemAt': [
                        '$vmax.value', 0
                    ]
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
                'vmax': 0, 
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
    print("yes")
    print(parsed_cursos)


def update_likes_score():
    pipeline = [
        {
            '$lookup': {
                'from': 'settings', 
                'as': 'max_likes', 
                'pipeline': [
                    {
                        '$match': {
                            '_id': 'max_likes'
                        }
                    }
                ]
            }
        }, {
            '$addFields': {
                'max_likes': {
                    '$first': '$max_likes.value'
                }
            }
        }, {
            '$addFields': {
                'likes_score': {
                    '$divide': [
                        '$likes', '$max_likes'
                    ]
                }
            }
        }, {
            '$project': {
                'max_likes': 0
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
    print("yes")
    print(parsed_cursos)



def update_all_scores():
    all_scores = articles_scores.aggregate([
     {
        '$lookup': {
            'from': 'settings', 
            'as': 'vmax', 
            'pipeline': [
                {
                    '$project': {
                        'value': 1, 
                        '_id': 0
                    }
                }
            ]
        }
    }, {
        '$addFields': {
            'vmax': {
                '$arrayElemAt': [
                    '$vmax.value', 0
                ]
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
                                    '$dateDiff': {
                                        'startDate': '$datetime', 
                                        'endDate': '$$NOW', 
                                        'unit': 'hour', 
                                        'timezone': '+07', 
                                        'startOfWeek': 'mon'
                                    }
                                }, DECAY_CONSTANT
                            ]
                        }
                    }
                ]
            }
        }
    }, {
        '$addFields': {
            'views_score': {
                '$divide': [
                    '$views', '$vmax'
                ]
            }
        }
    }, {
        '$addFields': {
            'trend_score': {
                '$sum': [
                    {
                        '$multiply': [
                            '$recency_score', RECENCY_WEIGHT
                        ]
                    }, {
                        '$multiply': [
                            '$views_score', VIEWS_WEIGHT
                        ]
                    }
                ]
            }
        }
    }, {
        '$project': {
            'vmax': 0
        }
    }
])

# uncomment and execute
# update_views_score()
# update_recency_score()
update_likes_score()

