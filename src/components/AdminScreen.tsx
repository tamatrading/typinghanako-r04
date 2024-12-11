import React, { useState, useEffect, useCallback } from 'react';
import { Settings, ArrowLeft, Check, Shuffle } from 'lucide-react';

interface AdminScreenProps {
  onBack: () => void;
  onSettingsChange: (settings: {
    selectedStages: number[];
    speed: number;
    isRandomMode: boolean;
    numStages: number;
    showHands: boolean;
    windowSize: number;
  }) => void;
  currentSettings: {
    selectedStages: number[];
    speed: number;
    isRandomMode: boolean;
    numStages: number;
    showHands: boolean;
    windowSize: number;
  };
}

const stageGroups = [
  { id: 'basic', label: 'F/J練習', stages: [1] },
  { id: 'a', label: 'あ行', stages: [2] },
  { id: 'ka', label: 'か行', stages: [3] },
  { id: 'sa', label: 'さ行', stages: [4] },
  { id: 'ta', label: 'た行', stages: [5] },
  { id: 'na', label: 'な行', stages: [6] },
  { id: 'ha', label: 'は行', stages: [7] },
  { id: 'ma', label: 'ま行', stages: [8] },
  { id: 'ya', label: 'や行', stages: [9] },
  { id: 'wa', label: 'わ行', stages: [10] },
  { id: 'ga', label: 'が行', stages: [11] },
  { id: 'za', label: 'ざ行', stages: [12] },
  { id: 'da', label: 'だ行', stages: [13] },
  { id: 'ba', label: 'ば行', stages: [14] },
  { id: 'pa', label: 'ぱ行', stages: [15] },
  { id: 'kya', label: 'きゃ行', stages: [16] },
  { id: 'sha', label: 'しゃ行', stages: [17] },
  { id: 'cha', label: 'ちゃ行', stages: [18] },
  { id: 'nya', label: 'にゃ行', stages: [19] },
  { id: 'hya', label: 'ひゃ行', stages: [20] },
  { id: 'mya', label: 'みゃ行', stages: [21] },
  { id: 'rya', label: 'りゃ行', stages: [22] },
  { id: 'fa', label: 'ふぁ行', stages: [23] },
  { id: 'gya', label: 'ぎゃ行', stages: [24] },
  { id: 'ja', label: 'じゃ行', stages: [25] },
  { id: 'dya', label: 'ぢゃ行', stages: [26] },
  { id: 'bya', label: 'びゃ行', stages: [27] },
  { id: 'pya', label: 'ぴゃ行', stages: [28] },
  { id: 'sokuon1', label: 'た行促音', stages: [29] },
  { id: 'sokuon2', label: 'ちゃ行促音', stages: [30] },
  { id: 'sokuon3', label: 'ぱ行促音', stages: [31] },
  { id: 'sokuon4', label: 'か/さ行促音', stages: [32] },
  { id: 'small', label: '小書き', stages: [33] }
];

const AdminScreen: React.FC<AdminScreenProps> = ({
  onBack,
  onSettingsChange,
  currentSettings,
}) => {
  const [speed, setSpeed] = useState(currentSettings.speed);
  const [selectedGroups, setSelectedGroups] = useState<string[]>(() => {
    const allGroups = stageGroups.map(group => group.id);
    return allGroups.filter(groupId => {
      const group = stageGroups.find(g => g.id === groupId);
      return group?.stages.some(stage => currentSettings.selectedStages.includes(stage));
    });
  });
  const [isRandomMode, setIsRandomMode] = useState(currentSettings.isRandomMode);
  const [numStages, setNumStages] = useState(currentSettings.numStages);
  const [showHands, setShowHands] = useState(currentSettings.showHands);
  const [windowSize, setWindowSize] = useState(currentSettings.windowSize);
  const [showWarning, setShowWarning] = useState(false);

  const updateSettings = useCallback(() => {
    const currentStages = Array.from(
      new Set(
        selectedGroups.flatMap(
          (id) => stageGroups.find((group) => group.id === id)?.stages || []
        )
      )
    ).sort((a, b) => a - b);

    if (currentStages.length > 0) {
      onSettingsChange({ selectedStages: currentStages, speed, isRandomMode, numStages, showHands, windowSize });
    }
  }, [selectedGroups, speed, isRandomMode, numStages, showHands, windowSize, onSettingsChange]);

  useEffect(() => {
    updateSettings();
  }, [updateSettings]);

  const toggleStageGroup = (groupId: string) => {
    setSelectedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
    setShowWarning(false);
  };

  const selectAll = () => {
    setSelectedGroups(stageGroups.map((g) => g.id));
    setShowWarning(false);
  };

  const clearAll = () => {
    setSelectedGroups([]);
    setShowWarning(false);
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
  };

  const toggleRandomMode = () => {
    setIsRandomMode((prev) => {
      const newValue = !prev;
      if (newValue) {
        // ランダムモードがONになった時、F/J練習を選択から外す
        setSelectedGroups(prev => prev.filter(id => id !== 'basic'));
      }
      return newValue;
    });
  };

  const toggleShowHands = () => {
    setShowHands((prev) => !prev);
  };

  const handleBack = () => {
    if (selectedGroups.length === 0) {
      setShowWarning(true);
      return;
    }
    onBack();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-blue-100 to-blue-200 p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl p-8">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="mr-2" />
            戻る
          </button>
          <h2 className="text-2xl font-bold flex items-center">
            <Settings className="mr-2" />
            管理画面
          </h2>
          <div className="w-[72px]"></div>
        </div>

        {showWarning && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            最低一つの選択をしてください
          </div>
        )}

        <div className="space-y-8">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">実施ステージ選択</h3>
              <div className="space-x-2">
                <button
                  onClick={selectAll}
                  className="px-3 py-1 text-sm rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                >
                  すべて選択
                </button>
                <button
                  onClick={clearAll}
                  className="px-3 py-1 text-sm rounded-md bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  選択解除
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {stageGroups.map((group) => (
                <button
                  key={group.id}
                  disabled={isRandomMode && group.id === 'basic'}
                  onClick={() => toggleStageGroup(group.id)}
                  className={`p-3 rounded-lg border-2 transition-all relative ${
                    isRandomMode && group.id === 'basic'
                      ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                      : 
                    selectedGroups.includes(group.id)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  {selectedGroups.includes(group.id) && !isRandomMode && (
                    <Check className="absolute top-1 right-1 w-4 h-4 text-blue-500" />
                  )}
                  {group.label}
                  {isRandomMode && group.id === 'basic' && (
                    <div className="text-xs text-gray-500 mt-1">
                      ランダムモードでは選択できません
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">出題モード</h3>
            <button
              onClick={toggleRandomMode}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-all ${
                isRandomMode
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
              }`}
            >
              <Shuffle
                className={`w-5 h-5 ${
                  isRandomMode ? 'text-purple-500' : 'text-gray-500'
                }`}
              />
              <span>ランダム出題</span>
              {isRandomMode && (
                <Check className="w-4 h-4 text-purple-500 ml-2" />
              )}
            </button>
          </div>

          {isRandomMode && (
            <div className="mt-4">
              <h3 className="text-xl font-semibold mb-4">ステージ数</h3>
              <input
                type="number"
                min="1"
                max="100"
                value={numStages}
                onChange={(e) => setNumStages(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                className="w-24 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
          )}

          <div>
            <h3 className="text-xl font-semibold mb-4">キーボードの表示</h3>
            <button
              onClick={toggleShowHands}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-all ${
                showHands
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              <span>キーボードの表示 {showHands ? 'ON' : 'OFF'}</span>
              {showHands && (
                <Check className="w-4 h-4 text-blue-500 ml-2" />
              )}
            </button>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">落下速度調整（1:ゆっくり 5:はやい）</h3>
            <div className="flex items-center space-x-4">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => handleSpeedChange(value)}
                  className={`w-12 h-12 rounded-lg border-2 transition-all ${
                    speed === value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">ウィンドウ倍率（0.5〜2まで）</h3>
            <input
              type="number"
              min="0.5"
              max="2"
              step="0.1"
              value={windowSize}
              onChange={(e) => setWindowSize(Math.max(0.5, Math.min(2, parseFloat(e.target.value) || 1)))}
              className="w-24 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">現在の設定</h4>
            <p className="mb-1">
              選択された行:{' '}
              {selectedGroups.length === 0
                ? 'なし'
                : stageGroups
                    .filter((group) => selectedGroups.includes(group.id))
                    .map((group) => group.label)
                    .join(', ')}
            </p>
            <p className="mb-1">
              出題モード: {isRandomMode ? 'ランダム' : '順番通り'}
            </p>
            {isRandomMode && (
              <p className="mb-1">
                ステージ数: {numStages}
              </p>
            )}
            <p className="mb-1">
              キーボードの表示: {showHands ? '表示' : '非表示'}
            </p>
            <p className="mb-1">落下速度: {speed}</p>
            <p>ウィンドウ倍率: {windowSize}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminScreen;