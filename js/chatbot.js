const API_URL = "https://ai-chat-production-e92f.up.railway.app/chat";

class Chatbot {
  constructor() {
    this.initializeEventListeners();
    this.isProcessing = false;
    this.lastRequestTime = 0;
    this.minRequestInterval = 1000; // Minimum 1 second between requests
    this.sessionId = this.generateSessionId();
    this.isMinimized = false;
  }

  generateSessionId() {
    // Generate a random string of 12 characters
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  initializeEventListeners() {
    const form = document.getElementById("chat-form");
    form.addEventListener("submit", (e) => this.handleSubmit(e));

    // Add toggle functionality for mobile
    const toggleButton = document.querySelector('.chatbot-toggle');
    const chatContainer = document.querySelector('.chatbot-container');
    const closeButton = document.querySelector('.close-chat');
    const minimizeButton = document.querySelector('.minimize-chat');

    toggleButton?.addEventListener('click', () => {
      chatContainer.classList.add('active');
      chatContainer.classList.remove('minimized');
      this.isMinimized = false;
      toggleButton.style.display = 'none';
    });

    closeButton?.addEventListener('click', () => {
      chatContainer.classList.remove('active');
      chatContainer.classList.remove('minimized');
      this.isMinimized = false;
      toggleButton.style.display = 'flex';
    });

    minimizeButton?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.isMinimized = !this.isMinimized;
      chatContainer.classList.toggle('minimized');
    });

    chatContainer?.addEventListener('click', () => {
      if (this.isMinimized) {
        this.isMinimized = false;
        chatContainer.classList.remove('minimized');
      }
    });

    // Handle clicks outside the chatbot on mobile
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        const isClickInsideChatbot = chatContainer.contains(e.target);
        const isClickOnToggle = toggleButton.contains(e.target);
        
        if (!isClickInsideChatbot && !isClickOnToggle && chatContainer.classList.contains('active')) {
          chatContainer.classList.remove('active');
          chatContainer.classList.remove('minimized');
          this.isMinimized = false;
          toggleButton.style.display = 'flex';
        }
      }
    });
  }

  async handleSubmit(e) {
    e.preventDefault();
    
    if (this.isProcessing) {
      return; // Prevent multiple simultaneous requests
    }

    const input = document.getElementById("chat-input");
    const message = input.value.trim();
    if (!message) return;

    // Add user message to chat
    this.addMessageToChat("user", message);
    input.value = "";

    // Show loading indicator
    this.addMessageToChat("bot", "...", "loading-message");
    
    this.isProcessing = true;

    try {
      const response = await this.generateResponseWithRetry(message);
      // Remove loading message
      document.querySelector(".loading-message")?.remove();
      // Add bot response
      this.addMessageToChat("bot", response);
    } catch (error) {
      console.error("Error:", error);
      document.querySelector(".loading-message")?.remove();
      this.addMessageToChat(
        "bot",
        "I'm a bit overwhelmed right now. Please try again in a moment."
      );
    } finally {
      this.isProcessing = false;
    }
  }

  async generateResponseWithRetry(message, retries = 3) {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minRequestInterval) {
      await new Promise(resolve => 
        setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest)
      );
    }

    try {
      const response = await this.generateResponse(message);
      this.lastRequestTime = Date.now();
      return response;
    } catch (error) {
      if (error.message.includes('429') && retries > 0) {
        // If rate limited, wait longer before retrying
        await new Promise(resolve => setTimeout(resolve, 2000));
        return this.generateResponseWithRetry(message, retries - 1);
      }
      throw error;
    }
  }

  async generateResponse(message) {
    const requestBody = {
      message: message,
      sessionId: this.sessionId
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Store the session ID from the response if it's different
      if (data.sessionId && data.sessionId !== this.sessionId) {
        this.sessionId = data.sessionId;
      }
      return data.response;
    } catch (error) {
      console.error('Full error:', error);
      throw error;
    }
  }

  addMessageToChat(sender, message, className = "") {
    const chatMessages = document.getElementById("chat-messages");
    const messageDiv = document.createElement("div");
    messageDiv.className = `chat-message ${sender}-message ${className}`;
    
    if (className === 'loading-message') {
      // Create terminal-style loader
      messageDiv.innerHTML = `
        <div class="message-content">
          <div class="terminal-loader">
            <span class="command">processing request</span>
            <span class="command">analyzing context</span>
            <span class="command">generating response</span>
          </div>
        </div>
      `;
    } else {
      messageDiv.innerHTML = `
        <div class="message-content">
          <span class="message-text">${sender === 'user' ? message : ''}</span>
        </div>
      `;
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Apply typewriter effect only for bot messages (except loading)
    if (sender === 'bot' && className !== 'loading-message') {
      const messageText = messageDiv.querySelector('.message-text');
      let i = 0;
      messageText.textContent = ''; // Clear initial content
      
      const typeWriter = () => {
        if (i < message.length) {
          messageText.textContent += message.charAt(i);
          i++;
          chatMessages.scrollTop = chatMessages.scrollHeight;
          // Randomize typing speed between 30ms and 50ms for a more natural effect
          setTimeout(typeWriter, Math.random() * 20 + 30);
        }
      };
      
      typeWriter();
    }
  }
}

// Initialize chatbot when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.chatbot = new Chatbot();
});
