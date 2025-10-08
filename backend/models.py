# Models
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, Integer
from sqlalchemy.ext.declarative import declarative_base
Base = declarative_base()
# Models
class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    subscription_tier = Column(String, default="free")

class Chatbot(Base):
    __tablename__ = "chatbots"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String)
    name = Column(String)
    website_url = Column(String)
    training_data = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    api_key = Column(String, unique=True)
    is_active = Column(Integer, default=1)

class Conversation(Base):
    __tablename__ = "conversations"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    chatbot_id = Column(String)
    user_message = Column(Text)
    bot_response = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)