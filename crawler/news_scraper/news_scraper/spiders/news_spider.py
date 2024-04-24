import scrapy
from datetime import datetime as dt
from news_scraper.items import NewsScraperItem
from news_scraper.helpers import *


# from news_scraper.news_scraper.helpers import convert_datetime_timezone


class NewsSpiderCNN(scrapy.Spider):
    name = "cnn_spider"
    domain = "https://edition.cnn.com"
    start_urls = [
        "https://edition.cnn.com/politics",
        "https://edition.cnn.com/business",
        "https://edition.cnn.com/health",
        "https://edition.cnn.com/entertainment",
        "https://edition.cnn.com/sports",
    ]

    custom_settings = {
        "FEEDS": {
            f"data/cnn/news_{dt.today().strftime('%Y-%m-%d')}.csv": {"format": "csv", "overwrite": True}
        },
        "ITEM_PIPELINES": {
            "news_scraper.pipelines.CNNNewsScraperPipeline": 300,
        }
    }

    cnn_date_format = "%I:%M %p, %a %B %d, %Y"

    def parse(self, response):
        urls = response.css('div.zone:nth-child(1) a.container__link--type-article:nth-child(1)::attr(href)').getall()
        for url in urls:
            article_url = self.domain + url
            yield response.follow(article_url, callback=self.parse_article_page)

    def parse_article_page(self, response):
        new_item = NewsScraperItem()

        url = response.url
        title = response.css('h1.headline__text::text').get().strip()

        body = ""
        for i in response.css('div.article__content > p, div.article__content > h2'):
            tmp = i.css('h2::text').get("p")
            if tmp != "p":
                text = f"<h2>{tmp.strip()}</h2>"
            else:
                text = (''.join(i.xpath('descendant-or-self::text()').extract())).strip()
            body += text

        authors = response.css('span.byline__name::text').getall()
        datetime = response.css('div.timestamp::text').get() \
            .strip() \
            .replace("\n", "") \
            .replace(" EDT", "") \
            .removeprefix("Updated        ")

        datetime = convert_datetime_timezone(datetime, self.cnn_date_format, "US/Eastern")

        new_item["url"] = url
        new_item["title"] = title
        new_item["body"] = body
        new_item["authors"] = ','.join(authors)
        new_item["datetime"] = datetime
        new_item["news_site"] = "CNN"

        yield new_item


class NewsSpiderNBC(scrapy.Spider):
    name = "nbc_spider"
    domains = "https://www.nbcnews.com"
    start_urls = [
        "https://www.nbcnews.com/politics",
        "https://www.nbcnews.com/business",
        "https://www.nbcnews.com/health",
        "https://www.nbcnews.com/sports",
        "https://www.nbcnews.com/culture-matters",
    ]

    custom_settings = {
        "FEEDS": {
            f"data/nbc/news_{dt.today().strftime('%Y-%m-%d')}.csv": {"format": "csv", "overwrite": True}
        },
        "ITEM_PIPELINES": {
            "news_scraper.pipelines.NBCNewsScraperPipeline": 300,
        }
    }

    nbc_date_format = "%B %d, %Y, %I:%M %p %Z"

    def parse(self, response):
        urls = response.css('h2.tease-card__headline > a::attr(href)').getall()
        urls.extend(response.css('div.package-grid__column:nth-child(1) h2 a::attr(href)').getall())
        urls.extend(response.css('div.wide-tease-item__info-wrapper > a::attr(href)').getall())
        for url in urls:
            article_url = url
            yield response.follow(article_url, callback=self.parse_article_page)

    def parse_article_page(self, response):
        new_item = NewsScraperItem()

        url = response.url
        title = response.css('h1::text').get().strip()

        body = ""
        for i in response.css(
                'div.article-body__content > h2, '
                'div.article-body__content > p, '
                'div.article-body__content > h2 + div + div > p'):

            tmp = i.css('h2::text').get("p")
            if tmp != "p":
                text = f"<h2>{tmp.strip()}</h2>"
            else:
                text = (' '.join(i.xpath('descendant-or-self::text()').extract()))
            body += text

        authors = response.css('section span.byline-name > a::text, section span.byline-name::text').getall()
        datetime = response.css('time::text').get().strip().replace("\n", "")

        datetime = convert_datetime_timezone(datetime, self.nbc_date_format, "UTC")

        new_item["url"] = url
        new_item["title"] = title
        new_item["body"] = body
        new_item["authors"] = ','.join(authors)
        new_item["datetime"] = datetime
        new_item["news_site"] = "NBC"

        yield new_item


class NewsSpiderNPR(scrapy.Spider):
    name = "npr_spider"
    domains = "https://www.npr.org"
    start_urls = [
        "https://www.npr.org/sections/politics/",
        "https://www.npr.org/sections/business/",
        "https://www.npr.org/sections/health/",
        "https://www.npr.org/sections/culture/",
        "https://www.npr.org/sections/sports/",
    ]

    custom_settings = {
        "FEEDS": {
            f"data/npr/news_{dt.today().strftime('%Y-%m-%d')}.csv": {"format": "csv", "overwrite": True}
        },
        "ITEM_PIPELINES": {
            "news_scraper.pipelines.NBCNewsScraperPipeline": 300,
        }
    }

    npr_date_format = "%B %d, %Y %I:%M %p"  # %Z"

    def parse(self, response):
        urls = response.css('h2.title > a::attr(href)').getall()
        for url in urls:
            article_url = url
            yield response.follow(article_url, callback=self.parse_article_page)

    def parse_article_page(self, response):
        new_item = NewsScraperItem()

        url = response.url
        if "org/series" in url:
            print(url)
            return

        title = response.css('h1::text').get().strip()

        body = ""
        c = 0
        for i in response.css('div.storytext > p:not(.contributors-text), div.storytext > h3, div.storytext > em'):  #
            if "You're reading the Consider This" in i.get():
                continue

            not_nested_strong = i.css('h3::text').get("p")
            has_nested_strong = i.css('h3 > strong::text').get("p")
            if not_nested_strong != "p" or has_nested_strong != "p":

                if not_nested_strong != "p":
                    tmp = not_nested_strong
                    text = f"<h2>{tmp.strip()}</h2>"
                    print(text)
                    if None != (strong := i.css('h3.edTag strong::text').get()):
                        text = text.removesuffix("</h2>") + strong + "</h2>"
                elif has_nested_strong != "p":
                    tmp = has_nested_strong
                    text = f"<h2>{tmp.strip()}</h2>"

            else:
                text = (' '.join(i.xpath('descendant-or-self::text()').extract()))

            body += text
        print(body)

        authors = response.css('p.byline__name > a::text').getall()
        datetime = \
            ' '.join(response.css('time:nth-child(1) span.date::text, span.time::text').getall()) \
            .removeprefix("Updated ") \
            .removesuffix(" ET")

        datetime = convert_datetime_timezone(datetime, self.npr_date_format, "US/Eastern")

        new_item["url"] = url
        new_item["title"] = title
        new_item["body"] = body
        new_item["authors"] = ','.join([a.strip() for a in authors]) if authors else "None"
        new_item["datetime"] = ''.join(datetime)
        new_item["news_site"] = "NPR"

        yield new_item
