import scrapy
import csv


class NewsSpider(scrapy.Spider):
    name = "cnn_spider"
    domain = "https://edition.cnn.com"
    # allowed_domains = [domain]
    start_urls = ["https://edition.cnn.com/politics",
                  "https://edition.cnn.com/business",
                  "https://edition.cnn.com/health",
                  "https://edition.cnn.com/entertainment",
                  "https://edition.cnn.com/sports",
                  ]

    def parse(self, response):
        urls = response.css('div.zone:nth-child(1) a.container__link--type-article:nth-child(1)::attr(href)').getall()
        for url in urls:
            article_url = self.domain + url
            yield response.follow(article_url, callback=self.parse_article_page)

    def parse_article_page(self, response):
        url = response.url
        authors = response.css('span.byline__name::text').getall()
        title = response.css('h1.headline__text::text').get().strip()
        datetime = response.css('div.timestamp::text').get().strip().replace("\n", "")

        yield {
            "url": url,
            "authors": ','.join(authors),
            "title": title,
            "datetime": datetime
        }

