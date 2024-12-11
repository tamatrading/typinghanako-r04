import React from 'react';
import { Dog } from 'lucide-react';
import { CurrentWord, Particle, ScorePopup } from '../../types/game';
import TimeoutBar from './TimeoutBar';
import { useState, useEffect } from 'react';

interface GameScreenProps {
  gameState: string;
  currentWord: CurrentWord | null;
  countdown: number | null;
  score: number;
  speedMultiplier: number;
  highScore: number;
  totalStagesCompleted: number;
  questionCount: number;
  finalScoreRef: React.MutableRefObject<number>;
  previousHighScoreRef: React.MutableRefObject<number>;
  resetGame: () => void;
  nextStage: () => void;
  saveHighScoreToStorage: (score: number) => void;
  showSuccessEffect: boolean;
  particles: Particle[];
  scorePopups: ScorePopup[];
  stage: number;
  convertToRomaji: (word: string) => string[];
  shakeAnimation: boolean;
  settings: {
    isRandomMode: boolean;
    windowSize: number;
    showHands: boolean;
  };
  currentBackground: string;
  stageBackgrounds: Record<number, string>;
}

const GameScreen: React.FC<GameScreenProps> = ({
  gameState,
  currentWord,
  countdown,
  score,
  speedMultiplier,
  highScore,
  totalStagesCompleted,
  questionCount,
  finalScoreRef,
  previousHighScoreRef,
  resetGame,
  nextStage,
  saveHighScoreToStorage,
  showSuccessEffect,
  particles,
  scorePopups,
  stage,
  convertToRomaji,
  shakeAnimation,
  settings,
  currentBackground,
  stageBackgrounds,
}) => {
  const [successWord, setSuccessWord] = useState<string | null>(null);

  useEffect(() => {
    if (showSuccessEffect && currentWord) {
      setSuccessWord(currentWord.text);
    } else {
      setSuccessWord(null);
    }
  }, [showSuccessEffect, currentWord]);
  return (
    <div
      className={`relative h-[22rem] bg-gradient-to-b ${
        settings.isRandomMode
          ? currentBackground
          : stageBackgrounds[stage]
      } rounded-lg mb-8 overflow-hidden ${
        shakeAnimation ? 'animate-[shake_0.5s_ease-in-out]' : ''
      }`}
    >
      {/* Start Screen */}
      {gameState === 'start' && (
        <div className="absolute inset-0 bg-gradient-radial from-indigo-500 via-purple-600 to-blue-800 overflow-hidden">
          {/* Animated background particles */}
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-float-random opacity-30"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `float-random ${3 + Math.random() * 2}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              >
                {['⌨️', '✨', '💫', '⭐️', '🎯', '🎮'][Math.floor(Math.random() * 6)]}
              </div>
            ))}
          </div>
          
          {/* Main content */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-300 to-cyan-300 animate-gradient-x mb-2">
                タイピングHANAKO
              </h2>
              <div className="relative">
                <Dog 
                  className="text-yellow-300 animate-bounce mx-auto" 
                  size={56}
                />
                <div className="absolute -inset-4 bg-gradient-to-r from-yellow-400/20 via-pink-400/20 to-cyan-400/20 blur-xl rounded-full animate-pulse" />
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 mb-5 transform hover:scale-105 transition-all">
              <p className="text-lg font-bold text-yellow-300 mb-1">
                ハイスコア: {highScore}
              </p>
              <p className="text-base text-cyan-300">
                スピード: {speedMultiplier}
              </p>
            </div>
            
            <button
              onClick={resetGame}
              className="group relative px-8 py-4 text-lg font-bold text-white overflow-hidden rounded-xl transition-all duration-300 transform hover:scale-105 hover:rotate-1"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-600 transition-all group-hover:scale-110" />
              <div className="absolute -inset-full top-0 h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
              <span className="relative z-10 flex items-center gap-2">
                スタート！
                <span className="animate-bounce">🎮</span>
              </span>
            </button>
            
            <div className="mt-5 space-y-1 text-center">
              <p className="text-sm text-cyan-200 animate-pulse">
                スペースキーでスタート
              </p>
              <p className="text-sm text-pink-200 animate-pulse">
                Vキーで管理画面を開く
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === 'gameover' && (
        <div className="absolute inset-0 bg-gradient-to-b from-slate-600 via-slate-700 to-slate-800 flex flex-col items-center justify-center text-white">
          <h2 className="text-4xl mb-4 font-bold animate-bounce">
            ゲームオーバー
          </h2>
          <Dog className="mb-4 text-slate-400" size={64} />
          <p className="text-xl mb-2">最終スコア: {score}</p>
          {finalScoreRef.current > previousHighScoreRef.current && (
            <p className="text-lg text-yellow-300 mb-2">
              🎉 ハイスコア達成！ 🎉
            </p>
          )}
          <p className="text-lg text-slate-300 mb-4">
            ステージ {totalStagesCompleted + 1} - {questionCount}/20問クリア
          </p>
          <button
            onClick={resetGame}
            className="bg-slate-500 hover:bg-slate-600 text-white text-xl py-6 px-8 rounded-lg transform transition-all duration-300 hover:scale-110"
          >
            もう一度チャレンジ！
          </button>
        </div>
      )}

      {/* Stage Clear Screen */}
      {gameState === 'stageClear' && (
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-300 via-green-400 to-emerald-500 flex flex-col items-center justify-center text-white">
          <h2 className="text-4xl mb-4 font-bold animate-bounce">
            ステージクリア！
          </h2>
          <Dog className="mb-4 text-yellow-300 animate-pulse" size={64} />
          <p className="text-xl mb-2">スコア: {score}</p>
          <button
            onClick={nextStage}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xl py-6 px-8 rounded-lg transform transition-all duration-300 hover:scale-110 hover:rotate-1"
          >
            次のステージへ
          </button>
          <p className="text-white mt-4 animate-pulse">
            スペースキーでも進めます
          </p>
        </div>
      )}

      {/* Game Clear Screen */}
      {gameState === 'clear' && (
        <div className="absolute inset-0 bg-gradient-radial from-yellow-300 via-amber-400 to-amber-500 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-300/30 via-amber-400/20 to-amber-500/10 animate-spin-slow"></div>

          <div className="relative z-10 flex flex-col items-center justify-center max-w-lg mx-auto px-3 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-4xl mb-4 text-white font-bold animate-bounce">
              🎉 全ステージクリア！ 🎉
            </h2>

            <p className="text-xl sm:text-2xl md:text-3xl text-white mb-3 animate-pulse">
              おめでとうございます！
            </p>

            <p className="text-lg sm:text-xl md:text-2xl text-white mb-3">
              最終スコア: {score}
            </p>

            {finalScoreRef.current > previousHighScoreRef.current && (
              <div className="relative mb-3">
                {(() => {
                  saveHighScoreToStorage(score);
                  return null;
                })()}
                <p className="text-base sm:text-lg md:text-xl text-red animate-pulse">
                  🏆 ハイスコア達成！ 🏆
                </p>
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 rounded-lg blur opacity-75 animate-pulse"></div>
              </div>
            )}

            <button
              onClick={resetGame}
              className="relative group bg-gradient-to-br from-amber-400 to-amber-600 text-white text-lg sm:text-xl md:text-2xl py-4 sm:py-6 px-6 sm:px-8 rounded-xl transform transition-all duration-300 hover:scale-110 hover:rotate-1 overflow-hidden mt-2"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-amber-300 to-amber-500 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity"></span>
              <span className="relative">最初から挑戦！</span>
            </button>
          </div>

          <div className="absolute inset-0 pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-float-random text-xl sm:text-2xl"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              >
                {['🌟', '✨', '💫', '⭐'][Math.floor(Math.random() * 4)]}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Countdown */}
      {gameState === 'countdown' && countdown !== null && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-8xl font-bold text-white animate-pulse">
            {countdown}
          </div>
        </div>
      )}

      {/* Playing State */}
      {gameState === 'playing' && currentWord && (
        <div className="relative h-full flex flex-col items-center justify-center">
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-3/4 z-10">
            <TimeoutBar 
              startTime={currentWord.startTime} 
              timeout={(() => {
                switch (speedMultiplier) {
                  case 5:
                    return 2000;
                  case 4:
                    return 4000;
                  case 3:
                    return 6000;
                  case 2:
                    return 8000;
                  case 1:
                    return 10000;
                  default:
                    return 6000;
                }
              })()}
              isPaused={showSuccessEffect}
            />
          </div>

          <div className={`text-center mb-8 ${settings.showHands ? '-mt-16' : ''}`}>
            {!showSuccessEffect && currentWord && (
              <div className={`text-white font-bold mb-3 ${
                // 小書き文字の場合は小さく表示
                ['ぁ', 'ぃ', 'ぅ', 'ぇ', 'ぉ', 'っ', 'ゃ', 'ゅ', 'ょ'].includes(currentWord.text) ? 'text-3xl' : 'text-5xl'
              }`}>
                {currentWord.text}
              </div>
            )}
            {stage > 1 && currentWord && !showSuccessEffect && (
              <div className="text-gray-200 text-xl space-y-0.5">
                {convertToRomaji(currentWord.text).map((hint, index) => (
                  <div key={index}>{hint}</div>
                ))}
              </div>
            )}
          </div>

          {showSuccessEffect && successWord && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ transform: 'translateZ(0)' }}>
              <div className="w-32 h-32">
                <div
                  className="absolute inset-0 text-white text-6xl font-bold flex items-center justify-center"
                  style={{
                    animation: 'success-explosion 0.3s ease-out forwards, success-fall 0.3s ease-in forwards 0.3s',
                    willChange: 'transform, opacity'
                  }}
                >
                  {successWord}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-2 h-2 rounded-full bg-white/60"
                      style={{
                        transform: `rotate(${i * 45}deg) translateY(-16px)`,
                        animation: 'particle 0.3s ease-in forwards',
                        animationDelay: `${i * 0.06}s`
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}


      {/* Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 rounded-full animate-[particle_1s_ease-out_forwards]"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            backgroundColor: particle.color,
          }}
        />
      ))}

      {/* Score Popups */}
      {scorePopups.map((popup) => (
        <div
          key={popup.id}
          className="absolute text-2xl font-bold text-yellow-300 animate-[scorePopup_1s_ease-out_forwards] whitespace-nowrap"
          style={{
            left: `calc(${popup.x}% + 4rem)`, // 文字の右側にずらす
            top: `${popup.y}%`,
            transform: 'translateX(-50%)',
            textShadow: '0 0 10px rgba(0,0,0,0.5)',
          }}
        >
          +{popup.score}
        </div>
      ))}
    </div>
  );
};

export default GameScreen;