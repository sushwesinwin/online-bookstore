'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/use-auth';
import { getApiErrorMessage } from '@/lib/api/error-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  User,
  Mail,
  Lock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Edit3,
  Key,
  Camera,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function ProfilePage() {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    updateProfile,
    isUpdatingProfile,
    updateProfileError,
    updateProfileSuccess,
    changePassword,
    isChangingPassword,
    changePasswordError,
    changePasswordSuccess,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    profileImage: '',
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordMatchError, setPasswordMatchError] = useState('');

  // Sync form with user data
  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        profileImage: user.profileImage || '',
      });
      setImagePreview(user.profileImage || null);
    }
  }, [user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setProfileForm(p => ({ ...p, profileImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setProfileForm(p => ({ ...p, profileImage: '' }));
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Reset password form on success
  useEffect(() => {
    if (changePasswordSuccess) {
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordMatchError('');
    }
  }, [changePasswordSuccess]);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      firstName: profileForm.firstName,
      lastName: profileForm.lastName,
      profileImage: profileForm.profileImage,
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMatchError('Passwords do not match');
      return;
    }
    setPasswordMatchError('');
    changePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
  };

  const initials = user
    ? `${user.firstName?.charAt(0) ?? ''}${user.lastName?.charAt(0) ?? ''}`.toUpperCase()
    : 'U';

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F9FCFB] flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full max-w-lg px-4">
          <div className="h-32 bg-white rounded-2xl border border-[#E4E9E8]" />
          <div className="h-64 bg-white rounded-2xl border border-[#E4E9E8]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FCFB]">
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Profile Hero Card */}
          <div className="bg-white rounded-3xl border border-[#E4E9E8] overflow-hidden shadow-sm">
            {/* Banner */}
            <div className="h-24 bg-gradient-to-r from-[#0B7C6B] via-[#17BD8D] to-[#0B7C6B]" />
            <div className="px-8 pb-8 -mt-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              {/* Avatar */}
              <div className="flex items-end gap-4">
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="h-24 w-24 rounded-2xl object-cover shadow-xl border-4 border-white"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-[#0B7C6B] to-[#17BD8D] flex items-center justify-center text-white text-3xl font-bold shadow-xl border-4 border-white">
                    {initials}
                  </div>
                )}
                <div className="pb-1">
                  <h1 className="text-2xl font-bold text-[#101313]">
                    {user.firstName} {user.lastName}
                  </h1>
                  <p className="text-[#848785] text-sm flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" />
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-2 sm:pb-1">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${user.role === 'ADMIN' ? 'bg-[#FFF4ED] text-[#FF6320] border border-[#FF6320]/20' : 'bg-[#E4FFFB] text-[#0B7C6B] border border-[#0B7C6B]/20'}`}
                >
                  {user.role === 'ADMIN' ? '🛡️ Admin' : '📚 Reader'}
                </span>
                <div className="flex items-center gap-1.5 text-xs text-[#848785]">
                  <Calendar className="h-3.5 w-3.5" />
                  Joined {formatDate(user.createdAt)}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-3xl border border-[#E4E9E8] overflow-hidden shadow-sm">
            {/* Tab Headers */}
            <div className="flex border-b border-[#E4E9E8]">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-colors border-b-2 -mb-px ${activeTab === 'profile' ? 'border-[#0B7C6B] text-[#0B7C6B]' : 'border-transparent text-[#848785] hover:text-[#101313]'}`}
              >
                <Edit3 className="h-4 w-4" />
                Edit Profile
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-colors border-b-2 -mb-px ${activeTab === 'security' ? 'border-[#0B7C6B] text-[#0B7C6B]' : 'border-transparent text-[#848785] hover:text-[#101313]'}`}
              >
                <Key className="h-4 w-4" />
                Change Password
              </button>
            </div>

            {/* Tab: Edit Profile */}
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileSubmit} className="p-8 space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-[#101313]">
                    Personal Information
                  </h2>
                  <p className="text-sm text-[#848785] mt-1">
                    Update your name below.
                  </p>
                </div>

                {/* Success / Error Feedback */}
                {updateProfileSuccess && (
                  <div className="flex items-center gap-3 p-4 bg-green-50 text-green-700 rounded-xl border border-green-200 text-sm">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                    Profile updated successfully!
                  </div>
                )}
                {updateProfileError && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 text-sm">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    {getApiErrorMessage(
                      updateProfileError,
                      'Failed to update profile.'
                    )}
                  </div>
                )}

                {/* Profile Image Upload */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-[#101313]">
                    Profile Picture
                  </label>
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Profile preview"
                          className="h-24 w-24 rounded-2xl object-cover border-2 border-[#E4E9E8]"
                        />
                      ) : (
                        <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-[#0B7C6B] to-[#17BD8D] flex items-center justify-center text-white text-2xl font-bold border-2 border-[#E4E9E8]">
                          {initials}
                        </div>
                      )}
                      <label
                        htmlFor="profile-image"
                        className="absolute -bottom-2 -right-2 bg-[#0B7C6B] hover:bg-[#096B5B] text-white p-2 rounded-full cursor-pointer shadow-lg transition-colors"
                      >
                        <Camera className="h-4 w-4" />
                        <input
                          id="profile-image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="text-xs text-[#848785]">
                        Upload a profile picture. Recommended size: 400x400px.
                        JPG, PNG, or GIF.
                      </p>
                      {imagePreview && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={removeImage}
                          className="text-xs h-8"
                        >
                          Remove Image
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Email (read-only) */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#101313]">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#848785]" />
                    <Input
                      value={user.email}
                      readOnly
                      className="pl-11 h-12 bg-[#F4F8F8] cursor-not-allowed text-[#848785]"
                    />
                  </div>
                  <p className="text-xs text-[#848785]">
                    Email cannot be changed.
                  </p>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="firstName"
                      className="text-sm font-medium text-[#101313]"
                    >
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#848785]" />
                      <Input
                        id="firstName"
                        value={profileForm.firstName}
                        onChange={e =>
                          setProfileForm(p => ({
                            ...p,
                            firstName: e.target.value,
                          }))
                        }
                        className="pl-11 h-12"
                        required
                        minLength={1}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="lastName"
                      className="text-sm font-medium text-[#101313]"
                    >
                      Last Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#848785]" />
                      <Input
                        id="lastName"
                        value={profileForm.lastName}
                        onChange={e =>
                          setProfileForm(p => ({
                            ...p,
                            lastName: e.target.value,
                          }))
                        }
                        className="pl-11 h-12"
                        required
                        minLength={1}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="bg-[#0B7C6B] hover:bg-[#096B5B] h-12 px-8 font-semibold shadow-md hover:shadow-lg transition-all"
                  >
                    {isUpdatingProfile ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving...
                      </span>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </form>
            )}

            {/* Tab: Change Password */}
            {activeTab === 'security' && (
              <form onSubmit={handlePasswordSubmit} className="p-8 space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-[#101313]">
                    Change Password
                  </h2>
                  <p className="text-sm text-[#848785] mt-1">
                    Choose a strong password with at least 8 characters.
                  </p>
                </div>

                {/* Success / Error Feedback */}
                {changePasswordSuccess && (
                  <div className="flex items-center gap-3 p-4 bg-green-50 text-green-700 rounded-xl border border-green-200 text-sm">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                    Password changed successfully!
                  </div>
                )}
                {(changePasswordError || passwordMatchError) && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 text-sm">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    {passwordMatchError ||
                      getApiErrorMessage(
                        changePasswordError,
                        'Failed to change password.'
                      )}
                  </div>
                )}

                {/* Current Password */}
                <div className="space-y-2">
                  <label
                    htmlFor="currentPassword"
                    className="text-sm font-medium text-[#101313]"
                  >
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#848785]" />
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={e =>
                        setPasswordForm(p => ({
                          ...p,
                          currentPassword: e.target.value,
                        }))
                      }
                      className="pl-11 h-12"
                      required
                      placeholder="Enter your current password"
                    />
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <label
                    htmlFor="newPassword"
                    className="text-sm font-medium text-[#101313]"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#848785]" />
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={e =>
                        setPasswordForm(p => ({
                          ...p,
                          newPassword: e.target.value,
                        }))
                      }
                      className="pl-11 h-12"
                      required
                      minLength={8}
                      placeholder="New password (min. 8 characters)"
                    />
                  </div>
                </div>

                {/* Confirm New Password */}
                <div className="space-y-2">
                  <label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium text-[#101313]"
                  >
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#848785]" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={e => {
                        setPasswordForm(p => ({
                          ...p,
                          confirmPassword: e.target.value,
                        }));
                        setPasswordMatchError('');
                      }}
                      className={`pl-11 h-12 ${passwordMatchError ? 'border-red-400 focus:ring-red-400/20' : ''}`}
                      required
                      placeholder="Re-enter new password"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={isChangingPassword}
                    className="bg-[#0B7C6B] hover:bg-[#096B5B] h-12 px-8 font-semibold shadow-md hover:shadow-lg transition-all"
                  >
                    {isChangingPassword ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Updating...
                      </span>
                    ) : (
                      'Change Password'
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
