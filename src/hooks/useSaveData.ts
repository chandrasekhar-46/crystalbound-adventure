/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { GameSaveData, DEFAULT_SAVE_DATA, DifficultyMode } from '../types/game';
import { soundManager } from '../audio/soundManager';

const STORAGE_KEY_V2 = 'crystalbound_save_v2';
const STORAGE_KEY_V1 = 'crystalbound_save_v1';

export function useSaveData() {
  const [saveData, setSaveData] = useState<GameSaveData>(() => {
    try {
      // 1. Try loading version 2 data
      const storedV2 = localStorage.getItem(STORAGE_KEY_V2);
      if (storedV2) {
        const parsed = JSON.parse(storedV2);
        return validateAndSanitizeSave(parsed);
      }

      // 2. Try migrating legacy version 1 data
      const storedV1 = localStorage.getItem(STORAGE_KEY_V1);
      if (storedV1) {
        const parsedV1 = JSON.parse(storedV1);
        const highestLvl = Math.max(1, Math.min(100, Number(parsedV1.highestUnlockedLevel) || 1));
        const completed = Array.isArray(parsedV1.completedLevels) ? parsedV1.completedLevels : [];
        const maxWorld = Math.max(1, Math.min(10, Math.ceil(highestLvl / 10)));
        const unlockedWorlds = Array.from({ length: maxWorld }, (_, i) => i + 1);

        const migrated: GameSaveData = {
          version: 2,
          highestUnlockedLevel: highestLvl,
          completedLevels: completed,
          unlockedWorlds,
          selectedDifficulty: 'normal',
          levelScores: parsedV1.levelScores && typeof parsedV1.levelScores === 'object' ? parsedV1.levelScores : {},
          levelBestTimes: {},
          totalScore: Number(parsedV1.totalScore) || 0,
          highScore: Number(parsedV1.highScore) || 0,
          totalCrystalsCollectedAllTime: completed.length * 4,
          achievements: {},
          soundSettings: {
            music: typeof parsedV1.soundSettings?.music === 'boolean' ? parsedV1.soundSettings.music : true,
            sfx: typeof parsedV1.soundSettings?.sfx === 'boolean' ? parsedV1.soundSettings.sfx : true,
            masterVolume: typeof parsedV1.soundSettings?.masterVolume === 'number' ? parsedV1.soundSettings.masterVolume : 0.7,
          },
          accessibility: {
            reducedMotion: typeof parsedV1.accessibility?.reducedMotion === 'boolean' ? parsedV1.accessibility.reducedMotion : false,
          },
        };

        // Persist migrated save immediately
        localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(migrated));
        return migrated;
      }

      return DEFAULT_SAVE_DATA;
    } catch {
      return DEFAULT_SAVE_DATA;
    }
  });

  // Keep audio manager in sync with sound settings
  useEffect(() => {
    soundManager.updateSettings(saveData.soundSettings);
  }, [saveData.soundSettings]);

  // Persist to localStorage
  const save = useCallback((newData: GameSaveData) => {
    try {
      localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(newData));
      setSaveData(newData);
    } catch {
      setSaveData(newData);
    }
  }, []);

  const updateSoundSettings = useCallback((settings: Partial<GameSaveData['soundSettings']>) => {
    setSaveData(prev => {
      const updated = {
        ...prev,
        soundSettings: { ...prev.soundSettings, ...settings },
      };
      try {
        localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const updateAccessibility = useCallback((accessibility: Partial<GameSaveData['accessibility']>) => {
    setSaveData(prev => {
      const updated = {
        ...prev,
        accessibility: { ...prev.accessibility, ...accessibility },
      };
      try {
        localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const updateDifficulty = useCallback((difficulty: DifficultyMode) => {
    setSaveData(prev => {
      const updated = { ...prev, selectedDifficulty: difficulty };
      try {
        localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const unlockAchievement = useCallback((achievementId: string): boolean => {
    let unlocked = false;
    setSaveData(prev => {
      if (prev.achievements[achievementId]) return prev;
      unlocked = true;
      const updated = {
        ...prev,
        achievements: { ...prev.achievements, [achievementId]: true },
      };
      try {
        localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    return unlocked;
  }, []);

  const recordCrystalCollected = useCallback(() => {
    setSaveData(prev => {
      const newTotal = prev.totalCrystalsCollectedAllTime + 1;
      const updated = { ...prev, totalCrystalsCollectedAllTime: newTotal };
      try {
        localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const completeLevel = useCallback((levelId: number, score: number, timeTakenSeconds: number) => {
    setSaveData(prev => {
      const nextLevel = Math.min(100, levelId + 1);
      const highestUnlocked = Math.max(prev.highestUnlockedLevel, nextLevel);
      const completed = prev.completedLevels.includes(levelId)
        ? prev.completedLevels
        : [...prev.completedLevels, levelId];

      // Update worlds unlocked
      const unlockedWorldCount = Math.max(1, Math.min(10, Math.ceil(highestUnlocked / 10)));
      const unlockedWorlds = Array.from({ length: unlockedWorldCount }, (_, i) => i + 1);

      // Best score
      const prevScore = prev.levelScores[levelId] || 0;
      const levelScores = { ...prev.levelScores, [levelId]: Math.max(prevScore, score) };

      // Best time
      const prevTime = prev.levelBestTimes[levelId] || 999999;
      const levelBestTimes = { ...prev.levelBestTimes, [levelId]: Math.min(prevTime, Math.round(timeTakenSeconds)) };

      const newTotalScore = prev.totalScore + score;
      const newHighScore = Math.max(prev.highScore, newTotalScore);

      const updated: GameSaveData = {
        ...prev,
        highestUnlockedLevel: highestUnlocked,
        completedLevels: completed,
        unlockedWorlds,
        levelScores,
        levelBestTimes,
        totalScore: newTotalScore,
        highScore: newHighScore,
      };

      try {
        localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(updated));
      } catch {}

      return updated;
    });
  }, []);

  const resetProgress = useCallback(() => {
    const fresh: GameSaveData = {
      ...DEFAULT_SAVE_DATA,
      soundSettings: saveData.soundSettings,
      accessibility: saveData.accessibility,
      selectedDifficulty: saveData.selectedDifficulty,
    };
    try {
      localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(fresh));
    } catch {}
    setSaveData(fresh);
  }, [saveData.soundSettings, saveData.accessibility, saveData.selectedDifficulty]);

  return {
    saveData,
    save,
    updateSoundSettings,
    updateAccessibility,
    updateDifficulty,
    unlockAchievement,
    recordCrystalCollected,
    completeLevel,
    resetProgress,
  };
}

function validateAndSanitizeSave(parsed: any): GameSaveData {
  const highestLvl = Math.max(1, Math.min(100, Number(parsed.highestUnlockedLevel) || 1));
  const completed = Array.isArray(parsed.completedLevels)
    ? parsed.completedLevels.filter((x: any) => typeof x === 'number' && x >= 1 && x <= 100)
    : [];

  const maxWorld = Math.max(1, Math.min(10, Math.ceil(highestLvl / 10)));
  const unlockedWorlds = Array.isArray(parsed.unlockedWorlds) && parsed.unlockedWorlds.length > 0
    ? parsed.unlockedWorlds
    : Array.from({ length: maxWorld }, (_, i) => i + 1);

  const diff: DifficultyMode = ['easy', 'normal', 'hard'].includes(parsed.selectedDifficulty)
    ? parsed.selectedDifficulty
    : 'normal';

  return {
    version: 2,
    highestUnlockedLevel: highestLvl,
    completedLevels: completed,
    unlockedWorlds,
    selectedDifficulty: diff,
    levelScores: parsed.levelScores && typeof parsed.levelScores === 'object' ? parsed.levelScores : {},
    levelBestTimes: parsed.levelBestTimes && typeof parsed.levelBestTimes === 'object' ? parsed.levelBestTimes : {},
    totalScore: Math.max(0, Number(parsed.totalScore) || 0),
    highScore: Math.max(0, Number(parsed.highScore) || 0),
    totalCrystalsCollectedAllTime: Math.max(0, Number(parsed.totalCrystalsCollectedAllTime) || 0),
    achievements: parsed.achievements && typeof parsed.achievements === 'object' ? parsed.achievements : {},
    soundSettings: {
      music: typeof parsed.soundSettings?.music === 'boolean' ? parsed.soundSettings.music : true,
      sfx: typeof parsed.soundSettings?.sfx === 'boolean' ? parsed.soundSettings.sfx : true,
      masterVolume: typeof parsed.soundSettings?.masterVolume === 'number' ? parsed.soundSettings.masterVolume : 0.7,
    },
    accessibility: {
      reducedMotion: typeof parsed.accessibility?.reducedMotion === 'boolean' ? parsed.accessibility.reducedMotion : false,
    },
  };
}
