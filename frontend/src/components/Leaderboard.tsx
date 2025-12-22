'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Leaderboard.module.css';
import Prism from './Prism/Prism';
import api, { UserProfile } from '@/lib/api';

export default function Leaderboard() {
    const [competitors, setCompetitors] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRankings = async () => {
            setLoading(true);
            const response = await api.getLeaderboard();
            if (response.success && response.data) {
                setCompetitors(response.data);
            }
            setLoading(false);
        };

        fetchRankings();
    }, []);

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <section className={styles.leaderboard}>
            {/* Background Effect */}
            <div className={styles.backgroundEffect}>
                <Prism
                    animationType="rotate"
                    timeScale={0.5}
                    height={4.5}
                    baseWidth={4}
                    scale={3}
                    hueShift={0}
                    colorFrequency={1}
                    noise={0}
                    glow={1}
                />
            </div>

            {/* Content */}
            <div className={styles.content}>
                {/* Page Header */}
                <header className={styles.pageHeader}>
                    <h1 className={styles.pageTitle}>Global Leaderboard</h1>
                    <p className={styles.pageSubtitle}>
                        Top performers ranked by ELO rating. Compete to climb the ranks!
                    </p>
                </header>

                {/* Leaderboard Card */}
                <div className={styles.leaderboardCard}>
                    <div className={styles.cardHeader}>
                        <div className={styles.cardTitle}>
                            <h2>Top Competitors</h2>
                            <span className={styles.liveIndicator}>
                                <span className={styles.dot}></span>
                                Live
                            </span>
                        </div>
                        <Link href="/leaderboard" className={styles.viewAllBtn}>
                            View All Rankings
                        </Link>
                    </div>

                    {loading ? (
                        <div className={styles.loadingContainer}>
                            <div className={styles.loadingSpinner}></div>
                            <p>Fetching rankings...</p>
                        </div>
                    ) : competitors.length === 0 ? (
                        <div className={styles.noResults}>
                            <p>No rankings available yet. Join an event and start competing!</p>
                        </div>
                    ) : (
                        <div className={styles.tableWrapper}>
                            <table className={styles.leaderboardTable}>
                                <thead>
                                    <tr>
                                        <th>Rank</th>
                                        <th>Competitor</th>
                                        <th>ELO Rating</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {competitors.map((user, index) => {
                                        const rank = index + 1;
                                        return (
                                            <tr key={user._id} className={rank <= 3 ? styles[`topRow${rank}`] : ''}>
                                                <td>
                                                    <div className={`${styles.rankBadge} ${rank <= 3 ? styles[`rank${rank}`] : ''}`}>
                                                        {rank === 1 && <span className={styles.medal}>🥇</span>}
                                                        {rank === 2 && <span className={styles.medal}>🥈</span>}
                                                        {rank === 3 && <span className={styles.medal}>🥉</span>}
                                                        {rank > 3 && rank}
                                                    </div>
                                                </td>
                                                <td>
                                                    <Link href={`/profile/${user._id}`} className={styles.userLink}>
                                                        <div className={styles.userInfo}>
                                                            <div className={`${styles.avatar} ${rank <= 3 ? styles[`avatar${rank}`] : ''}`}>
                                                                {getInitials(user.name)}
                                                            </div>
                                                            <span className={styles.userName}>
                                                                {rank === 1 && <span className={styles.crown}>👑 </span>}
                                                                {user.name}
                                                            </span>
                                                        </div>
                                                    </Link>
                                                </td>
                                                <td>
                                                    <span className={`${styles.eloRating} ${rank <= 3 ? styles[`elo${rank}`] : ''}`}>
                                                        {Math.round(user.elo)}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
