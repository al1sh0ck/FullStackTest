from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class UserBase(BaseModel):
    email: str


class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: int

    class Config:
        orm_mode = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None


class TaskBase(BaseModel):
    title: str


class TaskCreate(TaskBase):
    pass


class Task(TaskBase):
    id: int
    completed: bool
    created_at: datetime
    owner_id: int

    class Config:
        orm_mode = True

class UserLogin(BaseModel):
    email: str
    password: str

class TaskUpdate(BaseModel):
    completed: bool