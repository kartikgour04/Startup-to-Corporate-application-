import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import api from '../../utils/api';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [unread, setUnread] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const dropRef = useRef();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (user) {
      api.get('/notifications').then(r => setUnread(r.data.unread)).catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setProfileOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) { navigate(`/search?q=${encodeURIComponent(searchQuery)}`); setSearchQuery(''); }
  };

  const isLanding = location.pathname === '/';
  const navClass = scrolled || !isLanding
    ? 'bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm'
    : 'bg-transparent';

  const linkClass = scrolled || !isLanding ? 'text-slate-700 hover:text-indigo-600' : 'text-white/90 hover:text-white';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center">
              <span className="text-white font-black text-sm">N</span>
            </div>
            <span className={`font-black text-xl tracking-tight transition-colors ${scrolled || !isLanding ? 'text-slate-900' : 'text-white'}`}>
              Nexus
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/startups" className={`text-sm font-medium transition-colors ${linkClass}`}>Startups</Link>
            <Link to="/corporates" className={`text-sm font-medium transition-colors ${linkClass}`}>Corporates</Link>
            <Link to="/opportunities" className={`text-sm font-medium transition-colors ${linkClass}`}>Opportunities</Link>
            <Link to="/events" className={`text-sm font-medium transition-colors ${linkClass}`}>Events</Link>
            <Link to="/funding" className={`text-sm font-medium transition-colors ${linkClass}`}>Funding</Link>
            <Link to="/pricing" className={`text-sm font-medium transition-colors ${linkClass}`}>Pricing</Link>
          </div>

          {/* Search + Auth */}
          <div className="hidden md:flex items-center gap-3">
            <form onSubmit={handleSearch} className="relative">
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-44 px-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-white/90 focus:outline-none focus:ring-2 focus:ring-indigo-500 pl-8"
              />
              <svg className="absolute left-2 top-2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </form>

            {user ? (
              <div className="relative" ref={dropRef}>
                <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className="relative">
                    <img src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff`}
                      alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                    {unread > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">{unread > 9 ? '9+' : unread}</span>}
                  </div>
                  <span className="text-sm font-medium text-slate-700 max-w-[100px] truncate">{user.name}</span>
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 animate-fade-in">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="font-semibold text-slate-900 text-sm">{user.name}</p>
                      <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                      {user.isPremium && <span className="badge badge-yellow text-xs mt-1">⭐ Premium</span>}
                    </div>
                    <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50" onClick={() => setProfileOpen(false)}>
                      <span>📊</span> Dashboard
                    </Link>
                    <Link to="/dashboard/notifications" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50" onClick={() => setProfileOpen(false)}>
                      <span>🔔</span> Notifications {unread > 0 && <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{unread}</span>}
                    </Link>
                    <Link to="/dashboard/messages" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50" onClick={() => setProfileOpen(false)}>
                      <span>💬</span> Messages
                    </Link>
                    <Link to="/dashboard/settings" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50" onClick={() => setProfileOpen(false)}>
                      <span>⚙️</span> Settings
                    </Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" className="flex items-center gap-2 px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50" onClick={() => setProfileOpen(false)}>
                        <span>🛡️</span> Admin Panel
                      </Link>
                    )}
                    <div className="border-t border-slate-100 mt-1">
                      <button onClick={logout} className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left">
                        <span>🚪</span> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className={`text-sm font-medium transition-colors ${scrolled || !isLanding ? 'text-slate-700 hover:text-indigo-600' : 'text-white/90 hover:text-white'}`}>Sign In</Link>
                <Link to="/register" className="btn-primary text-sm py-1.5 px-4">Get Started</Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg hover:bg-slate-100">
            <svg className="w-6 h-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-2 animate-fade-in">
          {[['/', 'Home'], ['/startups', 'Startups'], ['/corporates', 'Corporates'], ['/opportunities', 'Opportunities'], ['/events', 'Events'], ['/funding', 'Funding'], ['/pricing', 'Pricing']].map(([path, label]) => (
            <Link key={path} to={path} className="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 font-medium" onClick={() => setMenuOpen(false)}>{label}</Link>
          ))}
          {user ? (
            <>
              <Link to="/dashboard" className="block px-3 py-2 rounded-lg text-indigo-600 hover:bg-indigo-50 font-medium" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <button onClick={() => { logout(); setMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 font-medium">Sign Out</button>
            </>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link to="/login" className="btn-secondary flex-1 text-center" onClick={() => setMenuOpen(false)}>Sign In</Link>
              <Link to="/register" className="btn-primary flex-1 text-center" onClick={() => setMenuOpen(false)}>Get Started</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
