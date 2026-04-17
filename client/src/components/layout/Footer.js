import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 pt-16 pb-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center">
                <span className="text-white font-black text-sm">N</span>
              </div>
              <span className="text-white font-black text-xl">Nexus</span>
            </div>
            <p className="text-sm leading-relaxed mb-2">India's premier platform connecting innovative startups with corporate partners. Build partnerships, secure funding, and drive growth.</p>
            <p className="text-xs text-slate-500 mb-4">🇮🇳 Made in India · Startup India Aligned</p>
            <div className="flex gap-3">
              {['L', 'T', 'G'].map((s, i) => (
                <a key={i} href="#" className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-indigo-600 flex items-center justify-center transition-colors text-xs font-bold text-slate-400 hover:text-white">{s}</a>
              ))}
            </div>
          </div>
          {[
            { title: 'Platform', links: [['Startups','/startups'],['Corporates','/corporates'],['Opportunities','/opportunities'],['Events','/events'],['Funding','/funding']] },
            { title: 'Company', links: [['About','/about'],['Pricing','/pricing'],['Blog','#'],['Careers','#'],['Press','#']] },
            { title: 'Legal & Support', links: [['Help Center','#'],['Contact','#'],['Privacy Policy','#'],['Terms of Service','#'],['Grievance Officer','#']] },
          ].map(col => (
            <div key={col.title}>
              <h4 className="text-white font-semibold text-sm mb-4">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map(([label, href]) => (
                  <li key={label}><Link to={href} className="text-sm hover:text-white transition-colors">{label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* India compliance bar */}
        <div className="border-t border-slate-800 pt-6 mb-4">
          <div className="flex flex-wrap gap-4 text-xs text-slate-600 justify-center">
            {['CIN: U72900MH2024PTC123456','GSTIN: 27AAACN1234M1Z5','Registered under Companies Act 2013','Payment partner: Razorpay (PCI DSS Compliant)'].map(t => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm">© {new Date().getFullYear()} Nexus Platform Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
