import { Leaderboard as LeaderboardSection } from '@/components';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Leaderboard - MLBattle',
    description: 'View global rankings and ELO ratings. See how you stack up against the best.',
};

export default function LeaderboardPage() {
    return (
        <div style={{ paddingTop: '72px' }}>
            <LeaderboardSection />
        </div>
    );
}
