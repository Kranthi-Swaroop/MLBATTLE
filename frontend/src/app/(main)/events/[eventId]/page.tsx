'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import styles from './eventDetail.module.css';

interface Competition {
    id: string;
    title: string;
    description: string;
    prize: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    participants: number;
    deadline: string;
    metric: string;
}

interface Event {
    id: string;
    title: string;
    description: string;
    longDescription: string;
    banner: string;
    status: 'live' | 'upcoming' | 'ended';
    startDate: string;
    endDate: string;
    totalPrize: string;
    participants: number;
    organizer: string;
    tags: string[];
    competitions: Competition[];
}

const eventsData: Record<string, Event> = {
    'ml-olympics-2024': {
        id: 'ml-olympics-2024',
        title: 'ML Olympics 2024',
        description: 'The ultimate machine learning championship',
        longDescription: 'Welcome to the ML Olympics 2024 - the premier machine learning competition event of the year! This multi-track championship brings together 5 diverse challenges spanning Computer Vision, NLP, and Tabular data. Whether you\'re a seasoned ML practitioner or looking to make your mark, this is your arena to compete, learn, and grow.',
        banner: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
        status: 'live',
        startDate: 'Dec 1, 2024',
        endDate: 'Jan 15, 2025',
        totalPrize: '$50,000',
        participants: 8420,
        organizer: 'MLBattle Team',
        tags: ['Featured', 'Multi-Track', 'Prizes'],
        competitions: [
            { id: 'medical-imaging', title: 'Medical Image Classification', description: 'Build a CNN model to classify X-ray images for disease detection. Help improve healthcare diagnostics with AI.', prize: '$15,000', difficulty: 'Advanced', participants: 2340, deadline: 'Jan 10, 2025', metric: 'AUC-ROC' },
            { id: 'sentiment-analysis', title: 'Sentiment Analysis Challenge', description: 'Develop a model to analyze customer reviews and predict sentiment scores with high accuracy.', prize: '$10,000', difficulty: 'Intermediate', participants: 1890, deadline: 'Jan 8, 2025', metric: 'F1 Score' },
            { id: 'object-detection', title: 'Real-time Object Detection', description: 'Create a fast and accurate object detection model for autonomous vehicle applications.', prize: '$12,000', difficulty: 'Advanced', participants: 1560, deadline: 'Jan 12, 2025', metric: 'mAP@0.5' },
            { id: 'text-summarization', title: 'Document Summarization', description: 'Build a transformer-based model to generate concise summaries of long documents.', prize: '$8,000', difficulty: 'Intermediate', participants: 1230, deadline: 'Jan 5, 2025', metric: 'ROUGE-L' },
            { id: 'tabular-prediction', title: 'Time Series Forecasting', description: 'Predict future sales using historical data and advanced time series techniques.', prize: '$5,000', difficulty: 'Beginner', participants: 1400, deadline: 'Jan 15, 2025', metric: 'RMSE' }
        ]
    },
    'nlp-masters': {
        id: 'nlp-masters',
        title: 'NLP Masters Championship',
        description: 'A specialized event for NLP enthusiasts',
        longDescription: 'Dive deep into the world of Natural Language Processing with our NLP Masters Championship. This focused event brings together three challenging competitions designed to test your skills in understanding, processing, and generating human language using machine learning.',
        banner: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
        status: 'live',
        startDate: 'Dec 10, 2024',
        endDate: 'Jan 10, 2025',
        totalPrize: '$25,000',
        participants: 3250,
        organizer: 'NLP Research Lab',
        tags: ['NLP', 'Transformers', 'BERT'],
        competitions: [
            { id: 'qa-system', title: 'Question Answering System', description: 'Build an AI that can accurately answer questions based on given context passages.', prize: '$10,000', difficulty: 'Advanced', participants: 1200, deadline: 'Jan 5, 2025', metric: 'Exact Match' },
            { id: 'ner-challenge', title: 'Named Entity Recognition', description: 'Extract and classify named entities from text with high precision.', prize: '$8,000', difficulty: 'Intermediate', participants: 1100, deadline: 'Jan 7, 2025', metric: 'F1 Score' },
            { id: 'text-classification', title: 'Multi-label Classification', description: 'Classify documents into multiple categories simultaneously.', prize: '$7,000', difficulty: 'Beginner', participants: 950, deadline: 'Jan 10, 2025', metric: 'Micro F1' }
        ]
    },
    'vision-quest': {
        id: 'vision-quest',
        title: 'Vision Quest 2024',
        description: 'Computer Vision challenges for all skill levels',
        longDescription: 'Embark on Vision Quest 2024 - a comprehensive Computer Vision event featuring four distinct challenges. From image classification to semantic segmentation, test your skills across the full spectrum of CV tasks.',
        banner: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
        status: 'upcoming',
        startDate: 'Jan 1, 2025',
        endDate: 'Feb 15, 2025',
        totalPrize: '$35,000',
        participants: 0,
        organizer: 'CV Institute',
        tags: ['Computer Vision', 'Deep Learning', 'CNN'],
        competitions: [
            { id: 'image-segmentation', title: 'Semantic Segmentation', description: 'Perform pixel-level classification on complex urban scenes.', prize: '$12,000', difficulty: 'Advanced', participants: 0, deadline: 'Feb 10, 2025', metric: 'mIoU' },
            { id: 'face-recognition', title: 'Face Recognition Challenge', description: 'Build a robust face recognition system that handles various conditions.', prize: '$10,000', difficulty: 'Advanced', participants: 0, deadline: 'Feb 8, 2025', metric: 'Accuracy' },
            { id: 'image-classification', title: 'Multi-class Classification', description: 'Classify images into 100+ categories with high accuracy.', prize: '$8,000', difficulty: 'Intermediate', participants: 0, deadline: 'Feb 12, 2025', metric: 'Top-5 Accuracy' },
            { id: 'object-counting', title: 'Object Counting', description: 'Count objects in crowded scenes accurately.', prize: '$5,000', difficulty: 'Beginner', participants: 0, deadline: 'Feb 15, 2025', metric: 'MAE' }
        ]
    },
    'beginner-bootcamp': {
        id: 'beginner-bootcamp',
        title: 'ML Beginner Bootcamp',
        description: 'Perfect starting point for ML newcomers',
        longDescription: 'New to Machine Learning? The ML Beginner Bootcamp is designed just for you! With guided tutorials, a supportive community, and beginner-friendly competitions, this is the perfect place to start your ML journey.',
        banner: 'linear-gradient(135deg, #10B981 0%, #14B8A6 100%)',
        status: 'live',
        startDate: 'Nov 15, 2024',
        endDate: 'Dec 31, 2024',
        totalPrize: '$5,000',
        participants: 12500,
        organizer: 'MLBattle Education',
        tags: ['Beginner', 'Tutorial', 'Learn'],
        competitions: [
            { id: 'titanic', title: 'Titanic Survival Prediction', description: 'The classic beginner competition. Predict passenger survival on the Titanic.', prize: '$1,500', difficulty: 'Beginner', participants: 5200, deadline: 'Dec 25, 2024', metric: 'Accuracy' },
            { id: 'housing', title: 'Housing Price Prediction', description: 'Predict house prices using regression techniques.', prize: '$2,000', difficulty: 'Beginner', participants: 4100, deadline: 'Dec 28, 2024', metric: 'RMSE' },
            { id: 'digit-recognition', title: 'Digit Recognition', description: 'Classify handwritten digits using neural networks.', prize: '$1,500', difficulty: 'Beginner', participants: 3200, deadline: 'Dec 31, 2024', metric: 'Accuracy' }
        ]
    },
    'kaggle-sprint': {
        id: 'kaggle-sprint',
        title: 'Kaggle Sprint Series',
        description: 'Fast-paced weekly competitions',
        longDescription: 'The Kaggle Sprint Series was a fast-paced event featuring weekly competitions with quick turnarounds. Perfect for those who love rapid iteration and quick prototyping.',
        banner: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
        status: 'ended',
        startDate: 'Oct 1, 2024',
        endDate: 'Nov 30, 2024',
        totalPrize: '$15,000',
        participants: 6780,
        organizer: 'MLBattle Team',
        tags: ['Sprint', 'Weekly', 'Fast'],
        competitions: [
            { id: 'fraud-detection', title: 'Fraud Detection Sprint', description: 'Detect fraudulent transactions in imbalanced dataset.', prize: '$5,000', difficulty: 'Intermediate', participants: 2340, deadline: 'Ended', metric: 'AUC-PR' },
            { id: 'churn-prediction', title: 'Customer Churn Prediction', description: 'Predict which customers will leave the service.', prize: '$5,000', difficulty: 'Intermediate', participants: 2280, deadline: 'Ended', metric: 'F1 Score' },
            { id: 'recommendation', title: 'Movie Recommendations', description: 'Build a collaborative filtering recommendation system.', prize: '$5,000', difficulty: 'Intermediate', participants: 2160, deadline: 'Ended', metric: 'NDCG' }
        ]
    }
};

export default function EventDetailPage() {
    const params = useParams();
    const eventId = params.eventId as string;
    const event = eventsData[eventId];

    if (!event) {
        return (
            <div className={styles.notFound}>
                <h1>Event Not Found</h1>
                <p>The event you're looking for doesn't exist.</p>
                <Link href="/events" className="btn btn-primary">Back to Events</Link>
            </div>
        );
    }

    const getStatusLabel = () => {
        switch (event.status) {
            case 'live': return '🔴 Live Now';
            case 'upcoming': return '📅 Coming Soon';
            case 'ended': return '✓ Ended';
            default: return '';
        }
    };

    return (
        <div className={styles.eventPage}>
            <div className={styles.heroBanner} style={{ background: event.banner }}>
                <div className={styles.heroOverlay}>
                    <div className="container">
                        <Link href="/events" className={styles.backLink}>← Back to Events</Link>
                        <div className={styles.heroContent}>
                            <div className={styles.heroTags}>
                                <span className={styles.statusBadge}>{getStatusLabel()}</span>
                                {event.tags.map(tag => (
                                    <span key={tag} className={styles.tag}>{tag}</span>
                                ))}
                            </div>
                            <h1>{event.title}</h1>
                            <p className={styles.heroDescription}>{event.longDescription}</p>
                            <div className={styles.heroMeta}>
                                <div className={styles.metaItem}>
                                    <span className={styles.metaValue}>{event.totalPrize}</span>
                                    <span className={styles.metaLabel}>Total Prize</span>
                                </div>
                                <div className={styles.metaItem}>
                                    <span className={styles.metaValue}>{event.participants.toLocaleString()}</span>
                                    <span className={styles.metaLabel}>Participants</span>
                                </div>
                                <div className={styles.metaItem}>
                                    <span className={styles.metaValue}>{event.competitions.length}</span>
                                    <span className={styles.metaLabel}>Competitions</span>
                                </div>
                                <div className={styles.metaItem}>
                                    <span className={styles.metaValue}>{event.endDate}</span>
                                    <span className={styles.metaLabel}>Ends</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.navTabs}>
                <div className="container">
                    <div className={styles.tabsContainer}>
                        <button className={`${styles.tab} ${styles.active}`}>
                            🏆 Competitions
                        </button>
                        <Link href={`/events/${eventId}/discussions`} className={styles.tab}>
                            💬 Discussions
                        </Link>
                        <button className={styles.tab}>
                            📊 Leaderboard
                        </button>
                        <button className={styles.tab}>
                            📖 Rules
                        </button>
                        <button className={styles.tab}>
                            💾 Data
                        </button>
                    </div>
                </div>
            </div>

            <div className="container">
                <div className={styles.competitionsSection}>
                    <h2>Competitions in this Event</h2>
                    <p className={styles.sectionDesc}>Complete all competitions to maximize your points and climb the leaderboard</p>

                    <div className={styles.competitionsGrid}>
                        {event.competitions.map((comp) => (
                            <CompetitionCard key={comp.id} competition={comp} eventStatus={event.status} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function CompetitionCard({ competition, eventStatus }: { competition: Competition, eventStatus: string }) {
    return (
        <div className={styles.compCard}>
            <div className={styles.compHeader}>
                <h3>{competition.title}</h3>
                <span className={`${styles.difficulty} ${styles[competition.difficulty.toLowerCase()]}`}>
                    {competition.difficulty}
                </span>
            </div>
            <p className={styles.compDescription}>{competition.description}</p>

            <div className={styles.compStats}>
                <div className={styles.stat}>
                    <span className={styles.statValue}>{competition.prize}</span>
                    <span className={styles.statLabel}>Prize</span>
                </div>
                <div className={styles.stat}>
                    <span className={styles.statValue}>{competition.participants.toLocaleString()}</span>
                    <span className={styles.statLabel}>Teams</span>
                </div>
                <div className={styles.stat}>
                    <span className={styles.statValue}>{competition.metric}</span>
                    <span className={styles.statLabel}>Metric</span>
                </div>
            </div>

            <div className={styles.compFooter}>
                <span className={styles.deadline}>
                    {eventStatus === 'ended' ? '✓ Competition Ended' : `⏰ Deadline: ${competition.deadline}`}
                </span>
                <button
                    className={`btn ${eventStatus === 'ended' ? 'btn-secondary' : 'btn-primary'}`}
                    disabled={eventStatus === 'ended'}
                >
                    {eventStatus === 'ended' ? 'View Results' : eventStatus === 'upcoming' ? 'Notify Me' : 'Join Competition'}
                </button>
            </div>
        </div>
    );
}
