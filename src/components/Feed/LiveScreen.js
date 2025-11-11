import React, { useRef, useEffect, useState } from 'react';
import LiveChat from '../Live/LiveChat';
import '../../styles/Feed/LiveScreen.css';
import api from '../../services/api';

export default function LiveScreen({ liveStream }) {
    const videoRef = useRef(null);
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [showChat, setShowChat] = useState(true);

    useEffect(() => {
        // Join the stream
        const joinStream = async () => {
            try {
                await api.post(`/livestreams/${liveStream.id}/join`);
            } catch (error) {
                console.error('Failed to join stream:', error);
            }
        };

        if (liveStream && liveStream.id) {
            joinStream();
        }

        return () => {
            // Leave the stream
            const leaveStream = async () => {
                try {
                    if (liveStream && liveStream.id) {
                        await api.post(`/livestreams/${liveStream.id}/leave`);
                    }
                } catch (error) {
                    console.error('Failed to leave stream:', error);
                }
            };
            leaveStream();
        };
    }, [liveStream]);

    const handleLike = () => {
        setIsLiked(!isLiked);
        if (!isLiked) {
            setLikeCount(prev => prev + 1);
        } else {
            setLikeCount(prev => Math.max(0, prev - 1));
        }
    };

    const toggleChat = () => {
        setShowChat(!showChat);
    };

    return (
        <div className="live-screen-container">
            <div className="live-video-section">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    poster={liveStream.thumbnail || undefined}
                    className="live-video"
                />

                {/* Live Badge */}
                <div className="live-badge">
                    <span className="material-icons">fiber_manual_record</span>
                    CANLI
                </div>

                {/* Stats */}
                <div className="live-stats">
                    <div className="stat-item">
                        <span className="material-icons">visibility</span>
                        <span>{liveStream.viewers || 0}</span>
                    </div>
                </div>

                {/* Stream Info */}
                <div className="stream-info-overlay">
                    <div className="host-info">
                        <img 
                            src={liveStream.thumbnail && liveStream.thumbnail.trim() !== '' ? liveStream.thumbnail : '/logo192.png'} 
                            alt={liveStream.fullName || 'Host'}
                            className="host-avatar"
                        />
                        <div>
                            <h2>{liveStream.title}</h2>
                            <p className="host-name">{liveStream.fullName}</p>
                        </div>
                    </div>
                    {liveStream.description && <p className="stream-description">{liveStream.description}</p>}
                    <span className="category-badge">{liveStream.category}</span>
                </div>

                {/* Controls */}
                <div className="live-controls">
                    <button 
                        className="control-btn"
                        onClick={toggleChat}
                        title="Chat"
                    >
                        <span className="material-icons">
                            {showChat ? 'chat' : 'chat_bubble_outline'}
                        </span>
                    </button>
                </div>

                {/* Like Button */}
                <div className="live-actions">
                    <button 
                        className={`like-btn ${isLiked ? 'liked' : ''}`}
                        onClick={handleLike}
                    >
                        <span className="material-icons">
                            {isLiked ? 'favorite' : 'favorite_border'}
                        </span>
                        <span className="like-count">{likeCount}</span>
                    </button>
                </div>
            </div>

            {showChat && <LiveChat streamId={liveStream.id} />}
        </div>
    );
}
