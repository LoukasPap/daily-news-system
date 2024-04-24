# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: https://docs.scrapy.org/en/latest/topics/item-pipeline.html


# useful for handling different item types with a single interface
from itemadapter import ItemAdapter
import re
from datetime import datetime


class CNNNewsScraperPipeline:

    def process_item(self, item, spider):

        adapter = ItemAdapter(item)

        title_str = adapter.get("title")
        adapter["title"] = title_str.strip()

        datetime_str = adapter.get("datetime")
        match = re.search(r"\b(\d{1,2}:\d{2} [APM]{2} EDT, \w{3} \w{3,9} \d{1,2}, \d{4})\b", datetime_str)

        if match:
            datetime_str = match.group(1)
            datetime_obj = datetime.strptime(datetime_str, "%I:%M %p EDT, %a %B %d, %Y")
            adapter["datetime"] = datetime_obj
            timestamp = datetime_obj.timestamp()
        else:
            print("No match found")

        return item


class NBCNewsScraperPipeline:

    def process_item(self, item, spider):

        adapter = ItemAdapter(item)

        title_str = adapter.get("title")
        adapter["title"] = title_str.strip()

        datetime_str = adapter.get("datetime")
        match = re.search(r"\b(\d{1,2}:\d{2} [APM]{2} EDT, \w{3} \w{3,9} \d{1,2}, \d{4})\b", datetime_str)

        if match:
            datetime_str = match.group(1)
            datetime_obj = datetime.strptime(datetime_str, "%I:%M %p EDT, %a %B %d, %Y")
            adapter["datetime"] = datetime_obj
            timestamp = datetime_obj.timestamp()
        else:
            print("No match found")

        return item


class NPRNewsScraperPipeline:

    def process_item(self, item, spider):

        adapter = ItemAdapter(item)

        title_str = adapter.get("title")
        adapter["title"] = title_str.strip()

        datetime_str = adapter.get("datetime")
        adapter["datetime"] = datetime_str.replace("Updated ", "") if "Updated" in datetime_str else datetime_str

        # match = re.search(r"\b(\d{1,2}:\d{2} [APM]{2} EDT, \w{3} \w{3,9} \d{1,2}, \d{4})\b", datetime_str)

        # if match:
        #     datetime_str = match.group(1)
        #     datetime_obj = datetime.strptime(datetime_str, "%I:%M %p EDT, %a %B %d, %Y")
        #     adapter["datetime"] = datetime_obj
        #     timestamp = datetime_obj.timestamp()
        # else:
        #     print("No match found")

        return item
