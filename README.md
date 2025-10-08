# 🤖 AI Chatbot Builder for Websites

### 💡 Overview  
**AI Chatbot Builder** is a SaaS-style platform that lets businesses **train a custom AI chatbot** on their website’s content — such as FAQs, About pages, or Product information.  
Each business receives a **JavaScript embed snippet** to integrate the chatbot directly into their site.

---

## 🧠 Features

- 📚 **Train on Website Data** — Upload or scrape your website pages to train chatbot memory.  
- 💬 **AI Chat Interface** — Smart, context-aware responses using LangChain + OpenAI / Llama 3.  
- ⚡ **Easy Integration** — Copy-paste `<script>` snippet to add chatbot to any website.  
- 🧾 **Dashboard** — View chat history, analytics, and train new data.  
- 💾 **Conversation Logs** stored in PostgreSQL.  
- 💰 **Monetization Model**
  - Free trial for limited chats
  - ₹499/month per chatbot
  - Custom chatbot setup for ₹5,000–₹15,000 (for local companies)

---

## 🧩 Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | React + Vite + Tailwind CSS |
| **Backend** | FastAPI |
| **AI/LLM** | LangChain, OpenAI API, Hugging Face (Llama 3) |
| **Database** | PostgreSQL |
| **Integration** | JavaScript Embed Widget |

---

## 🏗️ Project Structure



---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/yourusername/ai-chatbot-builder.git
cd ai-chatbot-builder
```
2️⃣ Backend Setup (FastAPI)
```bash
cd backend
python -m venv venv
source venv/bin/activate   # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn main:app --reload
```
Make sure to configure your .env file:
```bash
OPENAI_API_KEY=your_openai_api_key
DATABASE_URL=postgresql://user:password@localhost:5432/chatbotdb
```
3️⃣ Frontend Setup (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
The frontend runs on http://localhost:5173
Backend API runs on http://localhost:8000
