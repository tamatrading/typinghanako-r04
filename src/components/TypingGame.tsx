import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Heart, Dog, Volume2, VolumeX, Settings } from 'lucide-react';
import KeyboardHands from './KeyboardHands';
import KeyboardLayout from './KeyboardLayout';
import GameHeader from './game/GameHeader';
import GameScreen from './game/GameScreen';
import { GameSettings, ScorePopup, CurrentWord, Particle } from '../types/game';
import {
  stageBackgrounds,
  stageSets,
  romajiMap,
} from '../constants/gameConstants';

interface Props {
  settings: GameSettings;
  onAdminRequest: () => void;
}

const TypingGame: React.FC<Props> = ({ settings, onAdminRequest }) => {
  const [stage, setStage] = useState(settings.selectedStages[0]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameState, setGameState] = useState('start');
  const [speedMultiplier, setSpeedMultiplier] = useState(settings.speed);
  const [currentWord, setCurrentWord] = useState<CurrentWord | null>(null);
  const [input, setInput] = useState('');
  const [life, setLife] = useState(10);
  const [questionCount, setQuestionCount] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [totalStagesCompleted, setTotalStagesCompleted] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [scoreAnimation, setScoreAnimation] = useState(false);
  const [shakeAnimation, setShakeAnimation] = useState(false);
  const [scorePopups, setScorePopups] = useState<ScorePopup[]>([]);
  const [availableCharacters, setAvailableCharacters] = useState<string[]>([]);
  const [lastCharacter, setLastCharacter] = useState<string>('');
  const [showSuccessEffect, setShowSuccessEffect] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [currentBackground, setCurrentBackground] = useState<string>('');
  const [questionHistory, setQuestionHistory] = useState<string[]>([]);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [characterFrequency, setCharacterFrequency] = useState<Record<string, number>>({});

  const handleAdminRequest = useCallback(() => {
    if (gameState === 'playing') {
      // Clear any active timers
      if (questionTimerRef.current) {
        clearTimeout(questionTimerRef.current);
      }
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
      
      // Reset game state
      setCurrentWord(null);
      setInput('');
      setGameState('start');
      setQuestionHistory([]);
    }
    
    onAdminRequest();
  }, [gameState, onAdminRequest]);

  const audioContextRef = useRef<AudioContext | null>(null);
  const finalScoreRef = useRef<number>(0);
  const previousHighScoreRef = useRef<number>(0);
  const currentStageIndexRef = useRef(0);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const questionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const gameStateRef = useRef(gameState);

  const getTimeoutDuration = (speed: number) => {
    switch (speed) {
      case 5: return 2000;
      case 4: return 4000;
      case 3: return 6000;
      case 2: return 8000;
      case 1: return 10000;
      default: return 6000;
    }
  };

  const QUESTION_TIMEOUT = getTimeoutDuration(speedMultiplier);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    const chars = settings.selectedStages.flatMap(
      (stageNum) => stageSets[stageNum as keyof typeof stageSets]
    );
    setAvailableCharacters(chars);
  }, [settings.selectedStages]);

  useEffect(() => {
    setSpeedMultiplier(settings.speed);
    setStage(settings.selectedStages[0]);
    currentStageIndexRef.current = 0;
    if (settings.isRandomMode) {
      const backgrounds = Object.values(stageBackgrounds);
      setCurrentBackground(
        backgrounds[Math.floor(Math.random() * backgrounds.length)]
      );
    }
  }, [settings]);

  const getRandomBackground = useCallback(() => {
    const backgrounds = Object.values(stageBackgrounds);
    return backgrounds[Math.floor(Math.random() * backgrounds.length)];
  }, []);

  const playSound = useCallback(
    (freq: number, type: OscillatorType, dur: number, vol = 0.3) => {
      if (isMuted || !audioContextRef.current) return;
      try {
        const osc = audioContextRef.current.createOscillator();
        const gain = audioContextRef.current.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(vol, audioContextRef.current.currentTime);
        gain.gain.exponentialRampToValueAtTime(
          0.01,
          audioContextRef.current.currentTime + dur
        );
        osc.connect(gain);
        gain.connect(audioContextRef.current.destination);
        osc.start();
        osc.stop(audioContextRef.current.currentTime + dur);
      } catch (e) {
        console.error(e);
      }
    },
    [isMuted]
  );

  const playTypeSound = useCallback(
    () => {
      // メインの音
      playSound(1200, 'sine', 0.08, 0.15);
      // キラキラ効果音
      setTimeout(() => playSound(2400, 'sine', 0.05, 0.05), 10);
    },
    [playSound]
  );

  const playCorrectSound = useCallback(() => {
    // メインの音 (明るい高音)
    playSound(1760, 'sine', 0.15, 0.2);
    // キラキラエフェクト (複数の高周波音を重ねる)
    setTimeout(() => playSound(2637, 'sine', 0.1, 0.1), 50);  // ミ
    setTimeout(() => playSound(3520, 'sine', 0.08, 0.08), 100); // ラ
    // 余韻
    setTimeout(() => playSound(4186, 'sine', 0.15, 0.05), 150); // ド
  }, [playSound]);

  const playMissSound = useCallback(
    () => {
      // 柔らかい低音
      playSound(330, 'sine', 0.15, 0.15);
      // 軽いエラー音
      setTimeout(() => playSound(220, 'sine', 0.1, 0.1), 50);
    },
    [playSound]
  );

  const playStageClearSound = useCallback(() => {
    // メジャースケールの明るい音階
    const notes = [
      523.25,  // ド
      659.25,  // ミ
      783.99,  // ソ
      1046.5,  // ド
      1318.51, // ミ
      1567.98  // ソ
    ];
    
    notes.forEach((note, i) => {
      // メイン音
      setTimeout(() => playSound(note, 'sine', 0.3, 0.2), i * 100);
      // キラキラエフェクト
      setTimeout(() => playSound(note * 2, 'sine', 0.2, 0.1), i * 100 + 50);
    });
  }, [playSound]);

  const playGameClearSound = useCallback(() => {
    // より豪華なコード進行（C → Am → F → G → C）
    const notes = [
      [523.25, 659.25, 783.99],     // C (ド・ミ・ソ)
      [440.00, 523.25, 659.25],     // Am (ラ・ド・ミ)
      [698.46, 880.00, 1046.50],    // F (ファ・ラ・ド)
      [783.99, 987.77, 1174.66],    // G (ソ・シ・レ)
      [1046.50, 1318.51, 1567.98],  // C (高いド・ミ・ソ)
      [1396.91, 1760.00, 2093.00],  // F (高いファ・ラ・ド)
      [1567.98, 1975.53, 2349.32],  // G (高いソ・シ・レ)
      [2093.00, 2637.02, 3135.96]   // C (最高いド・ミ・ソ)
    ];

    notes.forEach((chord, i) => {
      setTimeout(() => {
        chord.forEach((note, j) => {
          // メイン音
          playSound(note, 'sine', 4.0 - i * 0.2, 0.15);
          // 倍音を追加してリッチな音色に
          playSound(note * 2, 'sine', 3.5 - i * 0.2, 0.05);
          // 華やかさを追加
          playSound(note * 3, 'sine', 3.0 - i * 0.2, 0.02);
        });
        
        // 最後の2コードでキラキラエフェクトを追加
        if (i >= 6) {
          chord.forEach(note => {
            setTimeout(() => {
              playSound(note * 4, 'sine', 0.3, 0.02);
              playSound(note * 5, 'sine', 0.2, 0.01);
            }, 200);
          });
        }
      }, i * 500); // 0.5秒ごとにコードを変更
    });
  }, [playSound]);

  const playGameOverSound = useCallback(() => {
    // より深みのあるコード進行（Am → Em → Dm → G → C → Am）
    const notes = [
      [440.00, 523.25, 659.25],     // Am (ラ・ド・ミ)
      [329.63, 392.00, 493.88],     // Em (ミ・ソ・シ)
      [293.66, 349.23, 440.00],     // Dm (レ・ファ・ラ)
      [392.00, 493.88, 587.33],     // G (ソ・シ・レ)
      [261.63, 329.63, 392.00],     // C (低いド・ミ・ソ)
      [220.00, 261.63, 329.63],     // Am (低いラ・ド・ミ)
      [174.61, 220.00, 261.63],     // F (低いファ・ラ・ド)
      [146.83, 174.61, 220.00]      // D (最低いレ・ファ・ラ)
    ];

    notes.forEach((chord, i) => {
      setTimeout(() => {
        chord.forEach((note) => {
          // メイン音をよりソフトに
          playSound(note, 'sine', 4.0 - i * 0.2, 0.12);
          // 倍音を控えめに
          playSound(note * 2, 'sine', 3.5 - i * 0.2, 0.04);
          // 深みのある低音を追加
          playSound(note / 2, 'sine', 3.0 - i * 0.2, 0.08);
        });
        
        // 最後の2コードで余韻を強調
        if (i >= 6) {
          chord.forEach(note => {
            setTimeout(() => {
              playSound(note / 4, 'sine', 0.8, 0.04);
            }, 200);
          });
        }
      }, i * 500); // 0.5秒ごとにコード変更
    });
  }, [playSound]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameStateRef.current === 'start') {
        if (e.key === 'v') {
          onAdminRequest();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onAdminRequest]);

  useEffect(() => {
    const savedHighScore = localStorage.getItem('typingGameHighScore');
    if (savedHighScore) {
      const parsedHighScore = parseInt(savedHighScore, 10);
      setHighScore(parsedHighScore);
      previousHighScoreRef.current = parsedHighScore;
    }
  }, []);

  const updateHighScore = useCallback((finalScore: number) => {
    finalScoreRef.current = finalScore;
    if (finalScore > previousHighScoreRef.current) {
      return true;
    }
    return false;
  }, []);

  const saveNewHighScore = useCallback(() => {
    if (finalScoreRef.current > previousHighScoreRef.current) {
      localStorage.setItem(
        'typingGameHighScore',
        finalScoreRef.current.toString()
      );
      previousHighScoreRef.current = finalScoreRef.current;
      setHighScore(finalScoreRef.current);
    }
  }, []);

  const initAudio = useCallback(() => {
    if (typeof window !== 'undefined' && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }
  }, []);

  const startCountdown = useCallback(() => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }
    setCountdown(3);
    countdownTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current);
          }
          setGameState('playing');
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, []);

  const resetGame = useCallback(() => {
    initAudio();
    saveNewHighScore();
    setScore(0);
    setStage(settings.selectedStages[0]);
    currentStageIndexRef.current = 0;
    setLife(10);
    setQuestionCount(0);
    setInput('');
    setGameState('countdown');
    setQuestionHistory([]);
    setTotalStagesCompleted(0);
    setCurrentWord(null);
    setCharacterFrequency({});
    setScorePopups([]);
    finalScoreRef.current = 0;
    setLastCharacter('');
    startCountdown();
  }, [initAudio, saveNewHighScore, settings.selectedStages, startCountdown]);

  const convertToRomaji = useCallback((word: string) => {
    if (!word) return [];
    return romajiMap[word as keyof typeof romajiMap] || [word];
  }, []);

  const calculateScore = useCallback(
    (elapsedTime: number) => {
      const maxScore = 8;
      const minScore = 1;
      const maxTime = QUESTION_TIMEOUT;

      return Math.max(
        minScore,
        Math.ceil(maxScore * (1 - elapsedTime / maxTime) * (1 + speedMultiplier * 0.2))
      );
    },
    [speedMultiplier]
  );

  const createParticles = useCallback((x: number, y: number) => {
    const newParticles = Array.from({ length: 10 }, (_, i) => ({
      id: Date.now() + i,
      x,
      y,
      color: ['#60A5FA', '#34D399', '#FBBF24'][Math.floor(Math.random() * 3)],
    }));
    setParticles((prev) => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles((prev) =>
        prev.filter((p) => !newParticles.find((np) => np.id === p.id))
      );
    }, 1000);
  }, []);

  const createScorePopup = useCallback(
    (score: number, x: number, y: number) => {
      const newPopup = {
        id: Date.now(),
        score,
        x,
        y,
      };
      setScorePopups((prev) => [...prev, newPopup]);
      setTimeout(() => {
        setScorePopups((prev) =>
          prev.filter((popup) => popup.id !== newPopup.id)
        );
      }, 1000);
    },
    []
  );

  const saveHighScoreToStorage = useCallback((score: number) => {
    if (score >= previousHighScoreRef.current) {
      localStorage.setItem('typingGameHighScore', score.toString());
    }
  }, []);

  const gameOver = useCallback(() => {
    setGameState('gameover');
    setCurrentWord(null);
    updateHighScore(score);
    saveHighScoreToStorage(score);
    playGameOverSound();
  }, [playGameOverSound, score, updateHighScore, saveHighScoreToStorage]);

  const checkStageClear = useCallback(() => {
    if (questionCount >= 19) {
      currentStageIndexRef.current++;

      const shouldEndGame = settings.isRandomMode
        ? totalStagesCompleted + 1 >= settings.numStages
        : currentStageIndexRef.current >= settings.selectedStages.length;

      if (shouldEndGame) {
        setGameState('clear');
        updateHighScore(score);
        saveHighScoreToStorage(score);
        playGameClearSound();
      } else {
        setGameState('stageClear');
        playStageClearSound();
      }
      return true;
    }
    return false;
  }, [
    questionCount,
    totalStagesCompleted,
    settings.isRandomMode,
    settings.numStages,
    settings.selectedStages.length,
    playGameClearSound,
    playStageClearSound,
    score,
    updateHighScore,
    saveHighScoreToStorage,
  ]);

  const nextStage = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      if (settings.isRandomMode) {
        setCurrentBackground(getRandomBackground());
        setStage(
          settings.selectedStages[
            Math.floor(Math.random() * settings.selectedStages.length)
          ]
        );
      } else {
        setStage(settings.selectedStages[currentStageIndexRef.current]);
      }
      setQuestionCount(0);
      setInput('');
      setGameState('countdown');
      setQuestionHistory([]);
      setCurrentWord(null);
      setIsTransitioning(false);
      setTotalStagesCompleted((prev) => prev + 1);
      setLastCharacter('');
      startCountdown();
    }, 500);
  }, [
    settings.selectedStages,
    settings.isRandomMode,
    getRandomBackground,
    startCountdown,
  ]);

  const createNewWord = useCallback(() => {
    let text;
    const currentSet = stageSets[stage as keyof typeof stageSets];

    // Helper function to get the least used characters
    const getLeastUsedCharacters = (chars: string[]) => {
      const minFreq = Math.min(...chars.map(char => characterFrequency[char] || 0));
      return chars.filter(char => (characterFrequency[char] || 0) === minFreq);
    };

    const wouldRepeatTooMuch = (char: string) => {
      if (questionHistory.length < 2) return false;
      const lastTwo = questionHistory.slice(-2);
      return lastTwo[0] === char && lastTwo[1] === char;
    };

    const getAlternateChar = (char: string) => {
      return char === 'F' ? 'J' : 'F';
      const options = ['F', 'J'];
      const leastUsed = getLeastUsedCharacters(options);
      return leastUsed[Math.floor(Math.random() * leastUsed.length)];
    };

    if (stage === 1) {
      // F/J練習ステージでの処理
      const lastChar = questionHistory[questionHistory.length - 1];
      if (!lastChar) {
        const options = ['F', 'J'];
        const leastUsed = getLeastUsedCharacters(options);
        text = leastUsed[Math.floor(Math.random() * leastUsed.length)];
      } else {
        // 直前の文字が2回連続している場合は、異なる文字を強制的に選択
        if (wouldRepeatTooMuch(lastChar)) {
          text = getAlternateChar(lastChar);
        } else {
          const options = ['F', 'J'];
          const leastUsed = getLeastUsedCharacters(options);
          text = leastUsed[Math.floor(Math.random() * leastUsed.length)];
        }
      }
    } else {
      if (questionCount > 0 && questionCount % 4 === 3) {
        // F/J練習の挿入時も連続を防ぐ
        const lastChar = questionHistory[questionHistory.length - 1];
        if (lastChar === 'F' || lastChar === 'J') {
          text = getAlternateChar(lastChar);
        } else {
          const options = ['F', 'J'];
          const leastUsed = getLeastUsedCharacters(options);
          text = leastUsed[Math.floor(Math.random() * leastUsed.length)];
        }
      } else {
        if (settings.isRandomMode) {
          // Filter out F, J, and characters that would repeat too much
          let availableChars = availableCharacters.filter(
            char => 
              char !== 'F' && 
              char !== 'J' && 
              !wouldRepeatTooMuch(char)
          );
          
          // If no characters are available, use all characters except F and J
          if (availableChars.length === 0) {
            availableChars = availableCharacters.filter(
              char => char !== 'F' && char !== 'J'
            );
          }
          
          if (availableChars.length > 0) {
            const leastUsed = getLeastUsedCharacters(availableChars);
            text = leastUsed[Math.floor(Math.random() * leastUsed.length)];
          }
        } else {
          // Filter out F, J, and characters that would repeat too much
          let availableChars = currentSet.filter(
            char => 
              char !== 'F' && 
              char !== 'J' && 
              !wouldRepeatTooMuch(char)
          );
          
          // If no characters are available, use all characters except F and J
          if (availableChars.length === 0) {
            availableChars = currentSet.filter(
              char => char !== 'F' && char !== 'J'
            );
          }
          
          if (availableChars.length > 0) {
            const leastUsed = getLeastUsedCharacters(availableChars);
            text = leastUsed[Math.floor(Math.random() * leastUsed.length)];
          }
        }
      }
    }

    // Update question history
    if (text) {
      setQuestionHistory(prev => [...prev, text].slice(-2));
      setCharacterFrequency(prev => ({
        ...prev,
        [text]: (prev[text] || 0) + 1
      }));
    }

    setLastCharacter(text);
    setQuestionStartTime(Date.now());

    // Start question timer
    if (questionTimerRef.current) {
      clearTimeout(questionTimerRef.current);
    }
    
    questionTimerRef.current = setTimeout(() => {
      if (gameStateRef.current === 'playing') {
        setInput('');
        setShakeAnimation(true);
        setTimeout(() => setShakeAnimation(false), 500);
        setLife(prev => {
          const newLife = prev - 1;
          if (newLife <= 0) {
            gameOver();
          }
          return newLife;
        });
        setCurrentWord(createNewWord());
        playMissSound();
      }
    }, QUESTION_TIMEOUT);

    return {
      id: Date.now(),
      text,
      x: 50, // Center horizontally
      y: 50, // Center vertically
      speed: 0, // No movement needed
      startTime: Date.now(),
    };
  }, [
    stage,
    questionCount,
    settings.isRandomMode,
    availableCharacters,
    questionHistory,
    playMissSound,
  ]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (gameStateRef.current !== 'playing' || !currentWord) return;
      if (showSuccessEffect) return; // アニメーション中は入力を受け付けない

      if (e.isComposing) return;

      const key = e.key.toUpperCase();
      // キーの入力制限を緩和し、より多くの文字を受け付ける
      if (!/^[A-Z0-9\-.,;:@\[\]\\]$/.test(key)) return;

      const correctRomaji = convertToRomaji(currentWord.text);
      const newInput = (input + key).toUpperCase();

      // 入力が空の場合は、最初の文字が正しいかチェック
      if (input === '') {
        const expectedFirstChars = correctRomaji.map(romaji => romaji[0]);
        if (!expectedFirstChars.includes(key)) {
          playMissSound();
          setLife(prev => {
            const newLife = prev - 1;
            if (newLife <= 0) {
              gameOver();
            }
            return newLife;
          });
          setShakeAnimation(true);
          setTimeout(() => setShakeAnimation(false), 500);
          return;
        }
      }

      const isPartiallyCorrect = correctRomaji.some((romaji) =>
        romaji.startsWith(newInput)
      );

      if (!isPartiallyCorrect) {
        // 部分的に正しくない場合は何もしない（失敗音を鳴らさない）
        setInput(''); // 入力をリセットするだけ
        return;
      }

      setInput(newInput);
      playTypeSound(); // 正しい入力の場合のみタイプ音を鳴らす

      if (correctRomaji.includes(newInput)) {
        // Clear timeout timer immediately when correct answer is given
        if (questionTimerRef.current) {
          clearTimeout(questionTimerRef.current);
          questionTimerRef.current = null;
        }

        const elapsedTime = Date.now() - questionStartTime;
        const pointsEarned = calculateScore(elapsedTime);
        setScore((prev) => prev + pointsEarned);
        setInput('');
        setQuestionCount((prev) => prev + 1);
        playCorrectSound();

        if (currentWord) {
          createParticles(currentWord.x, currentWord.y);
          createScorePopup(pointsEarned, currentWord.x, currentWord.y);
          const currentWordCopy = currentWord; // 現在の単語を保存
          setShowSuccessEffect(true);
          
          // アニメーション完了後に次の問題を表示
          setTimeout(() => {
            setShowSuccessEffect(false);
            if (!checkStageClear()) {              
              setCurrentWord(createNewWord());
            }
          }, 600);
        }

        setScoreAnimation(true);
        setTimeout(() => setScoreAnimation(false), 300);
      }
    },
    [
      currentWord,
      input,
      convertToRomaji,
      playMissSound,
      playTypeSound,
      questionStartTime,
      calculateScore,
      playCorrectSound,
      createParticles,
      createScorePopup,
      checkStageClear,
      createNewWord,
    ]
  );

  useEffect(() => {
    if (gameState === 'playing') {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [gameState, handleKeyDown]);

  useEffect(() => {
    if (gameState === 'playing' && !currentWord && !isTransitioning) {
      setCurrentWord(createNewWord());
    }
  }, [gameState, currentWord, createNewWord, isTransitioning]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        if (gameState === 'start') {
          resetGame();
        } else if (gameState === 'stageClear') {
          nextStage();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, resetGame, nextStage]);

  return (
    <div className="aspect-[4/3] w-[780px] flex justify-center bg-gray-100 p-2 pt-[5vh] mx-auto">
      <div
        className="w-[700px] h-[525px] p-3 bg-gradient-to-b from-blue-100 to-blue-200 shadow-xl rounded-lg mx-auto"
        style={{
          transform: `scale(${settings.windowSize})`,
          transformOrigin: 'top center',
        }}
      >
        <GameHeader
          onAdminRequest={handleAdminRequest}
          isMuted={isMuted}
          setIsMuted={setIsMuted}
          totalStagesCompleted={totalStagesCompleted}
          questionCount={questionCount}
          gameState={gameState}
          life={life}
          score={score}
          highScore={highScore}
          scoreAnimation={scoreAnimation}
        />

        <GameScreen
          gameState={gameState}
          currentWord={currentWord}
          countdown={countdown}
          score={score}
          speedMultiplier={speedMultiplier}
          highScore={highScore}
          totalStagesCompleted={totalStagesCompleted}
          questionCount={questionCount}
          finalScoreRef={finalScoreRef}
          previousHighScoreRef={previousHighScoreRef}
          resetGame={resetGame}
          nextStage={nextStage}
          saveHighScoreToStorage={saveHighScoreToStorage}
          showSuccessEffect={showSuccessEffect}
          particles={particles}
          scorePopups={scorePopups}
          stage={stage}
          convertToRomaji={convertToRomaji}
          shakeAnimation={shakeAnimation}
          settings={settings}
          currentBackground={currentBackground}
          stageBackgrounds={stageBackgrounds}
        />

        {gameState === 'playing' && currentWord && (
          settings.showHands && (
            <div className="absolute bottom-0 left-0 right-0 transform translate-y-[30%]">
              <KeyboardHands
                highlightedKey={currentWord?.text || ''}
                currentInput={input}
                show={true}
                showSuccessEffect={showSuccessEffect}
              />
              <div className="mt-2">
                <KeyboardLayout
                  activeKey={currentWord?.text || ''}
                  currentInput={input}
                  showSuccessEffect={showSuccessEffect}
                />
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default TypingGame;