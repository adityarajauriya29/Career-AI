"""Async MongoDB connection using Motor."""
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

class MongoDB:
    client: AsyncIOMotorClient = None
    db = None

mongodb = MongoDB()

async def connect_to_mongo():
    mongodb.client = AsyncIOMotorClient(settings.MONGO_URI)
    mongodb.db = mongodb.client[settings.MONGO_DB]
    # Indexes
    await mongodb.db.users.create_index("email", unique=True)
    await mongodb.db.profiles.create_index("user_id", unique=True)
    await mongodb.db.career_roles.create_index("name", unique=True)
    await mongodb.db.roadmaps.create_index("user_id")
    await mongodb.db.progress.create_index([("user_id", 1), ("skill", 1)])
    print(f"[mongo] connected to {settings.MONGO_DB}")

async def close_mongo_connection():
    if mongodb.client:
        mongodb.client.close()

def get_db():
    return mongodb.db
