// src/components/LiveContent.js
import React, { useState, useEffect } from 'react';
import LiveScene from './Live/LiveScene';
import BeforeLive from './Feed/BeforeLive';
import '../styles/LiveContent.css';
import api from '../services/api';

export default function LiveContent({ onLiveSelect }) {
    const [myLiveStream, setMyLiveStream] = useState(null);
    const [mediaStream, setMediaStream] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkMyLiveStream();
    }, []);

    const checkMyLiveStream = async () => {
        try {
            setLoading(true);
            const response = await api.get('/livestreams/my-stream');
            setMyLiveStream(response.data);
            onLiveSelect?.(response.data);
        } catch (error) {
            // Aktif yayın yok, BeforeLive göster
            console.log('No active stream');
        } finally {
            setLoading(false);
        }
    };

    const handleLiveStart = (stream, media) => {
        setMyLiveStream(stream);
        setMediaStream(media);
        onLiveSelect?.(stream);
    };

    const handleLiveEnd = () => {
        setMyLiveStream(null);
        setMediaStream(null);
    };

    if (loading) {
        return (
            <div className="live-content-loading">
                <div className="loading-spinner">Yükleniyor...</div>
            </div>
        );
    }

    if (!myLiveStream) {
        return (
            <div className="live-content">
                <BeforeLive onLiveStart={handleLiveStart} />
            </div>
        );
    }

    return (
        <div className="live-content">
            <LiveScene 
                liveStream={myLiveStream} 
                mediaStream={mediaStream}
                onEndLive={handleLiveEnd}
            />
        </div>
    );
}

