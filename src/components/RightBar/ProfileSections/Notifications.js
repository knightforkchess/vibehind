import React from 'react';

export default function Notifications({ user }) {
    return (
        <div className="notifications-section">
            <div className="notification-option">
                <div className="option-info">
                    <span className="material-icons">favorite</span>
                    <div className="option-text">
                        <h4>Beğeni Bildirimleri</h4>
                        <p>Biri seni beğendiğinde bildirim al</p>
                    </div>
                </div>
                <label className="switch">
                    <input type="checkbox" defaultChecked={user.settings?.notifications || true} />
                    <span className="slider"></span>
                </label>
            </div>

            <div className="notification-option">
                <div className="option-info">
                    <span className="material-icons">chat</span>
                    <div className="option-text">
                        <h4>Mesaj Bildirimleri</h4>
                        <p>Yeni mesaj aldığında bildirim al</p>
                    </div>
                </div>
                <label className="switch">
                    <input type="checkbox" defaultChecked={true} />
                    <span className="slider"></span>
                </label>
            </div>

            <div className="notification-option">
                <div className="option-info">
                    <span className="material-icons">people</span>
                    <div className="option-text">
                        <h4>Takipçi Bildirimleri</h4>
                        <p>Biri seni takip ettiğinde bildirim al</p>
                    </div>
                </div>
                <label className="switch">
                    <input type="checkbox" defaultChecked={true} />
                    <span className="slider"></span>
                </label>
            </div>

            <div className="notification-option">
                <div className="option-info">
                    <span className="material-icons">card_giftcard</span>
                    <div className="option-text">
                        <h4>Hediye Bildirimleri</h4>
                        <p>Biri sana hediye gönderdiğinde bildirim al</p>
                    </div>
                </div>
                <label className="switch">
                    <input type="checkbox" defaultChecked={true} />
                    <span className="slider"></span>
                </label>
            </div>
        </div>
    );
}