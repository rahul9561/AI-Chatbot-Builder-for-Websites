from fastapi.responses import HTMLResponse

@app.get("/embed.js", response_class=HTMLResponse)
def embed_js():
    # This JS will create a simple chat widget
    js_code = """
    (function() {
        const scriptTag = document.currentScript;
        const apiKey = scriptTag.getAttribute('data-chatbot-key');

        // Create chat container
        const container = document.createElement('div');
        container.id = 'chatbot-container';
        container.style.position = 'fixed';
        container.style.bottom = '20px';
        container.style.right = '20px';
        container.style.width = '300px';
        container.style.height = '400px';
        container.style.border = '1px solid #ccc';
        container.style.background = 'white';
        container.style.zIndex = 9999;
        container.style.display = 'flex';
        container.style.flexDirection = 'column';

        // Messages box
        const messages = document.createElement('div');
        messages.id = 'chatbot-messages';
        messages.style.flex = '1';
        messages.style.padding = '10px';
        messages.style.overflowY = 'auto';
        container.appendChild(messages);

        // Input box
        const inputContainer = document.createElement('div');
        inputContainer.style.display = 'flex';
        inputContainer.style.borderTop = '1px solid #ccc';

        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Type a message...';
        input.style.flex = '1';
        input.style.padding = '10px';
        input.style.border = 'none';
        inputContainer.appendChild(input);

        const sendBtn = document.createElement('button');
        sendBtn.innerText = 'Send';
        sendBtn.style.padding = '10px';
        sendBtn.style.cursor = 'pointer';
        inputContainer.appendChild(sendBtn);

        container.appendChild(inputContainer);
        document.body.appendChild(container);

        // Send message function
        async function sendMessage(msg) {
            const messageElem = document.createElement('div');
            messageElem.innerText = 'You: ' + msg;
            messages.appendChild(messageElem);

            const res = await fetch('http://127.0.0.1:8000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: msg,
                    chatbot_api_key: apiKey
                })
            });
            const data = await res.json();
            const botElem = document.createElement('div');
            botElem.innerText = 'Bot: ' + data.response;
            messages.appendChild(botElem);
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
    return HTMLResponse(js_code, media_type="application/javascript")
