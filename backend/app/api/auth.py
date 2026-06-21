"""Auth: register, login, refresh, change password, forgot password."""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from bson import ObjectId
from datetime import datetime, timedelta
import random
import smtplib
from email.message import EmailMessage

from app.schemas.user import UserRegister, UserLogin, TokenResponse, PasswordChange
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.core.database import get_db
from app.middleware.auth import get_current_user
from app.core.config import settings

router = APIRouter()

ADMIN_EMAIL = "adityarajauriya29@gmail.com"


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class VerifyOtpRequest(BaseModel):
    email: EmailStr
    otp: str


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str


def send_otp_email(to_email: str, otp: str):
    if not settings.SMTP_EMAIL or not settings.SMTP_PASSWORD:
        raise HTTPException(
            status_code=500,
            detail="SMTP email is not configured"
        )

    msg = EmailMessage()
    msg["Subject"] = "Career AI Password Reset OTP"
    msg["From"] = settings.SMTP_EMAIL
    msg["To"] = to_email

    msg.set_content(
        f"""
Hello,

Your Career AI password reset OTP is:

{otp}

This OTP is valid for 10 minutes.

If you did not request this, please ignore this email.

Career AI Team
"""
    )

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
        server.starttls()
        server.login(settings.SMTP_EMAIL, settings.SMTP_PASSWORD)
        server.send_message(msg)


@router.post("/register", response_model=TokenResponse)
async def register(payload: UserRegister):
    db = get_db()

    email = payload.email.lower().strip()

    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email already registered")

    role = "admin" if email == ADMIN_EMAIL else "student"

    doc = {
        "name": payload.name,
        "email": email,
        "password": hash_password(payload.password),
        "role": role,
        "created_at": datetime.utcnow(),
    }

    result = await db.users.insert_one(doc)
    uid = str(result.inserted_id)

    if role == "student":
        await db.profiles.insert_one({
            "user_id": uid,
            "skills": [],
            "projects": [],
            "certifications": [],
            "interests": [],
            "latest_gap": None
        })

    access = create_access_token({"sub": uid, "role": role})
    refresh = create_refresh_token({"sub": uid, "role": role})

    return {
        "access_token": access,
        "refresh_token": refresh,
        "token_type": "bearer",
        "user": {
            "id": uid,
            "name": payload.name,
            "email": email,
            "role": role
        }
    }


@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLogin):
    db = get_db()

    email = payload.email.lower().strip()

    user = await db.users.find_one({"email": email})

    if not user or not verify_password(payload.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    uid = str(user["_id"])

    access = create_access_token({"sub": uid, "role": user["role"]})
    refresh = create_refresh_token({"sub": uid, "role": user["role"]})

    return {
        "access_token": access,
        "refresh_token": refresh,
        "token_type": "bearer",
        "user": {
            "id": uid,
            "name": user["name"],
            "email": user["email"],
            "role": user["role"]
        }
    }


@router.post("/forgot-password")
async def forgot_password(payload: ForgotPasswordRequest):
    db = get_db()

    email = payload.email.lower().strip()

    user = await db.users.find_one({"email": email})

    if not user:
        raise HTTPException(status_code=404, detail="Email not registered")

    otp = str(random.randint(100000, 999999))

    await db.password_resets.delete_many({"email": email})

    await db.password_resets.insert_one({
        "email": email,
        "otp": otp,
        "verified": False,
        "created_at": datetime.utcnow(),
        "expires_at": datetime.utcnow() + timedelta(minutes=10)
    })

    send_otp_email(email, otp)

    return {
        "message": "OTP sent to your registered email"
    }


@router.post("/verify-otp")
async def verify_otp(payload: VerifyOtpRequest):
    db = get_db()

    email = payload.email.lower().strip()

    record = await db.password_resets.find_one({
        "email": email,
        "otp": payload.otp
    })

    if not record:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    if record["expires_at"] < datetime.utcnow():
        raise HTTPException(status_code=400, detail="OTP expired")

    await db.password_resets.update_one(
        {"_id": record["_id"]},
        {"$set": {"verified": True}}
    )

    return {
        "message": "OTP verified successfully"
    }


@router.post("/reset-password")
async def reset_password(payload: ResetPasswordRequest):
    db = get_db()

    email = payload.email.lower().strip()

    if len(payload.new_password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters"
        )

    record = await db.password_resets.find_one({
        "email": email,
        "otp": payload.otp,
        "verified": True
    })

    if not record:
        raise HTTPException(status_code=400, detail="OTP not verified")

    if record["expires_at"] < datetime.utcnow():
        raise HTTPException(status_code=400, detail="OTP expired")

    await db.users.update_one(
        {"email": email},
        {"$set": {"password": hash_password(payload.new_password)}}
    )

    await db.password_resets.delete_many({"email": email})

    return {
        "message": "Password reset successfully"
    }


@router.post("/refresh")
async def refresh(refresh_token: str):
    try:
        payload = decode_token(refresh_token)

        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid refresh token")

    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    access = create_access_token({
        "sub": payload["sub"],
        "role": payload["role"]
    })

    return {
        "access_token": access,
        "token_type": "bearer"
    }


@router.post("/logout")
async def logout(user=Depends(get_current_user)):
    return {
        "message": "Logged out"
    }


@router.post("/change-password")
async def change_password(
    payload: PasswordChange,
    user=Depends(get_current_user)
):
    db = get_db()

    full = await db.users.find_one({
        "_id": ObjectId(user["_id"])
    })

    if not full:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(payload.old_password, full["password"]):
        raise HTTPException(status_code=400, detail="Old password incorrect")

    await db.users.update_one(
        {"_id": ObjectId(user["_id"])},
        {"$set": {"password": hash_password(payload.new_password)}}
    )

    return {
        "message": "Password updated"
    }


@router.get("/me")
async def me(user=Depends(get_current_user)):
    return {
        "id": user["_id"],
        "name": user["name"],
        "email": user["email"],
        "role": user["role"]
    }