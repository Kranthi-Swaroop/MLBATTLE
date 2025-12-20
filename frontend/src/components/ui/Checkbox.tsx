import React from 'react';
import styles from './Checkbox.module.css';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export function Checkbox({ className = '', label, ...props }: CheckboxProps) {
    return (
        <div className={styles.checkboxWrapper}>
            <input
                type="checkbox"
                className={`${styles.checkbox} ${className}`.trim()}
                {...props}
            />
            <span className={styles.checkmark}>
                <svg viewBox="0 0 12 12" fill="none">
                    <path
                        d="M2 6L5 9L10 3"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </span>
        </div>
    );
}
