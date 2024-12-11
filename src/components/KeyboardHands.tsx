import React from 'react';
import { romajiMap } from '../constants/gameConstants';

interface FingerPosition {
  hand: 'left' | 'right';
  finger: number;
  key: string;
}

interface Props {
  highlightedKey: string;
  currentInput: string;
  show: boolean;
  showSuccessEffect: boolean;
}

const KeyboardHands: React.FC<Props> = ({
  highlightedKey,
  currentInput,
  show,
  showSuccessEffect,
}) => {
  if (!show) return null;

  // Define finger positions for each romaji key
  const fingerMap: Record<string, FingerPosition> = {
    // Left hand - top row
    Q: { hand: 'left', finger: 3, key: 'Q' },
    W: { hand: 'left', finger: 2, key: 'W' },
    E: { hand: 'left', finger: 1, key: 'E' },
    R: { hand: 'left', finger: 0, key: 'R' },
    T: { hand: 'left', finger: 0, key: 'T' },
    // Right hand - top row
    Y: { hand: 'right', finger: 0, key: 'Y' },
    U: { hand: 'right', finger: 0, key: 'U' },
    I: { hand: 'right', finger: 1, key: 'I' },
    O: { hand: 'right', finger: 2, key: 'O' },
    P: { hand: 'right', finger: 3, key: 'P' },
    // Left hand - home row
    A: { hand: 'left', finger: 3, key: 'A' },
    S: { hand: 'left', finger: 2, key: 'S' },
    D: { hand: 'left', finger: 1, key: 'D' },
    F: { hand: 'left', finger: 0, key: 'F' },
    G: { hand: 'left', finger: 0, key: 'G' },
    // Right hand - home row
    H: { hand: 'right', finger: 0, key: 'H' },
    J: { hand: 'right', finger: 0, key: 'J' },
    K: { hand: 'right', finger: 1, key: 'K' },
    L: { hand: 'right', finger: 2, key: 'L' },
    ';': { hand: 'right', finger: 3, key: ';' },
    // Left hand - bottom row
    Z: { hand: 'left', finger: 3, key: 'Z' },
    X: { hand: 'left', finger: 2, key: 'X' },
    C: { hand: 'left', finger: 1, key: 'C' },
    V: { hand: 'left', finger: 0, key: 'V' },
    B: { hand: 'left', finger: 0, key: 'B' },
    // Right hand - bottom row
    N: { hand: 'right', finger: 0, key: 'N' },
    M: { hand: 'right', finger: 0, key: 'M' },
    ',': { hand: 'right', finger: 1, key: ',' },
    '.': { hand: 'right', finger: 2, key: '.' },
    '/': { hand: 'right', finger: 3, key: '/' },
  };

  const getFingerPositions = (key: string, input: string): FingerPosition[] => {
    if (!key) return [];

    // For direct key mapping
    if (fingerMap[key]) {
      return [fingerMap[key]];
    }

    // For hiragana, get all possible romaji characters
    const romaji = romajiMap[key as keyof typeof romajiMap];
    if (!romaji || !romaji[0]) return [];

    const correctRomaji = romaji[0];
    if (!correctRomaji) return [];

    // If no input yet, show the first character's position
    if (!input) {
      const firstChar = correctRomaji[0];
      return fingerMap[firstChar] ? [fingerMap[firstChar]] : [];
    }

    // Show the next character's position based on current input
    const nextCharIndex = input.length;
    if (nextCharIndex < correctRomaji.length) {
      return fingerMap[correctRomaji[nextCharIndex]]
        ? [fingerMap[correctRomaji[nextCharIndex]]]
        : [];
    }

    return [];
  };

  const activeKey = highlightedKey.toUpperCase();
  const fingerPositions = getFingerPositions(activeKey, currentInput);

  //  <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-32 opacity-90 pointer-events-none select-none">

  return (
    <div className="absolute bottom-4 left-0 right-0 flex justify-start pl-24 space-x-32 opacity-90 pointer-events-none select-none">
      {/* Left Hand */}
      <div className="flex space-x-2 items-end">
        {[3, 2, 1, 0].map((finger) => (
          <div
            key={`left-${finger}`}
            className={`${finger === 3 ? 'w-6' : 'w-8'} ${
              finger === 1
                ? 'h-[2.25rem]' // 中指は20%長く
                : finger === 3
                ? 'h-[1.5rem]' // 小指は20%短く
                : 'h-[1.875rem]'
            } rounded-t-full transition-all duration-200 transform origin-bottom ${
              !showSuccessEffect && fingerPositions.some(
                (pos) => pos.hand === 'left' && pos.finger === finger
              )
                ? 'bg-blue-500'
                : 'bg-gray-300/90'
            } hover:scale-105`}
          />
        ))}
      </div>

      {/* Right Hand */}
      <div className="flex space-x-2 items-end">
        {[0, 1, 2, 3].map((finger) => (
          <div
            key={`right-${finger}`}
            className={`${finger === 3 ? 'w-6' : 'w-8'} ${
              finger === 1
                ? 'h-[2.25rem]' // 中指は20%長く
                : finger === 3
                ? 'h-[1.5rem]' // 小指は20%短く
                : 'h-[1.875rem]'
            } rounded-t-full transition-all duration-200 transform origin-bottom ${
              !showSuccessEffect && fingerPositions.some(
                (pos) => pos.hand === 'right' && pos.finger === finger
              )
                ? 'bg-blue-500'
                : 'bg-gray-300/90'
            } hover:scale-105`}
          />
        ))}
      </div>
    </div>
  );
};

export default KeyboardHands;
