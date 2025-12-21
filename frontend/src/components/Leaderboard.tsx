'use client';

import { useState, useEffect } from 'react';
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
        <section className={`section ${styles.leaderboard}`} id="leaderboard" style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
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
            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                <div className="section-header">
                    <span className="section-label">Rankings</span>
                    <h2 className="section-title">Global Leaderboard</h2>
                    <p className="section-description">
                        Top performers ranked by ELO rating. Compete to climb the ranks!
                    </p>
                </div>

                <div className={styles.leaderboardContainer}>
                    <div className={styles.leaderboardHeader}>
                        <div className={styles.leaderboardTitle}>
                            <h3>Top Competitors</h3>
                            <span className={styles.liveIndicator}>
                                <span className={styles.dot}></span>
                                Live
                            </span>
                        </div>
                        <button className="btn btn-secondary">View All Rankings</button>
                    </div>

                    {loading ? (
                        <div className={styles.loadingContainer}>
                            <p>Fetching rankings...</p>
                        </div>
                    ) : (
                        <table className={styles.leaderboardTable}>
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Competitor</th>
                                    <th>ELO Rating</th>
                                    <th>Competitions</th>
                                    <th>Change</th>
                                </tr>
                            </thead>
                            <tbody>
                                {competitors.map((user, index) => {
                                    const rank = index + 1;
                                    return (
                                        <tr key={user._id} className={rank <= 3 ? styles[`topRow${rank}`] : ''}>
                                            <td>
                                                <div className={`${styles.tableRank} ${rank <= 3 ? styles[`top${rank}`] : ''}`}>
                                                    {rank === 1 && <span className={styles.medal}>🥇</span>}
                                                    {rank === 2 && <span className={styles.medal}>🥈</span>}
                                                    {rank === 3 && <span className={styles.medal}>🥉</span>}
                                                    {rank > 3 && rank}
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.tableUser}>
                                                    <div className={`${styles.tableUserAvatar} ${rank <= 3 ? styles[`avatar${rank}`] : ''}`}>
                                                        {getInitials(user.name)}
                                                    </div>
                                                    <div>
                                                        <div className={styles.tableUserName}>
                                                            {rank === 1 && <span className={styles.crown}>👑 </span>}
                                                            {user.name}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td><span className={`${styles.rating} ${rank <= 3 ? styles[`rating${rank}`] : ''}`}>{Math.round(user.elo)}</span></td>
                                            <td className={styles.score}>{user.eventsAttended} competitions</td>
                                            <td>
                                                <span className={`${styles.change} ${styles.neutral}`}>
                                                    —
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}

                    {!loading && competitors.length === 0 && (
                        <div className={styles.noResults}>
                            <p>No rankings available yet. Join an event and start competing!</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
