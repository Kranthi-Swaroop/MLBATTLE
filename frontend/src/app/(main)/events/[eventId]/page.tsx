'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import api, { UserProfile } from '@/lib/api';
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
    const [isAdmin, setIsAdmin] = useState(false);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [userRegistrations, setUserRegistrations] = useState<Record<string, any>>({});
    const [hasMounted, setHasMounted] = useState(false);
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state for new competition
    const [formData, setFormData] = useState({
        kaggleSlugOrUrl: '',
        title: '',
        description: '',
        higherIsBetter: true,
        metricMinValue: 0,
        metricMaxValue: 1,
        pointsForPerfectScore: 100,
        ratingWeight: 1,
        isImport: true
    });

    useEffect(() => {
        setHasMounted(true);
        if (eventId) {
            const init = async () => {
                const profile = await fetchUserData();
                await fetchEvent(profile); // Pass profile to avoid closure issues
            };
            init();
        }
    }, [eventId]);

    const fetchUserData = async (): Promise<UserProfile | null> => {
        const response = await api.getUserProfile();
        if (response.success && response.data) {
            setUserProfile(response.data);
            setIsAdmin(response.data.role === 'admin');
            return response.data;
        }
        return null;
    };

    const fetchEvent = async (profile?: UserProfile | null) => {
        try {
            setLoading(true);
            const response = await api.getEvent(eventId);

            if (response.success && response.data) {
                const eventData = response.data as Event;
                // Fetch full competition details with leaderboards
                const competitionsWithDetails = await Promise.all(
                    eventData.competitions.map(async (comp: Competition) => {
                        try {
                            const compResponse = await api.getCompetition(comp._id);
                            return compResponse.success ? compResponse.data : comp;
                        } catch {
                            return comp;
                        }
                    })
                );
                eventData.competitions = competitionsWithDetails as Competition[];
                setEvent(eventData);

                // Fetch registrations for each competition
                const registrationsMap: Record<string, any> = {};
                const currentUser = profile || userProfile;

                if (currentUser) {
                    await Promise.all(
                        eventData.competitions.map(async (comp: Competition) => {
                            const regRes = await api.getRegistrations(comp._id);
                            if (regRes.success && regRes.data) {
                                // Find current user's registration
                                const myReg = (regRes.data as any[]).find(r =>
                                    (r.type === 'solo' && r.user?._id === currentUser._id) ||
                                    (r.type === 'team' && r.team?.members?.some((m: any) => (m._id || m) === currentUser._id))
                                );
                                if (myReg) {
                                    registrationsMap[comp._id] = myReg;
                                }
                            }
                        })
                    );
                    setUserRegistrations(registrationsMap);
                }
            } else {
                setError(response.message || 'Event not found');
            }
        } catch (err) {
            setError('Failed to connect to server');
            console.error('Error fetching event:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCompetitionAction = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            let response;
            if (formData.isImport) {
                response = await api.importCompetition({
                    url: formData.kaggleSlugOrUrl,
                    eventId: eventId,
                    higherIsBetter: formData.higherIsBetter,
                    metricMinValue: formData.metricMinValue,
                    metricMaxValue: formData.metricMaxValue,
                    pointsForPerfectScore: formData.pointsForPerfectScore,
                    ratingWeight: formData.ratingWeight
                });
            } else {
                response = await api.createCompetition({
                    kaggleSlug: formData.kaggleSlugOrUrl,
                    title: formData.title,
                    description: formData.description,
                    eventId: eventId,
                    higherIsBetter: formData.higherIsBetter,
                    metricMinValue: formData.metricMinValue,
                    metricMaxValue: formData.metricMaxValue,
                    pointsForPerfectScore: formData.pointsForPerfectScore,
                    ratingWeight: formData.ratingWeight
                });
            }

            if (response.success) {
                setFormData({
                    kaggleSlugOrUrl: '',
                    title: '',
                    description: '',
                    higherIsBetter: true,
                    metricMinValue: 0,
                    metricMaxValue: 1,
                    pointsForPerfectScore: 100,
                    ratingWeight: 1,
                    isImport: true
                });
                fetchEvent();
            } else {
                alert(response.message || 'Action failed');
            }
        } catch (error) {
            console.error('Competition action error:', error);
            alert('An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteCompetition = async (id: string, title: string) => {
        if (!window.confirm(`Are you sure you want to remove "${title}" from this event?`)) return;

        try {
            const response = await api.deleteCompetition(id);
            if (response.success) {
                fetchEvent();
            } else {
                alert(response.message || 'Delete failed');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('An error occurred');
        }
    };

    const handleRegisterCompetition = async (id: string, title: string) => {
        if (!userProfile) {
            alert('Please log in to register for competitions.');
            return;
        }

        if (userRegistrations[id]) {
            alert('You are already registered for this competition.');
            return;
        }

        if (!window.confirm(`Do you want to register for "${title}"?`)) return;

        setIsSubmitting(true);
        try {
            // Default to solo registration
            const response = await api.registerForCompetition(id, 'solo');
            if (response.success) {
                alert(`Successfully registered! Good luck with ${title}.`);
                fetchEvent(); // Refresh event and registrations
            } else {
                alert(response.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFinalizeCompetition = async (id: string, title: string) => {
        if (!window.confirm(`Are you sure you want to finalize "${title}"? This will process results and update ELO ratings for all participants. This should only be done once per competition.`)) return;

        setIsSubmitting(true);
        try {
            const response = await api.finalizeCompetition(id);
            if (response.success) {
                alert('Success! ELO ratings have been updated for all matched participants.');
                fetchEvent();
            } else {
                alert(response.message || 'Finalization failed');
            }
        } catch (error) {
            console.error('Finalize error:', error);
            alert('An error occurred');
        } finally {
            setIsSubmitting(false);
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

                            {isAdmin && (
                                <div className={styles.manageActions}>
                                    <button
                                        className={styles.manageButton}
                                        onClick={() => setIsManageModalOpen(true)}
                                    >
                                        ⚙️ Manage Competitions
                                    </button>
                                </div>
                            )}
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
                                    isRegistered={!!userRegistrations[comp._id]}
                                    onRegister={() => handleRegisterCompetition(comp._id, comp.title)}
                                    isSubmitting={isSubmitting}
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

                {/* Management Modal */}
                {isManageModalOpen && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modalContent}>
                            <h2>Manage {event.name} Competitions</h2>

                            <div className={styles.competitionList}>
                                {event.competitions.map(comp => (
                                    <div key={comp._id} className={styles.competitionListItem}>
                                        <div className={styles.compItemInfo}>
                                            <h4>{comp.title}</h4>
                                            <p>{comp.kaggleSlug}</p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                className={styles.manageButton}
                                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem' }}
                                                onClick={() => handleFinalizeCompetition(comp._id, comp.title)}
                                                disabled={isSubmitting}
                                            >
                                                🏆 Finalize
                                            </button>
                                            <button
                                                className={styles.itemDeleteBtn}
                                                onClick={() => handleDeleteCompetition(comp._id, comp.title)}
                                                title="Remove Competition"
                                                disabled={isSubmitting}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {event.competitions.length === 0 && <p>No competitions added yet.</p>}
                            </div>

                            <div className={styles.infoBox}>
                                Add a Kaggle competition to this event. Scoring will be normalized based on your parameters.
                            </div>

                            <form onSubmit={handleCompetitionAction}>
                                <div className={styles.formGroup}>
                                    <label>Action Type</label>
                                    <div className={styles.radioGroup}>
                                        <label className={styles.radioLabel}>
                                            <input
                                                type="radio"
                                                checked={formData.isImport}
                                                onChange={() => setFormData({ ...formData, isImport: true })}
                                            />
                                            Import from Kaggle
                                        </label>
                                        <label className={styles.radioLabel}>
                                            <input
                                                type="radio"
                                                checked={!formData.isImport}
                                                onChange={() => setFormData({ ...formData, isImport: false })}
                                            />
                                            Add Manual (Slug only)
                                        </label>
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>{formData.isImport ? 'Kaggle Competition URL/Slug' : 'Kaggle Competition Slug'}</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.kaggleSlugOrUrl}
                                        onChange={e => setFormData({ ...formData, kaggleSlugOrUrl: e.target.value })}
                                        placeholder={formData.isImport ? "https://www.kaggle.com/competitions/..." : "titanic"}
                                    />
                                </div>

                                {!formData.isImport && (
                                    <>
                                        <div className={styles.formRow}>
                                            <div className={styles.formGroup}>
                                                <label>Custom Title</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.title}
                                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                                />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label>Description</label>
                                                <input
                                                    type="text"
                                                    value={formData.description}
                                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>Scoring Metric Type</label>
                                        <select
                                            value={formData.higherIsBetter ? 'higher' : 'lower'}
                                            onChange={e => setFormData({ ...formData, higherIsBetter: e.target.value === 'higher' })}
                                        >
                                            <option value="higher">Higher Score is Better (e.g. Accuracy)</option>
                                            <option value="lower">Lower Score is Better (e.g. LogLoss)</option>
                                        </select>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Weight (ELO Multiplier)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={formData.ratingWeight}
                                            onChange={e => setFormData({ ...formData, ratingWeight: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>Metric Min Value</label>
                                        <input
                                            type="number"
                                            step="0.0001"
                                            value={formData.metricMinValue}
                                            onChange={e => setFormData({ ...formData, metricMinValue: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Metric Max Value</label>
                                        <input
                                            type="number"
                                            step="0.0001"
                                            value={formData.metricMaxValue}
                                            onChange={e => setFormData({ ...formData, metricMaxValue: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Perfect Score Points (Normalized Max)</label>
                                    <input
                                        type="number"
                                        value={formData.pointsForPerfectScore}
                                        onChange={e => setFormData({ ...formData, pointsForPerfectScore: parseFloat(e.target.value) })}
                                    />
                                </div>

                                <div className={styles.modalActions}>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setIsManageModalOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Saving...' : formData.isImport ? 'Import & Add' : 'Add Competition'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

interface CompetitionCardProps {
    competition: Competition;
    eventStatus: 'live' | 'upcoming' | 'ended';
    isRegistered: boolean;
    onRegister: () => void;
    isSubmitting: boolean;
}

function CompetitionCard({ competition, eventStatus, isRegistered, onRegister, isSubmitting }: CompetitionCardProps) {
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
            {isRegistered && (
                <div className={styles.registrationBadge}>
                    <span>✓ REGISTERED</span>
                </div>
            )}
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
                    className={`${styles.brutalistCardButton} ${styles.brutalistCardButtonRead} ${isRegistered ? styles.btnRegistered : ''}`}
                    onClick={onRegister}
                    disabled={eventStatus === 'ended' || isRegistered || isSubmitting}
                >
                    {isRegistered ? 'Registered' : eventStatus === 'ended' ? 'Ended' : eventStatus === 'upcoming' ? 'Coming Soon' : 'Register'}
                </button>
            </div>
        </div>
    );
}
