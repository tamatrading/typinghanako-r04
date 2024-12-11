import React, { useState, useEffect } from 'react';

interface TimeoutBarProps {
  startTime: number;
  timeout: number;
  isPaused: boolean;
}

const TimeoutBar: React.FC<TimeoutBarProps> = ({ startTime, timeout, isPaused }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    setProgress(100);
    let animationFrameId: number;

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.max(0, 100 - (elapsed / timeout) * 100);
      if (!isPaused) {
        setProgress(newProgress);
      }

      if (newProgress > 0 && !isPaused) {
        animationFrameId = requestAnimationFrame(updateProgress);
      }
    };

    animationFrameId = requestAnimationFrame(updateProgress);
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [startTime, timeout, isPaused]);

  const getBarColor = () => {
    if (progress > 66) return 'bg-green-500';
    if (progress > 33) return 'bg-yellow-500';
    return progress > 0 ? 'bg-red-500' : 'bg-gray-400';
  };

  return (
    <div className="w-full h-4 bg-gray-200/50 rounded-full overflow-hidden ring-2 ring-white/80">
      <div
        className={`h-full transition-all duration-100 ${getBarColor()}`}
        style={{
          width: `${progress}%`,
          transition: 'none'
        }}
      />
    </div>
  );
};

export default TimeoutBar;