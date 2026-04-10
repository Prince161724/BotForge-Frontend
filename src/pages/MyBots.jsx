import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import ChatWidget from '../chatbots/ChatWidget';
import { Package, MessageSquare, Trash2, ShoppingBag, X, AlertTriangle, Sparkles, Zap, Star } from 'lucide-react';
import './MyBots.css';

const API_URL = 'http://localhost:5000/api';

const BOT_FEATURES = {
  nebula: ['Deep philosophical insights', 'Cosmic metaphors & wisdom', 'Thoughtful responses', 'Fullscreen immersive chat'],
  ember: ['High-energy motivation', 'Fire & energy metaphors', 'Goal-setting companion', 'Bottom-right popup chat'],
  frost: ['Crystal-clear analysis', 'Structured data display', 'Complex problem breakdown', 'Right sidebar panel'],
  neon: ['Expert coding assistance', 'Cyberpunk hacker culture', 'Terminal-style interface', 'Bottom-left console'],
  aurora: ['Emotional support', 'Creative brainstorming', 'Compassionate responses', 'Center floating bubble'],
  midnight: ['Executive communication', 'Business strategy', 'Professional writing', 'Top-right dropdown panel']
};

export default function MyBots() {
  const [myBots, setMyBots] = useState([]);
  const [activeBot, setActiveBot] = useState(null);
  const [toast, setToast] = useState('');
  const [removeModal, setRemoveModal] = useState(null); // bot to remove
  const [isRemoving, setIsRemoving] = useState(false);
  const { token, updateUser, user } = useAuth();

  useEffect(() => {
    fetchMyBots();
  }, []);

  const fetchMyBots = async () => {
    try {
      const res = await fetch(`${API_URL}/shop/my-bots`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setMyBots(data);
    } catch (err) {
      console.error('Error fetching my bots:', err);
    }
  };

  const confirmRemove = async () => {
    if (!removeModal || isRemoving) return;
    setIsRemoving(true);

    try {
      const res = await fetch(`${API_URL}/shop/remove/${removeModal.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setMyBots(prev => prev.filter(b => b.id !== removeModal.id));
        if (user) {
          updateUser({ ...user, purchasedBots: data.purchasedBots });
        }
        showToast(`${removeModal.name} removed from your collection.`);
      } else {
        showToast(data.error || 'Failed to remove bot.');
      }
    } catch (err) {
      console.error('Remove error:', err);
      showToast('Error removing bot.');
    } finally {
      setRemoveModal(null);
      setIsRemoving(false);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  if (myBots.length === 0 && !removeModal) {
    return (
      <div className="mybots-page">
        {toast && <div className="mybots-toast">{toast}</div>}
        <div className="mybots-empty">
          <Package size={64} className="empty-icon" />
          <h2>No bots yet</h2>
          <p>Visit the shop to get your first AI chatbot!</p>
          <Link to="/shop" className="demo-button primary-btn">
            <ShoppingBag size={18} /> Browse Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mybots-page">
      {toast && <div className="mybots-toast">{toast}</div>}

      <div className="mybots-header">
        <h1><Package size={32} /> My <span className="text-gradient">Bots</span></h1>
        <p>Your personal collection of AI chatbots. Click to start chatting!</p>
      </div>

      <div className="mybots-grid">
        {myBots.map(bot => (
          <div
            key={bot.id}
            className="mybot-card"
            style={{ '--bot-primary': bot.theme.primary, '--bot-glow': bot.theme.glow, '--bot-gradient': bot.theme.gradient }}
          >
            <div className="mybot-preview" style={{ background: bot.theme.bg }}>
              <div className="mybot-orb" style={{ background: bot.theme.gradient }}>
                <MessageSquare size={24} />
              </div>
            </div>
            <div className="mybot-info">
              <h3 style={{ color: bot.theme.primary }}>{bot.name}</h3>
              <p>{bot.tagline}</p>
              <div className="mybot-actions">
                <button
                  className="chat-now-btn"
                  style={{ background: bot.theme.gradient }}
                  onClick={() => setActiveBot(bot)}
                >
                  <MessageSquare size={14} /> Chat Now
                </button>
                <button
                  className="clear-btn"
                  onClick={() => setRemoveModal(bot)}
                  title="Remove bot from collection"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Custom themed remove confirmation modal */}
      {removeModal && (
        <div className="rm-overlay" onClick={() => !isRemoving && setRemoveModal(null)}>
          <div
            className="rm-modal"
            onClick={e => e.stopPropagation()}
            style={{
              '--rm-primary': removeModal.theme.primary,
              '--rm-gradient': removeModal.theme.gradient,
              '--rm-glow': removeModal.theme.glow,
              '--rm-bg': removeModal.theme.bg
            }}
          >
            {/* Close button */}
            <button className="rm-close" onClick={() => !isRemoving && setRemoveModal(null)}>
              <X size={18} />
            </button>

            {/* Bot visual */}
            <div className="rm-bot-visual">
              <div className="rm-orb-ring"></div>
              <div className="rm-orb" style={{ background: removeModal.theme.gradient }}>
                <Sparkles size={28} />
              </div>
            </div>

            {/* Warning header */}
            <div className="rm-warning-icon">
              <AlertTriangle size={18} />
            </div>
            <h2 className="rm-title">Remove <span style={{ color: removeModal.theme.primary }}>{removeModal.name}</span>?</h2>
            <p className="rm-subtitle">{removeModal.tagline}</p>

            {/* Features they'll lose */}
            <div className="rm-features-section">
              <p className="rm-features-label">You'll lose access to:</p>
              <div className="rm-features-list">
                {(BOT_FEATURES[removeModal.id] || []).map((feature, i) => (
                  <div key={i} className="rm-feature" style={{ borderColor: `${removeModal.theme.primary}25` }}>
                    <Zap size={12} style={{ color: removeModal.theme.primary }} />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="rm-note">This will also clear all chat history with this bot.</p>

            {/* Actions */}
            <div className="rm-actions">
              <button
                className="rm-cancel-btn"
                onClick={() => !isRemoving && setRemoveModal(null)}
                disabled={isRemoving}
              >
                Keep Bot
              </button>
              <button
                className="rm-confirm-btn"
                onClick={confirmRemove}
                disabled={isRemoving}
              >
                {isRemoving ? 'Removing...' : 'Yes, Remove'}
              </button>
            </div>

            {/* Re-add note */}
            <p className="rm-readd-note">You can always add it back from the <Star size={12} /> Shop.</p>
          </div>
        </div>
      )}

      {activeBot && (
        <ChatWidget
          bot={activeBot}
          onClose={() => setActiveBot(null)}
        />
      )}
    </div>
  );
}
