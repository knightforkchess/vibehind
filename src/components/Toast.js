import React, { useEffect } from 'react';
import '../styles/Toast.css';

export default function Toast({ message, link, linkText, onClose, duration = 3000 }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div className="toast-overlay">
            <div className="toast-container">
                <div className="toast-icon">
                    <span className="material-icons">bookmark</span>
                </div>
                <div className="toast-content">
                    <p className="toast-message">{message}</p>
                    {link && linkText && (
                        <button className="toast-link" onClick={link}>
                            {linkText}
                        </button>
                    )}
                </div>
                <button className="toast-close" onClick={onClose}>
                    <span className="material-icons">close</span>
                </button>
            </div>
        </div>
    );
}
