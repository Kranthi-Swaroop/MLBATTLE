'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import styles from './events.module.css';
import api, { UserProfile } from '@/lib/api';

const LightPillar = dynamic(() => import('@/components/LightPillar'), { ssr: false });

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
    const [isAdmin, setIsAdmin] = useState(false);
    const [hasMounted, setHasMounted] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        setHasMounted(true);
        fetchEvents();
        checkAdminStatus();
    }, []);

    const checkAdminStatus = async () => {
        const token = api.getToken();
        if (token) {
            const response = await api.getUserProfile();
            if (response.success && response.data) {
                setIsAdmin(response.data.role === 'admin');
            }
        }
    };

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const response = await api.getEvents();
            if (response.success && response.data) {
                setEvents(response.data as Event[]);
            } else {
                setError(response.message || 'Failed to fetch events');
            }
        } catch (err) {
            setError('Failed to connect to server');
            console.error('Error fetching events:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteEvent = async (id: string, name: string) => {
        console.log(`%c [DELETE CLICK] Event: ${name}, ID: ${id}`, 'background: #EF4444; color: white; font-weight: bold;');

        if (!window.confirm(`Are you sure you want to delete the event "${name}"? This will also delete all associated competitions.`)) {
            return;
        }

        try {
            console.log(`Sending delete request for ID: ${id}`);
            const response = await api.deleteEvent(id);
            if (response.success) {
                console.log('Delete successful');
                setEvents(prev => prev.filter(e => e._id !== id));
            } else {
                console.error('Delete failed:', response.message);
                alert(response.message || 'Failed to delete event');
            }
        } catch (err) {
            console.error('Error deleting event:', err);
            alert('Failed to delete event');
        }
    };

    const handleCreateEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await api.createEvent(formData);
            if (response.success) {
                setIsCreateModalOpen(false);
                setFormData({ name: '', description: '', startDate: '', endDate: '' });
                fetchEvents();
            } else {
                alert(response.message || 'Failed to create event');
            }
        } catch (err) {
            console.error('Error creating event:', err);
            alert('Failed to create event');
        } finally {
            setIsSubmitting(false);
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
                <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
                    <LightPillar
                        topColor="#5227FF"
                        bottomColor="#FF9FFC"
                        intensity={0.75}
                        rotationSpeed={0.3}
                        glowAmount={0.005}
                        pillarWidth={4.2}
                        pillarHeight={0.4}
                        noiseIntensity={0.5}
                        pillarRotation={45}
                        interactive={false}
                        mixBlendMode="normal"
                    />
                </div>
                <div className={styles.eventsHeader}>
                    <div className="container">
                        <h1>Events</h1>
                        <p>Loading events...</p>
                    </div>
                </div>
                <div className="container">
                    <div className={styles.loadingGrid}>
                        <div className={styles.loadingSpinner}></div>
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
            <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
                <LightPillar
                    topColor="#5227FF"
                    bottomColor="#FF9FFC"
                    intensity={0.75}
                    rotationSpeed={0.3}
                    glowAmount={0.005}
                    pillarWidth={4.2}
                    pillarHeight={0.4}
                    noiseIntensity={0.5}
                    pillarRotation={45}
                    interactive={false}
                    mixBlendMode="normal"
                />
            </div>
            <div className={styles.eventsHeader}>
                <div className="container">
                    <div className={styles.headerTop}>
                        <h1>Events</h1>
                        {isAdmin && (
                            <div className={styles.headerActions}>
                                <button
                                    className={styles.manageButton}
                                    onClick={() => setIsDeleteModalOpen(true)}
                                >
                                    🗑️ Manage Events
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => setIsCreateModalOpen(true)}
                                >
                                    + Create Event
                                </button>
                            </div>
                        )}
                    </div>
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

                {/* Create Event Modal */}
                {isCreateModalOpen && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modalContent}>
                            <h2>Create New Event</h2>
                            <form onSubmit={handleCreateEvent}>
                                <div className={styles.formGroup}>
                                    <label>Event Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. ML Olympics 2024"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Brief description of the event..."
                                        rows={3}
                                    />
                                </div>
                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>Start Date</label>
                                        <input
                                            type="datetime-local"
                                            required
                                            value={formData.startDate}
                                            onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>End Date</label>
                                        <input
                                            type="datetime-local"
                                            required
                                            value={formData.endDate}
                                            onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className={styles.modalActions}>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setIsCreateModalOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Creating...' : 'Create Event'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Manage Events Modal */}
                {isDeleteModalOpen && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modalContent}>
                            <h2>Manage Events</h2>
                            <div className={styles.eventList}>
                                {hasMounted && events.map(event => (
                                    <div key={event._id} className={styles.eventListItem}>
                                        <div className={styles.eventItemInfo}>
                                            <h4>{event.name}</h4>
                                            <p>{new Date(event.startDate).toDateString()} - {new Date(event.endDate).toDateString()}</p>
                                        </div>
                                        <button
                                            className={styles.itemDeleteBtn}
                                            onClick={() => handleDeleteEvent(event._id, event.name)}
                                            title="Delete Event"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                ))}
                                {events.length === 0 && <p>No events to manage.</p>}
                            </div>
                            <div className={styles.modalActions}>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => setIsDeleteModalOpen(false)}
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    </div>
                )}

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
