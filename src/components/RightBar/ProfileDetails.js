import React, { useState, lazy, Suspense } from 'react';
import './styles/ProfileDetails.css';

// Lazy load the sections to reduce initial bundle size
const EditProfileSection = lazy(() => import('./ProfileSections/EditProfile'));
const PrivacySection = lazy(() => import('./ProfileSections/Privacy'));
const NotificationsSection = lazy(() => import('./ProfileSections/Notifications'));

const mockUserData = {
    username: "Yasin",
    age: 25,
    location: "İstanbul",
    bio: "Hayatı dolu dolu yaşamayı seven biriyim ✨",
    interests: ["Seyahat", "Fotoğrafçılık", "Müzik", "Spor"],
    verified: true,
    profileCompletion: 85
};

export default function ProfileDetails() {
    const [activeSection, setActiveSection] = useState('edit');
    const user = mockUserData;

    return (
        <div className="profile-details-container">
            <div className="profile-details-header">
                <h2>Profil Detayları</h2>
                <span className="material-icons settings-icon">settings</span>
            </div>

            <div className="completion-card">
                <div className="completion-header">
                    <h3>Profil Tamamlama</h3>
                    <span className="completion-percentage">{user.profileCompletion}%</span>
                </div>
                <div className="completion-bar">
                    <div 
                        className="completion-progress" 
                        style={{ width: `${user.profileCompletion}%` }}
                    />
                </div>
                <p className="completion-tip">
                    Profilini tamamla ve daha fazla eşleşme yakala!
                </p>
            </div>

            <div className="profile-sections">
                <button 
                    className={`section-btn ${activeSection === 'edit' ? 'active' : ''}`}
                    onClick={() => setActiveSection('edit')}
                >
                    <span className="material-icons">edit</span>
                    <span>Profili Düzenle</span>
                </button>
                <button 
                    className={`section-btn ${activeSection === 'privacy' ? 'active' : ''}`}
                    onClick={() => setActiveSection('privacy')}
                >
                    <span className="material-icons">lock</span>
                    <span>Gizlilik</span>
                </button>
                <button 
                    className={`section-btn ${activeSection === 'notifications' ? 'active' : ''}`}
                    onClick={() => setActiveSection('notifications')}
                >
                    <span className="material-icons">notifications</span>
                    <span>Bildirimler</span>
                </button>
            </div>

            <Suspense fallback={<div className="loading-section">Yükleniyor...</div>}>
                <div className="section-content">
                    {activeSection === 'edit' && (
                        <EditProfileSection user={user} />
                    )}
                    {activeSection === 'privacy' && (
                        <PrivacySection user={user} />
                    )}
                    {activeSection === 'notifications' && (
                        <NotificationsSection user={user} />
                    )}
                </div>
            </Suspense>
        </div>
    );
}