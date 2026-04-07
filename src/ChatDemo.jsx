import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot } from 'lucide-react';
import './ChatDemo.css';

export default function ChatDemo({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am a premium AI assistant demo. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('https://botforge-backend-82fe.onrender.com/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.content })
      });
      
      const data = await response.json();
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.reply || data.error || 'Connection error'
      }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Error: Cannot connect to the server.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="chat-demo-overlay">
      <div className="chat-demo-modal">
        <div className="chat-header">
          <div className="flex items-center gap-2">
            <Bot size={24} className="text-accent" />
            <h3>Live Demo Agent</h3>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>
        
        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`message-wrapper ${msg.role}`}>
              <div className="message-bubble">
                <p>{msg.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message-wrapper assistant">
              <div className="message-bubble typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-area" onSubmit={handleSend}>
          <input 
            type="text" 
            placeholder="Type your message..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" disabled={!input.trim() || isLoading}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
