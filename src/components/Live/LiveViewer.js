import React, { useState, useRef, useEffect } from 'react';
import LiveChat from './LiveChat';
import api from '../../services/api';
import './LiveViewer.css';

export default function LiveViewer({ liveStream, onClose }) {
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [showChat, setShowChat] = useState(true);
    const videoRef = useRef(null);

    useEffect(() => {
        // Join the stream
        const joinStream = async () => {
            try {
                await api.post(`/livestreams/${liveStream.id}/join`);
            } catch (error) {
                console.error('Failed to join stream:', error);
            }
        };

        joinStream();

        return () => {
            // Leave the stream
            const leaveStream = async () => {
                try {
                    await api.post(`/livestreams/${liveStream.id}/leave`);
                } catch (error) {
                    console.error('Failed to leave stream:', error);
                }
            };
            leaveStream();
        };
    }, [liveStream.id]);

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
        <div className="live-viewer">
            <div className="live-video-container">
                <video
                    ref={videoRef}
                    className="live-video"
                    autoPlay
                    playsInline
                    poster={liveStream.thumbnail}
                />

                <div className="live-video-overlay">
                    <div className="live-overlay-top">
                        <div className="live-badge">
                            <span className="material-icons">fiber_manual_record</span>
                            <span>CANLI</span>
                        </div>
                        <div className="live-stats">
                            <div className="stat-item">
                                <span className="material-icons">visibility</span>
                                <span>{liveStream.viewers || 0}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="stream-info">
                        <div className="host-info">
                            <img 
                                src={liveStream.thumbnail || '/logo192.png'} 
                                alt={liveStream.fullName}
                                className="host-avatar"
                            />
                            <div>
                                <h2>{liveStream.title}</h2>
                                <p className="host-name">{liveStream.fullName}</p>
                            </div>
                        </div>
                        <span className="category-badge">{liveStream.category}</span>
                    </div>

                    <div className="live-overlay-controls">
                        <button className="control-btn" onClick={toggleChat}>
                            <span className="material-icons">
                                {showChat ? 'chat' : 'chat_bubble_outline'}
                            </span>
                        </button>
                        <button className="control-btn close-btn" onClick={onClose}>
                            <span className="material-icons">close</span>
                        </button>
                    </div>

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
            </div>

            {showChat && <LiveChat streamId={liveStream.id} />}
        </div>
    );
}
