'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './events.module.css';
import Squares from '@/components/Squares';

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
            <Squares 
                direction="diagonal"
                speed={0.5}
                borderColor="rgba(139, 92, 246, 0.3)"
                squareSize={50}
                hoverFillColor="rgba(224, 86, 240)"
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
                            status={getEventStatus(event)}
                            colorIndex={index % 4}
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
    status: 'live' | 'upcoming' | 'ended';
    colorIndex: number;
}

const colorClasses = [
    'colorPurple',
    'colorRed',
    'colorYellow',
    'colorGreen'
];

function EventCard({ event, status, colorIndex }: EventCardProps) {
    const getStatusLabel = () => {
        switch (status) {
            case 'live': return '🔴 Live';
            case 'upcoming': return '📅 Soon';
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

    const colorClass = styles[colorClasses[colorIndex] as keyof typeof styles];

    const startDate = new Date(event.startDate);
    const month = startDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const day = startDate.getDate();

    return (
        <div className={styles.cardParent}>
            <Link href={`/events/${event._id}`} className={`${styles.eventCard} ${colorClass}`}>
                <div className={styles.contentBox}>
                    <span className={`${styles.eventStatus} ${getStatusClass()}`}>
                        {getStatusLabel()}
                    </span>
                    <h3 className={styles.cardTitle}>{event.name}</h3>
                    <p className={styles.cardContent}>
                        {event.description || 'Join this exciting ML competition event!'}
                    </p>
                    <div className={styles.cardFooter}>
                        <span className={styles.competitionCount}>
                            {event.competitionCount} Competition{event.competitionCount !== 1 ? 's' : ''}
                        </span>
                        <span className={styles.seeMore}>View Event →</span>
                    </div>
                </div>
                <div className={styles.dateBox}>
                    <span className={styles.month}>{month}</span>
                    <span className={styles.date}>{day}</span>
                </div>
            </Link>
        </div>
    );
}
