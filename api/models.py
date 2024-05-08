from pydantic import BaseModel

class Article(BaseModel):
    url: str
    authors: list = []
    body: str
    title: str
    datetime: str
    news_site: str
    category: str

class User(BaseModel):
    username: str
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str