import PillNav from "@/components/PillNav";
import { Footer } from "@/components";

const navItems = [
    { label: 'Competitions', href: '/competitions' },
    { label: 'Leaderboard', href: '/leaderboard' },
    { label: 'Stats', href: '/stats' },
];

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <PillNav items={navItems} />
            <main>{children}</main>
            <Footer />
        </>
    );
}
