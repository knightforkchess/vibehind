import { useState, useEffect } from 'react';
import './App.css';
import socketService from './services/socket';
import api from './services/api';
import LeftBar from './components/LeftBar';
import Feed from './components/Feed';
import LiveContent from './components/LiveContent';
import Matches from './components/Matches';
import CloseMap from './components/CloseMap';
import RightBar from './components/RightBar';
import NewPostButton from './components/NewPostButton';
import SugarGirlLandingPage from './components/SugarGirlLandingPage';

function App() {
  const [activePost, setActivePost] = useState(null);
  const [showLanding, setShowLanding] = useState(!localStorage.getItem('token'));
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [isMatchesMode, setIsMatchesMode] = useState(false);
  const [isCloseMode, setIsCloseMode] = useState(false);
  const [selectedLive, setSelectedLive] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [isProfileMode, setIsProfileMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Connect to socket when authenticated
      const socket = socketService.connect(token);
      
      // Listen for real-time events
      socket.on('private-message', (data) => {
        // Handle incoming messages
        console.log('New message:', data);
      });

      socket.on('stream-started', (data) => {
        // Handle new live streams
        console.log('Stream started:', data);
      });

      socket.on('stream-ended', (data) => {
        // Handle ended streams
        console.log('Stream ended:', data);
      });

      // Check authentication status
      api.get('/auth/me')
        .then(response => {
          setIsAuthenticated(true);
          setUser(response.data);
          setShowLanding(false);
        })
        .catch(() => {
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          setUser(null);
          setShowLanding(true);
          socketService.disconnect();
        });

      return () => {
        socketService.disconnect();
      };
    } else {
      setShowLanding(true);
    }
  }, []);

  useEffect(() => {
    const handleSignOutEvent = () => {
        setShowLanding(true);
        setIsAuthenticated(false);
        setUser(null);
    };

    window.addEventListener('signOut', handleSignOutEvent);

    return () => {
        window.removeEventListener('signOut', handleSignOutEvent);
    };
  }, []);

  const handleNewPost = () => {
    // Yeni post oluşturma fonksiyonu
    console.log('Yeni post oluştur');
  };

  // This handler will be called by the LoginForm inside the landing page
  const handleEnterApp = (token, userData) => {
    if (token && userData) {
      localStorage.setItem('token', token);
      setIsAuthenticated(true);
      setUser(userData);
    }
    setShowLanding(false);
  };

  const handleLiveModeToggle = () => {
    setIsLiveMode(!isLiveMode);
    if (!isLiveMode) {
      setActivePost(null);
      setSelectedLive(null);
      setIsMatchesMode(false);
      setSelectedMatch(null);
    }
  };

  const handleMatchesModeToggle = () => {
    setIsMatchesMode(!isMatchesMode);
    if (!isMatchesMode) {
      setActivePost(null);
      setIsLiveMode(false);
      setIsCloseMode(false);
      setSelectedLive(null);
      setSelectedMatch(null);
    }
  };

  const handleCloseModeToggle = () => {
    setIsCloseMode(!isCloseMode);
    if (!isCloseMode) {
      setActivePost(null);
      setIsLiveMode(false);
      setIsMatchesMode(false);
      setSelectedLive(null);
      setSelectedMatch(null);
    }
  };

  const handleProfileModeToggle = () => {
    setIsProfileMode(!isProfileMode);
    if (!isProfileMode) {
      setActivePost(null);
      setIsLiveMode(false);
      setIsMatchesMode(false);
      setIsCloseMode(false);
      setSelectedLive(null);
      setSelectedMatch(null);
    }
  };

  if (showLanding) {
    return <SugarGirlLandingPage onEnter={handleEnterApp} />;
  }

  return (
    <div className="App">
      <main className='main'>
        <LeftBar 
          onLiveClick={handleLiveModeToggle} 
          isLiveMode={isLiveMode}
          onMatchesClick={handleMatchesModeToggle}
          isMatchesMode={isMatchesMode}
          onCloseClick={handleCloseModeToggle}
          isCloseMode={isCloseMode}
          onProfileClick={handleProfileModeToggle}
          isProfileMode={isProfileMode}
        />
        {isLiveMode ? (
          <LiveContent onLiveSelect={setSelectedLive} />
        ) : isMatchesMode ? (
          <Matches selectedMatch={selectedMatch} onMatchSelect={setSelectedMatch} />
        ) : (
          <Feed 
            onPostSelect={setActivePost} 
            isCloseMode={isCloseMode}
            isProfileMode={isProfileMode}
            selectedLive={selectedLive}
          />
        )}
        <RightBar 
          activePost={activePost} 
          isLiveMode={isLiveMode}
          isMatchesMode={isMatchesMode}
          isCloseMode={isCloseMode}
          isProfileMode={isProfileMode}
          selectedLive={selectedLive}
          selectedMatch={selectedMatch}
          onLiveSelect={setSelectedLive}
          onMatchSelect={setSelectedMatch}
        />
      </main>
      {!isLiveMode && !isMatchesMode && !isCloseMode && !isProfileMode && <NewPostButton onClick={handleNewPost} />}
    </div>
  );
}

export default App;
