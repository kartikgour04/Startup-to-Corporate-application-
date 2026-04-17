import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import api from '../../utils/api';
import toast from 'react-hot-toast';

// ─── Verify Email Page ────────────────────────────────────────────
export function VerifyEmailPage() {
  const { token } = require('react-router-dom').useParams();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  React.useEffect(() => {
    api.get(`/auth/verify/${token}`)
      .then(r => { setStatus('success'); setMessage(r.data.message); })
      .catch(e => { setStatus('error'); setMessage(e.response?.data?.message || 'Verification failed'); });
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full text-center">
        {status === 'verifying' && <><div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4" /><p className="text-slate-600">Verifying your email...</p></>}
        {status === 'success' && <>
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Email Verified!</h2>
          <p className="text-slate-600 mb-6">{message}</p>
          <Link to="/login" className="btn-primary block text-center">Login Now →</Link>
        </>}
        {status === 'error' && <>
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Verification Failed</h2>
          <p className="text-slate-600 mb-6">{message}</p>
          <button onClick={() => { setStatus('resend'); }} className="btn-primary w-full mb-3">Resend Verification Email</button>
          <Link to="/login" className="text-indigo-600 text-sm hover:underline">Back to Login</Link>
        </>}
        {status === 'resend' && <ResendVerification />}
      </div>
    </div>
  );
}

// ─── Resend Verification ──────────────────────────────────────────
function ResendVerification({ initialEmail = '' }) {
  const [email, setEmail] = useState(initialEmail);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResend = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/resend-verification', { email });
      setSent(true);
      toast.success('Verification email sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error sending email');
    } finally { setLoading(false); }
  };

  if (sent) return (
    <div className="text-center">
      <div className="text-5xl mb-3">📧</div>
      <p className="font-semibold text-slate-900 mb-1">Email Sent!</p>
      <p className="text-slate-500 text-sm">Check your inbox at <strong>{email}</strong></p>
    </div>
  );

  return (
    <form onSubmit={handleResend} className="space-y-3 text-left">
      <p className="text-slate-600 text-sm text-center mb-4">Enter your email to resend the verification link</p>
      <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="input" placeholder="your@email.com" />
      <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Sending...' : 'Resend Email'}</button>
    </form>
  );
}

// ─── Email Required Screen ────────────────────────────────────────
function VerificationRequired({ email, onResend }) {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleResend = async () => {
    setResending(true);
    try {
      await api.post('/auth/resend-verification', { email });
      setResent(true);
      toast.success('Verification email resent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    } finally { setResending(false); }
  };

  return (
    <div className="text-center space-y-4">
      <div className="text-6xl">📧</div>
      <h3 className="text-xl font-black text-slate-900">Check Your Email</h3>
      <p className="text-slate-600 text-sm leading-relaxed">
        We've sent a verification link to<br />
        <strong className="text-slate-900">{email}</strong>
      </p>
      <p className="text-slate-500 text-xs">Click the link in the email to verify your account and login.</p>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-left">
        <p className="text-amber-800 text-xs font-medium mb-1">📌 Didn't receive it?</p>
        <ul className="text-amber-700 text-xs space-y-0.5 list-disc list-inside">
          <li>Check your Spam / Junk folder</li>
          <li>Make sure you entered the right email</li>
          <li>Wait 1-2 minutes, then resend</li>
        </ul>
      </div>
      {resent ? (
        <p className="text-emerald-600 text-sm font-medium">✅ Email resent successfully!</p>
      ) : (
        <button onClick={handleResend} disabled={resending} className="btn-secondary w-full text-sm">
          {resending ? 'Sending...' : '🔄 Resend Verification Email'}
        </button>
      )}
      {onResend && <button onClick={onResend} className="text-indigo-600 text-xs hover:underline">Use different email →</button>}
    </div>
  );
}

// ─── Login Page ───────────────────────────────────────────────────
export function LoginPage() {
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showVerification, setShowVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  React.useEffect(() => {
    const verified = searchParams.get('verified');
    if (verified) toast.success('Email verified! You can now login.');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await login(form.email, form.password);
    if (res.success) {
      toast.success('Welcome back! 🎉');
      navigate('/dashboard');
    } else if (res.requiresVerification) {
      setVerificationEmail(res.email || form.email);
      setShowVerification(true);
    } else {
      toast.error(res.message);
    }
  };

  if (showVerification) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center"><span className="text-white font-black">N</span></div>
          <span className="text-white font-black text-2xl">Nexus</span>
        </Link>
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <VerificationRequired email={verificationEmail} onResend={() => setShowVerification(false)} />
          <div className="mt-4 pt-4 border-t border-slate-100 text-center">
            <button onClick={() => setShowVerification(false)} className="text-slate-500 text-sm hover:text-slate-700">← Back to Login</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center"><span className="text-white font-black">N</span></div>
            <span className="text-white font-black text-2xl">Nexus</span>
          </Link>
          <h1 className="text-3xl font-black text-white mb-2">Welcome back</h1>
          <p className="text-slate-400">Sign in to your Nexus account</p>
        </div>
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email address</label>
              <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                className="input" placeholder="you@company.com" autoComplete="email" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} required value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  className="input pr-10" placeholder="Enter your password" autoComplete="current-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm">
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-700">Forgot password?</Link>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-500 mb-3 text-center font-medium uppercase tracking-wider">Demo Accounts</p>
            <div className="space-y-2">
              {[
                { label: '🚀 Startup Demo', email: 'arjun@aifusion.in', pw: 'Test@123', desc: 'AI Fusion · Hyderabad' },
                { label: '🏢 Corporate Demo', email: 'anjali@techcorp.in', pw: 'Test@123', desc: 'TechCorp · Bangalore' },
              ].map(d => (
                <button key={d.label} type="button"
                  onClick={() => setForm({ email: d.email, password: d.pw })}
                  className="w-full text-left px-3 py-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 transition-all">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-700 font-medium text-sm">{d.label}</span>
                    <span className="text-slate-400 text-xs">{d.desc}</span>
                  </div>
                  <p className="text-slate-400 text-xs mt-0.5">{d.email}</p>
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account? <Link to="/register" className="text-indigo-600 font-semibold hover:text-indigo-700">Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Register Page ─────────────────────────────────────────────────
export function RegisterPage() {
  const { register, loading } = useAuthStore();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'startup', phone: '', city: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters');
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return toast.error('Please enter a valid email address');
    const res = await register(form);
    if (res.success) {
      setRegisteredEmail(form.email);
      setRegistered(true);
      if (res.emailSent === false && res.devVerifyLink) {
        // Email not configured — show dev link for testing
        toast(
          (t) => (
            <span style={{fontSize:'13px'}}>
              Email not configured. <a href={res.devVerifyLink} onClick={() => toast.dismiss(t.id)}
                style={{color:'#818cf8',textDecoration:'underline'}}>Click here to verify (dev mode)</a>
            </span>
          ),
          { duration: 30000, style: { background: '#1e293b', color: '#f1f5f9' } }
        );
      } else {
        toast.success(res.message || 'Account created! Check your email to verify.');
      }
    } else {
      toast.error(res.message);
    }
  };

  if (registered) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center"><span className="text-white font-black text-sm">N</span></div>
            <span className="text-white font-black text-xl">Nexus</span>
          </Link>
        </div>
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <VerificationRequired email={registeredEmail} />
          <div className="mt-4 pt-4 border-t border-slate-100 text-center">
            <Link to="/login" className="text-slate-500 text-sm hover:text-slate-700">← Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center"><span className="text-white font-black">N</span></div>
            <span className="text-white font-black text-2xl">Nexus</span>
          </Link>
          <h1 className="text-3xl font-black text-white mb-2">Create your account</h1>
          <p className="text-slate-400">Join India's startup-corporate platform</p>
        </div>
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { value: 'startup', icon: '🚀', label: 'Startup', desc: "I'm building a company" },
              { value: 'corporate', icon: '🏢', label: 'Corporate', desc: 'I represent an enterprise' },
            ].map(r => (
              <button key={r.value} type="button" onClick={() => setForm({...form, role: r.value})}
                className={`p-3 rounded-xl border-2 text-left transition-all ${form.role === r.value ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'}`}>
                <div className="text-2xl mb-1">{r.icon}</div>
                <div className="font-bold text-slate-900 text-sm">{r.label}</div>
                <div className="text-slate-500 text-xs">{r.desc}</div>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
              <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                className="input" placeholder="Your name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Work Email *</label>
              <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                className="input" placeholder="you@company.com" autoComplete="email" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                  className="input" placeholder="+91 9876543210" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                <input value={form.city} onChange={e => setForm({...form, city: e.target.value})}
                  className="input" placeholder="Mumbai, Delhi..." />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password * (min 8 characters)</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} required minLength={8}
                  value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                  className="input pr-10" placeholder="Create a strong password" autoComplete="new-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm">
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
              {form.password && (
                <div className="flex gap-1 mt-1.5">
                  {[form.password.length >= 8, /[A-Z]/.test(form.password), /[0-9]/.test(form.password), /[^A-Za-z0-9]/.test(form.password)].map((ok, i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full ${ok ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                  ))}
                </div>
              )}
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? 'Creating account...' : `Create ${form.role === 'startup' ? 'Startup' : 'Corporate'} Account →`}
            </button>
          </form>
          <p className="text-center text-xs text-slate-400 mt-4">
            By signing up you agree to our <a href="#" className="underline">Terms</a> and <a href="#" className="underline">Privacy Policy</a>. Made in India 🇮🇳
          </p>
          <p className="text-center text-sm text-slate-500 mt-3">
            Already have an account? <Link to="/login" className="text-indigo-600 font-semibold hover:text-indigo-700">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Forgot Password Page ──────────────────────────────────────────
export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center"><span className="text-white font-black">N</span></div>
            <span className="text-white font-black text-2xl">Nexus</span>
          </Link>
        </div>
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          {sent ? (
            <div className="text-center">
              <div className="text-6xl mb-4">📧</div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Check your email</h2>
              <p className="text-slate-600 mb-2">We sent a password reset link to</p>
              <p className="font-semibold text-slate-900 mb-6">{email}</p>
              <p className="text-slate-400 text-sm">Didn't receive it? Check spam or <button onClick={() => setSent(false)} className="text-indigo-600 hover:underline">try again</button></p>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Reset Password</h2>
              <p className="text-slate-500 text-sm mb-6">Enter your email and we'll send a reset link</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  className="input" placeholder="your@email.com" />
                <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                  {loading ? 'Sending...' : 'Send Reset Email'}
                </button>
              </form>
            </>
          )}
          <Link to="/login" className="block text-center text-sm text-indigo-600 mt-4 hover:underline">← Back to login</Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
