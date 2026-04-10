import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import ChatWidget from '../chatbots/ChatWidget';
import { ShoppingBag, Sparkles, Star, Eye } from 'lucide-react';
import './Shop.css';

const API_URL = 'http://localhost:5000/api';

export default function Shop() {
  const [bots, setBots] = useState([]);
  const [activeBot, setActiveBot] = useState(null);
  const [purchaseMsg, setPurchaseMsg] = useState('');
  const { user, token, updateUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBots();
  }, []);

  const fetchBots = async () => {
    try {
      const res = await fetch(`${API_URL}/shop/bots`);
      const data = await res.json();
      setBots(data);
    } catch (err) {
      console.error('Error fetching bots:', err);
    }
  };

  const handlePurchase = async (botId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/shop/purchase/${botId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setPurchaseMsg(data.message);
        updateUser({ ...user, purchasedBots: data.purchasedBots });
        setTimeout(() => setPurchaseMsg(''), 3000);
      } else {
        setPurchaseMsg(data.error);
        setTimeout(() => setPurchaseMsg(''), 3000);
      }
    } catch (err) {
      console.error('Purchase error:', err);
    }
  };

  const handleTryDemo = (bot) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setActiveBot(bot);
  };

  const isOwned = (botId) => user?.purchasedBots?.includes(botId);

  return (
    <div className="shop-page">
      <div className="shop-header">
        <h1>
          <ShoppingBag size={32} />
          Bot <span className="text-gradient">Shop</span>
        </h1>
        <p>6 unique AI personalities with stunning visual styles. Each bot thinks differently, looks different, and animates differently.</p>
      </div>

      {purchaseMsg && (
        <div className="purchase-toast">{purchaseMsg}</div>
      )}

      {user && user.purchasedBots?.length > 0 && (
        <p className="shop-owned-note">
          ✓ You own {user.purchasedBots.length} bot{user.purchasedBots.length > 1 ? 's' : ''} — check <a href="/my-bots">My Bots</a> to chat with them.
        </p>
      )}

      <div className="shop-grid">
        {bots.filter(bot => !isOwned(bot.id)).map((bot) => (
          <ShopCard
            key={bot.id}
            bot={bot}
            owned={false}
            onPurchase={handlePurchase}
            onTryDemo={handleTryDemo}
          />
        ))}
      </div>

      {user && bots.length > 0 && bots.filter(bot => !isOwned(bot.id)).length === 0 && (
        <div className="shop-all-owned">
          <p>🎉 You own all available bots! Head to <a href="/my-bots">My Bots</a> to start chatting.</p>
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

function ShopCard({ bot, owned, onPurchase, onTryDemo }) {
  const cardRef = useRef(null);
  const navigate = useNavigate();

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    cardRef.current.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    cardRef.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  const handleCardClick = () => {
    navigate(`/shop/${bot.id}`);
  };

  return (
    <div
      className="shop-card clickable"
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onClick={handleCardClick}
      style={{ '--bot-primary': bot.theme.primary, '--bot-glow': bot.theme.glow, '--bot-gradient': bot.theme.gradient, cursor: 'pointer' }}
    >
      <div className="shop-card-glow"></div>

      {/* Preview area */}
      <div className="shop-card-preview" style={{ background: bot.theme.bg }}>
        <div className="preview-orb" style={{ background: bot.theme.gradient }}>
          <Sparkles size={28} />
        </div>
        {bot.featured && (
          <div className="featured-badge">
            <Star size={12} /> Featured
          </div>
        )}
      </div>

      {/* Info */}
      <div className="shop-card-info">
        <h3 style={{ color: bot.theme.primary }}>{bot.name}</h3>
        <p className="shop-card-tagline">{bot.tagline}</p>
        <p className="shop-card-desc">{bot.description}</p>

        <div className="shop-card-footer">
          <span className="price-tag">{bot.price}</span>
          <div className="shop-card-actions">
            <button
              className="try-btn"
              onClick={(e) => { e.stopPropagation(); onTryDemo(bot); }}
              style={{ borderColor: bot.theme.primary, color: bot.theme.primary }}
            >
              <Eye size={14} /> Try
            </button>
            <button
              className="get-btn"
              onClick={(e) => { e.stopPropagation(); onPurchase(bot.id); }}
              style={{ background: bot.theme.gradient }}
            >
              Get Bot
            </button>
          </div>
        </div>
      </div>

      <div className="shop-card-view-hint">Click to view details →</div>
    </div>
  );
}
