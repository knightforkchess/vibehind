import { useState } from 'react'
import '../styles/LeftBar.css'
import './styles/LeftBar/Navigation.css'
import LeftHeader from './LeftBar/Header'

export default function LeftBar(){
    const [isOpen, setIsOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
    };

    return(
        <>
            <div className={`leftbar-overlay ${isOpen ? 'show' : ''}`} onClick={toggleMenu} />
            <button className="menu-toggle" onClick={toggleMenu}>
                <span className="material-icons">
                    {isOpen ? 'close' : 'menu'}
                </span>
            </button>
            <div className={`left-bar ${isOpen ? 'show' : ''}`}>
                <LeftHeader />
                <div className="nav-buttons">
                    <button className="nav-button active">
                        <div className="nav-icon-wrapper">
                            <span className="material-icons">explore</span>
                        </div>
                        <span className="nav-text">Keşfet</span>
                        <span className="nav-badge">12</span>
                    </button>
                    <button className="nav-button">
                        <div className="nav-icon-wrapper">
                            <span className="material-icons">favorite</span>
                        </div>
                        <span className="nav-text">Eşleşmeler</span>
                        <span className="nav-badge">3</span>
                    </button>
                    <button className="nav-button">
                        <div className="nav-icon-wrapper">
                            <span className="material-icons">chat_bubble</span>
                        </div>
                        <span className="nav-text">Mesajlar</span>
                        <span className="nav-badge new">5</span>
                    </button>
                    <button className="nav-button">
                        <div className="nav-icon-wrapper">
                            <span className="material-icons">star</span>
                        </div>
                        <span className="nav-text">Super Likeler</span>
                    </button>
                    <button className="nav-button">
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
                    </div>
                </div>
            </div>
        </>   
    )
}