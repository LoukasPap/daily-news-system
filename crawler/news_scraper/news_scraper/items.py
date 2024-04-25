# Define here the models for your scraped items
#
# See documentation in:
# https://docs.scrapy.org/en/latest/topics/items.html

import scrapy


class NewsScraperItem(scrapy.Item):
    url = scrapy.Field()
    authors = scrapy.Field()
    body = scrapy.Field()
    title = scrapy.Field()
    datetime = scrapy.Field()
    news_site = scrapy.Field()
    category = scrapy.Field()
