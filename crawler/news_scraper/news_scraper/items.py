# Define here the models for your scraped items
#
# See documentation in:
# https://docs.scrapy.org/en/latest/topics/items.html

import scrapy


def serialize_title(value):
    return value.strip()


def serialize_datetime(value):
    return value.strip().replace("\n", "")


class NewsScraperItem(scrapy.Item):
    url = scrapy.Field()
    authors = scrapy.Field()
    body = scrapy.Field()
    title = scrapy.Field(serializer=lambda x: x.strip())
    datetime = scrapy.Field()
    news_site = scrapy.Field()
