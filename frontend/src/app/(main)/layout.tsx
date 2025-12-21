import { Footer } from "@/components";
import PillNav from "@/components/PillNav";

const navItems = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Events', href: '/events' },
    { label: 'Discussions', href: '/discussions' },
    { label: 'Leaderboard', href: '/leaderboard' },
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
