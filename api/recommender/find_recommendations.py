from pymongo import MongoClient
from faker import Faker
from models import User


client = MongoClient("localhost", 27017)
db = client["EarlyBird"]
articles = db["articles"]
articles_scores = db["articles_scores"]
authors = db["authors"]
settings = db["settings"]
users = db["users"]



def find_recommendations():
    pass


def find_similar_users():
    pass



