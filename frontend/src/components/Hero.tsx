'use client';

import styles from './Hero.module.css';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const Hyperspeed = dynamic(() => import('./Hyperspeed.jsx'), { ssr: false });

export default function Hero() {
    return (
        <section className={styles.hero}>
            <Hyperspeed />
            <div className={`container ${styles.heroContent}`}>
                <div className={styles.heroText}>
                    <div className={styles.heroBadge}>
                        <span className={styles.dot}></span>
                        <span>Live Competitions Running Now</span>
                    </div>

                    <h1>
                        Compete. Learn.<br />
                        <span className={styles.highlight}>Dominate ML.</span>
                    </h1>

                    <p className={styles.heroDescription}>
                        Join thousands of data scientists and ML engineers competing in real-world challenges.
                        Track your progress with our ELO rating system and climb the global leaderboard.
                    </p>

                    <div className={styles.heroButtons}>
                        <Link href="/signup" className="btn btn-primary btn-lg">Start Competing</Link>
                        <Link href="/events" className="btn btn-secondary btn-lg">View Events</Link>
                    </div>



                    <div className={styles.heroStats}>
                        <div className={styles.statItem}>
                            <div className={styles.statNumber}>15K+</div>
                            <div className={styles.statLabel}>Active Users</div>
                        </div>
                        <div className={styles.statItem}>
                            <div className={styles.statNumber}>250+</div>
                            <div className={styles.statLabel}>Competitions</div>
                        </div>
                        <div className={styles.statItem}>
                            <div className={styles.statNumber}>$1M+</div>
                            <div className={styles.statLabel}>Prizes Awarded</div>
                        </div>
                    </div>
                </div>

                <div className={styles.heroVisual}>
                    <div className={styles.heroCard}>
                        <div className={styles.heroCardHeader}>
                            <div className={styles.heroCardIcon}>🏆</div>
                            <div>
                                <div className={styles.heroCardTitle}>Live Rankings</div>
                                <div className={styles.heroCardSubtitle}>Image Classification Challenge</div>
                            </div>
                        </div>

                        <div className={styles.miniLeaderboard}>
                            <LeaderboardRow rank={1} initials="SN" name="Sarah_Neural" score="0.9847 accuracy" rating={2450} rankClass="gold" />
                            <LeaderboardRow rank={2} initials="DL" name="DeepLearner99" score="0.9821 accuracy" rating={2380} rankClass="silver" />
                            <LeaderboardRow rank={3} initials="TF" name="TensorFlow_Pro" score="0.9798 accuracy" rating={2315} rankClass="bronze" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

interface LeaderboardRowProps {
    rank: number;
    initials: string;
    name: string;
    score: string;
    rating: number;
    rankClass: string;
}

function LeaderboardRow({ rank, initials, name, score, rating, rankClass }: LeaderboardRowProps) {
    return (
        <div className={styles.leaderboardRow}>
            <div className={`${styles.rank} ${styles[rankClass]}`}>{rank}</div>
            <div className={styles.userAvatar}>{initials}</div>
            <div className={styles.userInfo}>
                <div className={styles.userName}>{name}</div>
                <div className={styles.userScore}>{score}</div>
            </div>
            <div className={styles.ratingBadge}>{rating}</div>
        </div>
    );
}
