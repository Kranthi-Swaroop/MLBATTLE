import { Leaderboard as LeaderboardSection } from '@/components';
import type { Metadata } from 'next';
import styles from './leaderboard.module.css';

export const metadata: Metadata = {
    title: 'Leaderboard - MLBattle',
    description: 'View global rankings and ELO ratings. See how you stack up against the best.',
};

export default function LeaderboardPage() {
    return (
        <div className={styles.pageWrapper}>
            <LeaderboardSection />
        </div>
    );
}
