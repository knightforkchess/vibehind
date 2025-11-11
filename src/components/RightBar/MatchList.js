// src/components/RightBar/MatchList.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import socketService from '../../services/socket';
import './styles/MatchList.css';

export default function MatchList({ onMatchSelect, selectedMatch }) {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMatches();

        // Listen for online/offline status changes
        let unsubscribe = () => {};
        
        try {
            unsubscribe = socketService.onOnlineStatusChange((userId, isOnline) => {
                setMatches(prevMatches => 
                    prevMatches.map(match => 
                        match.userId === userId 
                            ? { ...match, online: isOnline }
                            : match
                    )
                );
            });
        } catch (error) {
            console.error('Failed to subscribe to online status:', error);
        }

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, []);

    const fetchMatches = async () => {
        try {
            setLoading(true);
            const response = await api.get('/matches');
            
            const formattedMatches = response.data.map(match => ({
                id: match._id,
                userId: match.user._id,
                fullName: match.user.username,
                thumbnail: match.user.profilePicture || '/logo192.png',
                online: match.user.isOnline || false,
                lastMessage: match.lastMessage,
                lastMessageAt: match.lastMessageAt,
                matchedAt: match.matchedAt
            }));
            
            setMatches(formattedMatches);
        } catch (error) {
            console.error('Failed to fetch matches:', error);
            setMatches([]);
        } finally {
            setLoading(false);
        }
    };

    const formatLastMessageTime = (date) => {
        if (!date) return '';
        const now = new Date();
        const messageDate = new Date(date);
        const diffMs = now - messageDate;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Şimdi';
        if (diffMins < 60) return `${diffMins}d önce`;
        if (diffHours < 24) return `${diffHours}s önce`;
        if (diffDays < 7) return `${diffDays}g önce`;
        return messageDate.toLocaleDateString('tr-TR');
    };

    if (loading) {
        return (
            <div className="match-list-container">
                <div className="match-list-header">
                    <h2>Eşleşmeler</h2>
                </div>
                <div className="loading-matches">Yükleniyor...</div>
            </div>
        );
    }

    return (
        <div className="match-list-container">
            <div className="match-list-header">
                <h2>Eşleşmeler</h2>
                <span className="match-count">{matches.length} eşleşme</span>
            </div>
            {matches.length === 0 ? (
                <div className="no-matches">
                    <span className="material-icons">favorite_border</span>
                    <p>Henüz eşleşmeniz yok</p>
                    <p className="no-matches-hint">Keşfet sekmesinden kullanıcıları beğenmeye başlayın!</p>
                </div>
            ) : (
                <ul className="match-list">
                    {matches.map((match) => (
                        <li 
                            key={match.id} 
                            className={`match-item ${selectedMatch?.id === match.id ? 'active' : ''}`}
                            onClick={() => onMatchSelect?.(match)}
                        >
                            <div className="match-avatar-wrapper">
                                <img 
                                    src={match.thumbnail} 
                                    alt={match.fullName}
                                    className="match-avatar"
                                />
                                {match.online && (
                                    <span className="match-online-dot"></span>
                                )}
                            </div>
                            <div className="match-info">
                                <div className="match-name-row">
                                    <h3 className="match-name">{match.fullName}</h3>
                                    {match.lastMessageAt && (
                                        <span className="match-time">{formatLastMessageTime(match.lastMessageAt)}</span>
                                    )}
                                </div>
                                <div className="match-last-message">
                                    {match.lastMessage ? (
                                        <p className="last-message-text">{match.lastMessage.content}</p>
                                    ) : (
                                        <p className="no-message-text">Sohbete başlayın! 💬</p>
                                    )}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

