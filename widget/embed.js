// embed-widget/embed.js
// AI Chatbot Widget - Embeddable script for client websites
// Usage: <script src="https://your-domain.com/embed.js" data-chatbot-key="your-api-key"></script>

(function() {
  'use strict';
  
  // Configuration
  const API_URL = 'http://127.0.0.1:8000/api';
  const scriptTag = document.currentScript;
  const chatbotKey = scriptTag.getAttribute('data-chatbot-key');
  const position = scriptTag.getAttribute('data-position') || 'right'; // right or left
  const theme = scriptTag.getAttribute('data-theme') || 'gradient'; // gradient, blue, purple, dark
  
  if (!chatbotKey) {
    console.error('Chatbot key not found. Please add data-chatbot-key attribute.');
    return;
  }

  // Theme configurations
  const themes = {
    gradient: {
      primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      primarySolid: '#667eea',
      text: '#ffffff'
    },
    blue: {
      primary: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
      primarySolid: '#3b82f6',
      text: '#ffffff'
    },
    purple: {
      primary: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
      primarySolid: '#7c3aed',
      text: '#ffffff'
    },
    dark: {
      primary: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
      primarySolid: '#1f2937',
      text: '#ffffff'
    }
  };

  const currentTheme = themes[theme] || themes.gradient;
  const positionStyle = position === 'left' ? 'left: 20px;' : 'right: 20px;';

  // Create widget HTML
  const widgetHTML = `
    <div id="chatbot-widget-container" style="position: fixed; bottom: 20px; ${positionStyle} z-index: 999999; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      
      <!-- Chat Button -->
      <div id="chat-button" style="width: 60px; height: 60px; border-radius: 50%; background: ${currentTheme.primary}; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: all 0.3s ease; position: relative;">
        <svg id="chat-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="${currentTheme.text}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <svg id="close-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="${currentTheme.text}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: none;">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
        <div id="unread-badge" style="display: none; position: absolute; top: -5px; right: -5px; background: #ef4444; color: white; border-radius: 50%; width: 24px; height: 24px; font-size: 12px; font-weight: bold; display: flex; align-items: center; justify-content: center; border: 2px solid white;">1</div>
      </div>
      
      <!-- Chat Window -->
      <div id="chat-window" style="display: none; width: 380px; height: 600px; background: white; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.15); overflow: hidden; position: absolute; bottom: 80px; ${position === 'left' ? 'left: 0;' : 'right: 0;'} flex-direction: column; animation: slideUp 0.3s ease;">
        
        <!-- Header -->
        <div id="chat-header" style="background: ${currentTheme.primary}; padding: 20px; color: ${currentTheme.text};">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="flex: 1;">
              <h3 style="margin: 0; font-size: 18px; font-weight: 600;">Chat with us</h3>
              <div style="display: flex; align-items: center; gap: 6px; margin-top: 4px;">
                <div id="status-indicator" style="width: 8px; height: 8px; border-radius: 50%; background: #10b981;"></div>
                <p style="margin: 0; font-size: 13px; opacity: 0.9;color:#fff;">We typically reply instantly</p>
              </div>
            </div>
            <button id="minimize-chat" style="background: rgba(255,255,255,0.2); border: none; cursor: pointer; padding: 8px; border-radius: 8px; display: flex; align-items: center; justify-content: center; transition: background 0.2s;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${currentTheme.text}" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Messages Container -->
        <div id="chat-messages" style="flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 12px; background: #f9fafb; scroll-behavior: smooth;">
          <div class="bot-message" style="background: white; padding: 12px 16px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); max-width: 85%; animation: fadeIn 0.3s ease;">
            <p style="margin: 0; font-size: 14px; color: #374151; line-height: 1.5;">👋 Hi! How can I help you today?</p>
          </div>
        </div>
        
        <!-- Powered By (Optional - remove if white-label) -->
        <div style="padding: 8px 20px; text-align: center; border-top: 1px solid #e5e7eb; background: #fafafa;">
          <p style="margin: 0; font-size: 11px; color: #9ca3af;">Powered by <span style="font-weight: 600; color: #667eea;">ChatBot Builder</span></p>
        </div>
        
        <!-- Input Container -->
        <div id="input-container" style="padding: 16px; border-top: 1px solid #e5e7eb; background: white;">
          <div style="display: flex; gap: 8px; align-items: center;">
            <input 
              id="chat-input" 
              type="text" 
              placeholder="Type your message..." 
              style="flex: 1; padding: 12px 16px; border: 1px solid #d1d5db; border-radius: 24px; font-size: 14px; outline: none; transition: all 0.2s; font-family: inherit;"
            />
            <button id="send-button" style="background: ${currentTheme.primary}; color: ${currentTheme.text}; border: none; width: 44px; height: 44px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; flex-shrink: 0;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Insert widget into page
  document.body.insertAdjacentHTML('beforeend', widgetHTML);

  // Add CSS animations and styles
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    
    @keyframes typing {
      0%, 60%, 100% {
        transform: translateY(0);
        opacity: 0.7;
      }
      30% {
        transform: translateY(-8px);
        opacity: 1;
      }
    }
    
    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.05);
      }
    }
    
    #chat-button:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 16px rgba(0,0,0,0.2);
    }
    
    #chat-button:active {
      transform: scale(1.05);
    }
    
    #chat-input:focus {
      border-color: ${currentTheme.primarySolid};
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
    
    #send-button:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    
    #send-button:active {
      transform: scale(0.95);
    }
    
    #send-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    #minimize-chat:hover {
      background: rgba(255,255,255,0.3);
    }
    
    #chat-messages::-webkit-scrollbar {
      width: 6px;
    }
    
    #chat-messages::-webkit-scrollbar-track {
      background: #f1f1f1;
    }
    
    #chat-messages::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 3px;
    }
    
    #chat-messages::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }
    
    .user-message {
      background: ${currentTheme.primary};
      color: ${currentTheme.text};
      padding: 12px 16px;
      border-radius: 12px;
      max-width: 85%;
      align-self: flex-end;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      animation: fadeIn 0.3s ease;
      word-wrap: break-word;
    }
    
    .bot-message {
      background: white;
      padding: 12px 16px;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      max-width: 85%;
      animation: fadeIn 0.3s ease;
      word-wrap: break-word;
    }
    
    .message-text {
      margin: 0;
      font-size: 14px;
      line-height: 1.5;
      
    }
    
    .bot-message .message-text {
      color: #374151;
    }
    
    .timestamp {
      font-size: 11px;
      color: rgba(0,0,0,0.4);
      margin-top: 4px;
      text-align: right;
    }
    
    .user-message .timestamp {
      color: rgba(255,255,255,0.7);
    }
    
    @media (max-width: 480px) {
      #chat-window {
        width: calc(100vw - 40px) !important;
        height: calc(100vh - 100px) !important;
        max-height: 600px;
      }
    }
  `;
  document.head.appendChild(style);

  // Get elements
  const chatButton = document.getElementById('chat-button');
  const chatWindow = document.getElementById('chat-window');
  const minimizeChat = document.getElementById('minimize-chat');
  const chatMessages = document.getElementById('chat-messages');
  const chatInput = document.getElementById('chat-input');
  const sendButton = document.getElementById('send-button');
  const chatIcon = document.getElementById('chat-icon');
  const closeIcon = document.getElementById('close-icon');
  const unreadBadge = document.getElementById('unread-badge');

  // State
  let isOpen = false;
  let isTyping = false;
  let messageCount = 0;
  let unreadCount = 0;

  // Toggle chat window
  function toggleChat() {
    isOpen = !isOpen;
    chatWindow.style.display = isOpen ? 'flex' : 'none';
    chatIcon.style.display = isOpen ? 'none' : 'block';
    closeIcon.style.display = isOpen ? 'block' : 'none';
    
    if (isOpen) {
      chatInput.focus();
      unreadCount = 0;
      unreadBadge.style.display = 'none';
      
      // Mark as opened in analytics
      trackEvent('chat_opened');
    } else {
      trackEvent('chat_closed');
    }
  }

  // Event listeners
  chatButton.addEventListener('click', toggleChat);
  minimizeChat.addEventListener('click', toggleChat);

  // Send message function
  async function sendMessage() {
    const message = chatInput.value.trim();
    if (!message || isTyping) return;

    // Add user message
    addMessage(message, 'user');
    chatInput.value = '';
    messageCount++;
    
    // Disable input while processing
    chatInput.disabled = true;
    sendButton.disabled = true;
    isTyping = true;

    // Show typing indicator
    const typingDiv = addTypingIndicator();

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          chatbot_api_key: chatbotKey
        })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      
      // Remove typing indicator
      typingDiv.remove();
      
      // Add bot response with slight delay for natural feel
      setTimeout(() => {
        addMessage(data.response, 'bot');
        
        // Show unread badge if chat is closed
        if (!isOpen) {
          unreadCount++;
          unreadBadge.textContent = unreadCount;
          unreadBadge.style.display = 'flex';
        }
      }, 500);
      
      // Track successful message
      trackEvent('message_sent', { message_count: messageCount });
      
    } catch (error) {
      typingDiv.remove();
      addMessage('Sorry, I encountered an error. Please try again later.', 'bot', true);
      console.error('Chat error:', error);
      
      trackEvent('error', { error: error.message });
    } finally {
      chatInput.disabled = false;
      sendButton.disabled = false;
      isTyping = false;
      chatInput.focus();
    }
  }

  // Add message to chat
  function addMessage(text, sender, isError = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = sender === 'user' ? 'user-message' : 'bot-message';
    
    if (isError) {
      messageDiv.style.borderLeft = '3px solid #ef4444';
    }
    
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.innerHTML = `
      <p class="message-text">${escapeHtml(text)}</p>
      <div class="timestamp">${timeString}</div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return messageDiv;
  }

  // Add typing indicator
  function addTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typing-indicator';
    typingDiv.className = 'bot-message';
    typingDiv.style.cssText = 'padding: 16px; display: flex; gap: 4px; align-items: center;';
    
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('div');
      dot.style.cssText = `
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #9ca3af;
        animation: typing 1.4s infinite;
        animation-delay: ${i * 0.2}s;
      `;
      typingDiv.appendChild(dot);
    }
    
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return typingDiv;
  }

  // Escape HTML to prevent XSS
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Track events (optional analytics)
  function trackEvent(eventName, data = {}) {
    // You can send analytics to your backend
    try {
      fetch(`${API_URL}/analytics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatbot_key: chatbotKey,
          event: eventName,
          data: data,
          timestamp: new Date().toISOString()
        })
      }).catch(() => {}); // Silently fail
    } catch (e) {}
  }

  // Send button click
  sendButton.addEventListener('click', sendMessage);

  // Enter key to send
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Auto-focus on input when typing
  chatInput.addEventListener('input', () => {
    if (chatInput.value.length > 0) {
      sendButton.style.animation = 'pulse 0.5s ease';
    }
  });

  // Remove animation after it ends
  sendButton.addEventListener('animationend', () => {
    sendButton.style.animation = '';
  });

  // Welcome message after 3 seconds if no interaction
  setTimeout(() => {
    if (messageCount === 0 && !isOpen) {
      unreadCount = 1;
      unreadBadge.textContent = '1';
      unreadBadge.style.display = 'flex';
      chatButton.style.animation = 'pulse 2s infinite';
    }
  }, 3000);

  // Handle page visibility (pause when tab is hidden)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      trackEvent('tab_hidden');
    } else {
      trackEvent('tab_visible');
    }
  });

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    trackEvent('page_unload', {
      total_messages: messageCount,
      chat_opened: isOpen
    });
  });

  // Initialize - track widget loaded
  trackEvent('widget_loaded');
  
  console.log('✅ Chatbot widget loaded successfully');

})();