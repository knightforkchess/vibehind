import React, { useState } from 'react';
import './styles/Comments.css';

export default function Comments({ isOpen, onClose }) {
    const [replyingTo, setReplyingTo] = useState(null);

    const comments = [
        {
            id: 1,
            user: {
                name: 'Ayşe Yılmaz',
                avatar: 'https://i.pravatar.cc/50?img=1',
            },
            comment: 'Çok güzel fotoğraflar! Profil harika görünüyor.',
            likes: 12,
            replies: [
                {
                    id: 11,
                    user: {
                        name: 'Mehmet Kaya',
                        avatar: 'https://i.pravatar.cc/50?img=12',
                    },
                    comment: 'Katılıyorum, çok şık!',
                    likes: 5,
                }
            ]
        },
        {
            id: 2,
            user: {
                name: 'Zeynep Demir',
                avatar: 'https://i.pravatar.cc/50?img=5',
            },
            comment: 'Ortak ilgi alanlarımız varmış, harika!',
            likes: 8,
            replies: []
        }
    ];

    const handleReply = (commentId) => {
        setReplyingTo(replyingTo === commentId ? null : commentId);
    };

    const CommentInput = ({ placeholder = "Mesajınızı yazın..." }) => (
        <div className="comment-input-container">
            <img src="https://picsum.photos/50/50" alt="Your avatar" className="user-avatar" />
            <div className="input-wrapper">
                <input 
                    type="text" 
                    placeholder={placeholder}
                    className="comment-input"
                />
                <button className="send-button">
                    <span className="material-icons">send</span>
                </button>
            </div>
        </div>
    );

    const CommentItem = ({ comment, isReply }) => (
        <div className={`comment-item ${isReply ? 'reply' : ''}`}>
            <div className="comment-content">
                <img src={comment.user.avatar} alt={comment.user.name} className="user-avatar" />
                <div className="comment-text">
                    <span className="username">{comment.user.name}</span>
                    <p>{comment.comment}</p>
                </div>
                <div className="comment-actions">
                    <button className="icon-button">
                        <span className="material-icons">favorite_border</span>
                    </button>
                    {!isReply && (
                        <button className="icon-button" onClick={() => handleReply(comment.id)}>
                            <span className="material-icons">reply</span>
                        </button>
                    )}
                </div>
            </div>
            {replyingTo === comment.id && (
                <div className="reply-input">
                    <CommentInput placeholder="Yanıtınızı yazın..." />
                </div>
            )}
            {comment.replies && comment.replies.map(reply => (
                <CommentItem key={reply.id} comment={reply} isReply={true} />
            ))}
        </div>
    );

    if (!isOpen) return null;

    return (
        <div className="comments-section">
            <div className="comments-header">
                <h2>Yorumlar</h2>
                <button className="close-button" onClick={onClose}>
                    <span className="material-icons">close</span>
                </button>
            </div>
            
            <CommentInput />

            <div className="comments-list">
                {comments.map(comment => (
                    <CommentItem key={comment.id} comment={comment} isReply={false} />
                ))}
            </div>

            <button className="view-all-button">
                Tüm yorumları gör
            </button>
        </div>
    );
}