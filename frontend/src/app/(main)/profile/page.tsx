'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import api, { UserProfile } from '@/lib/api';
import styles from './profile.module.css';

const Galaxy = dynamic(() => import('@/components/Galaxy'), { ssr: false });

export default function ProfilePage() {
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        github: '',
        linkedin: ''
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
            const profileData = response.data;
            setProfile(profileData);
            setFormData({
                name: profileData.name || '',
                bio: profileData.bio || '',
                github: profileData.github || '',
                linkedin: profileData.linkedin || ''
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
            setProfile(response.data);
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
                linkedin: profile.linkedin || ''
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
            <div className={styles.galaxyBackground}>
                <Galaxy
                    mouseRepulsion={true}
                    mouseInteraction={true}
                    density={0.8}
                    glowIntensity={0.5}
                    saturation={1}
                    hueShift={140}
                />
            </div>
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
                        <div className={styles.statIcon}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                                <path d="M4 22h16"></path>
                                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
                            </svg>
                        </div>
                        <div className={styles.statValue}>{profile.elo}</div>
                        <div className={styles.statLabel}>ELO Rating</div>
                    </div>
                    <div className={`${styles.statCard} ${styles.statCardRed}`}>
                        <div className={styles.statIcon}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                                <path d="M8 14h.01"></path>
                                <path d="M12 14h.01"></path>
                                <path d="M16 14h.01"></path>
                                <path d="M8 18h.01"></path>
                                <path d="M12 18h.01"></path>
                                <path d="M16 18h.01"></path>
                            </svg>
                        </div>
                        <div className={styles.statValue}>{profile.eventsAttended}</div>
                        <div className={styles.statLabel}>Events Attended</div>
                    </div>
                    <div className={`${styles.statCard} ${styles.statCardGreen}`}>
                        <div className={styles.statIcon}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                                <circle cx="12" cy="12" r="10"></circle>
                            </svg>
                        </div>
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
                                <label>Name (Kaggle Display Name)</label>
                                <p>{profile.name}</p>
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
                                <label htmlFor="name">Name (Kaggle Display Name)</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                                <small style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '4px' }}>
                                    Use the exact name shown on Kaggle leaderboards for ELO matching
                                </small>
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
