import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/LeftBar.css'
import './styles/LeftBar/Navigation.css'
import LeftHeader from './LeftBar/Header'
import userService from '../services/user'

export default function LeftBar({ onLiveClick, isLiveMode, onMatchesClick, isMatchesMode, onCloseClick, isCloseMode, onProfileClick, isProfileMode, onToggleMap }){
    const [isOpen, setIsOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [showSignOutPopup, setShowSignOutPopup] = useState(false);
    const navigate = useNavigate();

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
    };

    const handleSignOut = () => {
        console.log('Sign-out initiated');
        userService.signOut();
        console.log('Token removed from localStorage');
        window.dispatchEvent(new Event('signOut'));
        console.log('Sign-out event dispatched');
        setShowSignOutPopup(false);
        navigate('/');
        console.log('Redirection to landing page triggered');
    };

    return(
        <>
            <div className={`leftbar-overlay ${isOpen ? 'show' : ''}`} onClick={toggleMenu} />
            <button className={`menu-toggle ${isOpen ? 'hide' : ''}`} onClick={toggleMenu}>
                <img src="/logo.jpg" alt="Profile" className="menu-profile-photo" />
            </button>
            <div className={`left-bar ${isOpen ? 'show' : ''}`}>
                <LeftHeader />
                <div className="nav-buttons">
                    <button 
                        className={`nav-button ${!isLiveMode && !isMatchesMode && !isCloseMode ? 'active' : ''}`}
                        onClick={() => {
                            if (isLiveMode) onLiveClick();
                            if (isMatchesMode) onMatchesClick();
                            if (isCloseMode) onCloseClick();
                        }}
                    >
                        <div className="nav-icon-wrapper">
                            <span className="material-icons">explore</span>
                        </div>
                        <span className="nav-text">Keşfet</span>
                        <span className="nav-badge">12</span>
                    </button>
                    <button 
                        className={`nav-button ${isMatchesMode ? 'active' : ''}`}
                        onClick={onMatchesClick}
                    >
                        <div className="nav-icon-wrapper">
                            <span className="material-icons">favorite</span>
                        </div>
                        <span className="nav-text">Eşleşmeler</span>
                        <span className="nav-badge">3</span>
                    </button>
                    <button 
                        className={`nav-button ${isCloseMode ? 'active' : ''}`}
                        onClick={() => {
                            onCloseClick();
                            if (typeof onToggleMap === 'function') {
                                onToggleMap(true); // Trigger map view
                            }
                        }}
                    >
                        <div className="nav-icon-wrapper">
                            <span className="material-icons">location_on</span>
                        </div>
                        <span className="nav-text">Yakınımdakiler</span>
                    </button>
                    <button 
                        className={`nav-button ${isLiveMode ? 'active' : ''}`}
                        onClick={onLiveClick}
                    >
                        <div className="nav-icon-wrapper">
                            <span className="material-icons">videocam</span>
                        </div>
                        <span className="nav-text">Canlı Yayın</span>
                    </button>
                    <button 
                        className={`nav-button ${isProfileMode ? 'active' : ''}`}
                        onClick={onProfileClick}
                    >
                        <div className="nav-icon-wrapper">
                            <span className="material-icons">person</span>
                        </div>
                        <span className="nav-text">Profilim</span>
                    </button>
                </div>
                <div className="bottom-section">
                    <button className="premium-card">
                        <div className="premium-icon">
                            <span className="material-icons">workspace_premium</span>
                        </div>
                        <div className="premium-content">
                            <h4>Premium'a Geç</h4>
                            <p>Sınırsız beğeni ve daha fazlası</p>
                        </div>
                        <span className="material-icons arrow">arrow_forward</span>
                    </button>
                    <div className="bottom-links">
                        <a href="#" className="bottom-link">
                            <span className="material-icons">settings</span>
                            <span>Ayarlar</span>
                        </a>
                        <a href="#" className="bottom-link">
                            <span className="material-icons">help_outline</span>
                            <span>Yardım</span>
                        </a>
                        <button 
                            className="bottom-link signout-link" 
                            onClick={() => setShowSignOutPopup(true)}
                        >
                            <span className="material-icons">logout</span>
                            <span>Çıkış Yap</span>
                        </button>
                    </div>
                </div>
            </div>

            {showSignOutPopup && (
                <div className='leftbar-signout-overlay' onClick={() => setShowSignOutPopup(false)}>
                    <div className='leftbar-signout-popup' onClick={(e) => e.stopPropagation()}>
                        <h4>Çıkış Yap</h4>
                        <p>Oturumu kapatmak istediğinize emin misiniz?</p>
                        <div className='popup-buttons'>
                            <button className='cancel-btn' onClick={() => setShowSignOutPopup(false)}>İptal</button>
                            <button className='confirm-btn' onClick={handleSignOut}>Çıkış Yap</button>
                        </div>
                    </div>
                </div>
            )}
        </>   
    )
}