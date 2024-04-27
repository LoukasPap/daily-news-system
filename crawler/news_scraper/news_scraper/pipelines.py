from itemadapter import ItemAdapter
import re
from datetime import datetime
from scrapy.exceptions import DropItem
import pymongo


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
    articles_collection = "articles"
    authors_collection = "authors"

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
        self.db[self.articles_collection].insert_one({
            "_id": adapter["url"],
            "authors": adapter["authors"].split(","),
            "body": adapter["body"],
            "title": adapter["title"],
            "datetime": adapter["datetime"],
            "new_site": adapter["news_site"],
            "category": adapter["category"]
        })

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
