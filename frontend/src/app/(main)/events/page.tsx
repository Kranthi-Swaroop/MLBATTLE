'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './events.module.css';
import Squares from '@/components/Squares';

interface Competition {
    id: string;
    title: string;
    prize: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

interface Event {
    id: string;
    title: string;
    description: string;
    banner: string;
    status: 'live' | 'upcoming' | 'ended';
    startDate: string;
    endDate: string;
    totalPrize: string;
    participants: number;
    competitions: Competition[];
    tags: string[];
}

const events: Event[] = [
    {
        id: 'ml-olympics-2024',
        title: 'ML Olympics 2024',
        description: 'The ultimate machine learning championship featuring 5 diverse challenges. Compete across Computer Vision, NLP, and more to prove your ML mastery.',
        banner: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
        status: 'live',
        startDate: 'Dec 1, 2024',
        endDate: 'Jan 15, 2025',
        totalPrize: '$50,000',
        participants: 8420,
        tags: ['Featured', 'Multi-Track'],
        competitions: [
            { id: 'medical-imaging', title: 'Medical Image Classification', prize: '$15,000', difficulty: 'Advanced' },
            { id: 'sentiment-analysis', title: 'Sentiment Analysis Challenge', prize: '$10,000', difficulty: 'Intermediate' },
            { id: 'object-detection', title: 'Real-time Object Detection', prize: '$12,000', difficulty: 'Advanced' },
            { id: 'text-summarization', title: 'Document Summarization', prize: '$8,000', difficulty: 'Intermediate' },
            { id: 'tabular-prediction', title: 'Time Series Forecasting', prize: '$5,000', difficulty: 'Beginner' }
        ]
    },
    {
        id: 'nlp-masters',
        title: 'NLP Masters Championship',
        description: 'A specialized event focused on Natural Language Processing. From sentiment analysis to machine translation, test your NLP skills.',
        banner: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
        status: 'live',
        startDate: 'Dec 10, 2024',
        endDate: 'Jan 10, 2025',
        totalPrize: '$25,000',
        participants: 3250,
        tags: ['NLP', 'Transformers'],
        competitions: [
            { id: 'qa-system', title: 'Question Answering System', prize: '$10,000', difficulty: 'Advanced' },
            { id: 'ner-challenge', title: 'Named Entity Recognition', prize: '$8,000', difficulty: 'Intermediate' },
            { id: 'text-classification', title: 'Multi-label Classification', prize: '$7,000', difficulty: 'Beginner' }
        ]
    },
    {
        id: 'vision-quest',
        title: 'Vision Quest 2024',
        description: 'Computer Vision challenges ranging from basic classification to complex segmentation. Perfect for CV enthusiasts.',
        banner: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
        status: 'upcoming',
        startDate: 'Jan 1, 2025',
        endDate: 'Feb 15, 2025',
        totalPrize: '$35,000',
        participants: 0,
        tags: ['Computer Vision', 'Deep Learning'],
        competitions: [
            { id: 'image-segmentation', title: 'Semantic Segmentation', prize: '$12,000', difficulty: 'Advanced' },
            { id: 'face-recognition', title: 'Face Recognition Challenge', prize: '$10,000', difficulty: 'Advanced' },
            { id: 'image-classification', title: 'Multi-class Classification', prize: '$8,000', difficulty: 'Intermediate' },
            { id: 'object-counting', title: 'Object Counting', prize: '$5,000', difficulty: 'Beginner' }
        ]
    },
    {
        id: 'beginner-bootcamp',
        title: 'ML Beginner Bootcamp',
        description: 'New to Machine Learning? Start here! Beginner-friendly competitions with guided tutorials and a supportive community.',
        banner: 'linear-gradient(135deg, #10B981 0%, #14B8A6 100%)',
        status: 'live',
        startDate: 'Nov 15, 2024',
        endDate: 'Dec 31, 2024',
        totalPrize: '$5,000',
        participants: 12500,
        tags: ['Beginner', 'Tutorial'],
        competitions: [
            { id: 'titanic', title: 'Titanic Survival Prediction', prize: '$1,500', difficulty: 'Beginner' },
            { id: 'housing', title: 'Housing Price Prediction', prize: '$2,000', difficulty: 'Beginner' },
            { id: 'digit-recognition', title: 'Digit Recognition', prize: '$1,500', difficulty: 'Beginner' }
        ]
    },
    {
        id: 'kaggle-sprint',
        title: 'Kaggle Sprint Series',
        description: 'Fast-paced weekly competitions with quick turnaround. Perfect for sharpening skills and rapid prototyping.',
        banner: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
        status: 'ended',
        startDate: 'Oct 1, 2024',
        endDate: 'Nov 30, 2024',
        totalPrize: '$15,000',
        participants: 6780,
        tags: ['Sprint', 'Weekly'],
        competitions: [
            { id: 'fraud-detection', title: 'Fraud Detection Sprint', prize: '$5,000', difficulty: 'Intermediate' },
            { id: 'churn-prediction', title: 'Customer Churn Prediction', prize: '$5,000', difficulty: 'Intermediate' },
            { id: 'recommendation', title: 'Movie Recommendations', prize: '$5,000', difficulty: 'Intermediate' }
        ]
    }
];

const statusFilters = ['All', 'Live', 'Upcoming', 'Ended'];

export default function EventsPage() {
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredEvents = events.filter(event => {
        const matchesStatus = selectedStatus === 'All' ||
            event.status === selectedStatus.toLowerCase();
        const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    return (
        <div className={styles.eventsPage}>
            <Squares 
                direction="diagonal"
                speed={0.5}
                borderColor="rgba(139, 92, 246, 0.3)"
                squareSize={50}
                hoverFillColor="rgba(139, 92, 246, 0.1)"
            />
            <div className={styles.eventsHeader}>
                <div className="container">
                    <h1>Events</h1>
                    <p>Join exciting ML events featuring multiple Kaggle competitions. Win prizes and climb the leaderboard.</p>
                </div>
            </div>

            <div className="container">
                <div className={styles.filtersSection}>
                    <div className={styles.searchBox}>
                        <span className={styles.searchIcon}>🔍</span>
                        <input
                            type="text"
                            placeholder="Search events..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className={styles.filterGroup}>
                        <label>Status:</label>
                        <div className={styles.filterPills}>
                            {statusFilters.map(status => (
                                <button
                                    key={status}
                                    className={`${styles.filterPill} ${selectedStatus === status ? styles.active : ''}`}
                                    onClick={() => setSelectedStatus(status)}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className={styles.resultsInfo}>
                    <span>Showing {filteredEvents.length} of {events.length} events</span>
                </div>

                <div className={styles.eventsGrid}>
                    {filteredEvents.map((event) => (
                        <EventCard key={event.id} event={event} />
                    ))}
                </div>

                {filteredEvents.length === 0 && (
                    <div className={styles.noResults}>
                        <span className={styles.noResultsIcon}>🔎</span>
                        <h3>No events found</h3>
                        <p>Try adjusting your filters or search query</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function EventCard({ event }: { event: Event }) {
    const getStatusLabel = () => {
        switch (event.status) {
            case 'live': return '🔴 Live Now';
            case 'upcoming': return '📅 Coming Soon';
            case 'ended': return '✓ Ended';
            default: return '';
        }
    };

    const getStatusClass = () => {
        switch (event.status) {
            case 'live': return styles.statusLive;
            case 'upcoming': return styles.statusUpcoming;
            case 'ended': return styles.statusEnded;
            default: return '';
        }
    };

    return (
        <Link href={`/events/${event.id}`} className={styles.eventCard}>
            <div className={styles.cardBanner} style={{ background: event.banner }}>
                <div className={styles.bannerOverlay}>
                    <span className={`${styles.eventStatus} ${getStatusClass()}`}>
                        {getStatusLabel()}
                    </span>
                    <div className={styles.eventTags}>
                        {event.tags.map(tag => (
                            <span key={tag} className={styles.tag}>{tag}</span>
                        ))}
                    </div>
                </div>
            </div>

            <div className={styles.cardBody}>
                <h3 className={styles.eventTitle}>{event.title}</h3>
                <p className={styles.eventDescription}>{event.description}</p>

                <div className={styles.competitionsList}>
                    <div className={styles.competitionsHeader}>
                        <span className={styles.competitionsCount}>
                            {event.competitions.length} Kaggle Competitions
                        </span>
                    </div>
                    <div className={styles.competitionsPreview}>
                        {event.competitions.slice(0, 3).map(comp => (
                            <div key={comp.id} className={styles.compPreviewItem}>
                                <span className={styles.compTitle}>{comp.title}</span>
                                <span className={`${styles.compDifficulty} ${styles[comp.difficulty.toLowerCase()]}`}>
                                    {comp.difficulty}
                                </span>
                            </div>
                        ))}
                        {event.competitions.length > 3 && (
                            <div className={styles.moreComps}>
                                +{event.competitions.length - 3} more competitions
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.eventMeta}>
                    <div className={styles.metaItem}>
                        <div className={styles.metaValue}>{event.totalPrize}</div>
                        <div className={styles.metaLabel}>Total Prize</div>
                    </div>
                    <div className={styles.metaItem}>
                        <div className={styles.metaValue}>{event.participants.toLocaleString()}</div>
                        <div className={styles.metaLabel}>Participants</div>
                    </div>
                    <div className={styles.metaItem}>
                        <div className={styles.metaValue}>{event.endDate}</div>
                        <div className={styles.metaLabel}>Ends</div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
