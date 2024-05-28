from itemadapter import ItemAdapter
from datetime import datetime
from scrapy.exceptions import DropItem
import pymongo
from math import e
from typing import Final
import re

class DuplicatesPipeline:
    def __init__(self):
        self.ids_seen = set()

    def process_item(self, item, spider):
        adapter = ItemAdapter(item)
        if adapter["url"] in self.ids_seen:
            raise DropItem(f"Duplicate item found: {item!r}")
        else:
            self.ids_seen.add(adapter["url"])
            return item


class MongoDBPipeline:
    articles_collection: str = "articles"
    articles_scores_collection: str = "articles_scores"
    authors_collection: str = "authors"

    DECAY_CONSTANT: Final[float] = 0.1

    def __init__(self, mongo_uri, mongo_db):
        self.mongo_uri = mongo_uri
        self.mongo_db = mongo_db

    @classmethod
    def from_crawler(cls, crawler):
        return cls(
            mongo_uri=crawler.settings.get("MONGO_URI"),
            mongo_db=crawler.settings.get("MONGO_DATABASE", "EarlyBird"),
        )

    def open_spider(self, spider):
        self.client = pymongo.MongoClient(self.mongo_uri)
        self.db = self.client[self.mongo_db]

    def close_spider(self, spider):
        self.client.close()

    def process_item(self, item, spider):
        adapter = ItemAdapter(item)

        adapter["datetime"] = adapter["datetime"].replace(microsecond=0)
        
        self.db[self.articles_collection].update_one(
            {
                "_id": adapter["url"]
            },
            {
                "$set": {
                    "authors": adapter["authors"].split(","),
                    "body": adapter["body"],
                    "title": adapter["title"],
                    "datetime": adapter["datetime"],
                    "new_site": adapter["news_site"],
                    "category": adapter["category"]
                }
            },
            upsert=True
        )
        
        recency_score = e ** (-self.DECAY_CONSTANT * round((datetime.now().replace(microsecond=0) - adapter["datetime"].replace(tzinfo=None)).total_seconds() / 3600) )

        self.db[self.articles_scores_collection].update_one(
            {
                "_id": adapter["url"]
            },
            {
                "$set": {
                    "trend_score": 0, # T score = 0.4 * R + 0.6 * V
                    "views": 0, # V score = views / Vmax, where Vmax are the most likes in a 2weeks period
                    "recency_score": recency_score, # R score = e^(-λ*R), where R=hours passed
                    "datetime": adapter["datetime"],
                    "views_score": 0,
                }
            },
            upsert=True
        )

        for author in adapter["authors"].split(","):
            self.db[self.authors_collection].update_one(
                {
                    "name": author
                },
                {
                    "$addToSet": {"articles": adapter["url"]}
                },
                upsert=True
            )

        return item
