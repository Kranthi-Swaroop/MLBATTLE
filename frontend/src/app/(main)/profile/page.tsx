'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import styles from './profile.module.css';

interface UserProfile {
    _id: string;
    name: string;
    email: string;
    kaggleUsername: string;
    elo: number;
    eventsAttended: number;
    problemsSolved: number;
    bio?: string;
    github?: string;
    linkedin?: string;
    createdAt: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        github: '',
        linkedin: '',
        kaggleUsername: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        const response = await api.getUserProfile();
        
        if (response.success && response.data) {
            const profileData = response.data as UserProfile;
            setProfile(profileData);
            setFormData({
                name: profileData.name || '',
                bio: profileData.bio || '',
                github: profileData.github || '',
                linkedin: profileData.linkedin || '',
                kaggleUsername: profileData.kaggleUsername || ''
            });
        } else {
            // Not logged in, redirect to login
            router.push('/login');
        }
        setLoading(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const response = await api.updateProfile(formData);

        if (response.success && response.data) {
            setSuccess('Profile updated successfully!');
            setProfile(response.data as UserProfile);
            setEditing(false);
            setTimeout(() => setSuccess(''), 3000);
        } else {
            setError(response.message || 'Failed to update profile');
        }
    };

    const handleCancel = () => {
        if (profile) {
            setFormData({
                name: profile.name || '',
                bio: profile.bio || '',
                github: profile.github || '',
                linkedin: profile.linkedin || '',
                kaggleUsername: profile.kaggleUsername || ''
            });
        }
        setEditing(false);
        setError('');
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Loading profile...</div>
            </div>
        );
    }

    if (!profile) {
        return null;
    }

    return (
        <div className={styles.container}>
            <div className={styles.profileWrapper}>
                {/* Profile Header */}
                <div className={styles.profileHeader}>
                    <div className={styles.avatar}>
                        {profile.name.charAt(0).toUpperCase()}
                    </div>
                    <div className={styles.headerInfo}>
                        <h1>{profile.name}</h1>
                        <p className={styles.email}>{profile.email}</p>
                        <p className={styles.joinDate}>
                            Member since {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className={styles.statsGrid}>
                    <div className={`${styles.statCard} ${styles.statCardPurple}`}>
                        <div className={styles.statIcon}>🏆</div>
                        <div className={styles.statValue}>{profile.elo}</div>
                        <div className={styles.statLabel}>ELO Rating</div>
                    </div>
                    <div className={`${styles.statCard} ${styles.statCardRed}`}>
                        <div className={styles.statIcon}>📅</div>
                        <div className={styles.statValue}>{profile.eventsAttended}</div>
                        <div className={styles.statLabel}>Events Attended</div>
                    </div>
                    <div className={`${styles.statCard} ${styles.statCardGreen}`}>
                        <div className={styles.statIcon}>✅</div>
                        <div className={styles.statValue}>{profile.problemsSolved}</div>
                        <div className={styles.statLabel}>Problems Solved</div>
                    </div>
                </div>

                {/* Messages */}
                {error && <div className={styles.error}>{error}</div>}
                {success && <div className={styles.success}>{success}</div>}

                {/* Profile Details */}
                {!editing ? (
                    <div className={styles.detailsSection}>
                        <div className={styles.sectionHeader}>
                            <h2>Profile Details</h2>
                            <button onClick={() => setEditing(true)} className={styles.editButton}>
                                Edit Profile
                            </button>
                        </div>

                        <div className={styles.detailsGrid}>
                            <div className={styles.detailItem}>
                                <label>Name</label>
                                <p>{profile.name}</p>
                            </div>
                            <div className={styles.detailItem}>
                                <label>Kaggle Username</label>
                                <p>{profile.kaggleUsername}</p>
                            </div>
                            <div className={styles.detailItem}>
                                <label>Bio</label>
                                <p>{profile.bio || 'No bio added yet'}</p>
                            </div>
                            <div className={styles.detailItem}>
                                <label>GitHub</label>
                                <p>{profile.github || 'Not provided'}</p>
                            </div>
                            <div className={styles.detailItem}>
                                <label>LinkedIn</label>
                                <p>{profile.linkedin || 'Not provided'}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className={styles.detailsSection}>
                        <div className={styles.sectionHeader}>
                            <h2>Edit Profile</h2>
                        </div>

                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label htmlFor="name">Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="kaggleUsername">Kaggle Username</label>
                                <input
                                    type="text"
                                    id="kaggleUsername"
                                    name="kaggleUsername"
                                    value={formData.kaggleUsername}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="bio">Bio</label>
                                <textarea
                                    id="bio"
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleInputChange}
                                    rows={4}
                                    maxLength={500}
                                    placeholder="Tell us about yourself..."
                                />
                                <span className={styles.charCount}>{formData.bio.length}/500</span>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="github">GitHub Username</label>
                                <input
                                    type="text"
                                    id="github"
                                    name="github"
                                    value={formData.github}
                                    onChange={handleInputChange}
                                    placeholder="yourusername"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="linkedin">LinkedIn Profile</label>
                                <input
                                    type="text"
                                    id="linkedin"
                                    name="linkedin"
                                    value={formData.linkedin}
                                    onChange={handleInputChange}
                                    placeholder="linkedin.com/in/yourprofile"
                                />
                            </div>
                        </div>

                        <div className={styles.formActions}>
                            <button type="button" onClick={handleCancel} className={styles.cancelButton}>
                                Cancel
                            </button>
                            <button type="submit" className={styles.saveButton}>
                                Save Changes
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
