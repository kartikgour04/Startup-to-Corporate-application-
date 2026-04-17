import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const getNavItems = (role) => {
  const base = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard', exact: true },
    { path: '/dashboard/messages', icon: '💬', label: 'Messages' },
    { path: '/dashboard/connections', icon: '🤝', label: 'Connections' },
    { path: '/dashboard/notifications', icon: '🔔', label: 'Notifications' },
    { path: '/dashboard/analytics', icon: '📈', label: 'Analytics' },
    { path: '/dashboard/events', icon: '📅', label: 'My Events' },
    { path: '/dashboard/settings', icon: '⚙️', label: 'Settings' },
  ];
  if (role === 'startup') return [
    ...base.slice(0, 1),
    { path: '/dashboard/startup-profile', icon: '🚀', label: 'My Startup' },
    { path: '/dashboard/pitches', icon: '🎯', label: 'My Pitches' },
    { path: '/dashboard/applications', icon: '📋', label: 'Applications' },
    { path: '/dashboard/funding', icon: '💰', label: 'Funding' },
    ...base.slice(1)
  ];
  if (role === 'corporate') return [
    ...base.slice(0, 1),
    { path: '/dashboard/corporate-profile', icon: '🏢', label: 'Company Profile' },
    { path: '/dashboard/opportunities', icon: '💡', label: 'Opportunities' },
    ...base.slice(1)
  ];
  return base;
};

export default function DashboardLayout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navItems = getNavItems(user?.role);

  const isActive = (path, exact) => exact ? location.pathname === path : location.pathname.startsWith(path) && (path !== '/dashboard' || location.pathname === '/dashboard');

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-auto lg:z-auto flex flex-col`}>
        {/* Logo */}
        <div className="p-6 border-b border-slate-100">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center">
              <span className="text-white font-black text-sm">N</span>
            </div>
            <span className="font-black text-xl text-slate-900">Nexus</span>
          </Link>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <img src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=6366f1&color=fff`}
              alt={user?.name} className="w-10 h-10 rounded-full object-cover" />
            <div className="min-w-0">
              <p className="font-semibold text-slate-900 text-sm truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 capitalize flex items-center gap-1">
                {user?.role} {user?.isPremium && <span className="text-amber-500">⭐</span>}
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <Link key={item.path} to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive(item.path, item.exact) ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
              onClick={() => setSidebarOpen(false)}>
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}

          {/* Quick actions */}
          <div className="pt-4 mt-4 border-t border-slate-100">
            <p className="text-xs text-slate-400 uppercase tracking-wider px-3 mb-2">Quick Actions</p>
            {user?.role === 'startup' && (
              <Link to="/dashboard/pitches/new" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-emerald-600 hover:bg-emerald-50 transition-colors">
                <span>✨</span> Create Pitch
              </Link>
            )}
            {user?.role === 'corporate' && (
              <Link to="/dashboard/opportunities/new" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-emerald-600 hover:bg-emerald-50 transition-colors">
                <span>✨</span> Post Opportunity
              </Link>
            )}
            <Link to="/opportunities" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
              <span>🌐</span> Browse Platform
            </Link>
          </div>
        </nav>

        {/* Upgrade Banner */}
        {!user?.isPremium && (
          <div className="p-4 border-t border-slate-100">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 text-white">
              <p className="font-semibold text-sm mb-1">Upgrade to Premium</p>
              <p className="text-xs text-indigo-200 mb-3">Unlimited pitches, priority listing & more</p>
              <Link to="/pricing" className="block text-center bg-white text-indigo-600 text-xs font-bold py-1.5 px-3 rounded-lg hover:bg-indigo-50 transition-colors">
                View Plans
              </Link>
            </div>
          </div>
        )}

        {/* Sign out */}
        <div className="p-4 border-t border-slate-100">
          <button onClick={logout} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 w-full transition-colors">
            <span>🚪</span> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between lg:hidden sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-slate-100">
            <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-bold text-slate-900">Nexus</span>
          <img src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=6366f1&color=fff`}
            className="w-8 h-8 rounded-full" alt="avatar" />
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-8 max-w-6xl w-full mx-auto">
          {!user?.isActive && user?.banReason && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-red-500 text-2xl flex-shrink-0">⚠️</span>
                <div>
                  <p className="font-bold text-red-800">Your account has been restricted</p>
                  <p className="text-red-700 text-sm mt-1">Reason: {user.banReason}</p>
                  <p className="text-red-600 text-xs mt-2">You cannot use platform features until this is resolved. To appeal, contact <a href="mailto:support@nexus.in" className="underline">support@nexus.in</a></p>
                </div>
              </div>
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
