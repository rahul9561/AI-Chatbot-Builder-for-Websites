import os
import time
from typing import List, Dict, Any
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory
from langchain_community.chat_models import ChatOpenAI
from langchain.prompts import PromptTemplate
from django.conf import settings
import chromadb
from chromadb.config import Settings as ChromaSettings


class AIService:
    """Service for handling AI operations including embeddings and chat"""
    
    def __init__(self):
        self.embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            model_kwargs={'device': 'cpu'}
        )
        
        self.chroma_client = chromadb.Client(ChromaSettings(
            persist_directory=str(settings.CHROMA_PERSIST_DIRECTORY),
            anonymized_telemetry=False
        ))
        
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
        )
    
    def get_collection_name(self, chatbot_id: str) -> str:
        """Generate collection name for chatbot"""
        return f"chatbot_{str(chatbot_id).replace('-', '_')}"
    
    def create_embeddings(self, chatbot_id: str, texts: List[str], metadatas: List[Dict] = None) -> bool:
        """Create embeddings and store in ChromaDB"""
        try:
            collection_name = self.get_collection_name(chatbot_id)
            
            # Split texts into chunks
            all_chunks = []
            all_metadatas = []
            
            for i, text in enumerate(texts):
                chunks = self.text_splitter.split_text(text)
                all_chunks.extend(chunks)
                
                # Add metadata for each chunk
                metadata = metadatas[i] if metadatas else {}
                all_metadatas.extend([metadata] * len(chunks))
            
            # Create or get collection
            try:
                collection = self.chroma_client.get_collection(collection_name)
                # Delete existing collection to rebuild
                self.chroma_client.delete_collection(collection_name)
            except:
                pass
            
            collection = self.chroma_client.create_collection(
                name=collection_name,
                metadata={"chatbot_id": str(chatbot_id)}
            )
            
            # Add documents to collection
            if all_chunks:
                embeddings_list = self.embeddings.embed_documents(all_chunks)
                
                collection.add(
                    embeddings=embeddings_list,
                    documents=all_chunks,
                    metadatas=all_metadatas,
                    ids=[f"doc_{i}" for i in range(len(all_chunks))]
                )
            
            return True
            
        except Exception as e:
            print(f"Error creating embeddings: {str(e)}")
            return False
    
    def get_vectorstore(self, chatbot_id: str):
        """Get vectorstore for chatbot"""
        collection_name = self.get_collection_name(chatbot_id)
        
        vectorstore = Chroma(
            client=self.chroma_client,
            collection_name=collection_name,
            embedding_function=self.embeddings
        )
        
        return vectorstore
    
    def create_chat_chain(self, chatbot):
        """Create conversational chain for chatbot"""
        
        # Get vectorstore
        vectorstore = self.get_vectorstore(str(chatbot.id))
        
        # Create LLM
        llm = ChatOpenAI(
            model_name=chatbot.model_name,
            temperature=chatbot.temperature,
            max_tokens=chatbot.max_tokens,
            openai_api_key=settings.OPENAI_API_KEY
        )
        
        # Custom prompt template
        template = """You are {bot_name}, a helpful AI assistant for {website_url}.
Use the following context to answer the user's question. If you don't know the answer based on the context, say so politely.

Context: {context}

Chat History: {chat_history}

User: {question}
Assistant:"""
        
        prompt = PromptTemplate(
            template=template,
            input_variables=["context", "chat_history", "question"],
            partial_variables={
                "bot_name": chatbot.bot_name,
                "website_url": chatbot.website_url
            }
        )
        
        # Create memory
        memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True,
            output_key="answer"
        )
        
        # Create conversational chain
        chain = ConversationalRetrievalChain.from_llm(
            llm=llm,
            retriever=vectorstore.as_retriever(search_kwargs={"k": 4}),
            memory=memory,
            combine_docs_chain_kwargs={"prompt": prompt},
            return_source_documents=True,
            verbose=False
        )
        
        return chain
    
    def get_response(self, chatbot, message: str, chat_history: List[tuple] = None) -> Dict[str, Any]:
        """Get AI response for user message"""
        start_time = time.time()
        
        try:
            # Create chat chain
            chain = self.create_chat_chain(chatbot)
            
            # Prepare chat history
            if chat_history is None:
                chat_history = []
            
            # Get response
            result = chain({
                "question": message,
                "chat_history": chat_history
            })
            
            response_time = time.time() - start_time
            
            return {
                "response": result["answer"],
                "source_documents": result.get("source_documents", []),
                "response_time": response_time,
                "success": True
            }
            
        except Exception as e:
            print(f"Error getting AI response: {str(e)}")
            return {
                "response": "I apologize, but I'm having trouble processing your request. Please try again.",
                "source_documents": [],
                "response_time": time.time() - start_time,
                "success": False,
                "error": str(e)
            }
    
    def estimate_tokens(self, text: str) -> int:
        """Estimate token count for text"""
        # Rough estimation: ~4 characters per token
        return len(text) // 4


# Global instance
ai_service = AIService()