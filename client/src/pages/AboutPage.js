import React from 'react';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <div className="pt-16 min-h-screen">
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white py-20 px-4 text-center">
        <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-400/30 rounded-full px-4 py-1.5 mb-6">
          <span className="text-orange-300 text-sm">🇮🇳 Proudly Made in India</span>
        </div>
        <h1 className="text-5xl font-black mb-6">About Nexus</h1>
        <p className="text-slate-400 text-xl max-w-2xl mx-auto">We're on a mission to accelerate India's startup ecosystem by connecting innovators with the corporate partners, capital, and resources they need to scale.</p>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-16 space-y-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-black text-slate-900 mb-4">Our Story</h2>
            <p className="text-slate-600 leading-relaxed mb-4">India has the world's 3rd largest startup ecosystem with 100,000+ startups — yet most struggle to get in front of corporate decision-makers. Nexus was built to close that gap.</p>
            <p className="text-slate-600 leading-relaxed mb-4">We believe every great Indian startup deserves a fair shot at corporate partnerships, pilots, and investment — regardless of whether they went to IIT or have alumni networks.</p>
            <p className="text-slate-600 leading-relaxed">Nexus democratizes access to opportunity. Built for Bharat, for every startup from Bengaluru to Bhopal.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[['2024','Founded'],['India','Home Market'],['₹0','Registration Cost'],['5 min','To Get Started']].map(([val, label]) => (
              <div key={label} className="card p-6 text-center">
                <p className="text-3xl font-black text-indigo-600 mb-1">{val}</p>
                <p className="text-slate-500 text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-black text-slate-900 text-center mb-10">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '🤝', title: 'Partnership First', desc: 'Every feature is built to create more meaningful connections between Indian innovators and enterprises.' },
              { icon: '🔓', title: 'Merit Over Network', desc: 'Your startup\'s potential matters more than your college or connections. Nexus levels the playing field.' },
              { icon: '🌍', title: 'Bharat First', desc: 'Built for India — with INR pricing, Indian payment methods, local compliance, and cities across all states.' },
            ].map(v => (
              <div key={v.title} className="card p-6 text-center">
                <div className="text-4xl mb-4">{v.icon}</div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">{v.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 via-white to-green-500 p-0.5 rounded-2xl">
          <div className="bg-white rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-black text-slate-900 mb-4">Supporting India's Startup Mission 🇮🇳</h2>
            <p className="text-slate-600 mb-6">Nexus aligns with Startup India, Make in India, and DPIIT's vision to grow India to 500K+ startups by 2030.</p>
            <div className="flex flex-wrap justify-center gap-4">
              {['Startup India Aligned','DPIIT Registered','UPI Payments','GST Compliant','Indian Data Residency'].map(badge => (
                <span key={badge} className="bg-indigo-50 border border-indigo-200 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium">{badge}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-black text-slate-900 mb-4">Contact Us</h2>
          <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {[['📧','Email','support@nexus.in'],['📍','Address','Bangalore, Karnataka 560001'],['⏰','Support Hours','Mon–Fri, 10AM–7PM IST']].map(([icon, label, val]) => (
              <div key={label} className="card p-4 text-center">
                <div className="text-2xl mb-2">{icon}</div>
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">{label}</p>
                <p className="font-semibold text-slate-900 text-sm">{val}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
