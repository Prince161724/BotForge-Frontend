import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ChatWidget from '../chatbots/ChatWidget';
import { ArrowLeft, Sparkles, MessageSquare, Star, Check, Plus, Monitor, Palette, Zap, Heart, Code, Copy, CheckCheck } from 'lucide-react';
import './BotDetail.css';
import './BotDetail.css';

const API_URL = 'http://localhost:5000/api';

const FEATURE_ICONS = [Zap, Star, MessageSquare, Monitor, Palette, Heart];

function generateWidgetCode(bot, token) {
  const serverURL = 'http://localhost:5000';
  const displayToken = 'test_token_123';
  return `<script src="${serverURL}/widget.js?bot=${bot.id}&token=${displayToken}"></script>`;
}

export default function BotDetail() {
  const { botId } = useParams();
  const [bot, setBot] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [purchaseMsg, setPurchaseMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const { user, token, updateUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBot();
  }, [botId]);

  const fetchBot = async () => {
    try {
      const res = await fetch(`${API_URL}/shop/bots`);
      const bots = await res.json();
      const found = bots.find(b => b.id === botId);
      if (found) {
        setBot(found);
      } else {
        navigate('/shop');
      }
    } catch (err) {
      console.error('Error fetching bot:', err);
    }
  };

  const isOwned = user?.purchasedBots?.includes(botId);

  const handlePurchase = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      const res = await fetch(`${API_URL}/shop/purchase/${botId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        updateUser({ ...user, purchasedBots: data.purchasedBots });
        setPurchaseMsg(data.message);
        setTimeout(() => setPurchaseMsg(''), 3000);
      } else {
        setPurchaseMsg(data.error);
        setTimeout(() => setPurchaseMsg(''), 3000);
      }
    } catch (err) {
      console.error('Purchase error:', err);
    }
  };

  const handleTry = () => {
    if (!user) { navigate('/login'); return; }
    setShowChat(true);
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!bot) {
    return <div className="loading-screen"><div className="loader"></div></div>;
  }

  const embedCode = generateWidgetCode(bot, token);

  return (
    <div
      className="bot-detail-page"
      style={{
        '--bd-primary': bot.theme.primary,
        '--bd-secondary': bot.theme.secondary,
        '--bd-gradient': bot.theme.gradient,
        '--bd-glow': bot.theme.glow,
        '--bd-bg': bot.theme.bg
      }}
    >
      {purchaseMsg && (
        <div className="bd-toast">{purchaseMsg}</div>
      )}

      {/* Decorative background elements */}
      <div className="bd-bg-orb bd-orb-1"></div>
      <div className="bd-bg-orb bd-orb-2"></div>
      <div className="bd-bg-lines"></div>

      {/* Back button */}
      <Link to="/shop" className="bd-back">
        <ArrowLeft size={18} />
        <span>Back to Shop</span>
      </Link>

      {/* Hero section */}
      <section className="bd-hero">
        <div className="bd-hero-visual">
          <div className="bd-orb-main">
            <div className="bd-orb-ring bd-ring-1"></div>
            <div className="bd-orb-ring bd-ring-2"></div>
            <div className="bd-orb-ring bd-ring-3"></div>
            <div className="bd-orb-core" style={{ background: bot.theme.gradient }}>
              <Sparkles size={36} />
            </div>
          </div>
        </div>

        <div className="bd-hero-content">
          {bot.featured && (
            <div className="bd-featured-tag">
              <Star size={12} /> Featured Bot
            </div>
          )}
          <h1 className="bd-title" style={{ color: bot.theme.primary }}>{bot.name}</h1>
          <p className="bd-tagline">{bot.tagline}</p>
          <p className="bd-long-desc">{bot.longDescription}</p>

          <div className="bd-actions">
            <button className="bd-try-btn" onClick={handleTry} style={{ background: bot.theme.gradient }}>
              <MessageSquare size={18} />
              Try {bot.name}
            </button>
            {isOwned ? (
              <span className="bd-owned-badge"><Check size={16} /> In Your Collection</span>
            ) : (
              <button className="bd-add-btn" onClick={handlePurchase}>
                <Plus size={18} />
                Add to My Bots — {bot.price}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Info cards section */}
      <section className="bd-info-grid">
        {/* Features */}
        <div className="bd-card bd-features-card">
          <h2>What {bot.name} Does</h2>
          <ul className="bd-feature-list">
            {bot.features?.map((f, i) => {
              const Icon = FEATURE_ICONS[i % FEATURE_ICONS.length];
              return (
                <li key={i}>
                  <div className="bd-feature-icon" style={{ background: bot.theme.bg, color: bot.theme.primary }}>
                    <Icon size={16} />
                  </div>
                  <span>{f}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Response style */}
        <div className="bd-card bd-style-card">
          <h2>Response Style</h2>
          <div className="bd-style-preview" style={{ borderColor: `${bot.theme.primary}33` }}>
            <div className="bd-style-dot" style={{ background: bot.theme.primary }}></div>
            <p>{bot.responseStyle}</p>
          </div>

          <h3>Chat Position</h3>
          <div className="bd-position-tag">
            <Monitor size={14} style={{ color: bot.theme.primary }} />
            <span>{bot.chatPosition}</span>
          </div>
        </div>

        {/* Best for */}
        <div className="bd-card bd-bestfor-card">
          <h2>Best For</h2>
          <div className="bd-bestfor-tags">
            {bot.bestFor?.split(', ').map((tag, i) => (
              <span key={i} className="bd-tag" style={{ background: bot.theme.bg, borderColor: `${bot.theme.primary}33`, color: bot.theme.primary }}>
                {tag}
              </span>
            ))}
          </div>

          <div className="bd-price-section">
            <span className="bd-price-label">Price</span>
            <span className="bd-price-value">{bot.price}</span>
          </div>
        </div>
      </section>

      {/* Integration Code Section */}
      <section className="bd-code-section">
        <div className="bd-code-header">
          <div>
            <h2><Code size={22} style={{ color: bot.theme.primary }} /> Integration Code</h2>
            <p className="bd-code-subtitle">Copy and paste this one line into your website to embed <strong style={{ color: bot.theme.primary }}>{bot.name}</strong></p>
          </div>
        </div>

        {/* Code block */}
        <div className="bd-code-block">
          <div className="bd-code-toolbar">
            <div className="bd-code-dots">
              <span></span><span></span><span></span>
            </div>
            <span className="bd-code-filename">index.html</span>
            <button
              className="bd-copy-btn"
              onClick={() => handleCopy(embedCode)}
              style={copied ? { background: 'rgba(34, 197, 94, 0.15)', borderColor: 'rgba(34, 197, 94, 0.3)' } : {}}
            >
              {copied ? <><CheckCheck size={14} /> Copied!</> : <><Copy size={14} /> Copy Script</>}
            </button>
          </div>
          <pre className="bd-code-content">
            <code>{embedCode}</code>
          </pre>
        </div>

        <div className="bd-code-note">
          <strong>💡 Setup:</strong> Replace <code>http://localhost:5000</code> with your deployed BotForge server URL and verify the embedded token is valid for your user. Place this script right before your closing <code>&lt;/body&gt;</code> tag.
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bd-bottom-cta">
        <h2>Ready to chat with<span style={{ color: bot.theme.primary }}> {bot.name}</span>?</h2>
        <div className="bd-cta-actions">
          <button className="bd-try-btn" onClick={handleTry} style={{ background: bot.theme.gradient }}>
            <MessageSquare size={18} />
            Start Chatting
          </button>
          {!isOwned && (
            <button className="bd-add-btn" onClick={handlePurchase}>
              <Plus size={18} /> Add to Collection
            </button>
          )}
        </div>
      </section>

      {/* Chat widget */}
      {showChat && (
        <ChatWidget
          bot={bot}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
}
