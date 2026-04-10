import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Minimize2 } from 'lucide-react';
import { useChatState } from '../context/ChatContext';
import './SupportBot.css';

const API_URL = 'http://localhost:5000/api';

export default function SupportBot() {
  const { isChatOpen } = useChatState();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hey there! 👋 I'm BotForge's support assistant. Ask me anything about our platform, bots, pricing, or how things work!"
    }
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [showPulse, setShowPulse] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Hide pulse after first open
  useEffect(() => {
    if (isOpen) setShowPulse(false);
  }, [isOpen]);

  // Close support widget if a bot chat opens
  useEffect(() => {
    if (isChatOpen && isOpen) setIsOpen(false);
  }, [isChatOpen]);

  const sendMessage = async () => {
    if (!input.trim() || isStreaming) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsStreaming(true);

    // Add empty assistant message for streaming
    setMessages(prev => [...prev, { role: 'assistant', content: '', streaming: true }]);

    try {
      const res = await fetch(`${API_URL}/support/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          history: messages.filter(m => !m.streaming).slice(-10)
        })
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullReply = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '));

        for (const line of lines) {
          const data = line.replace('data: ', '');
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              fullReply += parsed.content;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: fullReply, streaming: true };
                return updated;
              });
            }
          } catch {}
        }
      }

      // Finalize message
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'assistant', content: fullReply };
        return updated;
      });

    } catch (err) {
      console.error('Support chat error:', err);
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'assistant', content: 'Sorry, I couldn\'t connect. Please email princekumargiri50@gmail.com for help!' };
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    'What is BotForge?',
    'Tell me about the bots',
    'How does pricing work?',
    'Who created this?'
  ];

  // Don't render anything if a bot chat is open
  if (isChatOpen) return null;

  return (
    <>
      {/* Floating trigger button */}
      {!isOpen && (
        <button className="sb-trigger" onClick={() => setIsOpen(true)}>
          <div className="sb-trigger-icon">
            <Bot size={24} />
          </div>
          {showPulse && <span className="sb-trigger-pulse"></span>}
          <span className="sb-trigger-label">Need help?</span>
        </button>
      )}

      {/* Chat widget */}
      {isOpen && (
        <div className="sb-widget">
          {/* Header */}
          <div className="sb-header">
            <div className="sb-header-info">
              <div className="sb-avatar">
                <Bot size={18} />
              </div>
              <div>
                <h4>BotForge Support</h4>
                <span className="sb-status">● Online</span>
              </div>
            </div>
            <div className="sb-header-actions">
              <button onClick={() => setIsOpen(false)} className="sb-minimize">
                <Minimize2 size={16} />
              </button>
              <button onClick={() => setIsOpen(false)} className="sb-close-btn">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="sb-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`sb-msg sb-msg-${msg.role}`}>
                {msg.role === 'assistant' && (
                  <div className="sb-msg-avatar"><Bot size={14} /></div>
                )}
                <div className="sb-msg-bubble">
                  {msg.content}
                  {msg.streaming && <span className="sb-cursor">|</span>}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />

            {/* Quick questions (only show at start) */}
            {messages.length === 1 && !isStreaming && (
              <div className="sb-quick-section">
                <p className="sb-quick-label">Quick questions:</p>
                <div className="sb-quick-list">
                  {quickQuestions.map((q, i) => (
                    <button
                      key={i}
                      className="sb-quick-btn"
                      onClick={() => { setInput(q); setTimeout(() => { setInput(q); }, 50); }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="sb-input-area">
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask about BotForge..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isStreaming}
            />
            <button
              className="sb-send"
              onClick={sendMessage}
              disabled={!input.trim() || isStreaming}
            >
              <Send size={16} />
            </button>
          </div>

          <div className="sb-footer">
            Powered by <strong>BotForge</strong> — Built by Prince Kumar Giri
          </div>
        </div>
      )}
    </>
  );
}
