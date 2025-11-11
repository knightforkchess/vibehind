// src/components/RightBar/LiveList.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './styles/LiveList.css';

export default function LiveList({ onLiveSelect }) {
    const [lives, setLives] = useState([]);

    useEffect(() => {
        const fetchActiveLives = async () => {
            try {
                const response = await api.get('/users/live/active');
                setLives(response.data);
            } catch (error) {
                console.error('Failed to fetch active live streams:', error);
            }
        };

        fetchActiveLives();
    }, []);

    return (
        <div className="live-list-container">
            <div className="live-list-header">
                <h2>Canlı Yayınlar</h2>
                <span className="live-count">{lives.length} yayın</span>
            </div>
            <div className="live-list">
                {lives.map((live) => (
                    <div 
                        key={live._id} 
                        className="live-list-item"
                        onClick={() => onLiveSelect?.(live)}
                    >
                        <div className="live-list-thumbnail">
                            <img src={live.thumbnail || '/logo192.png'} alt={live.title} />
                            <div className="live-list-badge">
                                <span className="material-icons">fiber_manual_record</span>
                            </div>
                            <div className="live-list-viewers">
                                <span className="material-icons">visibility</span>
                                <span>{live.viewers}</span>
                            </div>
                        </div>
                        <div className="live-list-info">
                            <h3 className="live-list-name">{live.title}</h3>
                            <p className="live-list-city">
                                <span className="material-icons">location_on</span>
                                {live.city || 'Bilinmeyen Konum'}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

