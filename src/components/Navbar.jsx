import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bot, ShoppingBag, Package, LogOut, User } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="nav-inner">
        <Link to="/" className="nav-logo">
          <div className="logo-icon"><Bot size={22} /></div>
          <span className="logo-text">BotForge</span>
        </Link>

        <div className="nav-links">
          <Link to="/shop" className={`nav-link ${location.pathname === '/shop' ? 'active' : ''}`}>
            <ShoppingBag size={16} />
            <span>Shop</span>
          </Link>
          {user && (
            <Link to="/my-bots" className={`nav-link ${location.pathname === '/my-bots' ? 'active' : ''}`}>
              <Package size={16} />
              <span>My Bots</span>
            </Link>
          )}
        </div>

        <div className="nav-auth">
          {user ? (
            <div className="nav-user">
              <div className="user-avatar">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} referrerPolicy="no-referrer" />
                ) : (
                  <User size={16} />
                )}
              </div>
              <span className="user-name">{user.name}</span>
              <button className="nav-btn logout-btn" onClick={logout}>
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="nav-auth-buttons">
              <Link to="/login" className="nav-btn login-btn">Sign In</Link>
              <Link to="/register" className="nav-btn register-btn">Get Started</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
