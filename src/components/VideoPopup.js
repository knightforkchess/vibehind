import React from 'react';
import '../styles/VideoPopup.css';

export default function VideoPopup({ isOpen, onClose, videoUrl }) {
    if (!isOpen) return null;

    // Extract video ID from YouTube URL
    const getYouTubeEmbedUrl = (url) => {
        const videoId = url.split('?')[0].split('/').pop();
        return `https://www.youtube.com/embed/${videoId}`;
    };

    return (
        <div className="video-overlay" onClick={onClose}>
            <div className="video-modal" onClick={(e) => e.stopPropagation()}>
                <button className="video-close" onClick={onClose}>
                    <span className="material-icons">close</span>
                </button>

                <div className="video-header">
                    <h2 className="video-title">✨ Vibehind'i Keşfet</h2>
                    <p className="video-subtitle">Nasıl çalıştığını öğren</p>
                </div>

                <div className="video-container">
                    <iframe
                        src={getYouTubeEmbedUrl(videoUrl)}
                        title="Vibehind Tanıtım Videosu"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>

                <div className="video-footer">
                    <p>💕 Hemen başla ve özel insanlarla tanış!</p>
                </div>
            </div>
        </div>
    );
}
