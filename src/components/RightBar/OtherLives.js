// src/components/RightBar/OtherLives.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import socketService from '../../services/socket';
import './styles/OtherLives.css';

export default function OtherLives({ onLiveSelect }) {
    const [lives, setLives] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchActiveLiveStreams();

        // Socket listener for new streams
        const socket = socketService.socket;
        if (socket) {
            socket.on('stream-started', (data) => {
                console.log('New stream started:', data);
                
                // Null check for host data
                if (!data || !data.host) {
                    console.error('Invalid stream data:', data);
                    return;
                }

                const newLive = {
                    id: data.streamId,
                    fullName: data.host.username || 'Anonim',
                    thumbnail: data.host.profilePicture || '/logo192.png',
                    viewers: data.viewerCount || 0,
                    title: data.title || 'Başlıksız Yayın',
                    category: data.category || 'Sohbet',
                    hostId: data.host._id,
                    isOnline: data.host.isOnline || false
                };
                setLives(prev => [newLive, ...prev]);
            });

            socket.on('stream-ended', (data) => {
                console.log('Stream ended:', data);
                if (data && data.streamId) {
                    setLives(prev => prev.filter(live => live.id !== data.streamId));
                }
            });
        }

        return () => {
            if (socket) {
                socket.off('stream-started');
                socket.off('stream-ended');
            }
        };
    }, []);

    const fetchActiveLiveStreams = async () => {
        try {
            setLoading(true);
            const response = await api.get('/livestreams/active');
            
            const formattedLives = response.data.streams.map(stream => ({
                id: stream._id,
                fullName: stream.host.username,
                thumbnail: stream.host.profilePicture || '/logo192.png',
                viewers: stream.viewerCount || 0,
                title: stream.title,
                category: stream.category,
                streamKey: stream.streamKey,
                hostId: stream.host._id,
                isOnline: stream.host.isOnline || false
            }));
            
            setLives(formattedLives);
        } catch (error) {
            console.error('Failed to fetch live streams:', error);
            setLives([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="other-lives-container">
                <div className="other-lives-header">
                    <h2>Canlı Yayınlar</h2>
                </div>
                <div className="loading-lives">Yükleniyor...</div>
            </div>
        );
    }

    if (lives.length === 0) {
        return (
            <div className="other-lives-container">
                <div className="other-lives-header">
                    <h2>Canlı Yayınlar</h2>
                    <span className="live-count">0 yayın</span>
                </div>
                <div className="no-lives">
                    <span className="material-icons">videocam_off</span>
                    <p>Şu anda aktif yayın yok</p>
                </div>
            </div>
        );
    }

    return (
        <div className="other-lives-container">
            <div className="other-lives-header">
                <h2>Canlı Yayınlar</h2>
                <span className="live-count">{lives.length} yayın</span>
            </div>
            <div className="other-lives-list">
                {lives.map((live) => (
                    <div 
                        key={live.id} 
                        className="other-lives-item"
                        onClick={() => onLiveSelect?.(live)}
                    >
                        <div className="other-lives-thumbnail">
                            <img src={live.thumbnail} alt={live.fullName} />
                            <div className="other-lives-badge">
                                <span className="material-icons">fiber_manual_record</span>
                                CANLI
                            </div>
                            <div className="other-lives-viewers">
                                <span className="material-icons">visibility</span>
                                <span>{live.viewers}</span>
                            </div>
                        </div>
                        <div className="other-lives-info">
                            <h3 className="other-lives-name">{live.fullName}</h3>
                            <p className="other-lives-title">{live.title}</p>
                            <span className="other-lives-category">{live.category}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

