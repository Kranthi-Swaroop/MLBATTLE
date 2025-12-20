'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Checkbox } from '@/components/ui/Checkbox';
import styles from './animated-login.module.css';

interface PupilProps {
    size?: number;
    maxDistance?: number;
    pupilColor?: string;
    forceLookX?: number;
    forceLookY?: number;
}

const Pupil = ({
    size = 12,
    maxDistance = 5,
    pupilColor = 'black',
    forceLookX,
    forceLookY
}: PupilProps) => {
    const [mouseX, setMouseX] = useState<number>(0);
    const [mouseY, setMouseY] = useState<number>(0);
    const pupilRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMouseX(e.clientX);
            setMouseY(e.clientY);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const calculatePupilPosition = () => {
        if (!pupilRef.current) return { x: 0, y: 0 };

        if (forceLookX !== undefined && forceLookY !== undefined) {
            return { x: forceLookX, y: forceLookY };
        }

        const pupil = pupilRef.current.getBoundingClientRect();
        const pupilCenterX = pupil.left + pupil.width / 2;
        const pupilCenterY = pupil.top + pupil.height / 2;

        const deltaX = mouseX - pupilCenterX;
        const deltaY = mouseY - pupilCenterY;
        const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);

        const angle = Math.atan2(deltaY, deltaX);
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        return { x, y };
    };

    const pupilPosition = calculatePupilPosition();

    return (
        <div
            ref={pupilRef}
            className={styles.pupil}
            style={{
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor: pupilColor,
                transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
            }}
        />
    );
};

interface EyeBallProps {
    size?: number;
    pupilSize?: number;
    maxDistance?: number;
    eyeColor?: string;
    pupilColor?: string;
    isBlinking?: boolean;
    forceLookX?: number;
    forceLookY?: number;
}

const EyeBall = ({
    size = 48,
    pupilSize = 16,
    maxDistance = 10,
    eyeColor = 'white',
    pupilColor = 'black',
    isBlinking = false,
    forceLookX,
    forceLookY
}: EyeBallProps) => {
    const [mouseX, setMouseX] = useState<number>(0);
    const [mouseY, setMouseY] = useState<number>(0);
    const eyeRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMouseX(e.clientX);
            setMouseY(e.clientY);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const calculatePupilPosition = () => {
        if (!eyeRef.current) return { x: 0, y: 0 };

        if (forceLookX !== undefined && forceLookY !== undefined) {
            return { x: forceLookX, y: forceLookY };
        }

        const eye = eyeRef.current.getBoundingClientRect();
        const eyeCenterX = eye.left + eye.width / 2;
        const eyeCenterY = eye.top + eye.height / 2;

        const deltaX = mouseX - eyeCenterX;
        const deltaY = mouseY - eyeCenterY;
        const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);

        const angle = Math.atan2(deltaY, deltaX);
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        return { x, y };
    };

    const pupilPosition = calculatePupilPosition();

    return (
        <div
            ref={eyeRef}
            className={styles.eyeball}
            style={{
                width: `${size}px`,
                height: isBlinking ? '2px' : `${size}px`,
                backgroundColor: eyeColor,
            }}
        >
            {!isBlinking && (
                <div
                    className={styles.pupil}
                    style={{
                        width: `${pupilSize}px`,
                        height: `${pupilSize}px`,
                        backgroundColor: pupilColor,
                        transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
                    }}
                />
            )}
        </div>
    );
};

export default function AnimatedLoginPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isPurpleBlinking, setIsPurpleBlinking] = useState(false);
    const [isBlackBlinking, setIsBlackBlinking] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [isLookingAtEachOther, setIsLookingAtEachOther] = useState(false);
    const [isPurplePeeking, setIsPurplePeeking] = useState(false);
    const purpleRef = useRef<HTMLDivElement>(null);
    const blackRef = useRef<HTMLDivElement>(null);
    const yellowRef = useRef<HTMLDivElement>(null);
    const orangeRef = useRef<HTMLDivElement>(null);

    // Blinking effects
    useEffect(() => {
        const getRandomBlinkInterval = () => Math.random() * 4000 + 3000;

        const scheduleBlink = () => {
            const blinkTimeout = setTimeout(() => {
                setIsPurpleBlinking(true);
                setTimeout(() => {
                    setIsPurpleBlinking(false);
                    scheduleBlink();
                }, 150);
            }, getRandomBlinkInterval());

            return blinkTimeout;
        };

        const timeout = scheduleBlink();
        return () => clearTimeout(timeout);
    }, []);

    useEffect(() => {
        const getRandomBlinkInterval = () => Math.random() * 4000 + 3000;

        const scheduleBlink = () => {
            const blinkTimeout = setTimeout(() => {
                setIsBlackBlinking(true);
                setTimeout(() => {
                    setIsBlackBlinking(false);
                    scheduleBlink();
                }, 150);
            }, getRandomBlinkInterval());

            return blinkTimeout;
        };

        const timeout = scheduleBlink();
        return () => clearTimeout(timeout);
    }, []);

    useEffect(() => {
        if (isTyping) {
            setIsLookingAtEachOther(true);
            const timer = setTimeout(() => {
                setIsLookingAtEachOther(false);
            }, 800);
            return () => clearTimeout(timer);
        } else {
            setIsLookingAtEachOther(false);
        }
    }, [isTyping]);

    useEffect(() => {
        if (password.length > 0 && showPassword) {
            const schedulePeek = () => {
                const peekInterval = setTimeout(() => {
                    setIsPurplePeeking(true);
                    setTimeout(() => {
                        setIsPurplePeeking(false);
                    }, 800);
                }, Math.random() * 3000 + 2000);
                return peekInterval;
            };

            const firstPeek = schedulePeek();
            return () => clearTimeout(firstPeek);
        } else {
            setIsPurplePeeking(false);
        }
    }, [password, showPassword, isPurplePeeking]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        await new Promise(resolve => setTimeout(resolve, 300));

        if (email === 'demo@mlbattle.com' && password === 'demo123') {
            console.log('✅ Login successful!');
            // Store demo auth state
            localStorage.setItem('mlbattle_user', JSON.stringify({
                email: 'demo@mlbattle.com',
                name: 'Demo User',
                rating: 1850,
                rank: 42
            }));
            
            // Redirect to home page
            router.push('/');
        } else {
            setError('Invalid email or password. Try the demo account!');
            console.log('❌ Login failed');
            setIsLoading(false);
        }
        setIsLoading(false);
    };

    const fillDemoCredentials = () => {
        setEmail('demo@mlbattle.com');
        setPassword('demo123');
        setError('');
    };

    return (
        <div className={styles.loginPage}>
            {/* Left Content Section */}
            <div className={styles.leftSection}>
                <div className={styles.brandLogo}>
                    <div className={styles.logoIcon}>⚔️</div>
                    <span>MLBattle</span>
                </div>

                <div className={styles.charactersContainer}>
                    <div className={styles.characters}>
                        {/* Purple character */}
                        <div
                            ref={purpleRef}
                            className={`${styles.character} ${styles.purple}`}
                            style={{
                                height: (isTyping || (password.length > 0 && !showPassword)) ? '440px' : '400px',
                                transform: (password.length > 0 && showPassword)
                                    ? 'skewX(0deg)'
                                    : (isTyping || (password.length > 0 && !showPassword))
                                        ? 'skewX(-12deg) translateX(40px)'
                                        : 'skewX(0deg)',
                            }}
                        >
                            <div
                                className={styles.eyes}
                                style={{
                                    left: (password.length > 0 && showPassword) ? '20px' : isLookingAtEachOther ? '55px' : '45px',
                                    top: (password.length > 0 && showPassword) ? '35px' : isLookingAtEachOther ? '65px' : '40px',
                                }}
                            >
                                <EyeBall
                                    size={18}
                                    pupilSize={7}
                                    maxDistance={5}
                                    eyeColor="white"
                                    pupilColor="#2D2D2D"
                                    isBlinking={isPurpleBlinking}
                                    forceLookX={(password.length > 0 && showPassword) ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined}
                                    forceLookY={(password.length > 0 && showPassword) ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined}
                                />
                                <EyeBall
                                    size={18}
                                    pupilSize={7}
                                    maxDistance={5}
                                    eyeColor="white"
                                    pupilColor="#2D2D2D"
                                    isBlinking={isPurpleBlinking}
                                    forceLookX={(password.length > 0 && showPassword) ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined}
                                    forceLookY={(password.length > 0 && showPassword) ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined}
                                />
                            </div>
                        </div>

                        {/* Black character */}
                        <div
                            ref={blackRef}
                            className={`${styles.character} ${styles.black}`}
                            style={{
                                transform: (password.length > 0 && showPassword)
                                    ? 'skewX(0deg)'
                                    : isLookingAtEachOther
                                        ? 'skewX(10deg) translateX(20px)'
                                        : (isTyping || (password.length > 0 && !showPassword))
                                            ? 'skewX(0deg)'
                                            : 'skewX(0deg)',
                            }}
                        >
                            <div
                                className={styles.eyes}
                                style={{
                                    left: (password.length > 0 && showPassword) ? '10px' : isLookingAtEachOther ? '32px' : '26px',
                                    top: (password.length > 0 && showPassword) ? '28px' : isLookingAtEachOther ? '12px' : '32px',
                                }}
                            >
                                <EyeBall
                                    size={16}
                                    pupilSize={6}
                                    maxDistance={4}
                                    eyeColor="white"
                                    pupilColor="#2D2D2D"
                                    isBlinking={isBlackBlinking}
                                    forceLookX={(password.length > 0 && showPassword) ? -4 : isLookingAtEachOther ? 0 : undefined}
                                    forceLookY={(password.length > 0 && showPassword) ? -4 : isLookingAtEachOther ? -4 : undefined}
                                />
                                <EyeBall
                                    size={16}
                                    pupilSize={6}
                                    maxDistance={4}
                                    eyeColor="white"
                                    pupilColor="#2D2D2D"
                                    isBlinking={isBlackBlinking}
                                    forceLookX={(password.length > 0 && showPassword) ? -4 : isLookingAtEachOther ? 0 : undefined}
                                    forceLookY={(password.length > 0 && showPassword) ? -4 : isLookingAtEachOther ? -4 : undefined}
                                />
                            </div>
                        </div>

                        {/* Orange character */}
                        <div ref={orangeRef} className={`${styles.character} ${styles.orange}`}>
                            <div className={styles.pupils} style={{ left: (password.length > 0 && showPassword) ? '50px' : '82px', top: (password.length > 0 && showPassword) ? '85px' : '90px' }}>
                                <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={(password.length > 0 && showPassword) ? -5 : undefined} forceLookY={(password.length > 0 && showPassword) ? -4 : undefined} />
                                <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={(password.length > 0 && showPassword) ? -5 : undefined} forceLookY={(password.length > 0 && showPassword) ? -4 : undefined} />
                            </div>
                        </div>

                        {/* Yellow character */}
                        <div ref={yellowRef} className={`${styles.character} ${styles.yellow}`}>
                            <div className={styles.pupils} style={{ left: (password.length > 0 && showPassword) ? '20px' : '52px', top: (password.length > 0 && showPassword) ? '35px' : '40px' }}>
                                <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={(password.length > 0 && showPassword) ? -5 : undefined} forceLookY={(password.length > 0 && showPassword) ? -4 : undefined} />
                                <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={(password.length > 0 && showPassword) ? -5 : undefined} forceLookY={(password.length > 0 && showPassword) ? -4 : undefined} />
                            </div>
                            <div className={styles.mouth} style={{ left: (password.length > 0 && showPassword) ? '10px' : '40px', top: (password.length > 0 && showPassword) ? '88px' : '88px' }} />
                        </div>
                    </div>
                </div>

                <div className={styles.footerLinks}>
                    <a href="#">Privacy Policy</a>
                    <a href="#">Terms of Service</a>
                    <a href="#">Contact</a>
                </div>
            </div>

            {/* Right Login Section */}
            <div className={styles.rightSection}>
                <div className={styles.loginForm}>
                    <div className={styles.mobileLogo}>
                        <div className={styles.logoIcon}>⚔️</div>
                        <span>MLBattle</span>
                    </div>

                    <div className={styles.header}>
                        <h1>Welcome back!</h1>
                        <p>Please enter your details</p>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.formGroup}>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="test@mlbattle.com"
                                value={email}
                                autoComplete="off"
                                onChange={(e) => setEmail(e.target.value)}
                                onFocus={() => setIsTyping(true)}
                                onBlur={() => setIsTyping(false)}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <Label htmlFor="password">Password</Label>
                            <div className={styles.passwordWrapper}>
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className={styles.eyeButton}
                                >
                                    {showPassword ? '👁️' : '👁️‍🗨️'}
                                </button>
                            </div>
                        </div>

                        <div className={styles.formOptions}>
                            <div className={styles.remember}>
                                <Checkbox id="remember" />
                                <Label htmlFor="remember">Remember for 30 days</Label>
                            </div>
                            <a href="#" className={styles.forgotLink}>
                                Forgot password?
                            </a>
                        </div>

                        {error && (
                            <div className={styles.errorMessage}>
                                {error}
                            </div>
                        )}

                        <Button type="submit" variant="primary" size="lg" disabled={isLoading} style={{ width: '100%' }}>
                            {isLoading ? 'Signing in...' : 'Log in'}
                        </Button>
                    </form>

                    <div className={styles.demoSection}>
                        <p className={styles.demoText}>Want to try it out?</p>
                        <button
                            type="button"
                            onClick={fillDemoCredentials}
                            className={styles.demoBtn}
                        >
                            🎮 Use Demo Account
                        </button>
                        <div className={styles.demoCredentials}>
                            <code>demo@mlbattle.com</code>
                            <code>demo123</code>
                        </div>
                    </div>

                    <div className={styles.divider}>
                        <span>or</span>
                    </div>

                    <div className={styles.socialLogin}>
                        <Button variant="outline" size="lg" type="button" style={{ width: '100%' }}>
                            <span>✉️</span>
                            Log in with Google
                        </Button>
                    </div>

                    <div className={styles.signupLink}>
                        Don&apos;t have an account?{' '}
                        <a href="/signup">Sign Up</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
