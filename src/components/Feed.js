// src/components/Feed.js
import React, { useState, useEffect } from 'react';
import Content from './Feed/Content';
import BeforeLive from './Feed/BeforeLive';
import LiveScreen from './Feed/LiveScreen';
import MapComponent from './MapComponent';
import Profile from './Profile';
import LiveScene from './Live/LiveScene';
import '../styles/Feed.css';

export default function Feed({ onPostSelect, isCloseMode, isProfileMode, isLiveMode, selectedLive }) {
    const [mapVisible, setMapVisible] = useState(false);
    const [activeProfile, setActiveProfile] = useState(null);
    const [myLiveStream, setMyLiveStream] = useState(null);
    const [mediaStream, setMediaStream] = useState(null);
    const [isMyLiveActive, setIsMyLiveActive] = useState(false);

    useEffect(() => {
        setMapVisible(isCloseMode);
    }, [isCloseMode]);

    const handleProfileChange = (profile) => {
        setActiveProfile(profile);
        if (onPostSelect) {
            onPostSelect(profile);
        }
    };

    const handleLiveStart = (stream, media) => {
        setMyLiveStream(stream);
        setMediaStream(media);
        setIsMyLiveActive(true);
        console.log('My live stream started:', stream);
    };

    const handleEndLive = () => {
        setMyLiveStream(null);
        setMediaStream(null);
        setIsMyLiveActive(false);
    };

    const showNormalFeed = !selectedLive && !isMyLiveActive && !isLiveMode && !isProfileMode;

    return (
        <div className={`feed ${mapVisible ? 'map-mode' : ''} ${isProfileMode ? 'profile-mode' : ''} ${isLiveMode ? 'live-mode' : ''} ${selectedLive ? 'viewing-live' : ''} ${isMyLiveActive ? 'broadcasting-live' : ''}`}>
            {/* Normal Feed Content - Always mounted */}
            <div style={{ 
                display: showNormalFeed ? 'block' : 'none',
                width: '100%',
                height: '100%'
            }}>
                <div className={`feed-content ${mapVisible ? 'hidden' : ''}`}>
                    <Content onProfileChange={handleProfileChange} />
                </div>
                <div className={`map-view ${mapVisible ? 'visible' : ''}`}>
                    <MapComponent />
                </div>
            </div>

            {/* Viewing someone else's live stream */}
            {selectedLive && (
                <LiveScreen liveStream={selectedLive} />
            )}
            
            {/* Broadcasting my own live stream */}
            {isMyLiveActive && myLiveStream && (
                <LiveScene 
                    liveStream={myLiveStream} 
                    mediaStream={mediaStream}
                    onEndLive={handleEndLive}
                />
            )}
            
            {/* Preparing to go live */}
            {isLiveMode && !isMyLiveActive && (
                <BeforeLive onLiveStart={handleLiveStart} />
            )}
            
            {/* Profile mode */}
            {isProfileMode && (
                <Profile />
            )}
        </div>
    );
}