'use client';

import styles from './Hero.module.css';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

const Hyperspeed = dynamic(() => import('./Hyperspeed.jsx'), { ssr: false });

export default function Hero() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        setIsLoggedIn(!!api.getToken());
    }, []);

    return (
        <section className={styles.hero}>
            <Hyperspeed />
            <div className={`container ${styles.heroContent}`}>
                <div className={styles.heroText}>

                    <h1>
                        Compete. Learn. <span className={styles.highlight}>Dominate ML.</span>
                    </h1>

                    <p className={styles.heroDescription}>
                        Join a platform of data scientists and ML engineers competing in real-world challenges.
                        Track your progress with our ELO rating system and climb the global leaderboard.
                    </p>

                    <div className={styles.heroButtons}>
                        {!isLoggedIn && (
                            <Link href="/signup" className="btn btn-primary btn-lg">Start Competing</Link>
                        )}
                        <Link href="/events" className="btn btn-secondary btn-lg">View Events</Link>
                    </div>

                    <div className={styles.heroFeatures}>
                        <div className={styles.featureItem}>
                            <div className={styles.featureIcon}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                    <path d="M2 17l10 5 10-5" />
                                    <path d="M2 12l10 5 10-5" />
                                </svg>
                            </div>
                            <div>
                                <div className={styles.featureTitle}>Real-World Datasets</div>
                                <div className={styles.featureDesc}>Tackle challenges with industry-grade datasets</div>
                            </div>
                        </div>

                        <div className={styles.featureItem}>
                            <div className={styles.featureIcon}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                            </div>
                            <div>
                                <div className={styles.featureTitle}>Competitive Community</div>
                                <div className={styles.featureDesc}>Learn from top ML practitioners worldwide</div>
                            </div>
                        </div>

                        <div className={styles.featureItem}>
                            <div className={styles.featureIcon}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                                    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                                    <path d="M4 22h16" />
                                    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                                    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                                    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                                </svg>
                            </div>
                            <div>
                                <div className={styles.featureTitle}>ELO Rating System</div>
                                <div className={styles.featureDesc}>Track your skill progression and global ranking</div>
                            </div>
                        </div>

                        <div className={styles.featureItem}>
                            <div className={styles.featureIcon}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                                </svg>
                            </div>
                            <div>
                                <div className={styles.featureTitle}>Live Leaderboards</div>
                                <div className={styles.featureDesc}>Real-time rankings and performance metrics</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
