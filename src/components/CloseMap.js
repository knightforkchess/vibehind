// src/components/CloseMap.js
import React, { useState } from 'react';
import './styles/CloseMap.css';

// Yakındakiler verisi simülasyonu
const fetchNearbyUsers = () => {
    const genders = ['Kadın', 'Erkek'];
    const ages = [22, 24, 25, 26, 27, 28, 29, 30, 31, 32];
    
    return Array.from({ length: 6 }, (_, index) => {
        const gender = genders[Math.floor(Math.random() * genders.length)];
        const age = ages[Math.floor(Math.random() * ages.length)];
        const distance = (Math.random() * 5 + 0.5).toFixed(1);
        
        return {
            id: `nearby-${index}`,
            gender,
            age,
            distance: `${distance} km uzakta`,
            thumbnail: `https://i.pravatar.cc/300?img=${index + 30}`,
            lat: Math.random() * 0.1 + 41.0082, // İstanbul koordinatları civarı
            lng: Math.random() * 0.1 + 28.9784
        };
    });
};

export default function CloseMap({ onUserClick }) {
    const [nearbyUsers] = useState(fetchNearbyUsers());
    const [showPremiumModal, setShowPremiumModal] = useState(false);

    const handleCardClick = (user) => {
        setShowPremiumModal(true);
    };

    return (
        <>
            <div className="close-map-container">
                <div className="map-wrapper">
                    <div className="map-background">
                        {/* Harita görseli simülasyonu */}
                        <div className="map-image">
                            <div className="map-grid"></div>
                        </div>
                        
                        {/* Kullanıcının konumu */}
                        <div className="user-location-marker">
                            <div className="location-pulse"></div>
                            <div className="location-icon">
                                <span className="material-icons">my_location</span>
                            </div>
                            <div className="location-label">Siz</div>
                        </div>
                        
                        {/* Card öngösterimleri */}
                        {nearbyUsers.map((user, index) => {
                            // Daha dağınık ve doğal pozisyonlar
                            const positions = [
                                { left: '15%', top: '20%' },
                                { left: '65%', top: '15%' },
                                { left: '35%', top: '45%' },
                                { left: '75%', top: '50%' },
                                { left: '20%', top: '70%' },
                                { left: '60%', top: '75%' }
                            ];
                            const pos = positions[index] || { left: '50%', top: '50%' };
                            
                            return (
                            <div
                                key={user.id}
                                className="map-card-preview"
                                style={{
                                    left: pos.left,
                                    top: pos.top,
                                    transform: `translate(-50%, -50%) rotate(${(index % 2 === 0 ? 1 : -1) * (index * 3)}deg)`
                                }}
                                onClick={() => handleCardClick(user)}
                            >
                                <div className="card-preview-image">
                                    <img 
                                        src={user.thumbnail} 
                                        alt={`${user.gender}, ${user.age}`}
                                        className="blurred-image"
                                    />
                                    <div className="card-preview-overlay">
                                        <div className="card-preview-info">
                                            <span className="card-preview-gender">{user.gender}</span>
                                            <span className="card-preview-age">{user.age}</span>
                                        </div>
                                        <div className="card-preview-distance">
                                            <span className="material-icons">location_on</span>
                                            <span>{user.distance}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Premium Modal */}
            {showPremiumModal && (
                <div className="close-map-premium-overlay" onClick={() => setShowPremiumModal(false)}>
                    <div className="close-map-premium-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="close-map-premium-header">
                            <div className="close-map-premium-icon-wrapper">
                                <span className="material-icons">workspace_premium</span>
                            </div>
                            <h2>Premium Özellik</h2>
                            <button 
                                className="close-map-premium-close-btn"
                                onClick={() => setShowPremiumModal(false)}
                            >
                                <span className="material-icons">close</span>
                            </button>
                        </div>
                        <div className="close-map-premium-content">
                            <div className="close-map-premium-feature-icon">
                                <span className="material-icons">location_on</span>
                            </div>
                            <h3>Yakındakileri Görüntüle</h3>
                            <p className="close-map-premium-description">
                                Yakındakileri görüntülemek premium üyelere özeldir. Bu özellik ile:
                            </p>
                            <ul className="close-map-premium-features">
                                <li>
                                    <span className="material-icons">check_circle</span>
                                    <span>Yakınındaki kişileri harita üzerinde görebilirsiniz</span>
                                </li>
                                <li>
                                    <span className="material-icons">check_circle</span>
                                    <span>Detaylı profil bilgilerine erişebilirsiniz</span>
                                </li>
                                <li>
                                    <span className="material-icons">check_circle</span>
                                    <span>Mesafe ve konum bilgilerini görebilirsiniz</span>
                                </li>
                                <li>
                                    <span className="material-icons">check_circle</span>
                                    <span>Filtreleme ve arama özellikleri</span>
                                </li>
                            </ul>
                            <button 
                                className="close-map-premium-upgrade-btn"
                                onClick={() => {
                                    console.log('Premium upgrade clicked');
                                    setShowPremiumModal(false);
                                }}
                            >
                                <span className="material-icons">star</span>
                                <span>Premium'a Geç</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

