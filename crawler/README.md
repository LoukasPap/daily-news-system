# Crawler
Implemented with the Scrapy framework.

Dependencies are managed with [uv](https://docs.astral.sh/uv/). Run `uv sync` inside this folder to create a `.venv` and install everything from `uv.lock`. If you want to run a spider (a scraper), head to _.\news_scraper\news_scraper_ and run `uv run scrapy crawl <spider_name>` where spider_name is the name of a crawler as declared in a class  in _news_spider.py_ (e.g. "ap_spider"). 
