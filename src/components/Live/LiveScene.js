import React, { useState, useRef, useEffect } from 'react';
import LiveChat from './LiveChat';
import api from '../../services/api';
import './LiveScene.css';

export default function LiveScene({ liveStream, mediaStream, onEndLive }) {
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [showChat, setShowChat] = useState(true);
    const videoRef = useRef(null);
    const [cameraEnabled, setCameraEnabled] = useState(true);
    const [micEnabled, setMicEnabled] = useState(true);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        if (videoRef.current && mediaStream) {
            videoRef.current.srcObject = mediaStream;
        }
    }, [mediaStream]);

    useEffect(() => {
        // Duration timer
        const timer = setInterval(() => {
            setDuration(prev => prev + 1);
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatDuration = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const toggleCamera = () => {
        if (mediaStream) {
            const videoTrack = mediaStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setCameraEnabled(videoTrack.enabled);
            }
        }
    };

    const toggleMic = () => {
        if (mediaStream) {
            const audioTrack = mediaStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setMicEnabled(audioTrack.enabled);
            }
        }
    };

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

    const handleEndStream = async () => {
        if (window.confirm('Canlı yayını sonlandırmak istediğinize emin misiniz?')) {
            try {
                await api.post(`/livestreams/${liveStream._id}/end`);
                
                // Stop media stream
                if (mediaStream) {
                    mediaStream.getTracks().forEach(track => track.stop());
                }
                
                if (onEndLive) {
                    onEndLive();
                }
            } catch (error) {
                console.error('End live error:', error);
                alert('Yayın sonlandırılamadı');
            }
        }
    };

    return (
        <div className="live-scene">
            <div className="live-video-container">
                <video
                    ref={videoRef}
                    className="live-video"
                    autoPlay
                    playsInline
                    muted
                />
                
                {!cameraEnabled && (
                    <div className="camera-off-overlay">
                        <span className="material-icons">videocam_off</span>
                        <p>Kamera Kapalı</p>
                    </div>
                )}

                <div className="live-video-overlay">
                    <div className="live-overlay-top">
                        <div className="live-badge">
                            <span className="material-icons">fiber_manual_record</span>
                            <span>CANLI</span>
                        </div>
                        <div className="live-stats">
                            <div className="stat-item">
                                <span className="material-icons">visibility</span>
                                <span>{liveStream.viewerCount || 0}</span>
                            </div>
                            <div className="stat-item">
                                <span className="material-icons">schedule</span>
                                <span>{formatDuration(duration)}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="stream-info">
                        <h2>{liveStream.title}</h2>
                        {liveStream.description && <p>{liveStream.description}</p>}
                        <span className="category-badge">{liveStream.category}</span>
                    </div>

                    <div className="live-overlay-controls">
                        <button 
                            className={`control-btn ${cameraEnabled ? 'active' : 'inactive'}`}
                            onClick={toggleCamera}
                        >
                            <span className="material-icons">
                                {cameraEnabled ? 'videocam' : 'videocam_off'}
                            </span>
                        </button>
                        <button 
                            className={`control-btn ${micEnabled ? 'active' : 'inactive'}`}
                            onClick={toggleMic}
                        >
                            <span className="material-icons">
                                {micEnabled ? 'mic' : 'mic_off'}
                            </span>
                        </button>
                        <button className="control-btn" onClick={toggleChat}>
                            <span className="material-icons">
                                {showChat ? 'chat' : 'chat_bubble_outline'}
                            </span>
                        </button>
                        <button className="control-btn end-btn" onClick={handleEndStream}>
                            <span className="material-icons">call_end</span>
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

            {showChat && <LiveChat streamId={liveStream._id} />}
        </div>
    );
}

