import React, { useState, useEffect } from 'react';
import userService from '../services/user';
import './styles/Profile.css';

export default function Profile() {
    const [activeTab, setActiveTab] = useState('photos');
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userData = await userService.getCurrentUser();
                setUser(userData);
            } catch (error) {
                console.error('Failed to fetch user data:', error);
            }
        };

        fetchUserData();
    }, []);

    const handleEditProfile = () => {
        console.log('Edit Profile button clicked');
        // Implement navigation or modal for editing profile
    };

    if (!user) {
        return <p>Loading...</p>;
    }

    return (
        <div className="profile-container">
            {/* Cover Photo */}
            <div className="profile-cover">
                <img src={user.profilePicture || '/logo192.png'} alt="Cover" />
            </div>

            {/* Profile Info */}
            <div className="profile-info">
                <div className="profile-photo">
                    <img src={user.profilePicture || '/logo192.png'} alt={user.username} />
                    {user.verified && (
                        <span className="verified-badge">
                            <span className="material-icons">verified</span>
                        </span>
                    )}
                </div>
                
                <h1 className="profile-name">
                    {user.username}, {user.age || 'N/A'}
                </h1>
                
                <div className="profile-location">
                    <span className="material-icons">location_on</span>
                    <span>{user.location?.coordinates ? `(${user.location.coordinates[0]}, ${user.location.coordinates[1]})` : 'Konum belirtilmedi'}</span>
                </div>

                <div className="profile-stats">
                    <div className="stat-item">
                        <span className="stat-value">{user.followers?.length || 0}</span>
                        <span className="stat-label">Takipçi</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">{user.following?.length || 0}</span>
                        <span className="stat-label">Takip</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">{user.likesCount || 0}</span>
                        <span className="stat-label">Beğeni</span>
                    </div>
                </div>

                <p className="profile-bio">{user.bio || 'Biyografi eklenmedi'}</p>

                <div className="profile-interests">
                    {user.interests?.map((interest, index) => (
                        <span key={index} className="interest-tag">
                            {interest}
                        </span>
                    )) || 'İlgi alanları belirtilmedi'}
                </div>

                <button className="edit-profile-btn" onClick={handleEditProfile}>
                    Profili Düzenle
                </button>
            </div>

            {/* Profile Tabs */}
            <div className="profile-tabs">
                <button 
                    className={`tab-button ${activeTab === 'photos' ? 'active' : ''}`}
                    onClick={() => setActiveTab('photos')}
                >
                    <span className="material-icons">photo_library</span>
                    <span>Fotoğraflar</span>
                </button>
                <button 
                    className={`tab-button ${activeTab === 'likes' ? 'active' : ''}`}
                    onClick={() => setActiveTab('likes')}
                >
                    <span className="material-icons">favorite</span>
                    <span>Beğeniler</span>
                </button>
                <button 
                    className={`tab-button ${activeTab === 'saved' ? 'active' : ''}`}
                    onClick={() => setActiveTab('saved')}
                >
                    <span className="material-icons">bookmark</span>
                    <span>Kaydedilenler</span>
                </button>
            </div>

            {/* Profile Content */}
            <div className="profile-content">
                {activeTab === 'photos' && (
                    <div className="photos-grid">
                        {user.photos?.map((photo, index) => (
                            <div key={index} className="photo-item">
                                <img src={photo} alt={`Photo ${index + 1}`} />
                            </div>
                        )) || 'Fotoğraf bulunamadı'}
                    </div>
                )}
                {activeTab === 'likes' && (
                    <div className="likes-placeholder">
                        <span className="material-icons">favorite</span>
                        <p>Beğendiğin gönderiler burada görünecek</p>
                    </div>
                )}
                {activeTab === 'saved' && (
                    <div className="saved-placeholder">
                        <span className="material-icons">bookmark</span>
                        <p>Kaydettiğin gönderiler burada görünecek</p>
                    </div>
                )}
            </div>
        </div>
    );
}