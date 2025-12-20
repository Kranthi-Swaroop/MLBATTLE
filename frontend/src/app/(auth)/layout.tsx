import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Login | MLBattle",
    description: "Sign in to your MLBattle account",
};

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
