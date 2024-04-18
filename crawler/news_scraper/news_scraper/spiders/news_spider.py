import scrapy
from news_scraper.items import NewsScraperItem


class NewsSpider(scrapy.Spider):
    name = "cnn_spider"
    domain = "https://edition.cnn.com"
    # allowed_domains = [domain]
    start_urls = [
        # "https://edition.cnn.com/politics",
        "https://edition.cnn.com/business",
        # "https://edition.cnn.com/health",
        # "https://edition.cnn.com/entertainment",
        # "https://edition.cnn.com/sports",
    ]

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
        datetime = response.css('div.timestamp::text').get().strip().replace("\n", "")

        new_item["url"] = url
        new_item["title"] = title
        new_item["body"] = body
        new_item["authors"] = ','.join(authors)
        new_item["datetime"] = datetime

        yield new_item
