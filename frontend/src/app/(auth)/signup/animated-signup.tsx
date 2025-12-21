'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import api from '@/lib/api';

import styles from './animated-signup.module.css';

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

interface PasswordStrength {
    score: number;
    label: string;
    color: string;
    checks: {
        minLength: boolean;
        hasUppercase: boolean;
        hasLowercase: boolean;
        hasNumber: boolean;
        hasSpecial: boolean;
    };
}

const checkPasswordStrength = (password: string): PasswordStrength => {
    const checks = {
        minLength: password.length >= 8,
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };
    
    const score = Object.values(checks).filter(Boolean).length;
    
    let label = 'Very Weak';
    let color = '#ef4444';
    
    if (score === 5) {
        label = 'Strong';
        color = '#22c55e';
    } else if (score >= 4) {
        label = 'Good';
        color = '#84cc16';
    } else if (score >= 3) {
        label = 'Fair';
        color = '#f59e0b';
    } else if (score >= 2) {
        label = 'Weak';
        color = '#f97316';
    }
    
    return { score, label, color, checks };
};

export default function AnimatedSignupPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>(checkPasswordStrength(''));
    const [isPurpleBlinking, setIsPurpleBlinking] = useState(false);
    const [isBlackBlinking, setIsBlackBlinking] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [isLookingAtEachOther, setIsLookingAtEachOther] = useState(false);
    const [areCharactersExcited, setAreCharactersExcited] = useState(false);
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

    // Characters get excited when all fields are filled
    useEffect(() => {
        if (name && email && password && confirmPassword) {
            setAreCharactersExcited(true);
        } else {
            setAreCharactersExcited(false);
        }
    }, [name, email, password, confirmPassword]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match!');
            return;
        }

        if (passwordStrength.score < 5) {
            setError('Please create a stronger password that meets all requirements');
            return;
        }

        setIsLoading(true);

        try {
            const response = await api.register(email, password, name);

            if (response.success && response.data) {
                console.log('✅ Sign up successful!');
                // Store auth token using api service
                api.setToken(response.data.token);

                // Dispatch custom event to notify navbar
                window.dispatchEvent(new Event('auth-change'));

                // Redirect to profile page
                router.push('/profile');
            } else {
                setError(response.message || 'Registration failed. Please try again.');
                setIsLoading(false);
            }
        } catch (err) {
            console.error('Signup error:', err);
            setError('Failed to connect to server. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.signupPage}>
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
                                height: areCharactersExcited ? '450px' : isTyping ? '420px' : '400px',
                                transform: areCharactersExcited
                                    ? 'skewX(3deg) translateY(-20px)'
                                    : isLookingAtEachOther
                                        ? 'skewX(-8deg) translateX(30px)'
                                        : 'skewX(0deg)',
                            }}
                        >
                            <div
                                className={styles.eyes}
                                style={{
                                    left: areCharactersExcited ? '45px' : isLookingAtEachOther ? '55px' : '45px',
                                    top: areCharactersExcited ? '30px' : isLookingAtEachOther ? '65px' : '40px',
                                }}
                            >
                                <EyeBall
                                    size={areCharactersExcited ? 22 : 18}
                                    pupilSize={areCharactersExcited ? 9 : 7}
                                    maxDistance={5}
                                    eyeColor="white"
                                    pupilColor="#2D2D2D"
                                    isBlinking={isPurpleBlinking}
                                    forceLookX={areCharactersExcited ? 0 : isLookingAtEachOther ? 3 : undefined}
                                    forceLookY={areCharactersExcited ? -6 : isLookingAtEachOther ? 4 : undefined}
                                />
                                <EyeBall
                                    size={areCharactersExcited ? 22 : 18}
                                    pupilSize={areCharactersExcited ? 9 : 7}
                                    maxDistance={5}
                                    eyeColor="white"
                                    pupilColor="#2D2D2D"
                                    isBlinking={isPurpleBlinking}
                                    forceLookX={areCharactersExcited ? 0 : isLookingAtEachOther ? 3 : undefined}
                                    forceLookY={areCharactersExcited ? -6 : isLookingAtEachOther ? 4 : undefined}
                                />
                            </div>
                            {areCharactersExcited && <div className={styles.smile} style={{ left: '60px', top: '85px' }} />}
                        </div>

                        {/* Black character */}
                        <div
                            ref={blackRef}
                            className={`${styles.character} ${styles.black}`}
                            style={{
                                height: areCharactersExcited ? '330px' : '310px',
                                transform: areCharactersExcited
                                    ? 'skewX(-3deg) translateY(-15px)'
                                    : isLookingAtEachOther
                                        ? 'skewX(10deg) translateX(20px)'
                                        : 'skewX(0deg)',
                            }}
                        >
                            <div
                                className={styles.eyes}
                                style={{
                                    left: areCharactersExcited ? '26px' : isLookingAtEachOther ? '32px' : '26px',
                                    top: areCharactersExcited ? '22px' : isLookingAtEachOther ? '12px' : '32px',
                                }}
                            >
                                <EyeBall
                                    size={areCharactersExcited ? 20 : 16}
                                    pupilSize={areCharactersExcited ? 8 : 6}
                                    maxDistance={4}
                                    eyeColor="white"
                                    pupilColor="#2D2D2D"
                                    isBlinking={isBlackBlinking}
                                    forceLookX={areCharactersExcited ? 0 : isLookingAtEachOther ? 0 : undefined}
                                    forceLookY={areCharactersExcited ? -6 : isLookingAtEachOther ? -4 : undefined}
                                />
                                <EyeBall
                                    size={areCharactersExcited ? 20 : 16}
                                    pupilSize={areCharactersExcited ? 8 : 6}
                                    maxDistance={4}
                                    eyeColor="white"
                                    pupilColor="#2D2D2D"
                                    isBlinking={isBlackBlinking}
                                    forceLookX={areCharactersExcited ? 0 : isLookingAtEachOther ? 0 : undefined}
                                    forceLookY={areCharactersExcited ? -6 : isLookingAtEachOther ? -4 : undefined}
                                />
                            </div>
                            {areCharactersExcited && <div className={styles.smile} style={{ left: '38px', top: '70px', width: '3rem' }} />}
                        </div>

                        {/* Orange character */}
                        <div
                            ref={orangeRef}
                            className={`${styles.character} ${styles.orange}`}
                            style={{
                                height: areCharactersExcited ? '220px' : '200px',
                                transform: areCharactersExcited ? 'translateY(-10px)' : 'translateY(0)',
                            }}
                        >
                            <div className={styles.pupils} style={{ left: '82px', top: areCharactersExcited ? '80px' : '90px' }}>
                                <Pupil size={areCharactersExcited ? 14 : 12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={areCharactersExcited ? 0 : undefined} forceLookY={areCharactersExcited ? -6 : undefined} />
                                <Pupil size={areCharactersExcited ? 14 : 12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={areCharactersExcited ? 0 : undefined} forceLookY={areCharactersExcited ? -6 : undefined} />
                            </div>
                            {areCharactersExcited && <div className={styles.smile} style={{ left: '80px', top: '125px' }} />}
                        </div>

                        {/* Yellow character */}
                        <div
                            ref={yellowRef}
                            className={`${styles.character} ${styles.yellow}`}
                            style={{
                                height: areCharactersExcited ? '250px' : '230px',
                                transform: areCharactersExcited ? 'translateY(-15px)' : 'translateY(0)',
                            }}
                        >
                            <div className={styles.pupils} style={{ left: '52px', top: areCharactersExcited ? '30px' : '40px' }}>
                                <Pupil size={areCharactersExcited ? 14 : 12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={areCharactersExcited ? 0 : undefined} forceLookY={areCharactersExcited ? -6 : undefined} />
                                <Pupil size={areCharactersExcited ? 14 : 12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={areCharactersExcited ? 0 : undefined} forceLookY={areCharactersExcited ? -6 : undefined} />
                            </div>
                            <div className={areCharactersExcited ? styles.smile : styles.mouth} style={{ left: '40px', top: areCharactersExcited ? '80px' : '88px' }} />
                        </div>
                    </div>
                </div>

                <div className={styles.footerLinks}>
                    <a href="#">Privacy Policy</a>
                    <a href="#">Terms of Service</a>
                    <a href="#">Contact</a>
                </div>
            </div>

            {/* Right Signup Section */}
            <div className={styles.rightSection}>
                <div className={styles.signupForm}>
                    <div className={styles.mobileLogo}>
                        <div className={styles.logoIcon}>⚔️</div>
                        <span>MLBattle</span>
                    </div>

                    <div className={styles.header}>
                        <h1>Create your account</h1>
                        <p>Join the ML competition platform</p>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.formGroup}>
                            <Label htmlFor="name">Name (Your Kaggle Display Name)</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="Your name on Kaggle leaderboards"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                onFocus={() => setIsTyping(true)}
                                onBlur={() => setIsTyping(false)}
                                required
                            />
                            <small style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                                Use the exact name shown on Kaggle leaderboards for ELO matching
                            </small>
                        </div>

                        <div className={styles.formGroup}>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="john@example.com"
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
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setPasswordStrength(checkPasswordStrength(e.target.value));
                                    }}
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
                            {password && (
                                <div className={styles.passwordStrength}>
                                    <div className={styles.strengthBar}>
                                        <div 
                                            className={styles.strengthFill} 
                                            style={{ 
                                                width: `${(passwordStrength.score / 5) * 100}%`,
                                                backgroundColor: passwordStrength.color 
                                            }} 
                                        />
                                    </div>
                                    <span className={styles.strengthLabel} style={{ color: passwordStrength.color }}>
                                        {passwordStrength.label}
                                    </span>
                                    <div className={styles.strengthChecks}>
                                        <span className={passwordStrength.checks.minLength ? styles.checkPass : styles.checkFail}>
                                            {passwordStrength.checks.minLength ? '✓' : '✗'} 8+ characters
                                        </span>
                                        <span className={passwordStrength.checks.hasUppercase ? styles.checkPass : styles.checkFail}>
                                            {passwordStrength.checks.hasUppercase ? '✓' : '✗'} Uppercase
                                        </span>
                                        <span className={passwordStrength.checks.hasLowercase ? styles.checkPass : styles.checkFail}>
                                            {passwordStrength.checks.hasLowercase ? '✓' : '✗'} Lowercase
                                        </span>
                                        <span className={passwordStrength.checks.hasNumber ? styles.checkPass : styles.checkFail}>
                                            {passwordStrength.checks.hasNumber ? '✓' : '✗'} Number
                                        </span>
                                        <span className={passwordStrength.checks.hasSpecial ? styles.checkPass : styles.checkFail}>
                                            {passwordStrength.checks.hasSpecial ? '✓' : '✗'} Special (!@#$...)
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className={styles.formGroup}>
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <div className={styles.passwordWrapper}>
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className={styles.eyeButton}
                                >
                                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                                </button>
                            </div>
                        </div>



                        {error && (
                            <div className={styles.errorMessage}>
                                {error}
                            </div>
                        )}

                        <Button type="submit" variant="primary" size="lg" disabled={isLoading} style={{ width: '100%' }}>
                            {isLoading ? 'Creating account...' : 'Create Account'}
                        </Button>
                    </form>



                    <div className={styles.signupLink}>
                        Already have an account?{' '}
                        <a href="/login">Log in</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
