import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

export default function ProfileSettings() {
  const { user, updateUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: user?.name || '', avatar: user?.avatar || '', phone: user?.phone || '', city: user?.city || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await api.put('/users/update', form);
      updateUser(r.data);
      toast.success('Profile updated!');
    } catch { toast.error('Failed to save profile'); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error('New passwords do not match');
    if (pwForm.newPassword.length < 8) return toast.error('Password must be at least 8 characters');
    try {
      await api.put('/auth/update-password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password updated successfully');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to update password'); }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await api.delete('/auth/delete-account', { data: { password: deletePassword } });
      toast.success('Account permanently deleted.');
      logout();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to delete account'); }
    finally { setDeleteLoading(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <h1 className="text-2xl font-black text-slate-900">Account Settings</h1>

      {/* Ban notice */}
      {!user?.isActive && user?.banReason && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="font-bold text-red-800 mb-1">⚠️ Account Restricted</p>
          <p className="text-red-700 text-sm">Reason: {user.banReason}</p>
          <p className="text-red-600 text-xs mt-2">To appeal, contact support@nexus.in</p>
        </div>
      )}

      {/* Profile */}
      <div className="card p-6">
        <h2 className="font-bold text-slate-900 mb-4">Profile Information</h2>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="flex items-center gap-4 mb-2">
            <img src={form.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=4f46e5&color=fff&size=128`}
              className="w-16 h-16 rounded-full object-cover border-2 border-slate-200" alt="avatar" />
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Avatar URL</label>
              <input className="input" placeholder="https://your-photo.jpg" value={form.avatar} onChange={e => setForm({...form, avatar: e.target.value})} />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input required className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
              <input className="input" placeholder="+91 9876543210" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">City</label>
              <input className="input" placeholder="Mumbai, Bangalore..." value={form.city} onChange={e => setForm({...form, city: e.target.value})} /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Email (cannot change)</label>
              <input disabled className="input bg-slate-50 text-slate-400" value={user?.email || ''} /></div>
          </div>
          <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Changes'}</button>
        </form>
      </div>

      {/* Change Password */}
      <div className="card p-6">
        <h2 className="font-bold text-slate-900 mb-4">Change Password</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
            <input type="password" required className="input" value={pwForm.currentPassword} onChange={e => setPwForm({...pwForm, currentPassword: e.target.value})} /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">New Password (min 8 chars)</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} required minLength={8} className="input pr-10" value={pwForm.newPassword} onChange={e => setPwForm({...pwForm, newPassword: e.target.value})} />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{showPw ? '🙈' : '👁'}</button>
            </div>
          </div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
            <input type="password" required minLength={8} className="input" value={pwForm.confirmPassword} onChange={e => setPwForm({...pwForm, confirmPassword: e.target.value})} /></div>
          <button type="submit" className="btn-primary">Update Password</button>
        </form>
      </div>

      {/* Account Info */}
      <div className="card p-6">
        <h2 className="font-bold text-slate-900 mb-4">Account Details</h2>
        <div className="space-y-3 text-sm">
          {[
            ['Role', <span className="capitalize">{user?.role}</span>],
            ['Status', user?.isActive ? <span className="text-emerald-600 font-medium">Active</span> : <span className="text-red-500 font-medium">Restricted</span>],
            ['Email Verified', user?.isVerified ? <span className="text-emerald-600">✓ Verified</span> : <span className="text-amber-500">Pending</span>],
            ['Plan', user?.isPremium ? <span className="text-amber-500 font-medium capitalize">⭐ {user.premiumPlan}</span> : <span className="text-slate-400">Free</span>],
            ['Member Since', user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
              <span className="text-slate-500">{label}</span>
              <span className="font-medium text-slate-800">{value}</span>
            </div>
          ))}
        </div>
        {!user?.isPremium && (
          <Link to="/pricing" className="mt-4 block text-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2.5 rounded-xl font-semibold hover:opacity-90 transition-opacity text-sm">
            ⭐ Upgrade Plan
          </Link>
        )}
      </div>

      {/* Delete Account */}
      <div className="card p-6 border-red-200">
        <h2 className="font-bold text-red-700 mb-2">Delete Account</h2>
        <p className="text-slate-600 text-sm mb-4">Permanently delete your account and all associated data — profiles, pitches, applications, messages. This cannot be undone.</p>
        <button onClick={() => setShowDeleteModal(true)} className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          Delete My Account
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="text-center mb-4">
              <div className="text-5xl mb-3">⚠️</div>
              <h3 className="text-xl font-black text-slate-900">Delete Account</h3>
              <p className="text-slate-500 text-sm mt-2">This will permanently delete your account and all your data. This action cannot be reversed.</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Confirm with your password</label>
              <input type="password" value={deletePassword} onChange={e => setDeletePassword(e.target.value)}
                className="input" placeholder="Enter your password to confirm" />
            </div>
            <div className="flex gap-3">
              <button onClick={handleDeleteAccount} disabled={deleteLoading || !deletePassword}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-2.5 rounded-xl font-bold text-sm">
                {deleteLoading ? 'Deleting...' : 'Yes, Delete Everything'}
              </button>
              <button onClick={() => { setShowDeleteModal(false); setDeletePassword(''); }} className="flex-1 btn-secondary text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
