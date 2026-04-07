import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Bot, MessageSquare, Code2, Zap, Settings, Command, ArrowRight } from 'lucide-react';
import './Home.css';

const features = [
  {
    icon: <Settings size={24} />,
    title: "Easy Integrations",
    desc: "Make your bot more useful with custom integrations across your entire tech stack.",
    colSpan: true,
  },
  {
    icon: <Command size={24} />,
    title: "Shortcuts",
    desc: "Use shortcuts to make your work easier and boost productivity.",
  },
  {
    icon: <Bot size={24} />,
    title: "6 Unique Styles",
    desc: "Choose from 6 premium chatbot personalities — each with unique colors, animations, and AI behavior.",
  },
  {
    icon: <MessageSquare size={24} />,
    title: "Real AI Conversations",
    desc: "Powered by OpenAI GPT — these aren't mockups, they're real thinking, responding AI agents.",
    colSpan: true,
  },
  {
    icon: <Code2 size={24} />,
    title: "Easy Setup",
    desc: "With a few mouse clicks, your bot takes its place on our powerful infrastructure in seconds.",
  },
  {
    icon: <Zap size={24} />,
    title: "Lightning Responses",
    desc: "Ship AI responses at lightning speed with edge runtime optimizations.",
  }
];

function FeatureCard({ item }) {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    cardRef.current.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    cardRef.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  return (
    <div
      className={`bento-card ${item.colSpan ? 'span-2-col' : ''}`}
      ref={cardRef}
      onMouseMove={handleMouseMove}
    >
      <div className="card-visual">
        <div className="icon-wrapper">{item.icon}</div>
      </div>
      <div className="card-content">
        <h3 className="card-title">{item.title}</h3>
        <p className="card-desc">{item.desc}</p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="home-page">
      <header className="hero">
        <div className="hero-badge">🤖 AI-Powered Chat Widgets</div>
        <h1>
          The best <span className="text-gradient">AI chat bots</span><br />you will ever find
        </h1>
        <p>
          Premium conversational interfaces with beautiful opening and closing styles.
          6 unique personalities. Real AI thinking. Easy setup, powerful infrastructure.
        </p>
        <div className="hero-buttons">
          <Link to="/shop" className="demo-button primary-btn">
            Browse the Shop
            <ArrowRight size={18} />
          </Link>
          <Link to="/register" className="demo-button secondary-btn">
            Get Started Free
          </Link>
        </div>
      </header>

      <section className="features-section">
        <h2 className="section-title">Why choose <span className="text-gradient">BotForge</span>?</h2>
        <div className="bento-grid">
          {features.map((f, i) => (
            <FeatureCard key={i} item={f} />
          ))}
        </div>
      </section>
    </div>
  );
}
