import styles from './Features.module.css';

const features = [
    {
        icon: '🔗',
        title: 'Kaggle Integration',
        description: 'Seamlessly connect with Kaggle API to access competitions, datasets, and submit your solutions directly from our platform.'
    },
    {
        icon: '📈',
        title: 'ELO Rating System',
        description: 'Track your progress with our dynamic ELO-based rating system. See how you stack up against competitors worldwide.'
    },
    {
        icon: '⚡',
        title: 'Real-time Leaderboards',
        description: 'Watch the rankings update live as submissions pour in. Experience the thrill of competitive machine learning.'
    }
];

export default function Features() {
    return (
        <section className={`section ${styles.features}`} id="features">
            <div className="container">
                <div className="section-header">
                    <span className="section-label">Why MLBattle?</span>
                    <h2 className="section-title">Powerful Features for ML Champions</h2>
                    <p className="section-description">
                        Everything you need to compete, learn, and grow as a machine learning practitioner.
                    </p>
                </div>

                <div className={styles.featuresGrid}>
                    {features.map((feature, index) => (
                        <div key={index} className={styles.featureCard}>
                            <div className={styles.featureIcon}>{feature.icon}</div>
                            <h3 className={styles.featureTitle}>{feature.title}</h3>
                            <p className={styles.featureDescription}>{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
