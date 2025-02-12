// Gemini API configuration
const API_KEY = "";
const API_URL =
  "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent";

class Chatbot {
  constructor() {
    this.messageHistory = [];
    this.initializeEventListeners();
    this.isProcessing = false;
    this.lastRequestTime = 0;
    this.minRequestInterval = 1000; // Minimum 1 second between requests
    // Store the system prompt to avoid repeating it
    this.systemPrompt = `
      You are an AI assistant for Alvin Rahul Chauhan's portfolio website.
      Start by introducing yourself. Pick a name from the Marvel universe. 
      You should:
      - Be funny and interactive
      - Be knowledgeable about Alvin's background, skills, and experience
      - Help visitors learn more about Alvin's work and capabilities
      - Keep responses concise and relevant
      - Maintain a helpful and informative tone
      - If asked about technical details not present in the portfolio, be honest about not having that specific information
    `;
  }

  initializeEventListeners() {
    const form = document.getElementById("chat-form");
    form.addEventListener("submit", (e) => this.handleSubmit(e));

    // Add toggle functionality for mobile
    const toggleButton = document.querySelector('.chatbot-toggle');
    const chatContainer = document.querySelector('.chatbot-container');
    const closeButton = document.querySelector('.close-chat');

    toggleButton?.addEventListener('click', () => {
      chatContainer.classList.add('active');
      toggleButton.style.display = 'none';
    });

    closeButton?.addEventListener('click', () => {
      chatContainer.classList.remove('active');
      toggleButton.style.display = 'flex';
    });

    // Handle clicks outside the chatbot on mobile
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        const isClickInsideChatbot = chatContainer.contains(e.target);
        const isClickOnToggle = toggleButton.contains(e.target);
        
        if (!isClickInsideChatbot && !isClickOnToggle && chatContainer.classList.contains('active')) {
          chatContainer.classList.remove('active');
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
    // Add the new message to history
    this.messageHistory.push({
      role: "user",
      parts: [{ text: message }]
    });

    // Construct the conversation history with proper format
    const contents = [{
      role: "user",
      parts: [{ text: this.systemPrompt }]
    }];

    // Add conversation history
    for (const msg of this.messageHistory) {
      contents.push({
        role: msg.role,
        parts: msg.parts
      });
    }

    const requestBody = {
      contents,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
      ],
    };

    try {
      const response = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Check if we have a valid response
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid response from Gemini API');
      }

      const botResponse = data.candidates[0].content.parts[0].text;
      
      // Add bot response to history
      this.messageHistory.push({
        role: "model",
        parts: [{ text: botResponse }]
      });

      return botResponse;
    } catch (error) {
      console.error('Full error:', error);
      throw error;
    }
  }

  addMessageToChat(sender, message, className = "") {
    const chatMessages = document.getElementById("chat-messages");
    const messageDiv = document.createElement("div");
    messageDiv.className = `chat-message ${sender}-message ${className}`;
    messageDiv.innerHTML = `
        <div class="message-content">
            <span class="message-text">${sender === 'user' ? message : ''}</span>
        </div>
    `;
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
