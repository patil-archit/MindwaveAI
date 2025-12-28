import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Mail, Calendar, ArrowLeft, Edit2, Save, X, User, Phone, MapPin, FileText } from 'lucide-react';

const ProfilePage = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notification, setNotification] = useState(null);

    // Profile data state
    const [profileData, setProfileData] = useState({
        fullName: '',
        age: '',
        phone: '',
        bio: '',
        location: ''
    });

    // Temporary edit state
    const [editData, setEditData] = useState({ ...profileData });

    // Load user profile from localStorage on mount
    useEffect(() => {
        const loadProfile = () => {
            if (!currentUser) return;

            try {
                setLoading(true);

                // Get profile from localStorage
                const storageKey = `profile_${currentUser.uid}`;
                const savedProfile = localStorage.getItem(storageKey);

                let profile = {
                    fullName: '',
                    age: '',
                    phone: '',
                    bio: '',
                    location: ''
                };

                if (savedProfile) {
                    profile = JSON.parse(savedProfile);
                }

                setProfileData(profile);
                setEditData(profile);
            } catch (error) {
                console.error('Error loading profile:', error);
                showNotification('Failed to load profile', 'error');
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [currentUser]);

    const handleSignOut = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const handleEdit = () => {
        setEditData({ ...profileData });
        setIsEditing(true);
    };

    const handleCancel = () => {
        setEditData({ ...profileData });
        setIsEditing(false);
    };

    const handleSave = () => {
        // Validation
        if (editData.age && (isNaN(editData.age) || editData.age < 0 || editData.age > 150)) {
            showNotification('Please enter a valid age (0-150)', 'error');
            return;
        }

        try {
            setSaving(true);

            // Save to localStorage
            const storageKey = `profile_${currentUser.uid}`;
            localStorage.setItem(storageKey, JSON.stringify(editData));

            setProfileData({ ...editData });
            setIsEditing(false);
            showNotification('Profile updated successfully!', 'success');
        } catch (error) {
            console.error('Error saving profile:', error);
            showNotification('Failed to save profile', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleInputChange = (field, value) => {
        setEditData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    // Get user initials for avatar
    const getInitials = () => {
        if (profileData.fullName) {
            return profileData.fullName
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);
        }
        if (currentUser?.displayName) {
            return currentUser.displayName
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);
        }
        return currentUser?.email?.[0]?.toUpperCase() || 'U';
    };

    // Format creation date
    const getCreationDate = () => {
        if (currentUser?.metadata?.creationTime) {
            return new Date(currentUser.metadata.creationTime).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
        return 'Unknown';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-warm-bg flex items-center justify-center">
                <div className="text-deep-brown text-xl">Loading profile...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-warm-bg p-4 md:p-8 pt-24 md:pt-32">
            {/* Notification */}
            {notification && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`fixed top-24 right-4 z-50 px-6 py-3 rounded-2xl shadow-lg ${notification.type === 'success'
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                        }`}
                >
                    {notification.message}
                </motion.div>
            )}

            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 text-deep-brown hover:text-uprock-orange transition-colors mb-4"
                    >
                        <ArrowLeft size={20} />
                        <span>Back</span>
                    </button>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold text-deep-brown mb-2">Profile</h1>
                            <p className="text-deep-brown/70">Manage your account settings</p>
                        </div>
                        {!isEditing && (
                            <button
                                onClick={handleEdit}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-uprock-orange to-uprock-yellow text-white rounded-2xl font-bold hover:shadow-lg transition-all"
                            >
                                <Edit2 size={20} />
                                Edit Profile
                            </button>
                        )}
                    </div>
                </div>

                {/* Profile Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-panel p-8 mb-6"
                >
                    {/* Avatar and Name */}
                    <div className="flex items-center gap-6 mb-8">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-uprock-orange to-uprock-yellow flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                            {getInitials()}
                        </div>
                        <div className="flex-1">
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editData.fullName}
                                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                                    placeholder="Enter your full name"
                                    className="text-2xl font-bold text-deep-brown mb-1 w-full bg-white/50 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-uprock-orange"
                                />
                            ) : (
                                <h2 className="text-2xl font-bold text-deep-brown mb-1">
                                    {profileData.fullName || currentUser?.displayName || 'User'}
                                </h2>
                            )}
                            <p className="text-deep-brown/60">Member</p>
                        </div>
                    </div>

                    {/* User Information */}
                    <div className="space-y-4">
                        {/* Email (Read-only) */}
                        <div className="flex items-center gap-4 p-4 bg-white/50 rounded-2xl">
                            <Mail className="text-uprock-orange flex-shrink-0" size={24} />
                            <div className="flex-1">
                                <p className="text-sm text-deep-brown/60">Email</p>
                                <p className="font-semibold text-deep-brown">{currentUser?.email}</p>
                            </div>
                        </div>

                        {/* Age */}
                        <div className="flex items-center gap-4 p-4 bg-white/50 rounded-2xl">
                            <User className="text-uprock-orange flex-shrink-0" size={24} />
                            <div className="flex-1">
                                <p className="text-sm text-deep-brown/60">Age</p>
                                {isEditing ? (
                                    <input
                                        type="number"
                                        value={editData.age}
                                        onChange={(e) => handleInputChange('age', e.target.value)}
                                        placeholder="Enter your age"
                                        className="font-semibold text-deep-brown w-full bg-white/70 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-uprock-orange"
                                        min="0"
                                        max="150"
                                    />
                                ) : (
                                    <p className="font-semibold text-deep-brown">
                                        {profileData.age || 'Not set'}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="flex items-center gap-4 p-4 bg-white/50 rounded-2xl">
                            <Phone className="text-uprock-orange flex-shrink-0" size={24} />
                            <div className="flex-1">
                                <p className="text-sm text-deep-brown/60">Phone Number</p>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        value={editData.phone}
                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                        placeholder="Enter your phone number"
                                        className="font-semibold text-deep-brown w-full bg-white/70 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-uprock-orange"
                                    />
                                ) : (
                                    <p className="font-semibold text-deep-brown">
                                        {profileData.phone || 'Not set'}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Location */}
                        <div className="flex items-center gap-4 p-4 bg-white/50 rounded-2xl">
                            <MapPin className="text-uprock-orange flex-shrink-0" size={24} />
                            <div className="flex-1">
                                <p className="text-sm text-deep-brown/60">Location</p>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editData.location}
                                        onChange={(e) => handleInputChange('location', e.target.value)}
                                        placeholder="Enter your location"
                                        className="font-semibold text-deep-brown w-full bg-white/70 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-uprock-orange"
                                    />
                                ) : (
                                    <p className="font-semibold text-deep-brown">
                                        {profileData.location || 'Not set'}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Bio */}
                        <div className="flex items-start gap-4 p-4 bg-white/50 rounded-2xl">
                            <FileText className="text-uprock-orange flex-shrink-0 mt-1" size={24} />
                            <div className="flex-1">
                                <p className="text-sm text-deep-brown/60 mb-2">Bio</p>
                                {isEditing ? (
                                    <textarea
                                        value={editData.bio}
                                        onChange={(e) => handleInputChange('bio', e.target.value)}
                                        placeholder="Tell us about yourself..."
                                        rows="4"
                                        className="font-semibold text-deep-brown w-full bg-white/70 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-uprock-orange resize-none"
                                    />
                                ) : (
                                    <p className="font-semibold text-deep-brown whitespace-pre-wrap">
                                        {profileData.bio || 'No bio added yet'}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Member Since */}
                        <div className="flex items-center gap-4 p-4 bg-white/50 rounded-2xl">
                            <Calendar className="text-uprock-orange flex-shrink-0" size={24} />
                            <div>
                                <p className="text-sm text-deep-brown/60">Member Since</p>
                                <p className="font-semibold text-deep-brown">{getCreationDate()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Edit Mode Actions */}
                    {isEditing && (
                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
                            >
                                <Save size={20} />
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={saving}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-400 text-white rounded-2xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
                            >
                                <X size={20} />
                                Cancel
                            </button>
                        </div>
                    )}
                </motion.div>

                {/* Sign Out Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-panel p-8"
                >
                    <h3 className="text-xl font-bold text-deep-brown mb-4">Account Actions</h3>
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 w-full md:w-auto px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl font-bold hover:shadow-lg transition-all"
                    >
                        <LogOut size={20} />
                        Sign Out
                    </button>
                    <p className="text-sm text-deep-brown/60 mt-4">
                        You'll be signed out of your account and redirected to the home page.
                    </p>
                </motion.div>

                {/* Footer Note */}
                <div className="mt-8 text-center">
                    <p className="text-deep-brown/60 text-sm">
                        Need help? Visit our <a href="/help" className="text-uprock-orange hover:underline">Help Center</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
