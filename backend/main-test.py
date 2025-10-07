# backend/main.py
from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional, List
import uuid
from dotenv import load_dotenv
load_dotenv()
from datetime import datetime
import os
from sqlalchemy import create_engine, Column, String, DateTime, Text, Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from passlib.context import CryptContext
import jwt
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_community.chat_models import ChatOpenAI
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory
import pickle


# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:root@localhost/chatbot_db")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Models
class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    subscription_tier = Column(String, default="free")  # free, paid

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

Base.metadata.create_all(bind=engine)

# FastAPI app
app = FastAPI(title="AI Chatbot Builder API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Password hashing - Switched to pbkdf2_sha256 to avoid bcrypt 72-byte limit issues
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")

# Pydantic models
class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class ChatbotCreate(BaseModel):
    name: str
    website_url: str
    training_data: str

class ChatMessage(BaseModel):
    message: str
    chatbot_api_key: str

# Dependencies
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def verify_token(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="No authorization header")
    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload["user_id"]
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

# Store for vector stores (in production, use Redis or S3)
vector_stores = {}

# Routes
@app.post("/api/auth/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = pwd_context.hash(user.password)
    new_user = User(email=user.email, password_hash=hashed_password)
    db.add(new_user)
    db.commit()
    
    token = jwt.encode({"user_id": new_user.id}, SECRET_KEY, algorithm="HS256")
    return {"token": token, "user_id": new_user.id}

@app.post("/api/auth/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not pwd_context.verify(user.password, db_user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = jwt.encode({"user_id": db_user.id}, SECRET_KEY, algorithm="HS256")
    return {"token": token, "user_id": db_user.id}

# router = APIRouter()
vector_stores = {}  # temporary in-memory storage

@app.post("/api/chatbots")
def create_chatbot(chatbot: ChatbotCreate, user_id: str = Depends(verify_token), db: Session = Depends(get_db)):
    # Generate unique API key
    api_key = f"cb_{uuid.uuid4().hex}"

    # Split text into chunks for embedding
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    chunks = text_splitter.split_text(chatbot.training_data)

    # Create embeddings
    embeddings = OpenAIEmbeddings(openai_api_key=os.getenv("OPENAI_API_KEY"))
    print("Generating embeddings, please wait...")
    vector_store = FAISS.from_texts(chunks, embeddings)

    # Store in-memory (for dev only)
    vector_stores[api_key] = vector_store

    # Save chatbot info in DB
    new_chatbot = Chatbot(
        user_id=user_id,
        name=chatbot.name,
        website_url=chatbot.website_url,
        training_data=chatbot.training_data,
        api_key=api_key
    )
    db.add(new_chatbot)
    db.commit()
    db.refresh(new_chatbot)

    # Local testing domain
    domain = "http://127.0.0.1:8000"

    return {
        "chatbot_id": new_chatbot.id,
        "api_key": api_key,
        "embed_code": f'<script src="{domain}/embed.js" data-chatbot-key="{api_key}"></script>'
    }

@app.get("/api/chatbots")
def get_chatbots(user_id: str = Depends(verify_token), db: Session = Depends(get_db)):
    chatbots = db.query(Chatbot).filter(Chatbot.user_id == user_id).all()
    return [{"id": c.id, "name": c.name, "website_url": c.website_url, "api_key": c.api_key, "created_at": c.created_at} for c in chatbots]

@app.post("/api/chat")
def chat(msg: ChatMessage, db: Session = Depends(get_db)):
    # Verify chatbot exists
    chatbot = db.query(Chatbot).filter(Chatbot.api_key == msg.chatbot_api_key).first()
    if not chatbot:
        raise HTTPException(status_code=404, detail="Chatbot not found")
    
    # Get vector store
    vector_store = vector_stores.get(msg.chatbot_api_key)
    if not vector_store:
        raise HTTPException(status_code=500, detail="Chatbot not initialized")
    
    # Create conversation chain
    llm = ChatOpenAI(temperature=0.7, model="gpt-3.5-turbo", openai_api_key=os.getenv("OPENAI_API_KEY"))
    memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)
    
    qa_chain = ConversationalRetrievalChain.from_llm(
        llm=llm,
        retriever=vector_store.as_retriever(),
        memory=memory
    )
    
    # Get response
    result = qa_chain({"question": msg.message})
    response = result["answer"]
    
    # Log conversation
    conv = Conversation(
        chatbot_id=chatbot.id,
        user_message=msg.message,
        bot_response=response
    )
    db.add(conv)
    db.commit()
    
    return {"response": response}

@app.get("/api/conversations/{chatbot_id}")
def get_conversations(chatbot_id: str, user_id: str = Depends(verify_token), db: Session = Depends(get_db)):
    # Verify ownership
    chatbot = db.query(Chatbot).filter(Chatbot.id == chatbot_id, Chatbot.user_id == user_id).first()
    if not chatbot:
        raise HTTPException(status_code=404, detail="Chatbot not found")
    
    conversations = db.query(Conversation).filter(Conversation.chatbot_id == chatbot_id).order_by(Conversation.created_at.desc()).limit(100).all()
    return [{"user_message": c.user_message, "bot_response": c.bot_response, "created_at": c.created_at} for c in conversations]

@app.get("/")
def root():
    return {"message": "AI Chatbot Builder API", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)