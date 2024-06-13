"""
Functions to calculate recommendations for a user
"""

from pymongo import MongoClient
import helpers
import numpy as np
from numpy.linalg import norm
from heapq import nlargest


client = MongoClient("localhost", 27017)
db = client["Test11-full"]
articles_cl = db["articles"]
articles_scores = db["articles_scores"]
authors = db["authors"]
settings = db["settings"]
users = db["users"]
users_ratings = db["users_ratings"]
recommendations_cl = db["users_recommendations"]

all_users_similarities: dict = {}
all_items_scores: dict = {}

def main(username):
    recs = find_recommendations(username)

    sorted_recs = [{"aid":r, "score":s} for r, s in recs.items()]
    recommendations_cl.update_one(
        {"username": username},
        {
            "$set": {
                "recommendations": sorted_recs
                }
        },
        upsert=True
    )


def find_recommendations(username):

    items: list = helpers.take_articles_from_last_n_days(articles_cl, 14)
    user_categories: dict = helpers.take_last_100_categories_of_user(username, users)

    for item in items:
        # check if user has read the item
        if username in item["read_by"]:
            continue

        top_neighbors = find_similar_users(username, item["_id"], user_categories, item["read_by"], 128)
        item_score = user_to_user(username, item["_id"], top_neighbors, users)
        all_items_scores[item["_id"]] = item_score
    
    
    top_n_recommendations = dict(nlargest(
        120, all_items_scores.items(), key=lambda i: i[1]
    ))

    return top_n_recommendations
        

def find_similar_users(username: str, item_id: str, user_categories: dict, other_readers: list, n: int):
    similar_users = {}
    for reader in other_readers:
        if reader in all_users_similarities:
            score = all_users_similarities[reader]
        else:
            reader_categories: dict = helpers.take_last_100_categories_of_user(reader, users)
            score = find_cosine_sim(user_categories, reader_categories)

            all_users_similarities[reader] = score
        
        similar_users[reader] = score

    top_n_users = nlargest(n, similar_users.items(), key=lambda i: i[1])
    return top_n_users


def user_to_user(username, item_id, neighbors, users_cl):
    numerator: int = 0
    denominator: int = 0
    print("user-to-user for", item_id)
    response = users_ratings.find(
        {
            "username": {
                "$in": [i[0] for i in neighbors]
            },
            "aid": item_id
        },
        {
            "username": True, "total_score": True, "_id": False
        }
    )

    parsed_response = helpers.parse_json(response)
    tmp_ratings = {}
    for i in parsed_response:
        tmp_ratings[i["username"]] = i["total_score"]
    
    for n in neighbors:
        n_score = n[1]

        numerator += n_score * tmp_ratings[n[0]]
        denominator += n_score

    return numerator / denominator
        

def find_cosine_sim(u_cat, r_cat):
    list_u = [u_cat["health"], u_cat["entertainment"], u_cat["sports"], u_cat["politics"], u_cat["business"]]
    list_r = [r_cat["health"], r_cat["entertainment"], r_cat["sports"], r_cat["politics"], r_cat["business"]]

    vector_u = np.array(list_u)
    vector_v = np.array(list_r)
    

    cosine_score = np.dot(vector_u, vector_v) / (norm(vector_u) * norm(vector_v))

    return cosine_score
