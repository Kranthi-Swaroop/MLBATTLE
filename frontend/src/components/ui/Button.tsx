import React from 'react';
import styles from './Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
    size?: 'default' | 'sm' | 'lg';
    children: React.ReactNode;
}

export function Button({ 
    variant = 'primary', 
    size = 'default', 
    className = '', 
    children, 
    ...props 
}: ButtonProps) {
    const classes = `${styles.button} ${styles[variant]} ${styles[size]} ${className}`.trim();
    
    return (
        <button className={classes} {...props}>
            {children}
        </button>
    );
}
