import React from 'react';
import { Settings, Volume2, VolumeX, Heart } from 'lucide-react';

interface GameHeaderProps {
  onAdminRequest: () => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  totalStagesCompleted: number;
  questionCount: number;
  gameState: string;
  life: number;
  score: number;
  highScore: number;
  scoreAnimation: boolean;
}

const GameHeader: React.FC<GameHeaderProps> = ({
  onAdminRequest,
  isMuted,
  setIsMuted,
  totalStagesCompleted,
  questionCount,
  gameState,
  life,
  score,
  highScore,
  scoreAnimation,
}) => {
  return (
    <div className="text-center mb-2">
      <div className="flex justify-between items-start">
        <div className="flex-1 text-left">
          <button
            onClick={onAdminRequest}
            className="flex items-center gap-1 px-2 py-0.5 text-xs rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
          >
            <Settings className="w-4 h-4" />
            管理
          </button>
        </div>
        <div className="flex-1">
          <p className={`text-2xl font-bold transform transition-all duration-300 ${
            scoreAnimation ? 'scale-125 text-green-600' : ''
          }`}>
            スコア: {score}
          </p>
          <p className="text-xs text-gray-600">ハイスコア: {highScore}</p>
        </div>
        <div className="flex-1 text-right">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-0.5 rounded-full hover:bg-gray-200 transition-transform hover:scale-110"
          >
            {isMuted ? <VolumeX /> : <Volume2 />}
          </button>
        </div>
      </div>
      <div className="flex justify-between items-center px-1 mt-1">
        <div>
          <p className="text-xs">ステージ {totalStagesCompleted + 1}</p>
          {gameState === 'playing' && (
            <p className="text-xs">のこり {20 - questionCount}問</p>
          )}
        </div>
        <div className="flex flex-col items-center">
          <p className="text-xs mb-0.5">ライフポイント：{life}</p>
          <div className="flex gap-1">
          {[...Array(life)].map((_, i) => (
            <Heart
              key={i}
              className={`text-red-500 transition-transform hover:scale-125 ${
                life <= 3 ? 'animate-[heartbeat_0.8s_ease-in-out_infinite]' : ''
              }`}
              size={12}
              fill="red"
            />
          ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameHeader;