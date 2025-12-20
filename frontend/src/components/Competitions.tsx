import styles from './Competitions.module.css';

interface Competition {
    type: string;
    title: string;
    description: string;
    prize: string;
    teams: string;
    remaining: string;
    gradient: string;
    status: 'active' | 'ending-soon';
}

const competitions: Competition[] = [
    {
        type: 'Computer Vision',
        title: 'Medical Image Classification',
        description: 'Build a CNN model to classify X-ray images for disease detection. Help improve healthcare diagnostics.',
        prize: '$10,000',
        teams: '1,247',
        remaining: '14 days',
        gradient: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
        status: 'active'
    },
    {
        type: 'NLP',
        title: 'Sentiment Analysis Challenge',
        description: 'Develop a model to analyze customer reviews and predict sentiment scores with high accuracy.',
        prize: '$5,000',
        teams: '892',
        remaining: '3 days',
        gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        status: 'ending-soon'
    },
    {
        type: 'Tabular',
        title: 'Housing Price Prediction',
        description: 'Predict housing prices using advanced regression techniques. Perfect for beginners and experts alike.',
        prize: '$2,500',
        teams: '2,103',
        remaining: '21 days',
        gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
        status: 'active'
    }
];

export default function Competitions() {
    return (
        <section className={`section ${styles.competitions}`} id="competitions">
            <div className="container">
                <div className="section-header">
                    <span className="section-label">Active Challenges</span>
                    <h2 className="section-title">Featured Competitions</h2>
                    <p className="section-description">
                        Join exciting ML challenges powered by Kaggle API integration. Win prizes and boost your rating.
                    </p>
                </div>

                <div className={styles.competitionsGrid}>
                    {competitions.map((comp, index) => (
                        <CompetitionCard key={index} competition={comp} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function CompetitionCard({ competition }: { competition: Competition }) {
    return (
        <div className={styles.competitionCard}>
            <div className={styles.cardBanner} style={{ background: competition.gradient }}>
                <span className={styles.cardType}>{competition.type}</span>
                <span className={`${styles.cardStatus} ${competition.status === 'ending-soon' ? styles.endingSoon : ''}`}>
                    <span className={styles.statusDot}></span>
                    {competition.status === 'ending-soon' ? 'Ending Soon' : 'Active'}
                </span>
            </div>
            <div className={styles.cardBody}>
                <h3 className={styles.cardTitle}>{competition.title}</h3>
                <p className={styles.cardDescription}>{competition.description}</p>
                <div className={styles.cardMeta}>
                    <div className={styles.metaItem}>
                        <div className={styles.metaValue}>{competition.prize}</div>
                        <div className={styles.metaLabel}>Prize Pool</div>
                    </div>
                    <div className={styles.metaItem}>
                        <div className={styles.metaValue}>{competition.teams}</div>
                        <div className={styles.metaLabel}>Teams</div>
                    </div>
                    <div className={styles.metaItem}>
                        <div className={styles.metaValue}>{competition.remaining}</div>
                        <div className={styles.metaLabel}>Remaining</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
