# Crawler
Implemented with the Scrapy framework.

Create a virtual environment called 'venv' (name is for .gitignore purposes). After activating it, make sure to install the framework with `pip install Scrapy`. If you want to run a spider (a scraper), head to _.\news_scraper\news_scraper_ and run `scrapy crawl <spider_name>` where spider_name is the name of a crawler as declared in a class  in _news_spider.py_ (e.g. "ap_spider"). 