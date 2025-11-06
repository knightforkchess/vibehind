import React, { useState } from 'react';
import '../styles/Feed/SendGift.css';

export default function SendGift({ gift, recipient, onClose }) {
    const [quantity, setQuantity] = useState(1);
    const [cardNumber, setCardNumber] = useState('');
    const [cardName, setCardName] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const totalPrice = gift.price * quantity;

    const handleQuantityChange = (delta) => {
        const newQuantity = quantity + delta;
        if (newQuantity >= 1 && newQuantity <= 99) {
            setQuantity(newQuantity);
        }
    };

    const formatCardNumber = (value) => {
        const cleaned = value.replace(/\s/g, '');
        const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
        return formatted.substring(0, 19); // 16 digits + 3 spaces
    };

    const formatExpiryDate = (value) => {
        const cleaned = value.replace(/\D/g, '');
        if (cleaned.length >= 2) {
            return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
        }
        return cleaned;
    };

    const handleCardNumberChange = (e) => {
        const formatted = formatCardNumber(e.target.value);
        setCardNumber(formatted);
    };

    const handleExpiryChange = (e) => {
        const formatted = formatExpiryDate(e.target.value);
        setExpiryDate(formatted);
    };

    const handleCvvChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').substring(0, 3);
        setCvv(value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!cardNumber || !cardName || !expiryDate || !cvv) {
            alert('Lütfen tüm kart bilgilerini doldurun');
            return;
        }

        if (cardNumber.replace(/\s/g, '').length !== 16) {
            alert('Geçerli bir kart numarası girin');
            return;
        }

        if (cvv.length !== 3) {
            alert('Geçerli bir CVV girin');
            return;
        }

        setIsProcessing(true);

        // Simulate payment processing
        setTimeout(() => {
            console.log('Payment processed:', {
                gift: gift.name,
                quantity,
                totalPrice,
                recipient,
                cardNumber: cardNumber.substring(cardNumber.length - 4)
            });
            
            alert(`${quantity} adet ${gift.icon} ${gift.name} başarıyla ${recipient}'e gönderildi!`);
            setIsProcessing(false);
            onClose();
        }, 2000);
    };

    return (
        <div className="send-gift-overlay" onClick={onClose}>
            <div className="send-gift-modal" onClick={(e) => e.stopPropagation()}>
                <div className="send-gift-header">
                    <h2>💳 Ödeme</h2>
                    <button className="close-btn" onClick={onClose}>
                        <span className="material-icons">close</span>
                    </button>
                </div>

                <div className="send-gift-content">
                    {/* Gift Summary */}
                    <div className="gift-summary">
                        <div className="gift-preview">
                            <span className="gift-icon-large">{gift.icon}</span>
                            <div className="gift-details">
                                <h3>{gift.name}</h3>
                                <p className="recipient">
                                    <span className="material-icons">person</span>
                                    {recipient} için
                                </p>
                            </div>
                        </div>

                        {/* Quantity Selector */}
                        <div className="quantity-section">
                            <label>Adet</label>
                            <div className="quantity-controls">
                                <button 
                                    className="qty-btn"
                                    onClick={() => handleQuantityChange(-1)}
                                    disabled={quantity <= 1}
                                >
                                    <span className="material-icons">remove</span>
                                </button>
                                <span className="quantity-display">{quantity}</span>
                                <button 
                                    className="qty-btn"
                                    onClick={() => handleQuantityChange(1)}
                                    disabled={quantity >= 99}
                                >
                                    <span className="material-icons">add</span>
                                </button>
                            </div>
                        </div>

                        {/* Price Breakdown */}
                        <div className="price-breakdown">
                            <div className="price-row">
                                <span>Birim Fiyat</span>
                                <span>{gift.price} ₺</span>
                            </div>
                            <div className="price-row">
                                <span>Adet</span>
                                <span>× {quantity}</span>
                            </div>
                            <div className="price-row total">
                                <span>Toplam</span>
                                <span className="total-amount">{totalPrice} ₺</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Form */}
                    <form className="payment-form" onSubmit={handleSubmit}>
                        <h3>💳 Kart Bilgileri</h3>

                        <div className="form-group">
                            <label>Kart Numarası</label>
                            <div className="input-with-icon">
                                <span className="material-icons">credit_card</span>
                                <input
                                    type="text"
                                    placeholder="1234 5678 9012 3456"
                                    value={cardNumber}
                                    onChange={handleCardNumberChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Kart Üzerindeki İsim</label>
                            <div className="input-with-icon">
                                <span className="material-icons">person</span>
                                <input
                                    type="text"
                                    placeholder="AD SOYAD"
                                    value={cardName}
                                    onChange={(e) => setCardName(e.target.value.toUpperCase())}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Son Kullanma</label>
                                <div className="input-with-icon">
                                    <span className="material-icons">calendar_today</span>
                                    <input
                                        type="text"
                                        placeholder="MM/YY"
                                        value={expiryDate}
                                        onChange={handleExpiryChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>CVV</label>
                                <div className="input-with-icon">
                                    <span className="material-icons">lock</span>
                                    <input
                                        type="text"
                                        placeholder="123"
                                        value={cvv}
                                        onChange={handleCvvChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            className="pay-btn"
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <>
                                    <span className="spinner"></span>
                                    İşleniyor...
                                </>
                            ) : (
                                <>
                                    <span className="material-icons">send</span>
                                    {totalPrice} ₺ Öde ve Gönder
                                </>
                            )}
                        </button>
                    </form>

                    {/* Security Info */}
                    <div className="security-info">
                        <span className="material-icons">security</span>
                        <p>Ödemeniz SSL ile güvenli bir şekilde işlenir</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
