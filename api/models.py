from pydantic import BaseModel, SkipValidation, Field
from typing_extensions import Annotated
import datetime
from typing import List, Dict


class Article(BaseModel):
    url: str = Field(..., alias="_id")
    authors: List = Field(...)
    body: str = Field(...)
    title: str = Field(...)
    dt: str = Field(..., alias="datetime")
    news_site: str = Field(..., alias="new_site")
    category: str = Field(...)
    estimated_reading_time: int = Field(...)

    class Config:
        arbitrary_types_allowed = True


class ArticleHistory(BaseModel):
    aid: str = Field(...)
    dt: str = Field(default=datetime.datetime.now().replace(microsecond=0), alias="datetime_read")
    category: str = Field(...)
    is_liked: bool = Field(default=False)


class ArticleReadingTime(BaseModel):
    aid: str = Field(...)
    reading_time: int = Field(...)
    estimated_rt: int = Field(...)
    score: float = Field(...)


class User(BaseModel):
    username: str
    email: str
    password: str
    reads_per_category: Dict = Field(default={
        "sports": 0,
        "health": 0,
        "entertainment": 0,
        "politics": 0,
        "business": 0
    })
    reads_history: List = Field(default=[])


class Token(BaseModel):
    access_token: str
    token_type: str