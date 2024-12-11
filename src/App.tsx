import React, { useState } from 'react';
import TypingGame from './components/TypingGame';
import AdminScreen from './components/AdminScreen';

function App() {
  const [showAdmin, setShowAdmin] = useState(false);
  const [gameSettings, setGameSettings] = useState({
    selectedStages: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33],
    speed: 2,
    isRandomMode: false,
    numStages: 3,
    showHands: true,
    windowSize: 1
  });

  return showAdmin ? (
    <AdminScreen
      onBack={() => setShowAdmin(false)}
      onSettingsChange={setGameSettings}
      currentSettings={gameSettings}
    />
  ) : (
    <TypingGame
      settings={gameSettings}
      onAdminRequest={() => setShowAdmin(true)}
    />
  );
}

export default App;