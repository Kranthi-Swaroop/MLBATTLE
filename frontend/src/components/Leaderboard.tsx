'use client';

import { useState, useEffect } from 'react';
import styles from './Leaderboard.module.css';

interface Competitor {
    rank: number;
    initials: string;
    name: string;
    handle: string;
    rating: number;
    wins: number;
    change: 'up' | 'down' | 'neutral';
    changeAmount: number;
}

const initialCompetitors: Competitor[] = [
    { rank: 1, initials: 'SN', name: 'Sarah_Neural', handle: '@sarah_ml', rating: 2450, wins: 47, change: 'up', changeAmount: 3 },
    { rank: 2, initials: 'DL', name: 'DeepLearner99', handle: '@deep_learn', rating: 2380, wins: 42, change: 'up', changeAmount: 1 },
    { rank: 3, initials: 'TF', name: 'TensorFlow_Pro', handle: '@tf_master', rating: 2315, wins: 39, change: 'down', changeAmount: 2 },
    { rank: 4, initials: 'KM', name: 'KaggleMaster', handle: '@kaggle_king', rating: 2290, wins: 35, change: 'neutral', changeAmount: 0 },
    { rank: 5, initials: 'PT', name: 'PyTorch_Wizard', handle: '@torch_wiz', rating: 2245, wins: 31, change: 'up', changeAmount: 5 },
];

export default function Leaderboard() {
    const [competitors, setCompetitors] = useState(initialCompetitors);

    useEffect(() => {
        const interval = setInterval(() => {
            setCompetitors(prev => prev.map(comp => ({
                ...comp,
                rating: comp.rating + Math.floor(Math.random() * 10) - 5,
                change: ['up', 'down', 'neutral'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'neutral',
                changeAmount: Math.floor(Math.random() * 5) + 1
            })));
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    return (
        <section className={`section ${styles.leaderboard}`} id="leaderboard">
            <div className="container">
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
                            {competitors.map((comp) => (
                                <tr key={comp.rank}>
                                    <td>
                                        <div className={`${styles.tableRank} ${comp.rank <= 3 ? styles[`top${comp.rank}`] : ''}`}>
                                            {comp.rank}
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.tableUser}>
                                            <div className={styles.tableUserAvatar}>{comp.initials}</div>
                                            <div>
                                                <div className={styles.tableUserName}>{comp.name}</div>
                                                <div className={styles.tableUserHandle}>{comp.handle}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td><span className={styles.rating}>{comp.rating}</span></td>
                                    <td className={styles.score}>{comp.wins} wins</td>
                                    <td>
                                        <span className={`${styles.change} ${styles[comp.change]}`}>
                                            {comp.change === 'up' && `↑ ${comp.changeAmount}`}
                                            {comp.change === 'down' && `↓ ${comp.changeAmount}`}
                                            {comp.change === 'neutral' && '—'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}
