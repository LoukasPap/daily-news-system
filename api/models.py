from pydantic import BaseModel, SkipValidation, Field
from typing_extensions import Annotated
import datetime
from typing import List


class Article(BaseModel):
    url: str = Field(..., alias="_id")
    authors: List = Field(...)
    body: str = Field(...)
    title: str = Field(...)
    dt: str = Field(..., alias="datetime")
    news_site: str = Field(..., alias="new_site")
    category: str = Field(...)

    class Config:
        arbitrary_types_allowed = True

class User(BaseModel):
    username: str
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str