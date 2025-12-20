import styles from './Stats.module.css';

const stats = [
    { icon: '👥', number: '15,247', label: 'Active Users' },
    { icon: '🏆', number: '256', label: 'Competitions Hosted' },
    { icon: '📊', number: '1.2M+', label: 'Submissions Made' },
    { icon: '💰', number: '$1.5M', label: 'Prizes Awarded' },
];

export default function Stats() {
    return (
        <section className={`section ${styles.stats}`} id="stats">
            <div className="container">
                <div className="section-header">
                    <span className="section-label">Platform Statistics</span>
                    <h2 className="section-title">MLBattle by the Numbers</h2>
                    <p className="section-description">
                        Join a thriving community of ML enthusiasts and data scientists.
                    </p>
                </div>

                <div className={styles.statsGrid}>
                    {stats.map((stat, index) => (
                        <div key={index} className={styles.statCard}>
                            <div className={styles.statIcon}>{stat.icon}</div>
                            <div className={styles.statNumber}>{stat.number}</div>
                            <div className={styles.statLabel}>{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
