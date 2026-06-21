"""Pydantic schemas for user/auth."""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Literal

Role = Literal["student", "mentor", "placement_officer", "admin"]

class UserRegister(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    role: Role = "student"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict

class PasswordChange(BaseModel):
    old_password: str
    new_password: str = Field(min_length=8)

class PasswordReset(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str = Field(min_length=8)
