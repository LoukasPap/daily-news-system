import json
from bson import json_util
from datetime import datetime, timedelta
    
def find_last_100_categories_of_user(username: str, users_collection):
    pipeline = [
        {
            '$match': {
                'username': {
                    '$eq': username
                }
            }
        }, {
            '$project': {
                'reads_history': {
                    '$slice': [
                        '$reads_history', -100
                    ]
                }, 
                '_id': 1
            }
        }, {
            '$replaceWith': {
                'last_100_categories': '$reads_history.category'
            }
        }, {
            '$unwind': {
                'path': '$last_100_categories'
            }
        }, {
            '$group': {
                '_id': '$last_100_categories', 
                'count': {
                    '$sum': 1
                }
            }
        }, {
            '$group': {
                '_id': None, 
                'last_100': {
                    '$push': {
                        'category': '$_id', 
                        'count': '$count'
                    }
                }
            }
        }, {
            '$project': {
                '_id': 0, 
                'tags': {
                    '$arrayToObject': {
                        '$map': {
                            'input': '$last_100', 
                            'as': 'cats', 
                            'in': {
                                'k': '$$cats.category', 
                                'v': '$$cats.count'
                            }
                        }
                    }
                }
            }
        }, {
            '$replaceRoot': {
                'newRoot': {
                    '$mergeObjects': [
                        '$tags', '$$ROOT'
                    ]
                }
            }
        }, {
            '$project': {
                'tags': 0
            }
        }
    ]

    cursor = users_collection.aggregate(pipeline) 
    return parse_json(cursor)[0]


def take_last_100_categories_of_user(username: str, users_collection):
    print("problem is with", username)
    pipeline = [
        {
            '$match': {
                'username': username
            }
        }, {
            '$project': {
                'reads_per_category': 1, 
                '_id': 0
            }
        }, {
            '$replaceRoot': {
                'newRoot': {
                    '$mergeObjects': [
                        '$reads_per_category', '$$ROOT'
                    ]
                }
            }
        }, {
            '$project': {
                'reads_per_category': 0
            }
        }
    ]

    cursor = users_collection.aggregate(pipeline) 
    return parse_json(cursor)[0]


def take_articles_from_last_n_days(collection, n_days: str = 14):
    
    d = datetime.today() - timedelta(days=n_days)
    pipeline = [
        {
            '$match': {
                'datetime': {
                    '$gt': d
                }
            }
        }
    ]

    cursor = collection.aggregate(pipeline)
    return parse_json(cursor)


def parse_json(data):
    return json.loads(json_util.dumps(data))