import React, { useEffect, useState } from 'react';
import '../styles/LeftBar/Header.css';
import userService from '../../services/user';
import { useNavigate } from 'react-router-dom';

export default function LeftHeader() {
    const [user, setUser] = useState({
        name: 'Kullanıcı',
        profileImage: '/logo192.png',
        matches: 0,
        likes: 0,
        verified: false
    });
    const [showSignOutPopup, setShowSignOutPopup] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        let mounted = true;
        userService.getCurrentUser()
            .then(u => {
                if (!mounted) return;
                if (!u) return;
                setUser({
                    name: u.username || 'Kullanıcı',
                    profileImage: u.profilePicture || '/logo192.png',
                    matches: (u.followers && u.followers.length) || 0,
                    likes: u.likesCount || 0,
                    verified: !!u.verified
                });
            })
            .catch(() => {
                // keep defaults
            });
        return () => { mounted = false };
    }, []);

    const handleSignOut = () => {
        console.log('Sign-out initiated');
        userService.signOut(); // Clear session
        console.log('Token removed from localStorage');
        window.dispatchEvent(new Event('signOut')); // Dispatch signOut event
        console.log('Sign-out event dispatched');
        navigate('/'); // Redirect to landing page
        console.log('Redirection to landing page triggered');
    };

    return (
        <div className='left-header'>
            <div className='profile-section'>
                <div className='profile-avatar'>
                    <img src={user.profileImage} alt="Profile" />
                    {user.verified && (
                        <span className="verified-badge">
                            <span className="material-icons">verified</span>
                        </span>
                    )}
                </div>
                <div className='profile-info'>
                    <h3 className='profile-name'>{user.name}</h3>
                    <div className='stats-inline'>
                        <span className='stat-item'>
                            <span className="material-icons">favorite</span>
                            {user.likes}
                        </span>
                        <span className='stat-divider'></span>
                        <span className='stat-item'>
                            <span className="material-icons">people</span>
                            {user.matches}
                        </span>
                    </div>
                </div>
            </div>

            {showSignOutPopup && (
                <div className='sign-out-overlay' onClick={() => setShowSignOutPopup(false)}>
                    <div className='sign-out-popup' onClick={(e) => e.stopPropagation()}>
                        <h4>Çıkış Yap</h4>
                        <p>Oturumu kapatmak istediğinize emin misiniz?</p>
                        <div className='popup-buttons'>
                            <button className='cancel-btn' onClick={() => setShowSignOutPopup(false)}>İptal</button>
                            <button className='confirm-btn' onClick={handleSignOut}>Çıkış Yap</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}