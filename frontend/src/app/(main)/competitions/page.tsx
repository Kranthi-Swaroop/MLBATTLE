import { Competitions as CompetitionsSection } from '@/components';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Competitions - MLBattle',
    description: 'Browse and join exciting ML competitions. Win prizes and boost your rating.',
};

export default function CompetitionsPage() {
    return (
        <div style={{ paddingTop: '72px' }}>
            <CompetitionsSection />
        </div>
    );
}
