import React from 'react';
import { Link } from 'react-router-dom';

export function StartupCard({ startup }) {
  const stageBadge = { idea: 'badge-yellow', mvp: 'badge-blue', 'early-stage': 'badge-purple', growth: 'badge-green', scaling: 'badge-green', established: 'badge-blue' };
  return (
    <Link to={`/startups/${startup._id}`} className="card p-5 block hover:-translate-y-1 transition-all duration-200">
      <div className="flex items-start gap-3 mb-4">
        <img src={startup.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(startup.companyName)}&background=6366f1&color=fff&size=80`}
          alt={startup.companyName} className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-slate-200" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-slate-900 truncate">{startup.companyName}</h3>
            {startup.isVerified && <span title="Verified" className="text-indigo-500 text-sm">✓</span>}
          </div>
          <p className="text-slate-500 text-sm truncate">{startup.tagline || startup.industry}</p>
        </div>
      </div>
      {startup.description && <p className="text-slate-600 text-sm mb-4 line-clamp-2 leading-relaxed">{startup.description}</p>}
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <span className={stageBadge[startup.stage] || 'badge-blue'}>{startup.stage}</span>
        <span className="badge badge-blue">{startup.industry}</span>
        {startup.location?.country && <span className="text-slate-400 text-xs">📍 {startup.location.country}</span>}
      </div>
      {startup.traction?.revenue && (
        <div className="bg-emerald-50 rounded-lg px-3 py-1.5 text-sm">
          <span className="text-emerald-700 font-medium">💰 {startup.traction.revenue}</span>
          {startup.traction.growth && <span className="text-emerald-600 ml-2">↑ {startup.traction.growth}</span>}
        </div>
      )}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-3 text-slate-400 text-xs">
          <span>👁 {startup.views || 0}</span>
          <span>❤️ {startup.likes?.length || 0}</span>
          <span>👥 {startup.followers?.length || 0}</span>
        </div>
        {startup.isFeatured && <span className="badge badge-yellow">⭐ Featured</span>}
      </div>
    </Link>
  );
}

export function CorporateCard({ corporate }) {
  return (
    <Link to={`/corporates/${corporate._id}`} className="card p-5 block hover:-translate-y-1 transition-all duration-200">
      <div className="flex items-start gap-3 mb-4">
        <img src={corporate.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(corporate.companyName)}&background=10b981&color=fff&size=80`}
          alt={corporate.companyName} className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-slate-200" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 truncate">{corporate.companyName}</h3>
            {corporate.isVerified && <span title="Verified" className="text-emerald-500 text-sm">✓</span>}
          </div>
          <p className="text-slate-500 text-sm">{corporate.industry} · {corporate.size} employees</p>
        </div>
      </div>
      {corporate.description && <p className="text-slate-600 text-sm mb-4 line-clamp-2">{corporate.description}</p>}
      <div className="flex flex-wrap gap-2 mb-3">
        {corporate.innovationFocus?.slice(0, 3).map(f => <span key={f} className="badge badge-green">{f}</span>)}
      </div>
      {corporate.location?.country && <p className="text-slate-400 text-xs">📍 {corporate.location.city}, {corporate.location.country}</p>}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
        <span className="text-slate-400 text-xs">👁 {corporate.views || 0} views</span>
        {corporate.isFeatured && <span className="badge badge-yellow">⭐ Featured</span>}
      </div>
    </Link>
  );
}

export function OpportunityCard({ opportunity }) {
  const typeColors = { pilot: 'badge-blue', investment: 'badge-green', partnership: 'badge-purple', accelerator: 'badge-yellow', poc: 'badge-blue', vendor: 'badge-red' };
  const daysLeft = opportunity.deadline ? Math.max(0, Math.ceil((new Date(opportunity.deadline) - new Date()) / (1000 * 60 * 60 * 24))) : null;
  return (
    <Link to={`/opportunities/${opportunity._id}`} className="card p-5 block hover:-translate-y-1 transition-all duration-200">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <h3 className="font-bold text-slate-900 mb-1 line-clamp-2">{opportunity.title}</h3>
          {opportunity.corporate?.companyName && (
            <p className="text-sm text-slate-500 flex items-center gap-1">
              {opportunity.corporate.logo && <img src={opportunity.corporate.logo} alt="" className="w-4 h-4 rounded" />}
              {opportunity.corporate.companyName}
            </p>
          )}
        </div>
        <span className={typeColors[opportunity.type] || 'badge-blue'}>{opportunity.type}</span>
      </div>
      {opportunity.description && <p className="text-slate-600 text-sm mb-4 line-clamp-2">{opportunity.description}</p>}
      <div className="space-y-2 text-sm">
        {opportunity.budget?.min && (
          <div className="flex items-center gap-2 text-slate-600">
            <span>💰</span>
            <span>${(opportunity.budget.min / 1000).toFixed(0)}K – ${(opportunity.budget.max / 1000).toFixed(0)}K {opportunity.budget.currency}</span>
          </div>
        )}
        {daysLeft !== null && (
          <div className={`flex items-center gap-2 ${daysLeft <= 7 ? 'text-red-600' : 'text-slate-600'}`}>
            <span>⏰</span>
            <span>{daysLeft === 0 ? 'Deadline today!' : `${daysLeft} days left`}</span>
          </div>
        )}
        {opportunity.location?.remote && <div className="flex items-center gap-2 text-slate-600"><span>🌐</span><span>Remote OK</span></div>}
      </div>
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
        <span className="text-slate-400 text-xs">👁 {opportunity.views || 0} · {opportunity.applications?.length || 0} applicants</span>
        {opportunity.isFeatured && <span className="badge badge-yellow">⭐ Featured</span>}
      </div>
    </Link>
  );
}

export function EventCard({ event }) {
  const isRegistered = false;
  return (
    <Link to={`/events/${event._id}`} className="card p-5 block hover:-translate-y-1 transition-all duration-200">
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className="badge badge-purple">{event.type}</span>
        {event.isFeatured && <span className="badge badge-yellow">⭐</span>}
      </div>
      <h3 className="font-bold text-slate-900 mb-2 line-clamp-2">{event.title}</h3>
      {event.description && <p className="text-slate-600 text-sm mb-4 line-clamp-2">{event.description}</p>}
      <div className="space-y-1 text-sm text-slate-600">
        <div>📅 {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</div>
        <div>{event.isOnline ? '🌐 Online' : `📍 ${event.location}`}</div>
        <div>💰 {event.price === 0 ? 'Free' : `$${event.price}`}</div>
        <div>👥 {event.registrations?.length || 0}{event.capacity ? `/${event.capacity}` : ''} registered</div>
      </div>
    </Link>
  );
}

export function FundingCard({ round }) {
  const progress = round.targetAmount ? Math.min(100, Math.round((round.raisedAmount / round.targetAmount) * 100)) : 0;
  return (
    <Link to={`/funding/${round._id}`} className="card p-5 block hover:-translate-y-1 transition-all duration-200">
      <div className="flex items-start gap-3 mb-3">
        <img src={round.startup?.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(round.startup?.companyName || 'S')}&background=6366f1&color=fff`}
          alt="" className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
        <div>
          <h3 className="font-bold text-slate-900 text-sm">{round.title}</h3>
          <p className="text-slate-500 text-xs">{round.startup?.companyName}</p>
        </div>
        <span className="badge badge-green ml-auto">{round.roundType}</span>
      </div>
      <div className="mb-3">
        <div className="flex justify-between text-xs text-slate-600 mb-1">
          <span>Raised: ${(round.raisedAmount / 1000000).toFixed(1)}M</span>
          <span>Target: ${(round.targetAmount / 1000000).toFixed(1)}M</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-right text-slate-400 mt-1">{progress}% funded</p>
      </div>
      <div className="flex justify-between text-xs text-slate-500">
        <span>Min. ${(round.minInvestment || 0).toLocaleString()}</span>
        {round.equity && <span>{round.equity}% equity</span>}
        <span>{round.investors?.length || 0} investors</span>
      </div>
    </Link>
  );
}
