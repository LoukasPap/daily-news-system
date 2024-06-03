import json
from bson import json_util

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
                        '$reads_history', -10
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
    parsed_cursor = parse_json(cursor)
    return parsed_cursor

def parse_json(data):
    return json.loads(json_util.dumps(data))