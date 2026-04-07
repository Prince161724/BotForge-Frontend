import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChatState } from '../context/ChatContext';
import { X, Send, Trash2, Sparkles, Minimize2, Maximize2 } from 'lucide-react';
import './ChatWidget.css';

const API_URL = 'https://botforge-backend-82fe.onrender.com/api';

// Each bot has a unique response visual style AND position
const BOT_STYLES = {
  nebula: {
    bubbleClass: 'bubble-nebula',
    label: '🔮 Nebula',
    fontStyle: 'nebula-font',
    position: 'fullscreen',    // Immersive full-screen
  },
  ember: {
    bubbleClass: 'bubble-ember',
    label: '🔥 Ember',
    fontStyle: 'ember-font',
    position: 'bottom-right',  // Classic Intercom-style
  },
  frost: {
    bubbleClass: 'bubble-frost',
    label: '❄️ Frost',
    fontStyle: 'frost-font',
    position: 'sidebar-right', // Side panel
  },
  neon: {
    bubbleClass: 'bubble-neon',
    label: '⚡ Neon',
    fontStyle: 'neon-font',
    position: 'bottom-left',   // Terminal-style bottom-left
  },
  aurora: {
    bubbleClass: 'bubble-aurora',
    label: '🌸 Aurora',
    fontStyle: 'aurora-font',
    position: 'center',        // Center floating
  },
  midnight: {
    bubbleClass: 'bubble-midnight',
    label: '🌙 Midnight',
    fontStyle: 'midnight-font',
    position: 'top-right',     // Executive slide-down
  }
};

export default function ChatWidget({ bot, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [isClosing, setIsClosing] = useState(false);
  const [isOpening, setIsOpening] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);
  const { token } = useAuth();
  const { setIsChatOpen } = useChatState();
  const botStyle = BOT_STYLES[bot.id] || BOT_STYLES.aurora;

  useEffect(() => {
    loadHistory();
    setIsChatOpen(true);
    const timer = setTimeout(() => setIsOpening(false), 600);
    return () => {
      clearTimeout(timer);
      setIsChatOpen(false);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  const loadHistory = async () => {
    try {
      const res = await fetch(`${API_URL}/chat/history/${bot.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.messages && data.messages.length > 0) {
        setMessages(data.messages);
      } else {
        setMessages([{ role: 'assistant', content: getWelcomeMessage(bot.id) }]);
      }
    } catch (err) {
      setMessages([{ role: 'assistant', content: getWelcomeMessage(bot.id) }]);
    }
  };

  const getWelcomeMessage = (botId) => {
    const welcomes = {
      nebula: '✨ Greetings, seeker of knowledge. I am Nebula — a guide through the cosmos of thought. What philosophical depths shall we explore today?',
      ember: '🔥 Hey there, champion! I\'m Ember — your personal hype machine and motivation engine! Ready to set some goals on FIRE? Let\'s GO! 💪',
      frost: '❄️ Hello. I am Frost — your analytical companion.\n\n**Specializations:**\n• Complex problem analysis\n• Data-driven insights\n• Structured reasoning\n\nPresent your query, and I\'ll dissect it methodically.',
      neon: '```\n> SYSTEM BOOT COMPLETE\n> NEON_BOT v3.1.7 initialized\n> STATUS: ONLINE\n```\nReady to hack the mainframe of knowledge. Drop your query and let\'s jack in. 🟢',
      aurora: '🌸 Hi there, beautiful soul! I\'m Aurora — your warm companion. ✨\n\nI\'m here to listen, support, and help you bloom. Whatever\'s on your mind — I\'m all ears and all heart. 💗',
      midnight: '🌙 Good evening.\n\nI am **Midnight** — your executive AI assistant. I provide refined, professional counsel for:\n\n• Business strategy\n• Professional communication\n• Strategic planning\n\nHow may I assist you today?'
    };
    return welcomes[botId] || 'Hello! I\'m ready to chat.';
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setStreamingText('');

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(`${API_URL}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMsg.content, botStyleId: bot.id }),
        signal: controller.signal
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              setMessages(prev => [...prev, { role: 'assistant', content: fullText }]);
              setStreamingText('');
            } else {
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  fullText += parsed.content;
                  setStreamingText(fullText);
                }
              } catch (e) { /* skip */ }
            }
          }
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please try again.' }]);
        setStreamingText('');
      }
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleClose = () => {
    if (abortRef.current) abortRef.current.abort();
    setIsClosing(true);
    setTimeout(() => onClose(), 500);
  };

  const clearChat = async () => {
    if (abortRef.current) abortRef.current.abort();
    try {
      await fetch(`${API_URL}/chat/history/${bot.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages([{ role: 'assistant', content: getWelcomeMessage(bot.id) }]);
      setStreamingText('');
    } catch (err) { console.error('Clear error:', err); }
  };

  const formatContent = (text) => {
    if (!text) return '';
    return text
      .replace(/```([\s\S]*?)```/g, '<pre class="msg-code">$1</pre>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/• /g, '<span class="msg-bullet">• </span>')
      .replace(/\n/g, '<br/>');
  };

  const animClass = `anim-${bot.animation}`;
  const posClass = `pos-${botStyle.position}`;
  const stateClass = isClosing ? 'closing' : isOpening ? 'opening' : 'open';

  return (
    <div className={`chat-widget-overlay ${posClass} ${stateClass}`} onClick={handleClose}>
      <div
        className={`chat-widget ${animClass} ${posClass} ${stateClass}`}
        onClick={(e) => e.stopPropagation()}
        style={{
          '--cw-primary': bot.theme.primary,
          '--cw-secondary': bot.theme.secondary,
          '--cw-gradient': bot.theme.gradient,
          '--cw-glow': bot.theme.glow,
          '--cw-bg': bot.theme.bg
        }}
      >
        <div className="cw-glow-top"></div>

        {/* Header */}
        <div className="cw-header">
          <div className="cw-header-left">
            <div className="cw-avatar" style={{ background: bot.theme.gradient }}>
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="cw-name">{bot.name}</h3>
              <span className="cw-status">
                <span className="cw-status-dot" style={{ background: bot.theme.primary }}></span>
                {isLoading ? 'Thinking...' : 'Online'}
              </span>
            </div>
          </div>
          <div className="cw-header-right">
            <button className="cw-icon-btn" onClick={clearChat} title="Clear history"><Trash2 size={16} /></button>
            <button className="cw-icon-btn" onClick={handleClose}><X size={18} /></button>
          </div>
        </div>

        {/* Messages */}
        <div className="cw-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`cw-msg ${msg.role}`}>
              {msg.role === 'assistant' && (
                <div className="cw-msg-avatar" style={{ background: bot.theme.gradient }}>
                  <Sparkles size={12} />
                </div>
              )}
              <div className={`cw-bubble ${msg.role} ${msg.role === 'assistant' ? botStyle.bubbleClass : ''}`}>
                {msg.role === 'assistant' ? (
                  <div className={botStyle.fontStyle} dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }} />
                ) : (
                  <p>{msg.content}</p>
                )}
              </div>
            </div>
          ))}

          {streamingText && (
            <div className="cw-msg assistant">
              <div className="cw-msg-avatar" style={{ background: bot.theme.gradient }}>
                <Sparkles size={12} />
              </div>
              <div className={`cw-bubble assistant ${botStyle.bubbleClass} streaming`}>
                <div className={botStyle.fontStyle} dangerouslySetInnerHTML={{ __html: formatContent(streamingText) }} />
                <span className="stream-cursor" style={{ background: bot.theme.primary }}></span>
              </div>
            </div>
          )}

          {isLoading && !streamingText && (
            <div className="cw-msg assistant">
              <div className="cw-msg-avatar" style={{ background: bot.theme.gradient }}>
                <Sparkles size={12} />
              </div>
              <div className={`cw-bubble assistant ${botStyle.bubbleClass}`}>
                <div className="cw-thinking">
                  <span className="thinking-label" style={{ color: bot.theme.primary }}>{botStyle.label} is thinking</span>
                  <div className="cw-typing">
                    <span style={{ background: bot.theme.primary }}></span>
                    <span style={{ background: bot.theme.primary }}></span>
                    <span style={{ background: bot.theme.primary }}></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form className="cw-input-area" onSubmit={handleSend}>
          <input
            ref={inputRef}
            type="text"
            placeholder={`Message ${bot.name}...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{ '--cw-focus-color': bot.theme.primary }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            style={{ background: input.trim() && !isLoading ? bot.theme.gradient : '' }}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
