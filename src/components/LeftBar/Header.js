import '../styles/LeftBar/Header.css'

export default function LeftHeader(){
    const user = {
        name: "Selin",
        profileImage: "https://i.pravatar.cc/150?img=5",
        matches: 42,
        likes: 128,
        verified: true
    };

    return(
        <div className='left-header'>
            <div className='profile-section'>
                <div className='profile-avatar'>
                    <img src={user.profileImage} alt="Profile" />
                    {user.verified && (
                        <span className="verified-icon">
                            <span className="material-icons">verified</span>
                        </span>
                    )}
                </div>
                <div className='profile-info'>
                    <h3 className='profile-name'>{user.name}</h3>
                    <button className='edit-profile-btn'>
                        <span className="material-icons">edit</span>
                        Profili Düzenle
                    </button>
                </div>
            </div>
            <div className='match-stats'>
                <div className="stat-card">
                    <span className="material-icons stat-icon">people</span>
                    <div className="stat-content">
                        <span className="stat-number">{user.matches}</span>
                        <span className="stat-label">Eşleşme</span>
                    </div>
                </div>
                <div className="stat-card">
                    <span className="material-icons stat-icon">favorite</span>
                    <div className="stat-content">
                        <span className="stat-number">{user.likes}</span>
                        <span className="stat-label">Beğeni</span>
                    </div>
                </div>
            </div>
        </div>   
    )
}