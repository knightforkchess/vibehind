// src/components/Matches.js
import React, { useState, useRef, useEffect } from 'react';
import './styles/Matches.css';

export default function Matches({ selectedMatch, onMatchSelect }) {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const messagesEndRef = useRef(null);

    // Örnek mesajlar
    useEffect(() => {
        if (selectedMatch) {
            const sampleMessages = [
                { id: 1, text: 'Merhaba! Nasılsın?', sender: 'other', timestamp: '10:30' },
                { id: 2, text: 'Merhaba! İyiyim, sen nasılsın?', sender: 'me', timestamp: '10:32' },
                { id: 3, text: 'Ben de iyiyim, teşekkürler!', sender: 'other', timestamp: '10:33' }
            ];
            setMessages(sampleMessages);
        }
    }, [selectedMatch]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (message.trim()) {
            const newMessage = {
                id: messages.length + 1,
                text: message,
                sender: 'me',
                timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
            };
            setMessages([...messages, newMessage]);
            setMessage('');
        }
    };

    if (!selectedMatch) {
        return (
            <div className="matches-empty">
                <div className="matches-empty-content">
                    <span className="material-icons">favorite</span>
                    <h2>Eşleşmelerinizi Seçin</h2>
                    <p>Sağ taraftan bir eşleşme seçerek mesajlaşmaya başlayın</p>
                </div>
            </div>
        );
    }

    return (
        <div className="matches-container">
            <div className="matches-header">
                <div className="matches-user-info">
                    <div className="matches-avatar-wrapper">
                        <img 
                            src={selectedMatch.thumbnail} 
                            alt={selectedMatch.fullName}
                            className="matches-avatar"
                        />
                        {selectedMatch.online && (
                            <span className="matches-online-dot"></span>
                        )}
                    </div>
                    <div className="matches-user-details">
                        <h2 className="matches-name">{selectedMatch.fullName}</h2>
                        {selectedMatch.online ? (
                            <p className="matches-status online">Çevrimiçi</p>
                        ) : (
                            <p className="matches-status offline">Çevrimdışı</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="matches-messages">
                {messages.map((msg) => (
                    <div 
                        key={msg.id} 
                        className={`message ${msg.sender === 'me' ? 'message-sent' : 'message-received'}`}
                    >
                        <div className="message-bubble">
                            <p className="message-text">{msg.text}</p>
                            <span className="message-time">{msg.timestamp}</span>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form className="matches-input-form" onSubmit={handleSendMessage}>
                <div className="matches-input-wrapper">
                    <input
                        type="text"
                        className="matches-input"
                        placeholder="Mesajınızı yazın..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                    <button 
                        type="submit" 
                        className="matches-send-btn"
                        disabled={!message.trim()}
                    >
                        <span className="material-icons">send</span>
                    </button>
                </div>
            </form>
        </div>
    );
}

