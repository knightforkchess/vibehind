import { useState } from 'react';
import './App.css';
import LeftBar from './components/LeftBar';
import Feed from './components/Feed';
import RightBar from './components/RightBar';
import NewPostButton from './components/NewPostButton';
import SugarGirlLandingPage from './components/SugarGirlLandingPage';

function App() {
  const [activePost, setActivePost] = useState(null);
  const [showLanding, setShowLanding] = useState(true);

  const handleNewPost = () => {
    // Yeni post oluşturma fonksiyonu
    console.log('Yeni post oluştur');
  };

  const handleEnterApp = () => {
    setShowLanding(false);
  };

  if (showLanding) {
    return <SugarGirlLandingPage onEnter={handleEnterApp} />;
  }

  return (
    <div className="App">
      <main className='main'>
        <LeftBar />
        <Feed onPostSelect={setActivePost} />
        <RightBar activePost={activePost} />
      </main>
      <NewPostButton onClick={handleNewPost} />
    </div>
  );
}

export default App;
