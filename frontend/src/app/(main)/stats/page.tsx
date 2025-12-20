import { Stats as StatsSection } from '@/components';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Statistics - MLBattle',
    description: 'Platform statistics and metrics. See MLBattle by the numbers.',
};

export default function StatsPage() {
    return (
        <div style={{ paddingTop: '72px' }}>
            <StatsSection />
        </div>
    );
}
