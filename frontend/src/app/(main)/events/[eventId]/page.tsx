'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import styles from './eventDetail.module.css';

const FloatingLines = dynamic(() => import('@/components/FloatingLines'), { ssr: false });

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface LeaderboardEntry {
    rank: number;
    kaggleUsername: string;
    score: number;
    platformUser?: {
        _id: string;
        name: string;
        kaggleUsername: string;
    };
}

interface Competition {
    _id: string;
    kaggleSlug: string;
    title: string;
    description?: string;
    kaggleUrl: string;
    leaderboard: LeaderboardEntry[];
    lastSyncedAt?: string;
    syncStatus: string;
}

interface Event {
    _id: string;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    competitions: Competition[];
    competitionCount: number;
    createdBy?: {
        name: string;
    };
}

// Gradient colors for event banners
const gradients = [
    'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
    'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
    'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
    'linear-gradient(135deg, #10B981 0%, #14B8A6 100%)',
];

export default function EventDetailPage() {
    const params = useParams();
    const eventId = params.eventId as string;

    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('competitions');

    useEffect(() => {
        if (eventId) {
            fetchEvent();
        }
    }, [eventId]);

    const fetchEvent = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/events/${eventId}`);
            const data = await response.json();

            if (data.success) {
                // Fetch full competition details with leaderboards
                const eventData = data.data;
                const competitionsWithDetails = await Promise.all(
                    eventData.competitions.map(async (comp: Competition) => {
                        try {
                            const compResponse = await fetch(`${API_BASE_URL}/competitions/${comp._id}`);
                            const compData = await compResponse.json();
                            return compData.success ? compData.data : comp;
                        } catch {
                            return comp;
                        }
                    })
                );
                eventData.competitions = competitionsWithDetails;
                setEvent(eventData);
            } else {
                setError(data.message || 'Event not found');
            }
        } catch (err) {
            setError('Failed to connect to server');
            console.error('Error fetching event:', err);
        } finally {
            setLoading(false);
        }
    };

    const getEventStatus = (): 'live' | 'upcoming' | 'ended' => {
        if (!event) return 'upcoming';
        const now = new Date();
        const start = new Date(event.startDate);
        const end = new Date(event.endDate);

        if (now < start) return 'upcoming';
        if (now > end) return 'ended';
        return 'live';
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className={styles.eventPage}>
                <div className={styles.heroBanner} style={{ background: gradients[0] }}>
                    <div className={styles.heroOverlay}>
                        <div className="container">
                            <Link href="/events" className={styles.backLink}>← Back to Events</Link>
                            <div className={styles.heroContent}>
                                <h1>Loading event...</h1>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className={styles.notFound}>
                <h1>Event Not Found</h1>
                <p>{error || "The event you're looking for doesn't exist."}</p>
                <Link href="/events" className="btn btn-primary">Back to Events</Link>
            </div>
        );
    }

    const status = getEventStatus();

    const getStatusLabel = () => {
        switch (status) {
            case 'live': return '🔴 Live Now';
            case 'upcoming': return '📅 Coming Soon';
            case 'ended': return '✓ Ended';
            default: return '';
        }
    };

    const getStatusClass = () => {
        switch (status) {
            case 'live': return styles.statusLive;
            case 'upcoming': return styles.statusUpcoming;
            case 'ended': return styles.statusEnded;
            default: return '';
        }
    };

    // Calculate total participants from all competition registrations
    const totalParticipants = event.competitions.reduce((sum, comp) => {
        return sum + (comp.leaderboard?.length || 0);
    }, 0);

    return (
        <div className={styles.eventPage}>
            <div className={styles.heroBanner}>
                <div className={styles.floatingLinesWrapper}>
                    <FloatingLines 
                        enabledWaves={['top', 'middle', 'bottom']}
                        lineCount={[10, 15, 20]}
                        lineDistance={[8, 6, 4]}
                        bendRadius={5.0}
                        bendStrength={-0.5}
                        interactive={true}
                        parallax={true}
                        linesGradient={['#8B5CF6', '#EC4899', '#06B6D4', '#3B82F6', '#F59E0B', '#EF4444', '#10B981', '#14B8A6']}
                    />
                </div>
                <div className={styles.heroOverlay}>
                    <div className="container">
                        <Link href="/events" className={styles.backLink}>← Back to Events</Link>
                        <div className={styles.heroContent}>
                            <div className={styles.heroTags}>
                                <span className={`${styles.statusBadge} ${getStatusClass()}`}>{getStatusLabel()}</span>
                                {event.isActive && <span className={styles.tag}>Active</span>}
                            </div>
                            <h1>{event.name}</h1>
                            <p className={styles.heroDescription}>
                                {event.description || 'Join this exciting ML competition event featuring Kaggle challenges!'}
                            </p>
                            <div className={styles.heroMeta}>
                                <div className={styles.metaItem}>
                                    <span className={styles.metaValue}>{event.competitionCount}</span>
                                    <span className={styles.metaLabel}>Competitions</span>
                                </div>
                                <div className={styles.metaItem}>
                                    <span className={styles.metaValue}>{totalParticipants}</span>
                                    <span className={styles.metaLabel}>Submissions</span>
                                </div>
                                <div className={styles.metaItem}>
                                    <span className={styles.metaValue}>{formatDate(event.startDate)}</span>
                                    <span className={styles.metaLabel}>Started</span>
                                </div>
                                <div className={styles.metaItem}>
                                    <span className={styles.metaValue}>{formatDate(event.endDate)}</span>
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
                        <button
                            className={`${styles.tab} ${activeTab === 'competitions' ? styles.active : ''}`}
                            onClick={() => setActiveTab('competitions')}
                        >
                            🏆 Competitions
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === 'leaderboard' ? styles.active : ''}`}
                            onClick={() => setActiveTab('leaderboard')}
                        >
                            📊 Leaderboard
                        </button>
                        <Link href={`/events/${eventId}/discussions`} className={styles.tab}>
                            💬 Discussions
                        </Link>
                    </div>
                </div>
            </div>

            <div className="container">
                {activeTab === 'competitions' && (
                    <div className={styles.competitionsSection}>
                        <h2>Competitions in this Event</h2>
                        <p className={styles.sectionDesc}>
                            Complete Kaggle competitions to climb the leaderboard. Register on Kaggle to submit your solutions.
                        </p>

                        <div className={styles.competitionsGrid}>
                            {event.competitions.map((comp) => (
                                <CompetitionCard
                                    key={comp._id}
                                    competition={comp}
                                    eventStatus={status}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'leaderboard' && (
                    <div className={styles.competitionsSection}>
                        <h2>Competition Leaderboards</h2>
                        <p className={styles.sectionDesc}>
                            Rankings synced from Kaggle every 5 minutes. Your Kaggle username must match your platform profile.
                        </p>

                        {event.competitions.map((comp) => (
                            <div key={comp._id} className={styles.leaderboardSection}>
                                <h3>{comp.title}</h3>
                                {comp.lastSyncedAt && (
                                    <p className={styles.syncInfo}>
                                        Last synced: {new Date(comp.lastSyncedAt).toLocaleString()}
                                    </p>
                                )}

                                {comp.leaderboard && comp.leaderboard.length > 0 ? (
                                    <table className={styles.leaderboardTable}>
                                        <thead>
                                            <tr>
                                                <th>Rank</th>
                                                <th>Team/User</th>
                                                <th>Score</th>
                                                <th>Platform User</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {comp.leaderboard.slice(0, 10).map((entry, idx) => (
                                                <tr key={idx} className={entry.platformUser ? styles.matchedUser : ''}>
                                                    <td>
                                                        <span className={`${styles.rank} ${idx < 3 ? styles[`top${idx + 1}`] : ''}`}>
                                                            {entry.rank}
                                                        </span>
                                                    </td>
                                                    <td>{entry.kaggleUsername}</td>
                                                    <td>{typeof entry.score === 'number' ? entry.score.toFixed(5) : entry.score}</td>
                                                    <td>
                                                        {entry.platformUser ? (
                                                            <span className={styles.platformBadge}>
                                                                ✓ {entry.platformUser.name}
                                                            </span>
                                                        ) : (
                                                            <span className={styles.notLinked}>-</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className={styles.noLeaderboard}>
                                        <p>No leaderboard data yet. Sync will run automatically every 5 minutes.</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

interface CompetitionCardProps {
    competition: Competition;
    eventStatus: 'live' | 'upcoming' | 'ended';
}

function CompetitionCard({ competition, eventStatus }: CompetitionCardProps) {
    const leaderboardCount = competition.leaderboard?.length || 0;

    return (
        <div className={styles.brutalistCard}>
            <div className={styles.brutalistCardHeader}>
                <div className={styles.brutalistCardIcon}>
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                    </svg>
                </div>
                <div className={styles.brutalistCardAlert}>{competition.title}</div>
            </div>
            <div className={styles.brutalistCardMessage}>
                {competition.description || 'Kaggle competition integrated with this event.'}
                <div className={styles.brutalistCardStats}>
                    <span className={styles.brutalistStat}>
                        📊 {leaderboardCount} Submissions
                    </span>
                    <span className={styles.brutalistStat}>
                        {competition.syncStatus === 'success' ? '✓ Synced' : '⏳ Pending'}
                    </span>
                </div>
            </div>
            <div className={styles.brutalistCardActions}>
                <a
                    href={competition.kaggleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${styles.brutalistCardButton} ${styles.brutalistCardButtonMark}`}
                >
                    View on Kaggle
                </a>
                <button
                    className={`${styles.brutalistCardButton} ${styles.brutalistCardButtonRead}`}
                    disabled={eventStatus === 'ended'}
                >
                    {eventStatus === 'ended' ? 'Ended' : eventStatus === 'upcoming' ? 'Coming Soon' : 'Register'}
                </button>
            </div>
        </div>
    );
}
