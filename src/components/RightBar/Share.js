import React, { useState, useEffect } from 'react';
import './styles/Share.css';

const Share = ({ activePost, onClose }) => {
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [currentColor, setCurrentColor] = useState('#ffffff');
    const [selectedPlatform, setSelectedPlatform] = useState('');

    const shareMessage = "Bu içeriği Swapmood'tan gördüm, sen de bana katıl";
    const shareUrl = `https://swapmood.com/post/${activePost?.id}`; // URL yapınıza göre düzenleyin

    const socialPlatforms = [
        { name: 'X (Twitter)', color: '#000000', icon: 'X' },
        { name: 'Facebook', color: '#1877F2', icon: 'facebook' },
        { name: 'LinkedIn', color: '#0A66C2', icon: 'LinkedIn' },
        { name: 'WhatsApp', color: '#25D366', icon: 'WhatsApp' }
    ];

    const handleShare = (platform, e) => {
        if (isMobile()) {
            handleMobileShare();
        } else {
            setSelectedPlatform(platform.name);
            setCurrentColor(platform.color);
            setShowConfirmation(true);
        }
        // Paylaşım butonuna tıklandığında event'in bubble olmasını engelle
        // böylece overlay click eventi tetiklenmeyecek
        e.stopPropagation();
    };

    const isMobile = () => {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    };

    const handleMobileShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Swapmood',
                    text: shareMessage,
                    url: shareUrl
                });
            } catch (error) {
                console.log('Paylaşım sırasında hata oluştu:', error);
            }
        }
    };

    const handleConfirm = (e) => {
        e.stopPropagation(); // Popup dışına tıklama eventinin tetiklenmesini engelle
        let targetUrl;
        const encodedMessage = encodeURIComponent(shareMessage);
        const encodedUrl = encodeURIComponent(shareUrl);

        switch (selectedPlatform) {
            case 'X (Twitter)':
                targetUrl = `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${encodedUrl}`;
                break;
            case 'Facebook':
                targetUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
                break;
            case 'LinkedIn':
                targetUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
                break;
            case 'WhatsApp':
                targetUrl = `https://wa.me/?text=${encodedMessage} ${encodedUrl}`;
                break;
            default:
                return;
        }
        window.open(shareUrl, '_blank');
        setShowConfirmation(false);
        onClose();
    };

    const handleOverlayClick = (e) => {
        // Eğer tıklanan element share-overlay ise (yani popup dışı) kapat
        if (e.target.classList.contains('share-overlay')) {
            e.stopPropagation(); // Üst elementlere event'in yayılmasını engelle
            onClose();
        }
    };

    // Component mount olduğunda event listener ekle
    useEffect(() => {
        // Escape tuşuna basılınca da kapat
        const handleEscKey = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscKey);

        // Cleanup
        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [onClose]);

    return (
        <div className="share-overlay" onClick={handleOverlayClick}>
            <div className="share-popup" style={{ backgroundColor: currentColor }}>
                {!showConfirmation ? (
                    <>
                        <button className="close-button" onClick={onClose}>
                            <span className="material-icons">close</span>
                        </button>
                        <h3>Paylaş</h3>
                        <p>{shareMessage}</p>
                        <div className="share-link-container">
                            <div className="share-link">{shareUrl}</div>
                            <button 
                                className="copy-button"
                                onClick={() => {
                                    navigator.clipboard.writeText(shareUrl);
                                    const button = document.querySelector('.copy-button .material-icons');
                                    if (button) {
                                        button.textContent = 'check';
                                        setTimeout(() => {
                                            button.textContent = 'content_copy';
                                        }, 2000);
                                    }
                                }}
                            >
                                <span className="material-icons">content_copy</span>
                            </button>
                        </div>
                        <div className="social-buttons">
                            {socialPlatforms.map((platform) => (
                                <button
                                    key={platform.name}
                                    onClick={(e) => handleShare(platform, e)}
                                    className="social-button"
                                    style={{ backgroundColor: platform.color }}
                                >
                                    {platform.name === 'X (Twitter)' ? (
                                        <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
                                            <path d="M13.3174 10.7749L19.1457 4H17.7646L12.7039 9.88256L8.66193 4H4L10.1566 12.6641L4 19.8182H5.38107L10.7693 13.5565L15.0675 19.8182H19.7294L13.3174 10.7749ZM11.4789 12.6641L10.8327 11.7869L5.87144 5.01961H8.00676L12.0554 10.4612L12.7016 11.3384L17.8968 18.4301H15.7615L11.4789 12.6641Z"/>
                                        </svg>
                                    ) : platform.name === 'WhatsApp' ? (
                                        <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
                                            <path d="M12 2C6.475 2 2 6.475 2 12C2 13.75 2.45 15.375 3.225 16.8L2.075 21.925L7.275 20.775C8.7 21.55 10.325 22 12 22C17.525 22 22 17.525 22 12C22 6.475 17.525 2 12 2ZM12 20.375C10.475 20.375 8.975 19.95 7.7 19.2L7.4 19.025L4.3 19.725L5 16.675L4.8 16.35C4.025 15.05 3.575 13.525 3.575 12C3.575 7.35 7.35 3.575 12 3.575C16.65 3.575 20.425 7.35 20.425 12C20.425 16.65 16.65 20.375 12 20.375Z"/>
                                            <path d="M8.075 7.075C7.925 6.7 7.75 6.675 7.6 6.675C7.475 6.65 7.325 6.65 7.175 6.65C7.025 6.65 6.775 6.7 6.575 6.925C6.35 7.15 5.825 7.65 5.825 8.675C5.825 9.7 6.575 10.675 6.675 10.825C6.8 10.975 8.075 13.025 10.075 13.875C11.775 14.575 12.075 14.45 12.4 14.4C12.725 14.35 13.55 13.9 13.725 13.475C13.9 13.05 13.9 12.7 13.85 12.6C13.775 12.5 13.625 12.45 13.4 12.325C13.175 12.2 12.15 11.7 11.95 11.6C11.75 11.525 11.6 11.475 11.45 11.7C11.3 11.925 10.9 12.4 10.775 12.55C10.65 12.7 10.5 12.725 10.275 12.6C10.05 12.475 9.375 12.25 8.575 11.525C7.95 10.975 7.525 10.275 7.4 10.05C7.275 9.825 7.4 9.7 7.5 9.6C7.625 9.475 7.75 9.3 7.875 9.175C8 9.05 8.05 8.95 8.125 8.8C8.2 8.65 8.15 8.525 8.1 8.4C8.05 8.275 7.625 7.25 7.425 6.775"/>
                                        </svg>
                                    ) : platform.name === 'LinkedIn' ? (
                                        <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
                                            <path d="M19 3H5C4 3 3 4 3 5V19C3 20 4 21 5 21H19C20 21 21 20 21 19V5C21 4 20 3 19 3ZM9 17H6.5V10H9V17ZM7.7 8.7C6.9 8.7 6.2 8 6.2 7.2C6.2 6.4 6.9 5.7 7.7 5.7C8.5 5.7 9.2 6.4 9.2 7.2C9.2 8 8.5 8.7 7.7 8.7ZM18 17H15.5V13.7C15.5 12.9 15.5 11.9 14.4 11.9C13.3 11.9 13.1 12.8 13.1 13.7V17H10.6V10H13V11C13.4 10.4 14.2 9.8 15.5 9.8C18 9.8 18 11.4 18 13.1V17Z"/>
                                        </svg>
                                    ) : (
                                        <span className="material-icons">{platform.icon}</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="confirmation-dialog">
                        <h3>Sayfadan Ayrılma Onayı</h3>
                        <p>{selectedPlatform} sayfasına yönlendirileceksiniz. Devam etmek istiyor musunuz?</p>
                        <div className="confirmation-buttons">
                            <button onClick={handleConfirm}>Evet</button>
                            <button onClick={() => setShowConfirmation(false)}>Hayır</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Share;