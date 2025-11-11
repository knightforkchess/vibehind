import React, { useState, useEffect, useRef } from 'react';
import socketService from '../../services/socket';
import './LiveChat.css';

export default function LiveChat({ streamId }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const chatContainerRef = useRef(null);
    const [showEmoji, setShowEmoji] = useState(false);

    useEffect(() => {
        // Join the live stream room
        socketService.startStream(streamId);

        // Listen for incoming messages
        socketService.socket.on('stream-message', (message) => {
            setMessages((prev) => [...prev, message]);
        });

        // Auto-scroll to bottom when new messages arrive
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }

        return () => {
            // Leave the live stream room on cleanup
            socketService.endStream(streamId);
            socketService.socket.off('stream-message');
        };
    }, [streamId]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const message = {
            streamId,
            userId: 'currentUserId', // Replace with actual user ID
            username: 'You',
            content: newMessage,
        };

        // Emit the message to the server
        socketService.sendStreamMessage(streamId, newMessage);

        // Add the message locally
        setMessages((prev) => [...prev, message]);
        setNewMessage('');
        setShowEmoji(false);
    };

    return (
        <div className="live-chat">
            <div className="live-chat-header">
                <span className="material-icons">chat</span>
                <h3>Canlı Sohbet</h3>
            </div>
            
            <div className="live-chat-messages" ref={chatContainerRef}>
                {messages.map((msg, index) => (
                    <div key={index} className={`chat-message`}>
                        <span className="message-username">
                            {msg.username}
                        </span>
                        <span className="message-content">{msg.content}</span>
                    </div>
                ))}
            </div>
            
            <form onSubmit={handleSendMessage} className="live-chat-input">
                <button 
                    type="button" 
                    className="emoji-button"
                    onClick={() => setShowEmoji(!showEmoji)}
                >
                    <span className="material-icons">emoji_emotions</span>
                </button>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Mesajınızı yazın..."
                />
                <button type="submit" className="send-button">
                    <span className="material-icons">send</span>
                </button>
            </form>
        </div>
    );
}