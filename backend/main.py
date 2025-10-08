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
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_community.llms import HuggingFacePipeline
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
import torch
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from db import SessionLocal, engine, Base
from models import User, Chatbot, Conversation



from bs4 import BeautifulSoup
import requests

def scrape_website_text(url: str) -> str:
    try:
        res = requests.get(url, timeout=10)
        res.raise_for_status()
        soup = BeautifulSoup(res.text, "html.parser")
        # Remove scripts and styles
        for script in soup(["script", "style"]):
            script.decompose()
        text = ' '.join(soup.stripped_strings)
        return text[:5000]  # limit to 5000 chars to avoid huge embeddings
    except Exception as e:
        print(f"Error scraping {url}: {e}")
        return ""


def scrape_main_content(url: str) -> str:
    try:
        res = requests.get(url, timeout=10)
        res.raise_for_status()
        soup = BeautifulSoup(res.text, "html.parser")
        
        # Grab only meaningful text
        content = []
        for tag in soup.find_all(["p", "h1", "h2", "h3", "li"]):
            text = tag.get_text(strip=True)
            if text:
                content.append(text)
        
        text = ' '.join(content)
        return text[:5000]  # limit to 5000 chars to avoid too large embeddings
    except Exception as e:
        print(f"Error scraping {url}: {e}")
        return ""





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

from fastapi.responses import Response

@app.get("/embed.js")
def embed_js():
    js_code = """
(function() {
    const scriptTag = document.currentScript;
    const apiKey = scriptTag.getAttribute('data-chatbot-key');

    const container = document.createElement('div');
    container.id = 'chatbot-container';
    container.style.cssText = 'position:fixed;bottom:20px;right:20px;width:350px;height:500px;border:1px solid #ccc;background:white;z-index:9999;display:flex;flex-direction:column;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.15)';

    const header = document.createElement('div');
    header.style.cssText = 'padding:15px;background:#007bff;color:white;font-weight:bold;border-radius:12px 12px 0 0;';
    header.innerText = 'Chat Assistant';
    container.appendChild(header);

    const messages = document.createElement('div');
    messages.id = 'chatbot-messages';
    messages.style.cssText = 'flex:1;padding:15px;overflow-y:auto;background:#f8f9fa;';
    container.appendChild(messages);

    const inputContainer = document.createElement('div');
    inputContainer.style.cssText = 'display:flex;border-top:1px solid #ccc;background:white;border-radius:0 0 12px 12px;';

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Type a message...';
    input.style.cssText = 'flex:1;padding:12px;border:none;outline:none;font-size:14px;';
    inputContainer.appendChild(input);

    const sendBtn = document.createElement('button');
    sendBtn.innerText = 'Send';
    sendBtn.style.cssText = 'padding:12px 20px;cursor:pointer;background:#007bff;color:white;border:none;font-weight:bold;';
    sendBtn.onmouseover = function() { this.style.background = '#0056b3'; };
    sendBtn.onmouseout = function() { this.style.background = '#007bff'; };
    inputContainer.appendChild(sendBtn);

    container.appendChild(inputContainer);
    document.body.appendChild(container);

    async function sendMessage(msg) {
        const userMsgElem = document.createElement('div');
        userMsgElem.style.cssText = 'margin-bottom:10px;padding:10px;background:#007bff;color:white;border-radius:8px;max-width:80%;align-self:flex-end;margin-left:auto;';
        userMsgElem.innerText = msg;
        messages.appendChild(userMsgElem);
        messages.scrollTop = messages.scrollHeight;

        const botElem = document.createElement('div');
        botElem.style.cssText = 'margin-bottom:10px;padding:10px;background:#e9ecef;border-radius:8px;max-width:80%;font-style:italic;color:#666;';
        botElem.innerText = 'Typing...';
        messages.appendChild(botElem);
        messages.scrollTop = messages.scrollHeight;

        try {
            const res = await fetch('http://127.0.0.1:8000/api/chat', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({message: msg, chatbot_api_key: apiKey})
            });

            if (!res.ok) {
                throw new Error('Failed to get response');
            }

            const data = await res.json();
            botElem.style.fontStyle = 'normal';
            botElem.style.color = '#000';
            botElem.innerText = data.response || 'Sorry, I could not generate a response.';
        } catch (error) {
            botElem.style.fontStyle = 'normal';
            botElem.style.color = 'red';
            botElem.innerText = 'Error: Could not connect to chatbot. Please try again.';
            console.error('Chat error:', error);
        }
        messages.scrollTop = messages.scrollHeight;
    }

    sendBtn.addEventListener('click', () => {
        if(input.value.trim() !== '') {
            sendMessage(input.value);
            input.value = '';
        }
    });

    input.addEventListener('keypress', (e) => {
        if(e.key === 'Enter' && input.value.trim() !== '') {
            sendMessage(input.value);
            input.value = '';
        }
    });
})();
"""
    return Response(content=js_code, media_type="application/javascript")

# Password hashing
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
    # training_data: str

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
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")

# Store for vector stores and QA chains
vector_stores = {}
qa_chains = {}

# Global LLM setup with better configuration
print("Loading LLM model... This may take a moment...")
model_id = "gpt2"  # Using base GPT-2 for faster responses
tokenizer = AutoTokenizer.from_pretrained(model_id)

# Set padding token
if tokenizer.pad_token is None:
    tokenizer.pad_token = tokenizer.eos_token

model = AutoModelForCausalLM.from_pretrained(model_id)

# Optimized pipeline configuration
pipe = pipeline(
    "text-generation",
    model=model,
    tokenizer=tokenizer,
    max_new_tokens=100,
    temperature=0.7,
    do_sample=True,
    top_p=0.9,
    repetition_penalty=1.2,
    pad_token_id=tokenizer.eos_token_id,
    eos_token_id=tokenizer.eos_token_id
)

llm = HuggingFacePipeline(pipeline=pipe)
print("LLM model loaded successfully!")

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
    db.refresh(new_user)
    
    token = jwt.encode({"user_id": new_user.id}, SECRET_KEY, algorithm="HS256")
    return {"token": token, "user_id": new_user.id}

@app.post("/api/auth/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not pwd_context.verify(user.password, db_user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = jwt.encode({"user_id": db_user.id}, SECRET_KEY, algorithm="HS256")
    return {"token": token, "user_id": db_user.id}

@app.post("/api/chatbots")
def create_chatbot(chatbot: ChatbotCreate, user_id: str = Depends(verify_token), db: Session = Depends(get_db)):
    api_key = f"cb_{uuid.uuid4().hex}"

    # Scrape website content automatically
    training_data = scrape_website_text(chatbot.website_url)
    if not training_data:
        raise HTTPException(status_code=400, detail="Failed to scrape website content")

    try:
        # Split text into chunks
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
        chunks = text_splitter.split_text(training_data)

        embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
        vector_store = FAISS.from_texts(chunks, embeddings)

        prompt_template = """Use the following context to answer the question. If you don't know the answer, just say you don't know.

Context: {context}

Question: {question}

Answer:"""

        PROMPT = PromptTemplate(template=prompt_template, input_variables=["context", "question"])

        qa_chain = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=vector_store.as_retriever(search_kwargs={"k": 2}),
            chain_type_kwargs={"prompt": PROMPT},
            return_source_documents=False
        )

        vector_stores[api_key] = vector_store
        qa_chains[api_key] = qa_chain

        new_chatbot = Chatbot(
            user_id=user_id,
            name=chatbot.name,
            website_url=chatbot.website_url,
            training_data=training_data,
            api_key=api_key
        )
        db.add(new_chatbot)
        db.commit()
        db.refresh(new_chatbot)

        domain = "http://127.0.0.1:8000"
        return {
            "chatbot_id": new_chatbot.id,
            "api_key": api_key,
            "embed_code": f'<script src="{domain}/embed.js" data-chatbot-key="{api_key}"></script>'
        }

    except Exception as e:
        print(f"Error creating chatbot: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create chatbot: {e}")




@app.get("/api/chatbots")
def get_chatbots(user_id: str = Depends(verify_token), db: Session = Depends(get_db)):
    chatbots = db.query(Chatbot).filter(Chatbot.user_id == user_id).all()
    return [{
        "id": c.id,
        "name": c.name,
        "website_url": c.website_url,
        "api_key": c.api_key,
        "created_at": c.created_at
    } for c in chatbots]

def rebuild_qa_chain(chatbot: Chatbot, api_key: str):
    """Rebuild QA chain from stored training data"""
    try:
        print(f"Rebuilding QA chain for chatbot: {chatbot.name}")
        
        # Split text into chunks
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50
        )
        chunks = text_splitter.split_text(chatbot.training_data)
        
        # Create embeddings
        embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )
        vector_store = FAISS.from_texts(chunks, embeddings)
        
        # Create prompt template
        prompt_template = """Use the following context to answer the question. If you don't know the answer, just say you don't know.

Context: {context}

Question: {question}

Answer:"""
        
        PROMPT = PromptTemplate(
            template=prompt_template,
            input_variables=["context", "question"]
        )
        
        # Create QA chain
        qa_chain = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=vector_store.as_retriever(search_kwargs={"k": 2}),
            chain_type_kwargs={"prompt": PROMPT},
            return_source_documents=False
        )
        
        # Store both
        vector_stores[api_key] = vector_store
        qa_chains[api_key] = qa_chain
        
        print(f"QA chain rebuilt successfully for {api_key}")
        return qa_chain
        
    except Exception as e:
        print(f"Error rebuilding QA chain: {str(e)}")
        return None

@app.post("/api/chat")
def chat(msg: ChatMessage, db: Session = Depends(get_db)):
    print(f"Received chat message: {msg.message}")
    print(f"API Key: {msg.chatbot_api_key}")
    
    # Verify chatbot exists
    chatbot = db.query(Chatbot).filter(Chatbot.api_key == msg.chatbot_api_key).first()
    if not chatbot:
        print("Chatbot not found in database")
        raise HTTPException(status_code=404, detail="Chatbot not found")
    
    # Get QA chain or rebuild if missing
    qa_chain = qa_chains.get(msg.chatbot_api_key)
    if not qa_chain:
        print("QA chain not found - rebuilding from training data...")
        qa_chain = rebuild_qa_chain(chatbot, msg.chatbot_api_key)
        if not qa_chain:
            raise HTTPException(status_code=500, detail="Failed to initialize chatbot")
    
    try:
        print("Running QA chain...")
        
        # Run the chain with proper error handling
        result = qa_chain({"query": msg.message})
        
        print(f"QA chain result: {result}")
        
        # Extract response
        response = result.get("result", "").strip()
        
        # Fallback if response is empty
        if not response:
            response = "I'm not sure how to answer that based on my training data."
        
        # Clean up response - remove any prompt artifacts
        if "Answer:" in response:
            response = response.split("Answer:")[-1].strip()
        
        # Limit response length
        if len(response) > 500:
            response = response[:500] + "..."
        
        print(f"Final response: {response}")
        
        # Log conversation
        conv = Conversation(
            chatbot_id=chatbot.id,
            user_message=msg.message,
            bot_response=response
        )
        db.add(conv)
        db.commit()
        
        return {"response": response}
        
    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        import traceback
        traceback.print_exc()
        
        # Provide a fallback response instead of failing
        fallback_response = "I'm having trouble processing that right now. Could you rephrase your question?"
        
        # Still log the conversation
        try:
            conv = Conversation(
                chatbot_id=chatbot.id,
                user_message=msg.message,
                bot_response=fallback_response
            )
            db.add(conv)
            db.commit()
        except:
            pass
        
        return {"response": fallback_response}

@app.get("/api/conversations/{chatbot_id}")
def get_conversations(chatbot_id: str, user_id: str = Depends(verify_token), db: Session = Depends(get_db)):
    chatbot = db.query(Chatbot).filter(
        Chatbot.id == chatbot_id,
        Chatbot.user_id == user_id
    ).first()
    
    if not chatbot:
        raise HTTPException(status_code=404, detail="Chatbot not found")
    
    conversations = db.query(Conversation).filter(
        Conversation.chatbot_id == chatbot_id
    ).order_by(Conversation.created_at.desc()).limit(100).all()
    
    return [{
        "user_message": c.user_message,
        "bot_response": c.bot_response,
        "created_at": c.created_at
    } for c in conversations]

@app.get("/")
def root():
    return {"message": "AI Chatbot Builder API", "version": "1.0.1"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)