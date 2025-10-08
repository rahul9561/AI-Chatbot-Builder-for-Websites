# 📚 AI Chatbot Builder - Complete Documentation

> Build, deploy, and monetize AI chatbots for websites in minutes

## Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Backend API](#backend-api)
4. [Frontend Dashboard](#frontend-dashboard)
5. [Embed Widget](#embed-widget)
6. [Deployment](#deployment)
7. [Monetization](#monetization)
8. [Advanced Features](#advanced-features)
9. [Troubleshooting](#troubleshooting)
10. [API Reference](#api-reference)

---

## Overview

### What is AI Chatbot Builder?

AI Chatbot Builder is a complete SaaS solution that allows businesses to create AI-powered chatbots for their websites. The platform includes:

- **Dashboard**: Create and manage chatbots
- **AI Engine**: Powered by OpenAI/Llama for intelligent responses
- **Embed Widget**: Easy integration with any website
- **Analytics**: Track conversations and user engagement

### Tech Stack

```
Frontend: React 18 + Vite + Tailwind CSS
Backend: FastAPI (Python)
Database: PostgreSQL
AI: LangChain + OpenAI/Llama 3
Embedding: FAISS Vector Store
```

### Key Features

✅ No-code chatbot creation  
✅ Train on custom data (FAQs, docs, products)  
✅ One-line embed code  
✅ Real-time conversations  
✅ Conversation logging  
✅ Multi-chatbot support  
✅ Responsive design  
✅ Custom theming  

---

## Installation

### Prerequisites

Before you begin, ensure you have:

- **Python 3.8+** ([Download](https://python.org))
- **Node.js 18+** ([Download](https://nodejs.org))
- **PostgreSQL 12+** ([Download](https://postgresql.org))
- **OpenAI API Key** ([Get here](https://platform.openai.com/api-keys))

### Step 1: Clone Project

```bash
mkdir ai-chatbot-builder
cd ai-chatbot-builder
```

### Step 2: Backend Setup

```bash
# Create backend directory
mkdir backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Create requirements.txt
cat > requirements.txt << EOF
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
pydantic[email]==2.5.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
langchain==0.1.0
langchain-community==0.0.10
openai==1.6.1
faiss-cpu==1.7.4
tiktoken==0.5.2
python-dotenv==1.0.0
EOF

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
DATABASE_URL=postgresql://chatbot_user:chatbot_pass@localhost:5432/chatbot_db
OPENAI_API_KEY=sk-your-openai-key-here
SECRET_KEY=your-super-secret-jwt-key-change-in-production
HOST=0.0.0.0
PORT=8000
EOF
```

### Step 3: Database Setup

```bash
# Create PostgreSQL database
psql -U postgres

# In psql prompt:
CREATE DATABASE chatbot_db;
CREATE USER chatbot_user WITH PASSWORD 'chatbot_pass';
GRANT ALL PRIVILEGES ON DATABASE chatbot_db TO chatbot_user;
\q
```

### Step 4: Frontend Setup

```bash
# Go back to root
cd ..

# Create frontend with Vite
npm create vite@latest frontend -- --template react
cd frontend

# Install dependencies
npm install
npm install lucide-react
npm install -D tailwindcss postcss autoprefixer

# Initialize Tailwind
npx tailwindcss init -p
```

**Configure Tailwind** (tailwind.config.js):
```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**Update src/index.css**:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Step 5: Run the Application

**Terminal 1 - Backend**:
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python main.py
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm run dev
```

**Access**:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## Backend API

### Architecture

```
backend/
├── main.py                 # FastAPI application
├── requirements.txt        # Python dependencies
├── .env                    # Environment variables
└── venv/                   # Virtual environment
```

### Database Models

#### User Model
```python
class User(Base):
    id: String (UUID)
    email: String (unique)
    password_hash: String
    created_at: DateTime
    subscription_tier: String  # free, paid
```

#### Chatbot Model
```python
class Chatbot(Base):
    id: String (UUID)
    user_id: String
    name: String
    website_url: String
    training_data: Text
    created_at: DateTime
    api_key: String (unique)
    is_active: Integer
```

#### Conversation Model
```python
class Conversation(Base):
    id: String (UUID)
    chatbot_id: String
    user_message: Text
    bot_response: Text
    created_at: DateTime
```

### API Endpoints

#### Authentication

**POST /api/auth/register**
```json
Request:
{
  "email": "user@example.com",
  "password": "securepassword123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user_id": "uuid-here"
}
```

**POST /api/auth/login**
```json
Request:
{
  "email": "user@example.com",
  "password": "securepassword123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user_id": "uuid-here"
}
```

#### Chatbot Management

**POST /api/chatbots** (Requires Auth)
```json
Request:
{
  "name": "Support Bot",
  "website_url": "https://example.com",
  "training_data": "Q: What are your hours?\nA: 9 AM to 5 PM..."
}

Response:
{
  "chatbot_id": "uuid-here",
  "api_key": "cb_abc123...",
  "embed_code": "<script src='...'></script>"
}
```

**GET /api/chatbots** (Requires Auth)
```json
Response:
[
  {
    "id": "uuid-here",
    "name": "Support Bot",
    "website_url": "https://example.com",
    "api_key": "cb_abc123...",
    "created_at": "2024-01-01T00:00:00"
  }
]
```

#### Chat

**POST /api/chat**
```json
Request:
{
  "message": "What are your business hours?",
  "chatbot_api_key": "cb_abc123..."
}

Response:
{
  "response": "We're open Monday-Friday, 9 AM to 5 PM."
}
```

#### Conversations

**GET /api/conversations/{chatbot_id}** (Requires Auth)
```json
Response:
[
  {
    "user_message": "What are your hours?",
    "bot_response": "9 AM to 5 PM",
    "created_at": "2024-01-01T12:00:00"
  }
]
```

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# OpenAI
OPENAI_API_KEY=sk-...

# Security
SECRET_KEY=random-secret-key-here

# Server
HOST=0.0.0.0
PORT=8000

# CORS (comma-separated)
ALLOWED_ORIGINS=http://localhost:5173,https://yourdomain.com
```

---

## Frontend Dashboard

### Features

1. **Authentication**
   - User registration
   - Login/Logout
   - JWT token management

2. **Chatbot Management**
   - Create new chatbots
   - View all chatbots
   - Copy API keys
   - Copy embed codes

3. **Analytics**
   - View conversations
   - Message history
   - Timestamps

### Components

#### Authentication Page
- Email/password login
- Registration
- Form validation

#### Dashboard
- Grid layout of chatbots
- Create new button
- Quick actions

#### Create Chatbot
- Form inputs
- Training data textarea
- Instant embed code generation

#### Conversations View
- Message history
- User/bot messages
- Timestamps

### State Management

The app uses React hooks for state:

```javascript
const [token, setToken] = useState(localStorage.getItem('token'));
const [chatbots, setChatbots] = useState([]);
const [conversations, setConversations] = useState([]);
```

### API Integration

```javascript
const API_URL = 'http://localhost:8000/api';

// Fetch with auth
fetch(`${API_URL}/chatbots`, {
  headers: { 'Authorization': `Bearer ${token}` }
})
```

---

## Embed Widget

### Basic Usage

```html
<!DOCTYPE html>
<html>
<body>
  <!-- Your website content -->
  
  <!-- Add before closing </body> tag -->
  <script src="https://your-domain.com/embed.js" 
          data-chatbot-key="cb_your_api_key">
  </script>
</body>
</html>
```

### Customization Options

#### 1. Position
```html
<!-- Right side (default) -->
<script src="embed.js" 
        data-chatbot-key="cb_key"
        data-position="right"></script>

<!-- Left side -->
<script src="embed.js" 
        data-chatbot-key="cb_key"
        data-position="left"></script>
```

#### 2. Theme
```html
<!-- Gradient (default) -->
<script data-theme="gradient"></script>

<!-- Blue -->
<script data-theme="blue"></script>

<!-- Purple -->
<script data-theme="purple"></script>

<!-- Dark -->
<script data-theme="dark"></script>
```

### Features

✅ Responsive design  
✅ Auto-open after 3 seconds  
✅ Unread message badge  
✅ Typing indicators  
✅ Smooth animations  
✅ Mobile-friendly  
✅ Custom scrollbar  
✅ Error handling  

### Widget Architecture

```javascript
1. Inject HTML into page
2. Add CSS animations
3. Initialize event listeners
4. Connect to backend API
5. Handle user messages
6. Display bot responses
7. Track analytics
```

### Customizing Colors

Edit `embed.js` themes:

```javascript
const themes = {
  custom: {
    primary: 'linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%)',
    primarySolid: '#FF6B6B',
    text: '#ffffff'
  }
};
```

### Mobile Responsiveness

```css
@media (max-width: 480px) {
  #chat-window {
    width: calc(100vw - 40px) !important;
    height: calc(100vh - 100px) !important;
  }
}
```

---

## Deployment

### Option 1: Railway.app (Recommended for Beginners)

#### Backend Deployment

```bash
# Install Railway CLI
npm install -g railway

# Login
railway login

# Initialize project
cd backend
railway init

# Add environment variables in Railway dashboard
# DATABASE_URL, OPENAI_API_KEY, SECRET_KEY

# Deploy
railway up
```

#### Frontend Deployment

```bash
cd frontend
npm run build

# Deploy to Railway
railway init
railway up
```

**Cost**: Free tier available, then $5/month

### Option 2: Vercel (Frontend) + Render (Backend)

#### Frontend on Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
npm run build
vercel deploy --prod
```

#### Backend on Render

1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect GitHub repo
4. Configure:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables
6. Deploy

**Cost**: Free tier available

### Option 3: DigitalOcean (Full Control)

#### Create Droplet

```bash
# SSH into droplet
ssh root@your-droplet-ip

# Update system
apt update && apt upgrade -y

# Install dependencies
apt install -y python3-pip postgresql nginx nodejs npm

# Setup PostgreSQL
sudo -u postgres psql
CREATE DATABASE chatbot_db;
CREATE USER chatbot_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE chatbot_db TO chatbot_user;
\q
```

#### Deploy Backend

```bash
# Clone repo
git clone https://github.com/yourusername/ai-chatbot-builder.git
cd ai-chatbot-builder/backend

# Install Python packages
pip3 install -r requirements.txt

# Create systemd service
sudo nano /etc/systemd/system/chatbot.service
```

**chatbot.service**:
```ini
[Unit]
Description=Chatbot API
After=network.target

[Service]
User=root
WorkingDirectory=/root/ai-chatbot-builder/backend
Environment="PATH=/usr/local/bin:/usr/bin:/bin"
ExecStart=/usr/local/bin/uvicorn main:app --host 0.0.0.0 --port 8000

[Install]
WantedBy=multi-user.target
```

```bash
# Start service
sudo systemctl start chatbot
sudo systemctl enable chatbot
```

#### Setup Nginx

```bash
sudo nano /etc/nginx/sites-available/chatbot
```

**nginx config**:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/chatbot /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Install SSL (Let's Encrypt)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

#### Deploy Frontend

```bash
cd ../frontend
npm install
npm run build

# Copy to nginx
sudo cp -r dist/* /var/www/html/
```

**Cost**: $5-$12/month

### Database Options

#### Free Tier
- **Neon.tech**: PostgreSQL, 10GB free
- **Supabase**: PostgreSQL, 500MB free
- **ElephantSQL**: PostgreSQL, 20MB free

#### Paid
- **DigitalOcean Managed**: $15/month
- **AWS RDS**: $12+/month
- **Render PostgreSQL**: $7/month

### CDN for Embed Widget

#### Cloudflare Pages (Recommended)

```bash
# Build widget
# Upload embed.js to Cloudflare Pages

# Access via
https://your-project.pages.dev/embed.js
```

#### AWS S3 + CloudFront

```bash
# Upload to S3
aws s3 cp embed.js s3://your-bucket/embed.js --acl public-read

# Create CloudFront distribution
# Access via CloudFront URL
```

---

## Monetization

### Pricing Strategy

#### Tier 1: Free Trial
- 7 days free
- 100 messages limit
- 1 chatbot
- Basic support

#### Tier 2: Basic Plan - ₹499/month
- Unlimited messages
- 1 chatbot
- Custom branding
- Email support
- Analytics dashboard

#### Tier 3: Pro Plan - ₹999/month
- Everything in Basic
- 3 chatbots
- Priority support
- API access
- Advanced analytics

#### Tier 4: Enterprise - ₹5,000-₹15,000 (one-time)
- Custom setup
- Unlimited chatbots
- White-label solution
- Dedicated support
- Custom integrations
- Training sessions

### Revenue Calculations

**Scenario 1: Subscription Model**
```
20 clients × ₹499/month = ₹9,980/month
Annual: ₹1,19,760

50 clients × ₹499/month = ₹24,950/month
Annual: ₹2,99,400
```

**Scenario 2: One-Time Setup**
```
10 clients × ₹5,000 = ₹50,000
20 clients × ₹8,000 = ₹1,60,000
```

**Scenario 3: Hybrid Model**
```
10 enterprise clients × ₹10,000 = ₹1,00,000 (one-time)
30 basic clients × ₹499 = ₹14,970/month (recurring)

First month: ₹1,14,970
Annual recurring: ₹1,79,640
```

### Payment Integration

#### Razorpay (India)

```python
# Install
pip install razorpay

# In main.py
import razorpay

client = razorpay.Client(auth=("key_id", "key_secret"))

@app.post("/api/create-subscription")
def create_subscription(user_id: str, plan: str):
    subscription = client.subscription.create({
        "plan_id": "plan_id_here",
        "customer_notify": 1,
        "total_count": 12,
        "quantity": 1
    })
    return subscription
```

#### Stripe (International)

```python
# Install
pip install stripe

# In main.py
import stripe

stripe.api_key = "sk_..."

@app.post("/api/create-checkout")
def create_checkout(price_id: str):
    checkout_session = stripe.checkout.Session.create(
        payment_method_types=['card'],
        line_items=[{
            'price': price_id,
            'quantity': 1,
        }],
        mode='subscription',
        success_url='https://yourdomain.com/success',
        cancel_url='https://yourdomain.com/cancel',
    )
    return {"url": checkout_session.url}
```

### Sales Funnel

```
1. Landing Page → 
2. Free Trial Signup → 
3. Create First Chatbot → 
4. See Value (conversations) → 
5. Trial Expires → 
6. Upgrade Prompt → 
7. Payment → 
8. Active Subscription
```

### Marketing Strategies

#### 1. Content Marketing
- Blog: "How to Add AI Chat to Your Website"
- YouTube tutorials
- Case studies
- SEO optimization

#### 2. Local Business Outreach
- Visit local businesses
- Offer free setup demo
- 30-day money-back guarantee

#### 3. Social Media
- Twitter automation tips
- LinkedIn B2B marketing
- Instagram reels showing setup

#### 4. Partnerships
- Web development agencies
- Digital marketing firms
- WordPress plugin developers

#### 5. Affiliate Program
- 20% commission
- Lifetime recurring
- Marketing materials provided

---

## Advanced Features

### 1. Multi-Language Support

```python
# In main.py
from langchain.prompts import PromptTemplate

template = """Answer in {language}:
Context: {context}
Question: {question}
"""

prompt = PromptTemplate(
    template=template,
    input_variables=["language", "context", "question"]
)
```

### 2. Lead Capture

```javascript
// In embed.js
function captureEmail() {
  const email = prompt("Enter your email for support:");
  if (email) {
    fetch(`${API_URL}/capture-lead`, {
      method: 'POST',
      body: JSON.stringify({ email, chatbot_key: chatbotKey })
    });
  }
}
```

### 3. Custom Training Sources

```python
# Scrape website
from langchain.document_loaders import WebBaseLoader

loader = WebBaseLoader("https://example.com")
docs = loader.load()

# Load PDF
from langchain.document_loaders import PyPDFLoader

loader = PyPDFLoader("document.pdf")
docs = loader.load()

# Load CSV
import pandas as pd

df = pd.read_csv("data.csv")
text = df.to_string()
```

### 4. Analytics Dashboard

```python
# Add analytics endpoint
@app.get("/api/analytics/{chatbot_id}")
def get_analytics(chatbot_id: str, user_id: str = Depends(verify_token)):
    conversations = db.query(Conversation).filter(
        Conversation.chatbot_id == chatbot_id
    ).all()
    
    return {
        "total_conversations": len(conversations),
        "avg_response_time": calculate_avg_time(conversations),
        "top_questions": get_top_questions(conversations),
        "user_satisfaction": calculate_satisfaction(conversations)
    }
```

### 5. A/B Testing

```python
# Test different responses
@app.post("/api/chat")
def chat(msg: ChatMessage):
    version = random.choice(['A', 'B'])
    
    if version == 'A':
        llm = ChatOpenAI(temperature=0.5)
    else:
        llm = ChatOpenAI(temperature=0.9)
    
    # Track which version performed better
    log_ab_test(version, msg, response)
```

### 6. Voice Chat

```javascript
// In embed.js
const recognition = new webkitSpeechRecognition();

recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript;
  sendMessage(transcript);
};

document.getElementById('voice-btn').onclick = () => {
  recognition.start();
};
```

### 7. Integration with CRM

```python
# HubSpot integration
import hubspot

@app.post("/api/sync-to-crm")
def sync_to_crm(conversation_id: str):
    conv = db.query(Conversation).get(conversation_id)
    
    # Create contact in HubSpot
    client = hubspot.Client.create(api_key="your-key")
    client.crm.contacts.basic_api.create(
        simple_public_object_input={
            "properties": {
                "email": conv.user_email,
                "notes": conv.user_message
            }
        }
    )
```

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Failed

**Error**: `psycopg2.OperationalError: could not connect to server`

**Solution**:
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Start PostgreSQL
sudo systemctl start postgresql

# Verify credentials in .env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

#### 2. OpenAI API Error

**Error**: `openai.error.AuthenticationError: Incorrect API key`

**Solution**:
```bash
# Verify API key
echo $OPENAI_API_KEY

# Get new key from https://platform.openai.com/api-keys

# Update .env
OPENAI_API_KEY=sk-proj-...
```

#### 3. CORS Error

**Error**: `Access to fetch blocked by CORS policy`

**Solution**:
```python
# In main.py, update CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### 4. Widget Not Showing

**Solution**:
```javascript
// Check browser console for errors
// Verify API key is correct
// Check if script is loaded:
console.log('Widget loaded:', typeof window.chatbotWidget);

// Verify backend is running
fetch('http://localhost:8000/')
  .then(r => r.json())
  .then(console.log);
```

#### 5. Slow Response Times

**Solution**:
```python
# Use Redis for caching
import redis
cache = redis.Redis(host='localhost', port=6379)

# Cache vector store
@app.post("/api/chat")
def chat(msg: ChatMessage):
    cache_key = f"vs_{msg.chatbot_api_key}"
    
    if cache.exists(cache_key):
        vector_store = pickle.loads(cache.get(cache_key))
    else:
        vector_store = create_vector_store()
        cache.set(cache_key, pickle.dumps(vector_store))
```

### Debug Mode

```bash
# Backend debug mode
uvicorn main:app --reload --log-level debug

# Frontend debug mode
npm run dev -- --debug
```

### Logging

```python
# Add logging to main.py
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.post("/api/chat")
def chat(msg: ChatMessage):
    logger.info(f"Received message: {msg.message}")
    # ... rest of code
    logger.info(f"Sent response: {response}")
```

---

## API Reference

### Complete Endpoint List

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | No | Create new user |
| POST | /api/auth/login | No | Login user |
| POST | /api/chatbots | Yes | Create chatbot |
| GET | /api/chatbots | Yes | List chatbots |
| GET | /api/chatbots/{id} | Yes | Get chatbot details |
| PUT | /api/chatbots/{id} | Yes | Update chatbot |
| DELETE | /api/chatbots/{id} | Yes | Delete chatbot |
| POST | /api/chat | No | Send message to chatbot |
| GET | /api/conversations/{id} | Yes | Get conversation history |
| POST | /api/analytics | No | Track analytics event |
| GET | /api/analytics/{id} | Yes | Get chatbot analytics |

### Rate Limits

```
Free Tier: 100 requests/hour
Basic Plan: 1,000 requests/hour
Pro Plan: 10,000 requests/hour
Enterprise: Unlimited
```

### Error Codes

```json
{
  "400": "Bad Request - Invalid input",
  "401": "Unauthorized - Invalid token",
  "403": "Forbidden - Insufficient permissions",
  "404": "Not Found - Resource doesn't exist",
  "429": "Too Many Requests - Rate limit exceeded",
  "500": "Internal Server Error"
}
```

---

## Support & Community

### Getting Help

- **Documentation**: https://docs.yourdomain.com
- **Email**: support@yourdomain.com
- **Discord**: https://discord.gg/your-server
- **GitHub Issues**: https://github.com/yourrepo/issues

### Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

### License

MIT License - Free for commercial use

---

## Appendix

### Useful Commands

```bash
# Backend
python main.py                    # Run backend
pip freeze > requirements.txt     # Update dependencies
python -m pytest                  # Run tests

# Frontend
npm run dev                       # Development server
npm run build                     # Production build
npm run preview                   # Preview build

# Database
psql -U postgres                  # Connect to PostgreSQL
pg_dump dbname > backup.sql       # Backup database
psql dbname < backup.sql          # Restore database

# Docker
docker-compose up                 # Start all services
docker-compose down               # Stop all services
docker-compose logs -f            # View logs
```

### Resources

- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [React Docs](https://react.dev/)
- [LangChain Docs](https://python.langchain.com/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**Built with ❤️ for entrepreneurs and developers**

*Last updated: October 2025*