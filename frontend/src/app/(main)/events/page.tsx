'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './events.module.css';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Competition {
    _id: string;
    title: string;
    kaggleSlug: string;
    description?: string;
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
    isOngoing: boolean;
}

// Gradient colors for events (cycle through these)
const gradients = [
    'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
    'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
    'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
    'linear-gradient(135deg, #10B981 0%, #14B8A6 100%)',
    'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
];

const statusFilters = ['All', 'Live', 'Upcoming', 'Ended'];

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/events`);
            const data = await response.json();

            if (data.success) {
                setEvents(data.data);
            } else {
                setError(data.message || 'Failed to fetch events');
            }
        } catch (err) {
            setError('Failed to connect to server');
            console.error('Error fetching events:', err);
        } finally {
            setLoading(false);
        }
    };

    const getEventStatus = (event: Event): 'live' | 'upcoming' | 'ended' => {
        const now = new Date();
        const start = new Date(event.startDate);
        const end = new Date(event.endDate);

        if (now < start) return 'upcoming';
        if (now > end) return 'ended';
        return 'live';
    };

    const filteredEvents = events.filter(event => {
        const status = getEventStatus(event);
        const matchesStatus = selectedStatus === 'All' ||
            status === selectedStatus.toLowerCase();
        const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesStatus && matchesSearch;
    });

    if (loading) {
        return (
            <div className={styles.eventsPage}>
                <div className={styles.eventsHeader}>
                    <div className="container">
                        <h1>Events</h1>
                        <p>Loading events...</p>
                    </div>
                </div>
                <div className="container">
                    <div className={styles.loadingGrid}>
                        {[1, 2, 3].map(i => (
                            <div key={i} className={styles.loadingCard}></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.eventsPage}>
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

                {error && (
                    <div className={styles.errorMessage}>
                        <p>⚠️ {error}</p>
                        <button onClick={fetchEvents} className="btn btn-secondary">Retry</button>
                    </div>
                )}

                <div className={styles.eventsGrid}>
                    {filteredEvents.map((event, index) => (
                        <EventCard
                            key={event._id}
                            event={event}
                            gradient={gradients[index % gradients.length]}
                            status={getEventStatus(event)}
                        />
                    ))}
                </div>

                {filteredEvents.length === 0 && !error && (
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

interface EventCardProps {
    event: Event;
    gradient: string;
    status: 'live' | 'upcoming' | 'ended';
}

function EventCard({ event, gradient, status }: EventCardProps) {
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

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Generate tags based on event properties
    const tags = [];
    if (status === 'live') tags.push('Active');
    if (event.competitionCount > 3) tags.push('Multi-Track');
    if (event.competitionCount <= 3) tags.push('Focused');

    return (
        <Link href={`/events/${event._id}`} className={styles.eventCard}>
            <div className={styles.cardBanner} style={{ background: gradient }}>
                <div className={styles.bannerOverlay}>
                    <span className={`${styles.eventStatus} ${getStatusClass()}`}>
                        {getStatusLabel()}
                    </span>
                    <div className={styles.eventTags}>
                        {tags.map(tag => (
                            <span key={tag} className={styles.tag}>{tag}</span>
                        ))}
                    </div>
                </div>
            </div>

            <div className={styles.cardBody}>
                <h3 className={styles.eventTitle}>{event.name}</h3>
                <p className={styles.eventDescription}>
                    {event.description || 'Join this exciting ML competition event!'}
                </p>

                <div className={styles.competitionsList}>
                    <div className={styles.competitionsHeader}>
                        <span className={styles.competitionsCount}>
                            {event.competitionCount} Kaggle Competition{event.competitionCount !== 1 ? 's' : ''}
                        </span>
                    </div>
                    <div className={styles.competitionsPreview}>
                        {event.competitions && event.competitions.slice(0, 3).map(comp => (
                            <div key={comp._id} className={styles.compPreviewItem}>
                                <span className={styles.compTitle}>{comp.title}</span>
                            </div>
                        ))}
                        {event.competitionCount > 3 && (
                            <div className={styles.moreComps}>
                                +{event.competitionCount - 3} more competitions
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.eventMeta}>
                    <div className={styles.metaItem}>
                        <div className={styles.metaValue}>{event.competitionCount}</div>
                        <div className={styles.metaLabel}>Competitions</div>
                    </div>
                    <div className={styles.metaItem}>
                        <div className={styles.metaValue}>{formatDate(event.startDate)}</div>
                        <div className={styles.metaLabel}>Starts</div>
                    </div>
                    <div className={styles.metaItem}>
                        <div className={styles.metaValue}>{formatDate(event.endDate)}</div>
                        <div className={styles.metaLabel}>Ends</div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
