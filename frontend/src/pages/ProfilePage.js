import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, API } from '../contexts/AuthContext';
import { ArrowLeft, User, Lock, Trash, Camera } from '@phosphor-icons/react';
import axios from 'axios';
import { toast } from 'sonner';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [uploading, setUploading] = useState(false);

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    
    if (passwords.new !== passwords.confirm) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwords.new.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      await axios.post(
        `${API}/auth/change-password`,
        {
          currentPassword: passwords.current,
          newPassword: passwords.new
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Password changed successfully');
      setShowPasswordForm(false);
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to change password');
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(
        `${API}/auth/upload-photo`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      toast.success('Profile photo updated');
      window.location.reload();
    } catch (error) {
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await axios.delete(`${API}/auth/delete-account`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Account deleted successfully');
      logout();
      navigate('/');
    } catch (error) {
      toast.error('Failed to delete account');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#0A0A0B]">
      <header className="bg-[#FDFBF7] dark:bg-[#0A0A0B] border-b-2 border-[#1A237E] dark:border-[#FFD54F] sticky top-0 z-50 py-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            data-testid="back-to-dashboard-btn"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-[#1A237E] dark:text-[#FDFBF7] font-bold hover:text-[#FF6B35] transition-colors"
          >
            <ArrowLeft size={24} weight="bold" />
            Back to Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl sm:text-5xl font-black text-[#1A237E] dark:text-[#FDFBF7] mb-8 font-heading">
          My Profile
        </h1>

        {/* Profile Photo */}
        <div className="neo-card dark:bg-[#1A1A1B] dark:border-[#FFD54F] mb-6">
          <h2 className="text-2xl font-bold text-[#1A237E] dark:text-[#FDFBF7] mb-4 font-heading">Profile Photo</h2>
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-[#FF6B35] flex items-center justify-center border-4 border-[#1A237E] dark:border-[#FFD54F]">
                {user?.photoUrl ? (
                  <img src={user.photoUrl} alt="Profile" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User size={64} weight="bold" className="text-white" />
                )}
              </div>
              <label
                htmlFor="photo-upload"
                className="absolute bottom-0 right-0 bg-[#FFD54F] p-2 rounded-full border-2 border-[#1A237E] dark:border-[#FFD54F] cursor-pointer hover:bg-[#FACC15] transition-colors"
              >
                <Camera size={20} weight="bold" className="text-[#1A237E]" />
                <input
                  id="photo-upload"
                  data-testid="photo-upload-input"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>
            <div>
              <p className="text-lg font-bold text-[#1A237E] dark:text-[#FDFBF7]">{user?.name}</p>
              <p className="text-base text-[#1A237E]/70 dark:text-[#FDFBF7]/70">{user?.email}</p>
              <p className="text-sm text-[#1A237E]/50 dark:text-[#FDFBF7]/50 mt-2">
                {uploading ? 'Uploading...' : 'Click camera icon to change photo'}
              </p>
            </div>
          </div>
        </div>

        {/* User Stats */}
        <div className="grid sm:grid-cols-3 gap-6 mb-6">
          <div className="neo-card dark:bg-[#1A1A1B] dark:border-[#FFD54F]">
            <h3 className="text-lg font-bold text-[#1A237E]/70 dark:text-[#FDFBF7]/70 mb-2">Total Score</h3>
            <p className="text-4xl font-black text-[#FF6B35] font-heading">{user?.totalScore || 0}</p>
          </div>
          <div className="neo-card dark:bg-[#1A1A1B] dark:border-[#FFD54F]">
            <h3 className="text-lg font-bold text-[#1A237E]/70 dark:text-[#FDFBF7]/70 mb-2">Articles Completed</h3>
            <p className="text-4xl font-black text-[#00E676] font-heading">{user?.completedArticles?.length || 0}</p>
          </div>
          <div className="neo-card dark:bg-[#1A1A1B] dark:border-[#FFD54F]">
            <h3 className="text-lg font-bold text-[#1A237E]/70 dark:text-[#FDFBF7]/70 mb-2">Badges</h3>
            <p className="text-4xl font-black text-[#29B6F6] font-heading">{user?.badges?.length || 0}</p>
          </div>
        </div>

        {/* Password Reset */}
        <div className="neo-card dark:bg-[#1A1A1B] dark:border-[#FFD54F] mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Lock size={32} weight="bold" className="text-[#FF6B35]" />
              <h2 className="text-2xl font-bold text-[#1A237E] dark:text-[#FDFBF7] font-heading">Change Password</h2>
            </div>
            {!showPasswordForm && (
              <button
                data-testid="show-password-form-btn"
                onClick={() => setShowPasswordForm(true)}
                className="neo-btn-secondary"
              >
                Change Password
              </button>
            )}
          </div>

          {showPasswordForm && (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <label className="block text-sm font-bold uppercase tracking-[0.2em] text-[#1A237E]/70 dark:text-[#FDFBF7]/70 mb-2">
                  Current Password
                </label>
                <input
                  data-testid="current-password-input"
                  type="password"
                  value={passwords.current}
                  onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                  className="neo-input dark:bg-[#0A0A0B] dark:text-[#FDFBF7] dark:border-[#FFD54F] w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold uppercase tracking-[0.2em] text-[#1A237E]/70 dark:text-[#FDFBF7]/70 mb-2">
                  New Password
                </label>
                <input
                  data-testid="new-password-input"
                  type="password"
                  value={passwords.new}
                  onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                  className="neo-input dark:bg-[#0A0A0B] dark:text-[#FDFBF7] dark:border-[#FFD54F] w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold uppercase tracking-[0.2em] text-[#1A237E]/70 dark:text-[#FDFBF7]/70 mb-2">
                  Confirm New Password
                </label>
                <input
                  data-testid="confirm-password-input"
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  className="neo-input dark:bg-[#0A0A0B] dark:text-[#FDFBF7] dark:border-[#FFD54F] w-full"
                  required
                />
              </div>
              <div className="flex gap-4">
                <button type="submit" data-testid="submit-password-btn" className="neo-btn-primary flex-1">
                  Update Password
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswords({ current: '', new: '', confirm: '' });
                  }}
                  className="neo-btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Delete Account */}
        <div className="neo-card dark:bg-[#1A1A1B] dark:border-[#FF6B35] border-[#FF6B35]">
          <div className="flex items-center gap-3 mb-4">
            <Trash size={32} weight="bold" className="text-[#FF6B35]" />
            <h2 className="text-2xl font-bold text-[#FF6B35] font-heading">Delete Account</h2>
          </div>
          <p className="text-base text-[#1A237E]/70 dark:text-[#FDFBF7]/70 mb-4">
            Warning: This action cannot be undone. All your data, scores, and progress will be permanently deleted.
          </p>
          
          {!showDeleteConfirm ? (
            <button
              data-testid="show-delete-confirm-btn"
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-[#FF6B35] text-white font-bold border-2 border-[#1A237E] dark:border-[#FFD54F] shadow-[3px_3px_0px_#1A237E] dark:shadow-[3px_3px_0px_#FFD54F] rounded-lg px-6 py-3 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#1A237E] dark:hover:shadow-[4px_4px_0px_#FFD54F] transition-all"
            >
              Delete My Account
            </button>
          ) : (
            <div className="bg-[#FF6B35]/10 border-2 border-[#FF6B35] rounded-lg p-4">
              <p className="text-lg font-bold text-[#FF6B35] mb-4">Are you absolutely sure?</p>
              <div className="flex gap-4">
                <button
                  data-testid="confirm-delete-btn"
                  onClick={handleDeleteAccount}
                  className="bg-[#FF6B35] text-white font-bold border-2 border-[#1A237E] dark:border-[#FFD54F] rounded-lg px-6 py-3 hover:bg-[#E65A28] transition-all flex-1"
                >
                  Yes, Delete Forever
                </button>
                <button
                  data-testid="cancel-delete-btn"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="neo-btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
