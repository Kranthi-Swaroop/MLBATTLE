'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import api, { UserProfile } from '@/lib/api';
import styles from '../profile.module.css';

const Galaxy = dynamic(() => import('@/components/Galaxy'), { ssr: false });

export default function PublicProfilePage() {
    const params = useParams();
    const userId = params.id as string;
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (userId) {
            fetchProfile();
        }
    }, [userId]);

    const fetchProfile = async () => {
        setLoading(true);
        setError('');
        const response = await api.getPublicProfile(userId);

        if (response.success && response.data) {
            setProfile(response.data);
        } else {
            setError(response.message || 'User not found');
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <div className={styles.profilePage}>
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
                <div className={styles.loadingState}>
                    <div className={styles.spinner}></div>
                    <p>Loading profile...</p>
                </div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className={styles.profilePage}>
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
                    <div className={styles.errorState}>
                        <span className={styles.errorIcon}>👤</span>
                        <h2>User Not Found</h2>
                        <p>{error || 'This user profile does not exist.'}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.profilePage}>
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
                    <div className={styles.headerLeft}>
                        <div className={styles.avatar}>
                            {profile.name.charAt(0).toUpperCase()}
                        </div>
                        <div className={styles.headerInfo}>
                            <h1>{profile.name}</h1>
                            <p className={styles.joinDate}>
                                Member since {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                    </div>
                    <div className={styles.eloDisplay}>
                        <div className={styles.eloIcon}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                                <path d="M4 22h16"></path>
                                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
                            </svg>
                        </div>
                        <div className={styles.eloValue}>{profile.elo}</div>
                        <div className={styles.eloLabel}>ELO Rating</div>
                    </div>
                </div>

                {/* Profile Details */}
                <div className={styles.detailsSection}>
                    <div className={styles.sectionHeader}>
                        <h2>Profile Details</h2>
                    </div>

                    <div className={styles.detailsGrid}>
                        <div className={styles.detailItem}>
                            <div className={styles.detailLabel}>
                                <span className={styles.detailIcon}>👤</span>
                                <label>Display Name</label>
                            </div>
                            <p>{profile.name}</p>
                        </div>
                        <div className={`${styles.detailItem} ${styles.detailItemFull}`}>
                            <div className={styles.detailLabel}>
                                <span className={styles.detailIcon}>📝</span>
                                <label>Bio</label>
                            </div>
                            <p className={!profile.bio ? styles.placeholder : ''}>
                                {profile.bio || 'No bio added yet.'}
                            </p>
                        </div>
                        <div className={styles.detailItem}>
                            <div className={styles.detailLabel}>
                                <span className={styles.detailIcon}>💻</span>
                                <label>GitHub</label>
                            </div>
                            {profile.github ? (
                                <a
                                    href={`https://github.com/${profile.github}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.socialLink}
                                >
                                    <span className={styles.socialIcon}>
                                        <svg viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                        </svg>
                                    </span>
                                    {profile.github}
                                    <span className={styles.externalIcon}>↗</span>
                                </a>
                            ) : (
                                <p className={styles.placeholder}>Not connected</p>
                            )}
                        </div>
                        <div className={styles.detailItem}>
                            <div className={styles.detailLabel}>
                                <span className={styles.detailIcon}>💼</span>
                                <label>LinkedIn</label>
                            </div>
                            {profile.linkedin ? (
                                <a
                                    href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://${profile.linkedin}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.socialLink}
                                >
                                    <span className={styles.socialIcon}>
                                        <svg viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                        </svg>
                                    </span>
                                    View Profile
                                    <span className={styles.externalIcon}>↗</span>
                                </a>
                            ) : (
                                <p className={styles.placeholder}>Not connected</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
