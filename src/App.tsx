/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import { ScreenState, LevelId, SCORING, Achievement, DifficultyMode } from './types/game';
import { getLevel } from './data/levels';
import { useSaveData } from './hooks/useSaveData';
import { soundManager } from './audio/soundManager';
import { ACHIEVEMENTS } from './engine/achievements';
import { MainMenu } from './components/MainMenu';
import { StoryIntroModal } from './components/StoryIntroModal';
import { GameCanvas } from './components/GameCanvas';
import { PauseModal } from './components/PauseModal';
import { WorldMapModal } from './components/WorldMapModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { SettingsModal } from './components/SettingsModal';
import { CreditsModal } from './components/CreditsModal';
import { LevelCompleteModal } from './components/LevelCompleteModal';
import { GameOverModal } from './components/GameOverModal';
import { TimeUpModal } from './components/TimeUpModal';
import { VictoryModal } from './components/VictoryModal';
import { AchievementToast } from './components/AchievementToast';

export default function App() {
  const {
    saveData,
    updateSoundSettings,
    updateAccessibility,
    updateDifficulty,
    unlockAchievement,
    recordCrystalCollected,
    completeLevel,
    resetProgress,
  } = useSaveData();

  const [screenState, setScreenState] = useState<ScreenState>('MENU');
  const [previousScreenState, setPreviousScreenState] = useState<ScreenState>('MENU');
  const [currentLevelId, setCurrentLevelId] = useState<LevelId>(1);
  const [sessionScore, setSessionScore] = useState<number>(0);
  const [lastLevelScore, setLastLevelScore] = useState<number>(0);
  const [lastTimeBonus, setLastTimeBonus] = useState<number>(0);
  const [lastRemainingTime, setLastRemainingTime] = useState<number>(0);
  const [attemptScore, setAttemptScore] = useState<number>(0);
  const [attemptCrystals, setAttemptCrystals] = useState<number>(0);
  const [restartCounter, setRestartCounter] = useState<number>(0);
  const [activeAchievement, setActiveAchievement] = useState<Achievement | null>(null);

  // Trigger achievement toast
  const triggerAchievement = useCallback((achId: string) => {
    const isNew = unlockAchievement(achId);
    if (isNew && ACHIEVEMENTS[achId]) {
      setActiveAchievement(ACHIEVEMENTS[achId]);
      soundManager.playUiClick();
    }
  }, [unlockAchievement]);

  // Audio Toggle
  const handleToggleSound = useCallback(() => {
    const isCurrentlyOn = saveData.soundSettings.music || saveData.soundSettings.sfx;
    updateSoundSettings({
      music: !isCurrentlyOn,
      sfx: !isCurrentlyOn,
    });
  }, [saveData.soundSettings, updateSoundSettings]);

  // Main Menu Actions
  const handleStartPlay = useCallback(() => {
    if (saveData.completedLevels.length === 0 && saveData.highestUnlockedLevel === 1) {
      setScreenState('INTRO');
    } else {
      setCurrentLevelId(1);
      setSessionScore(0);
      setScreenState('PLAYING');
      soundManager.startMusic();
    }
  }, [saveData.completedLevels.length, saveData.highestUnlockedLevel]);

  const handleContinue = useCallback(() => {
    setCurrentLevelId(saveData.highestUnlockedLevel);
    setSessionScore(saveData.totalScore);
    setScreenState('PLAYING');
    soundManager.startMusic();
  }, [saveData.highestUnlockedLevel, saveData.totalScore]);

  const handleIntroComplete = useCallback(() => {
    setCurrentLevelId(1);
    setSessionScore(0);
    setScreenState('PLAYING');
    soundManager.startMusic();
  }, []);

  const handleSelectLevel = useCallback((id: LevelId) => {
    setCurrentLevelId(id);
    setSessionScore(saveData.totalScore);
    setScreenState('PLAYING');
    soundManager.startMusic();
  }, [saveData.totalScore]);

  // Level Completion Handler
  const handleLevelComplete = useCallback((
    finalLevelScore: number,
    timeBonus: number,
    remainingSeconds: number,
    tookDamage: boolean
  ) => {
    setLastLevelScore(finalLevelScore);
    setLastTimeBonus(timeBonus);
    setLastRemainingTime(remainingSeconds);
    setSessionScore(prev => prev + finalLevelScore);

    const levelConfig = getLevel(currentLevelId, saveData.selectedDifficulty);
    const timeTaken = Math.max(1, levelConfig.timeLimit - remainingSeconds);
    completeLevel(currentLevelId, finalLevelScore, timeTaken);

    // Achievement Checks
    triggerAchievement('first_crystal');

    if (currentLevelId === 10) {
      triggerAchievement('forest_explorer');
    }
    if (currentLevelId === 50) {
      triggerAchievement('halfway_hero');
    }
    if (currentLevelId === 100) {
      triggerAchievement('master_aetherfall');
    }
    if (remainingSeconds >= levelConfig.timeLimit * 0.5) {
      triggerAchievement('speed_seeker');
    }
    if (levelConfig.hazards.length > 0 && !tookDamage) {
      triggerAchievement('perfect_path');
    }
    if (saveData.totalCrystalsCollectedAllTime + levelConfig.targetCrystals >= 50) {
      triggerAchievement('crystal_collector');
    }

    if (currentLevelId === 100) {
      // Grand Final Victory of 100 Realms!
      setScreenState('GAME_VICTORY');
    } else {
      setScreenState('LEVEL_COMPLETE');
    }
  }, [currentLevelId, saveData, completeLevel, triggerAchievement]);

  // Time-Up Handler
  const handleTimeUp = useCallback((scoreSoFar: number, crystalsGathered: number) => {
    setAttemptScore(scoreSoFar);
    setAttemptCrystals(crystalsGathered);
    setScreenState('TIME_UP');
  }, []);

  // Game Over Handler
  const handleGameOver = useCallback(() => {
    setScreenState('GAME_OVER');
  }, []);

  const handleNextLevel = useCallback(() => {
    const nextId = currentLevelId + 1;
    if (nextId <= 100) {
      setCurrentLevelId(nextId);
      setRestartCounter(c => c + 1);
      setScreenState('PLAYING');
    } else {
      setScreenState('GAME_VICTORY');
    }
  }, [currentLevelId]);

  const handleRestartLevel = useCallback(() => {
    setRestartCounter(c => c + 1);
    setScreenState('PLAYING');
  }, []);

  const handlePlayAgain = useCallback(() => {
    setCurrentLevelId(1);
    setSessionScore(0);
    setRestartCounter(c => c + 1);
    setScreenState('PLAYING');
    soundManager.startMusic();
  }, []);

  const handleReturnToMenu = useCallback(() => {
    setScreenState('MENU');
  }, []);

  const handleOpenWorldMap = useCallback(() => {
    setScreenState('LEVEL_SELECT');
  }, []);

  const currentLevelConfig = getLevel(currentLevelId, saveData.selectedDifficulty);

  return (
    <div className="fixed inset-0 w-full h-full h-[100dvh] bg-stone-950 font-sans text-stone-100 flex flex-col overflow-hidden select-none">
      {/* Achievement Toast */}
      <AchievementToast
        achievement={activeAchievement}
        onDismiss={() => setActiveAchievement(null)}
      />

      {/* 1. Main Menu */}
      {screenState === 'MENU' && (
        <MainMenu
          saveData={saveData}
          onPlay={handleStartPlay}
          onContinue={handleContinue}
          onLevelSelect={handleOpenWorldMap}
          onHowToPlay={() => setScreenState('HOW_TO_PLAY')}
          onSettings={() => {
            setPreviousScreenState('MENU');
            setScreenState('SETTINGS');
          }}
          onCredits={() => setScreenState('CREDITS')}
          onToggleSound={handleToggleSound}
        />
      )}

      {/* 2. Story Introduction Modal */}
      {screenState === 'INTRO' && (
        <StoryIntroModal onStartGame={handleIntroComplete} />
      )}

      {/* 3. Game Playing / Paused / Level Complete / Game Over View */}
      {(screenState === 'PLAYING' || screenState === 'PAUSED' || screenState === 'LEVEL_COMPLETE' || screenState === 'TIME_UP' || screenState === 'GAME_OVER') && (
        <GameCanvas
          key={`level_${currentLevelId}_${saveData.selectedDifficulty}_${restartCounter}`}
          level={currentLevelConfig}
          difficulty={saveData.selectedDifficulty}
          sessionScore={sessionScore}
          highScore={saveData.highScore}
          soundEnabled={saveData.soundSettings.sfx || saveData.soundSettings.music}
          reducedMotion={saveData.accessibility.reducedMotion}
          isPaused={screenState === 'PAUSED' || screenState === 'LEVEL_COMPLETE' || screenState === 'TIME_UP' || screenState === 'GAME_OVER'}
          onPause={() => setScreenState('PAUSED')}
          onToggleSound={handleToggleSound}
          onLevelComplete={handleLevelComplete}
          onTimeUp={handleTimeUp}
          onGameOver={handleGameOver}
          onCrystalCollected={recordCrystalCollected}
        />
      )}

      {/* 4. Pause Menu */}
      {screenState === 'PAUSED' && (
        <PauseModal
          levelName={currentLevelConfig.name}
          levelNumber={currentLevelId}
          score={sessionScore}
          onResume={() => setScreenState('PLAYING')}
          onRestartLevel={handleRestartLevel}
          onWorldMap={handleOpenWorldMap}
          onOpenSettings={() => {
            setPreviousScreenState('PAUSED');
            setScreenState('SETTINGS');
          }}
          onMainMenu={handleReturnToMenu}
        />
      )}

      {/* 5. World Map Modal (10 Worlds, 100 Levels) */}
      {screenState === 'LEVEL_SELECT' && (
        <WorldMapModal
          saveData={saveData}
          onSelectLevel={handleSelectLevel}
          onSelectDifficulty={updateDifficulty}
          onClose={handleReturnToMenu}
        />
      )}

      {/* 6. How to Play Modal */}
      {screenState === 'HOW_TO_PLAY' && (
        <HowToPlayModal onClose={handleReturnToMenu} />
      )}

      {/* 7. Settings Modal */}
      {screenState === 'SETTINGS' && (
        <SettingsModal
          saveData={saveData}
          onUpdateSound={updateSoundSettings}
          onUpdateAccessibility={updateAccessibility}
          onUpdateDifficulty={updateDifficulty}
          onResetProgress={resetProgress}
          onClose={() => {
            setScreenState(previousScreenState);
          }}
        />
      )}

      {/* 8. Credits Modal */}
      {screenState === 'CREDITS' && (
        <CreditsModal onClose={handleReturnToMenu} />
      )}

      {/* 9. Level Complete Modal */}
      {screenState === 'LEVEL_COMPLETE' && (
        <LevelCompleteModal
          level={currentLevelConfig}
          crystalsCollected={currentLevelConfig.targetCrystals}
          totalCrystals={currentLevelConfig.targetCrystals}
          levelScore={lastLevelScore}
          timeBonus={lastTimeBonus}
          timeRemaining={lastRemainingTime}
          difficulty={saveData.selectedDifficulty}
          totalScore={sessionScore}
          isFinalLevel={currentLevelId === 100}
          onNextLevel={handleNextLevel}
          onPlayAgain={handleRestartLevel}
          onMainMenu={handleReturnToMenu}
        />
      )}

      {/* 10. Game Over Modal */}
      {screenState === 'GAME_OVER' && (
        <GameOverModal
          onPlayAgain={handleRestartLevel}
          onMainMenu={handleReturnToMenu}
        />
      )}

      {/* 11. Time-Up Modal */}
      {screenState === 'TIME_UP' && (
        <TimeUpModal
          level={currentLevelConfig}
          crystalsCollected={attemptCrystals}
          totalCrystals={currentLevelConfig.targetCrystals}
          attemptScore={attemptScore}
          onRestart={handleRestartLevel}
          onWorldMap={handleOpenWorldMap}
          onMainMenu={handleReturnToMenu}
        />
      )}

      {/* 12. Final Game Victory Screen (All 100 Levels) */}
      {screenState === 'GAME_VICTORY' && (
        <VictoryModal
          totalScore={sessionScore + SCORING.GAME_VICTORY_BONUS}
          onPlayAgain={handlePlayAgain}
          onMainMenu={handleReturnToMenu}
        />
      )}
    </div>
  );
}
