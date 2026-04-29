'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/game-store';
import { categoryInfo, QuestionCategory } from '@/lib/questions';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

// ===== Animation Variants =====
const pageVariants = {
  initial: { opacity: 0, y: 30, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, y: -30, scale: 0.95, transition: { duration: 0.3, ease: 'easeIn' } },
};

const bounceIn = {
  initial: { scale: 0, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } },
};

const shakeAnim = {
  animate: { x: [0, -10, 10, -10, 10, 0], transition: { duration: 0.5 } },
};

const pulseAnim = {
  animate: { scale: [1, 1.1, 1], transition: { duration: 0.3 } },
};

// ===== Helper Components =====
function GlowButton({ children, onClick, className = '', disabled = false, variant = 'default' }: {
  children: React.ReactNode; onClick?: () => void; className?: string; disabled?: boolean; variant?: string;
}) {
  const baseClass = variant === 'outline'
    ? 'border-2 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10'
    : 'bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold hover:from-yellow-400 hover:to-amber-500 shadow-lg shadow-yellow-500/25';

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.03 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`${baseClass} rounded-xl px-6 py-3 text-base transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </motion.button>
  );
}

function StatBadge({ icon, value, label }: { icon: string; value: string | number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 bg-white/5 rounded-xl p-3 min-w-[70px]">
      <span className="text-xl">{icon}</span>
      <span className="text-sm font-bold text-white">{value}</span>
      <span className="text-[10px] text-white/50">{label}</span>
    </div>
  );
}

function CoinDisplay() {
  const { playerCoins, playerGems } = useGameStore();
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1 bg-yellow-500/20 rounded-full px-3 py-1">
        <span className="text-sm">🪙</span>
        <span className="text-sm font-bold text-yellow-400">{playerCoins}</span>
      </div>
      <div className="flex items-center gap-1 bg-purple-500/20 rounded-full px-3 py-1">
        <span className="text-sm">💎</span>
        <span className="text-sm font-bold text-purple-400">{playerGems}</span>
      </div>
    </div>
  );
}

function LevelBar() {
  const { playerLevel, playerXP } = useGameStore();
  const xpNeeded = playerLevel * 200;
  const progress = Math.min((playerXP / xpNeeded) * 100, 100);
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 text-black font-bold text-xs">
        {playerLevel}
      </div>
      <div className="flex-1">
        <Progress value={progress} className="h-2 bg-white/10 [&>div]:bg-gradient-to-r [&>div]:from-yellow-500 [&>div]:to-amber-500" />
        <div className="flex justify-between mt-0.5">
          <span className="text-[10px] text-white/40">{playerXP} XP</span>
          <span className="text-[10px] text-white/40">{xpNeeded} XP</span>
        </div>
      </div>
    </div>
  );
}

// ===== Splash Screen =====
function SplashScreen() {
  const { setScreen } = useGameStore();
  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 p-6 text-center"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <motion.div
        animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
        className="text-8xl mb-6"
      >
        🏆
      </motion.div>
      <motion.h1
        className="text-5xl font-extrabold bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent mb-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        بطل الأسئلة
      </motion.h1>
      <motion.p
        className="text-lg text-white/60 mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        تحدّى عقلك وتفوّق على الجميع!
      </motion.p>
      <motion.div
        className="flex items-center gap-2 text-sm text-white/30 mb-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <span>🔬</span><span>📜</span><span>⚽</span><span>🌍</span><span>🎨</span><span>💻</span><span>🕌</span><span>🧠</span>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <GlowButton onClick={() => setScreen('menu')} className="text-lg px-12 py-4">
          🚀 ابدأ المغامرة
        </GlowButton>
      </motion.div>
      <motion.p
        className="text-xs text-white/20 mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        الإصدار 2.0 — أكثر من 100 سؤال في 10 تصنيفات
      </motion.p>
    </motion.div>
  );
}

// ===== Main Menu =====
function MainMenu() {
  const { setScreen, playerName, playerAvatar, totalScore, gamesPlayed, currentStreak, bestStreak, dailyCompleted } = useGameStore();
  const today = new Date().toLocaleDateString('ar');
  const menuItems = [
    { icon: '🎮', label: 'العب الآن', screen: 'modeSelect' as const, color: 'from-yellow-500 to-amber-600' },
    { icon: '📅', label: 'التحدي اليومي', screen: 'dailyChallenge' as const, color: 'from-emerald-500 to-teal-600', badge: dailyCompleted ? '✅' : '🔥' },
    { icon: '🎰', label: 'عجلة الحظ', screen: 'spinWheel' as const, color: 'from-purple-500 to-violet-600' },
    { icon: '🏆', label: 'المتصدرين', screen: 'leaderboard' as const, color: 'from-blue-500 to-cyan-600' },
    { icon: '⚔️', label: 'الفرق', screen: 'team' as const, color: 'from-red-500 to-rose-600' },
    { icon: '🛍️', label: 'المتجر', screen: 'shop' as const, color: 'from-pink-500 to-fuchsia-600' },
    { icon: '🏅', label: 'الإنجازات', screen: 'achievements' as const, color: 'from-amber-500 to-orange-600' },
    { icon: '👤', label: 'الملف الشخصي', screen: 'profile' as const, color: 'from-gray-500 to-gray-600' },
  ];

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 p-4 pb-8"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500/20 to-amber-600/20 flex items-center justify-center text-2xl border border-yellow-500/30">
            {playerAvatar}
          </div>
          <div>
            <div className="text-white font-bold text-sm">{playerName}</div>
            <LevelBar />
          </div>
        </div>
        <CoinDisplay />
      </div>

      {/* Daily Streak Banner */}
      <motion.div
        className="bg-gradient-to-r from-yellow-500/10 to-amber-600/10 border border-yellow-500/20 rounded-2xl p-4 mb-5"
        whileHover={{ scale: 1.01 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-yellow-400 font-bold text-sm">🔥 سلسلة الأيام</div>
            <div className="text-white/50 text-xs mt-1">{today}</div>
          </div>
          <div className="flex items-center gap-4">
            <StatBadge icon="🎯" value={currentStreak} label="حالي" />
            <StatBadge icon="⭐" value={bestStreak} label="أفضل" />
            <StatBadge icon="🎮" value={gamesPlayed} label="ألعاب" />
          </div>
        </div>
      </motion.div>

      {/* Menu Grid */}
      <div className="grid grid-cols-2 gap-3">
        {menuItems.map((item, i) => (
          <motion.button
            key={item.screen}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setScreen(item.screen)}
            className={`relative bg-gradient-to-br ${item.color} rounded-2xl p-5 text-center overflow-hidden group`}
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="text-3xl mb-2">{item.icon}</div>
            <div className="text-white font-bold text-sm relative z-10">{item.label}</div>
            {item.badge && (
              <span className="absolute top-2 left-2 text-sm">{item.badge}</span>
            )}
          </motion.button>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="mt-5 bg-white/5 rounded-2xl p-4">
        <div className="text-white/40 text-xs text-center mb-3">إحصائيات سريعة</div>
        <div className="flex justify-around">
          <StatBadge icon="🏆" value={totalScore} label="نقاط" />
          <StatBadge icon="✅" value={gamesPlayed} label="ألعاب" />
          <StatBadge icon="🔥" value={bestStreak} label="أفضل سلسلة" />
        </div>
      </div>
    </motion.div>
  );
}

// ===== Mode Selection =====
function ModeSelectScreen() {
  const { setScreen, startGame } = useGameStore();
  const modes = [
    { id: 'classic' as const, icon: '🎯', name: 'الكلاسيكي', desc: '10 أسئلة - 20 ثانية لكل سؤال', color: 'from-yellow-500 to-amber-600' },
    { id: 'speed' as const, icon: '⚡', name: 'السرعة', desc: '15 سؤال - 8 ثوان فقط!', color: 'from-red-500 to-rose-600' },
    { id: 'survival' as const, icon: '🏕️', name: 'البقاء', desc: 'أخطئ واخرج! صعوبة متزايدة', color: 'from-emerald-500 to-teal-600' },
    { id: 'marathon' as const, icon: '🏃', name: 'الماراثون', desc: '30 سؤال - تحدي طويل', color: 'from-purple-500 to-violet-600' },
    { id: 'daily' as const, icon: '📅', name: 'اليومي', desc: 'تحدي يومي خاص', color: 'from-blue-500 to-cyan-600' },
    { id: 'teamBattle' as const, icon: '⚔️', name: 'معركة الفرق', desc: 'افرح مع فريقك!', color: 'from-orange-500 to-red-600' },
  ];

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 p-4"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="flex items-center gap-3 mb-6">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setScreen('menu')} className="text-white/60 hover:text-white text-2xl">→</motion.button>
        <h2 className="text-xl font-bold text-white">اختر نمط اللعب</h2>
      </div>
      <div className="space-y-3">
        {modes.map((mode, i) => (
          <motion.button
            key={mode.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => startGame(mode.id)}
            className={`w-full bg-gradient-to-r ${mode.color} rounded-2xl p-4 flex items-center gap-4 text-right`}
          >
            <span className="text-3xl">{mode.icon}</span>
            <div className="flex-1">
              <div className="text-white font-bold">{mode.name}</div>
              <div className="text-white/70 text-sm">{mode.desc}</div>
            </div>
            <span className="text-white/50 text-xl">‹</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

// ===== Category Selection =====
function CategorySelectScreen() {
  const { setScreen, startGame } = useGameStore();
  const categories = Object.entries(categoryInfo) as [QuestionCategory, typeof categoryInfo[QuestionCategory]][];

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 p-4"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="flex items-center gap-3 mb-6">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setScreen('modeSelect')} className="text-white/60 hover:text-white text-2xl">→</motion.button>
        <h2 className="text-xl font-bold text-white">اختر التصنيف</h2>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {categories.map(([key, info], i) => (
          <motion.button
            key={key}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => startGame('classic', key)}
            className={`bg-gradient-to-br ${info.gradient} rounded-2xl p-4 text-center`}
          >
            <div className="text-4xl mb-2">{info.icon}</div>
            <div className="text-white font-bold text-sm">{info.name}</div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

// ===== Gameplay Screen =====
function GameplayScreen() {
  const store = useGameStore();
  const { questions, currentQuestionIndex, score, timeRemaining, isTimerActive,
    answeredCurrent, selectedAnswer, isCorrect, comboCount, currentMode,
    powerUps, usedPowerUps, correctCount } = store;

  const question = questions[currentQuestionIndex];
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([]);
  const [doubleActive, setDoubleActive] = useState(false);
  const [shieldActive, setShieldActive] = useState(false);
  const [skipUsed, setSkipUsed] = useState(false);

  // Timer
  useEffect(() => {
    if (isTimerActive && timeRemaining > 0 && !answeredCurrent) {
      timerRef.current = setTimeout(() => {
        useGameStore.setState((s) => {
          if (s.timeRemaining <= 1) {
            return { timeRemaining: 0, isTimerActive: false, answeredCurrent: true, isCorrect: false, selectedAnswer: -1 };
          }
          return { timeRemaining: s.timeRemaining - 1 };
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isTimerActive, timeRemaining, answeredCurrent]);

  // Reset state when question changes
  useEffect(() => {
    setShowHint(false);
    setEliminatedOptions([]);
    setDoubleActive(false);
    setSkipUsed(false);
  }, [currentQuestionIndex]);

  if (!question) return null;

  const handleAnswer = (index: number) => {
    if (answeredCurrent) return;
    store.answerQuestion(index);
  };

  const handleUsePowerUp = (puId: string) => {
    const pu = powerUps.find(p => p.id === puId);
    if (!pu || pu.count <= 0 || answeredCurrent) return;

    store.usePowerUp(puId);

    switch (puId) {
      case 'fifty_fifty': {
        const wrongIndices = question.options
          .map((_, i) => i)
          .filter(i => i !== question.correctIndex);
        const toEliminate = wrongIndices.sort(() => Math.random() - 0.5).slice(0, 2);
        setEliminatedOptions(toEliminate);
        break;
      }
      case 'hint':
        setShowHint(true);
        break;
      case 'double_points':
        setDoubleActive(true);
        break;
      case 'shield':
        setShieldActive(true);
        break;
      case 'skip':
        setSkipUsed(true);
        setTimeout(() => store.nextQuestion(), 500);
        break;
    }
  };

  // Timer color
  const timerColor = timeRemaining > 10 ? 'bg-emerald-500' : timeRemaining > 5 ? 'bg-yellow-500' : 'bg-red-500';
  const timerPercent = question ? (timeRemaining / question.timeLimit) * 100 : 0;

  // Mode info
  const modeNames: Record<string, string> = {
    classic: '🎯 الكلاسيكي', speed: '⚡ السرعة', survival: '🏕️ البقاء',
    marathon: '🏃 الماراثون', daily: '📅 اليومي', teamBattle: '⚔️ معركة الفرق',
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 p-4 flex flex-col"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/40 bg-white/5 px-2 py-1 rounded-lg">{modeNames[currentMode]}</span>
          <span className="text-xs text-white/40">{currentQuestionIndex + 1}/{questions.length}</span>
        </div>
        <div className="flex items-center gap-3">
          {comboCount > 1 && (
            <motion.span
              key={comboCount}
              initial={{ scale: 2 }}
              animate={{ scale: 1 }}
              className="text-sm font-bold text-yellow-400"
            >
              🔥 x{comboCount}
            </motion.span>
          )}
          <div className="flex items-center gap-1 bg-yellow-500/20 rounded-full px-3 py-1">
            <span className="text-xs">⭐</span>
            <span className="text-sm font-bold text-yellow-400">{score}</span>
          </div>
        </div>
      </div>

      {/* Timer Bar */}
      <div className="w-full bg-white/10 rounded-full h-2 mb-4 overflow-hidden">
        <motion.div
          className={`h-full ${timerColor} rounded-full`}
          initial={{ width: '100%' }}
          animate={{ width: `${timerPercent}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Timer Number */}
      <div className="text-center mb-2">
        <span className={`text-3xl font-extrabold ${timeRemaining <= 5 ? 'text-red-500' : 'text-white/80'}`}>
          {timeRemaining}
        </span>
      </div>

      {/* Progress Dots */}
      <div className="flex justify-center gap-1 mb-4 flex-wrap">
        {questions.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all ${
              i < currentQuestionIndex ? 'bg-emerald-500' :
              i === currentQuestionIndex ? 'bg-yellow-400 scale-125' :
              'bg-white/20'
            }`}
          />
        ))}
      </div>

      {/* Question Card */}
      <motion.div
        className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl p-6 mb-4 border border-white/10 flex-shrink-0"
        layout
      >
        <div className="text-center mb-1">
          <span className="text-xs text-white/30">
            {categoryInfo[question.category]?.icon} {categoryInfo[question.category]?.name} • {
              question.difficulty === 'easy' ? 'سهل' :
              question.difficulty === 'medium' ? 'متوسط' :
              question.difficulty === 'hard' ? 'صعب' : 'خبير'
            }
          </span>
        </div>
        <h3 className="text-xl font-bold text-white text-center leading-relaxed">
          {question.text}
        </h3>
        <div className="text-center text-sm text-yellow-400/70 mt-2">
          ⭐ {question.points} {doubleActive ? '×2' : ''} نقطة
        </div>
      </motion.div>

      {/* Hint */}
      {showHint && !answeredCurrent && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 mb-3 text-center"
        >
          <span className="text-sm text-yellow-300">💡 {question.hint}</span>
        </motion.div>
      )}

      {/* Answer Options */}
      <div className="space-y-2 flex-1">
        {question.options.map((option, i) => {
          const isEliminated = eliminatedOptions.includes(i);
          const isSelected = selectedAnswer === i;
          const isCorrectOption = i === question.correctIndex;

          let optionClass = 'bg-white/5 border-white/10 text-white';
          if (answeredCurrent) {
            if (isCorrectOption) optionClass = 'bg-emerald-500/20 border-emerald-500 text-emerald-300';
            else if (isSelected && !isCorrect) optionClass = 'bg-red-500/20 border-red-500 text-red-300';
            else optionClass = 'bg-white/5 border-white/5 text-white/30';
          }
          if (isEliminated) optionClass = 'bg-white/2 border-white/5 text-white/20 line-through';

          return (
            <motion.button
              key={i}
              whileHover={!answeredCurrent && !isEliminated ? { scale: 1.02 } : {}}
              whileTap={!answeredCurrent && !isEliminated ? { scale: 0.98 } : {}}
              onClick={() => !isEliminated && handleAnswer(i)}
              disabled={answeredCurrent || isEliminated}
              className={`w-full rounded-xl p-4 border-2 text-right transition-all duration-300 ${optionClass}`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border ${
                  answeredCurrent && isCorrectOption ? 'bg-emerald-500/30 border-emerald-500 text-emerald-300' :
                  answeredCurrent && isSelected && !isCorrect ? 'bg-red-500/30 border-red-500 text-red-300' :
                  'bg-white/10 border-white/20 text-white/60'
                }`}>
                  {answeredCurrent && isCorrectOption ? '✓' : answeredCurrent && isSelected && !isCorrect ? '✗' : ['أ', 'ب', 'ج', 'د'][i]}
                </span>
                <span className="flex-1 font-medium">{option}</span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Result Feedback */}
      <AnimatePresence>
        {answeredCurrent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3"
          >
            {isCorrect ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
                <span className="text-lg">🎉</span>
                <span className="text-emerald-400 font-bold mr-2">إجابة صحيحة!</span>
                {comboCount > 1 && <span className="text-yellow-400 text-sm"> 🔥 كومبو ×{comboCount}!</span>}
              </div>
            ) : (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
                <span className="text-lg">😔</span>
                <span className="text-red-400 font-bold mr-2">إجابة خاطئة!</span>
                <div className="text-white/50 text-xs mt-1">الإجابة الصحيحة: {question.options[question.correctIndex]}</div>
              </div>
            )}
            {question.funFact && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 mt-2 text-center">
                <span className="text-sm text-blue-300">🤓 هل تعلم؟ {question.funFact}</span>
              </div>
            )}
            <GlowButton onClick={() => store.nextQuestion()} className="w-full mt-3">
              {currentQuestionIndex < questions.length - 1 ? 'السؤال التالي ←' : 'عرض النتائج 🏆'}
            </GlowButton>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Power-ups Bar */}
      {!answeredCurrent && !skipUsed && (
        <div className="flex justify-center gap-2 mt-3 pb-2">
          {powerUps.map(pu => (
            <motion.button
              key={pu.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleUsePowerUp(pu.id)}
              disabled={pu.count <= 0 || usedPowerUps.includes(pu.id)}
              className={`relative flex flex-col items-center px-3 py-2 rounded-xl transition-all ${
                pu.count > 0 && !usedPowerUps.includes(pu.id)
                  ? 'bg-white/10 hover:bg-white/20 active:bg-white/30'
                  : 'bg-white/5 opacity-40'
              }`}
            >
              <span className="text-lg">{pu.icon}</span>
              <span className="text-[10px] text-white/50 mt-0.5">{pu.count}</span>
            </motion.button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ===== Results Screen =====
function ResultsScreen() {
  const { score, correctCount, questions, comboCount, maxCombo, currentMode, playerCoins, playerLevel,
    setScreen, resetGame, totalScore, gamesPlayed, gamesWon, playerGems } = useGameStore();
  const totalQuestions = questions.length;
  const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const coinsEarned = Math.round(score * 0.1) + correctCount * 5;
  const gemsEarned = correctCount === totalQuestions ? 3 : 0;
  const xpEarned = Math.round(score * 0.5);

  const getGrade = () => {
    if (percentage >= 90) return { emoji: '🏆', text: 'أسطوري!', color: 'text-yellow-400' };
    if (percentage >= 70) return { emoji: '🌟', text: 'ممتاز!', color: 'text-emerald-400' };
    if (percentage >= 50) return { emoji: '👍', text: 'جيد!', color: 'text-blue-400' };
    if (percentage >= 30) return { emoji: '💪', text: 'لا بأس', color: 'text-orange-400' };
    return { emoji: '📚', text: 'تحتاج مراجعة', color: 'text-red-400' };
  };
  const grade = getGrade();

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 p-4 flex flex-col items-center justify-center"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="text-7xl mb-4"
      >
        {grade.emoji}
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`text-3xl font-extrabold ${grade.color} mb-2`}
      >
        {grade.text}
      </motion.h2>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-white/50 text-sm mb-6"
      >
        {percentage}% إجابات صحيحة
      </motion.div>

      {/* Score Ring */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
        className="relative w-40 h-40 mb-6"
      >
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
          <circle cx="60" cy="60" r="50" fill="none" stroke="url(#scoreGradient)" strokeWidth="10"
            strokeDasharray={`${percentage * 3.14} 314`} strokeLinecap="round" />
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold text-white">{score}</span>
          <span className="text-xs text-white/40">نقطة</span>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-6 w-full max-w-sm">
        <StatBadge icon="✅" value={`${correctCount}/${totalQuestions}`} label="صحيح" />
        <StatBadge icon="🔥" value={maxCombo} label="أقصى كومبو" />
        <StatBadge icon="⭐" value={xpEarned} label="XP مكتسب" />
      </div>

      {/* Rewards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white/5 rounded-2xl p-4 mb-6 w-full max-w-sm"
      >
        <div className="text-white/40 text-xs text-center mb-3">المكافآت</div>
        <div className="flex justify-around">
          <div className="flex items-center gap-1">
            <span>🪙</span>
            <span className="text-yellow-400 font-bold">+{coinsEarned}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>💎</span>
            <span className="text-purple-400 font-bold">+{gemsEarned}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>⬆️</span>
            <span className="text-emerald-400 font-bold">+{xpEarned} XP</span>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 w-full max-w-sm">
        <GlowButton onClick={() => resetGame()} className="w-full">
          🔄 العب مرة أخرى
        </GlowButton>
        <GlowButton onClick={() => setScreen('leaderboard')} variant="outline" className="w-full">
          🏆 المتصدرين
        </GlowButton>
        <GlowButton onClick={() => setScreen('menu')} variant="outline" className="w-full">
          🏠 القائمة الرئيسية
        </GlowButton>
      </div>
    </motion.div>
  );
}

// ===== Leaderboard Screen =====
function LeaderboardScreen() {
  const { setScreen, leaderboard } = useGameStore();
  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 p-4"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="flex items-center gap-3 mb-6">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setScreen('menu')} className="text-white/60 hover:text-white text-2xl">→</motion.button>
        <h2 className="text-xl font-bold text-white">🏆 المتصدرين</h2>
      </div>

      {/* Top 3 Podium */}
      <div className="flex items-end justify-center gap-3 mb-6 h-48">
        {[1, 0, 2].map((podiumIndex) => {
          const entry = leaderboard[podiumIndex];
          if (!entry) return null;
          const isFirst = podiumIndex === 0;
          const heights = ['h-32', 'h-24', 'h-20'];
          return (
            <motion.div
              key={entry.rank}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: podiumIndex * 0.1 }}
              className="flex flex-col items-center"
            >
              <span className="text-2xl mb-1">{entry.avatar}</span>
              <div className="text-white font-bold text-xs text-center mb-1 max-w-[80px] truncate">{entry.name}</div>
              <div className={`w-20 ${heights[podiumIndex]} rounded-t-xl flex flex-col items-center justify-center ${
                isFirst ? 'bg-gradient-to-t from-yellow-600 to-yellow-400' :
                podiumIndex === 1 ? 'bg-gradient-to-t from-gray-500 to-gray-400' :
                'bg-gradient-to-t from-amber-700 to-amber-600'
              }`}>
                <span className="text-2xl font-extrabold text-white">{entry.rank}</span>
                <span className="text-[10px] text-white/70">{entry.score.toLocaleString()}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Full List */}
      <div className="space-y-2">
        {leaderboard.slice(3).map((entry) => (
          <motion.div
            key={entry.rank}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex items-center gap-3 p-3 rounded-xl ${
              entry.isPlayer ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-white/5'
            }`}
          >
            <span className="text-lg font-bold text-white/40 w-6 text-center">{entry.rank}</span>
            <span className="text-xl">{entry.avatar}</span>
            <div className="flex-1">
              <div className={`text-sm font-bold ${entry.isPlayer ? 'text-yellow-400' : 'text-white'}`}>{entry.name}</div>
              <div className="text-xs text-white/40">المستوى {entry.level}</div>
            </div>
            <div className="text-sm font-bold text-white/60">{entry.score.toLocaleString()}</div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ===== Profile Screen =====
function ProfileScreen() {
  const { setScreen, playerName, playerAvatar, playerLevel, playerXP, playerCoins, playerGems,
    totalScore, gamesPlayed, gamesWon, bestStreak, setPlayerName } = useGameStore();
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(playerName);
  const winRate = gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0;

  const avatars = ['🦁', '🦅', '🐉', '🔥', '👑', '💎', '🌟', '⚔️', '🌙', '🏹', '🎯', '🏆', '⚡', '🧠', '🎭', '🎪'];

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 p-4"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="flex items-center gap-3 mb-6">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setScreen('menu')} className="text-white/60 hover:text-white text-2xl">→</motion.button>
        <h2 className="text-xl font-bold text-white">الملف الشخصي</h2>
      </div>

      {/* Avatar & Name */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-500/20 to-amber-600/20 flex items-center justify-center text-5xl border-2 border-yellow-500/30 mb-3">
          {playerAvatar}
        </div>
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-center text-sm"
              maxLength={20}
              dir="rtl"
            />
            <GlowButton onClick={() => { setPlayerName(nameInput); setEditing(false); }} className="text-sm px-4 py-2">
              حفظ
            </GlowButton>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="text-white font-bold text-lg">
            {playerName} ✏️
          </button>
        )}
        <LevelBar />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{gamesPlayed}</div>
          <div className="text-xs text-white/40">ألعاب لُعبت</div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-emerald-400">{winRate}%</div>
          <div className="text-xs text-white/40">نسبة الفوز</div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">{totalScore.toLocaleString()}</div>
          <div className="text-xs text-white/40">مجموع النقاط</div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-orange-400">🔥 {bestStreak}</div>
          <div className="text-xs text-white/40">أفضل سلسلة</div>
        </div>
      </div>

      {/* Avatar Selection */}
      <div className="bg-white/5 rounded-2xl p-4">
        <div className="text-white/40 text-xs text-center mb-3">اختر أفاتارك</div>
        <div className="grid grid-cols-8 gap-2">
          {avatars.map(av => (
            <motion.button
              key={av}
              whileTap={{ scale: 0.9 }}
              onClick={() => useGameStore.getState().setPlayerAvatar(av)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                playerAvatar === av ? 'bg-yellow-500/30 border-2 border-yellow-500' : 'bg-white/5'
              }`}
            >
              {av}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ===== Shop Screen =====
function ShopScreen() {
  const { setScreen, shopItems, playerCoins, playerGems, buyShopItem } = useGameStore();
  const [tab, setTab] = useState<'powerup' | 'avatar'>('powerup');

  const filteredItems = shopItems.filter(i => i.type === tab);

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 p-4"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setScreen('menu')} className="text-white/60 hover:text-white text-2xl">→</motion.button>
          <h2 className="text-xl font-bold text-white">🛍️ المتجر</h2>
        </div>
        <CoinDisplay />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {(['powerup', 'avatar'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              tab === t ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-white/5 text-white/40'
            }`}
          >
            {t === 'powerup' ? '⚡ أدوات مساعدة' : '🎭 الأفاتارات'}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-2 gap-3">
        {filteredItems.map(item => (
          <motion.div
            key={item.id}
            whileHover={{ scale: 1.02 }}
            className={`bg-white/5 rounded-2xl p-4 text-center ${item.owned ? 'border border-emerald-500/20' : ''}`}
          >
            <div className="text-3xl mb-2">{item.icon}</div>
            <div className="text-white font-bold text-sm mb-1">{item.name}</div>
            <div className="text-white/40 text-xs mb-3">{item.description}</div>
            {item.owned ? (
              <span className="text-emerald-400 text-xs font-bold">✅ مملوك</span>
            ) : (
              <GlowButton
                onClick={() => buyShopItem(item.id)}
                disabled={(item.currency === 'coins' && playerCoins < item.cost) || (item.currency === 'gems' && playerGems < item.cost)}
                className="text-xs px-3 py-1.5"
              >
                {item.currency === 'coins' ? '🪙' : '💎'} {item.cost}
              </GlowButton>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ===== Achievements Screen =====
function AchievementsScreen() {
  const { setScreen, achievements, playerCoins } = useGameStore();
  const unlocked = achievements.filter(a => a.unlocked).length;

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 p-4"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="flex items-center gap-3 mb-4">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setScreen('menu')} className="text-white/60 hover:text-white text-2xl">→</motion.button>
        <h2 className="text-xl font-bold text-white">🏅 الإنجازات</h2>
      </div>

      <div className="text-center text-white/40 text-sm mb-4">
        {unlocked}/{achievements.length} إنجاز مفتوح
      </div>

      <Progress value={(unlocked / achievements.length) * 100} className="h-2 mb-6 bg-white/10 [&>div]:bg-gradient-to-r [&>div]:from-yellow-500 [&>div]:to-amber-500" />

      <div className="space-y-2">
        {achievements.map(ach => (
          <motion.div
            key={ach.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex items-center gap-3 p-3 rounded-xl ${
              ach.unlocked ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-white/5'
            }`}
          >
            <span className={`text-2xl ${ach.unlocked ? '' : 'grayscale opacity-40'}`}>{ach.icon}</span>
            <div className="flex-1">
              <div className={`text-sm font-bold ${ach.unlocked ? 'text-yellow-400' : 'text-white/40'}`}>{ach.name}</div>
              <div className="text-xs text-white/30">{ach.description}</div>
              <div className="mt-1">
                <Progress
                  value={Math.min((ach.progress / ach.target) * 100, 100)}
                  className="h-1 bg-white/10 [&>div]:bg-yellow-500"
                />
              </div>
            </div>
            <div className="text-xs text-yellow-400/50">🪙 {ach.reward}</div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ===== Team Screen =====
function TeamScreen() {
  const { setScreen, teams, currentTeam, joinTeam, createTeam, playerName } = useGameStore();
  const [showCreate, setShowCreate] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamLogo, setTeamLogo] = useState('⚔️');
  const logos = ['⚔️', '🛡️', '🏹', '🔥', '👑', '🦅', '🐉', '🌙', '⚡', '🌟', '💎', '🎯'];

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 p-4"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="flex items-center gap-3 mb-6">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setScreen('menu')} className="text-white/60 hover:text-white text-2xl">→</motion.button>
        <h2 className="text-xl font-bold text-white">⚔️ الفرق</h2>
      </div>

      {/* Current Team */}
      {currentTeam && (
        <div className="bg-gradient-to-r from-red-500/10 to-rose-600/10 border border-red-500/20 rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{currentTeam.logo}</span>
            <div className="flex-1">
              <div className="text-white font-bold">{currentTeam.name}</div>
              <div className="text-white/40 text-xs">👥 {currentTeam.members} عضو • 🏆 #{currentTeam.rank}</div>
            </div>
            <div className="text-right">
              <div className="text-yellow-400 font-bold">{currentTeam.score.toLocaleString()}</div>
              <div className="text-white/30 text-xs">نقطة</div>
            </div>
          </div>
        </div>
      )}

      {/* Create Team Button */}
      <GlowButton onClick={() => setShowCreate(!showCreate)} className="w-full mb-4">
        ➕ إنشاء فريق جديد
      </GlowButton>

      {showCreate && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-white/5 rounded-2xl p-4 mb-4"
        >
          <input
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="اسم الفريق"
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-sm mb-3"
            dir="rtl"
          />
          <div className="flex flex-wrap gap-2 mb-3">
            {logos.map(l => (
              <button
                key={l}
                onClick={() => setTeamLogo(l)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                  teamLogo === l ? 'bg-yellow-500/30 border-2 border-yellow-500' : 'bg-white/5'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          <GlowButton
            onClick={() => { if (teamName.trim()) { createTeam(teamName, teamLogo); setShowCreate(false); } }}
            disabled={!teamName.trim()}
            className="w-full"
          >
            إنشاء الفريق
          </GlowButton>
        </motion.div>
      )}

      {/* Teams List */}
      <div className="space-y-2">
        {teams.sort((a, b) => b.score - a.score).map((team, i) => (
          <motion.div
            key={team.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`flex items-center gap-3 p-3 rounded-xl bg-white/5 ${
              currentTeam?.id === team.id ? 'border border-yellow-500/20' : ''
            }`}
          >
            <span className="text-lg font-bold text-white/30 w-6 text-center">#{i + 1}</span>
            <span className="text-2xl">{team.logo}</span>
            <div className="flex-1">
              <div className="text-white font-bold text-sm">{team.name}</div>
              <div className="text-white/30 text-xs">👥 {team.members} عضو</div>
            </div>
            <div className="text-right">
              <div className="text-yellow-400 font-bold text-sm">{team.score.toLocaleString()}</div>
            </div>
            {currentTeam?.id !== team.id && (
              <GlowButton onClick={() => joinTeam(team)} className="text-xs px-3 py-1.5">
                انضمام
              </GlowButton>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ===== Daily Challenge Screen =====
function DailyChallengeScreen() {
  const { setScreen, dailyCompleted, startGame } = useGameStore();
  const today = new Date();
  const dayName = today.toLocaleDateString('ar', { weekday: 'long' });
  const dateStr = today.toLocaleDateString('ar');

  const dailyRewards = [
    { day: 1, reward: 50, icon: '🪙' },
    { day: 2, reward: 75, icon: '🪙' },
    { day: 3, reward: 100, icon: '🪙' },
    { day: 4, reward: 150, icon: '🪙' },
    { day: 5, reward: 200, icon: '🪙' },
    { day: 6, reward: 2, icon: '💎' },
    { day: 7, reward: 500, icon: '🏆' },
  ];

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 p-4"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="flex items-center gap-3 mb-6">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setScreen('menu')} className="text-white/60 hover:text-white text-2xl">→</motion.button>
        <h2 className="text-xl font-bold text-white">📅 التحدي اليومي</h2>
      </div>

      <div className="text-center mb-6">
        <div className="text-4xl mb-2">🔥</div>
        <div className="text-white font-bold">{dayName}</div>
        <div className="text-white/40 text-sm">{dateStr}</div>
      </div>

      {/* Weekly Progress */}
      <div className="bg-white/5 rounded-2xl p-4 mb-6">
        <div className="text-white/40 text-xs text-center mb-3">مكافآت الأسبوع</div>
        <div className="flex justify-between gap-1">
          {dailyRewards.map((d, i) => (
            <div key={i} className={`flex flex-col items-center gap-1 p-2 rounded-xl ${
              i < 3 ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-white/5'
            }`}>
              <span className="text-xs">{d.icon}</span>
              <span className="text-[10px] text-white/50">{d.reward}</span>
            </div>
          ))}
        </div>
      </div>

      {dailyCompleted ? (
        <div className="text-center bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6">
          <span className="text-4xl">✅</span>
          <div className="text-emerald-400 font-bold mt-2">أكملت تحدي اليوم!</div>
          <div className="text-white/40 text-sm mt-1">عد غداً لتحدي جديد</div>
        </div>
      ) : (
        <GlowButton onClick={() => startGame('daily')} className="w-full text-lg py-4">
          🎯 ابدأ التحدي اليومي
        </GlowButton>
      )}
    </motion.div>
  );
}

// ===== Spin Wheel Screen =====
function SpinWheelScreen() {
  const { setScreen, playerCoins, setScreen: goTo } = useGameStore();
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);

  const segments = [
    { text: '🪙 +50', color: '#f59e0b' },
    { text: '💎 +1', color: '#a855f7' },
    { text: '⚡ سرعة', color: '#ef4444' },
    { text: '🪙 +100', color: '#10b981' },
    { text: '🎯 كلاسيكي', color: '#3b82f6' },
    { text: '🪙 +25', color: '#f97316' },
    { text: '🔥 بقاء', color: '#ec4899' },
    { text: '💎 +2', color: '#8b5cf6' },
  ];

  const handleSpin = () => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);
    const newRotation = rotation + 1440 + Math.random() * 360;
    setRotation(newRotation);

    setTimeout(() => {
      const segmentIndex = Math.floor(Math.random() * segments.length);
      setResult(segments[segmentIndex].text);
      setSpinning(false);
    }, 3000);
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 p-4 flex flex-col items-center"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="flex items-center gap-3 mb-6 w-full">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setScreen('menu')} className="text-white/60 hover:text-white text-2xl">→</motion.button>
        <h2 className="text-xl font-bold text-white">🎰 عجلة الحظ</h2>
      </div>

      <div className="relative w-72 h-72 mb-6">
        {/* Arrow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10 text-3xl">▼</div>

        {/* Wheel */}
        <motion.div
          className="w-full h-full rounded-full border-4 border-yellow-500/30"
          style={{ rotate: `${rotation}deg` }}
          transition={spinning ? { duration: 3, ease: 'easeOut' } : { duration: 0 }}
        >
          <svg viewBox="0 0 200 200" className="w-full h-full">
            {segments.map((seg, i) => {
              const angle = (i * 360) / segments.length;
              const nextAngle = ((i + 1) * 360) / segments.length;
              const startRad = (angle - 90) * (Math.PI / 180);
              const endRad = (nextAngle - 90) * (Math.PI / 180);
              const x1 = 100 + 90 * Math.cos(startRad);
              const y1 = 100 + 90 * Math.sin(startRad);
              const x2 = 100 + 90 * Math.cos(endRad);
              const y2 = 100 + 90 * Math.sin(endRad);
              const midRad = ((angle + nextAngle) / 2 - 90) * (Math.PI / 180);
              const tx = 100 + 55 * Math.cos(midRad);
              const ty = 100 + 55 * Math.sin(midRad);
              const textAngle = (angle + nextAngle) / 2;

              return (
                <g key={i}>
                  <path d={`M100,100 L${x1},${y1} A90,90 0 0,1 ${x2},${y2} Z`} fill={seg.color} opacity={0.7} stroke="rgba(0,0,0,0.2)" strokeWidth={1} />
                  <text x={tx} y={ty} fill="white" fontSize="8" fontWeight="bold" textAnchor="middle" dominantBaseline="middle"
                    transform={`rotate(${textAngle}, ${tx}, ${ty})`}>
                    {seg.text}
                  </text>
                </g>
              );
            })}
            <circle cx="100" cy="100" r="18" fill="rgba(0,0,0,0.5)" stroke="gold" strokeWidth="2" />
            <text x="100" y="100" fill="gold" fontSize="14" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">🎰</text>
          </svg>
        </motion.div>
      </div>

      {result && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 mb-4 text-center w-full"
        >
          <div className="text-3xl mb-2">🎉</div>
          <div className="text-yellow-400 font-bold">فزت بـ {result}!</div>
        </motion.div>
      )}

      <GlowButton
        onClick={handleSpin}
        disabled={spinning}
        className="w-full max-w-xs"
      >
        {spinning ? '🎡 جاري الدوران...' : '🎰 أدر العجلة!'}
      </GlowButton>

      <div className="text-white/20 text-xs mt-3">تكلفة الدوران: 🪙 20</div>
    </motion.div>
  );
}

// ===== Main App =====
export default function QuizChampionGame() {
  const { currentScreen, darkMode } = useGameStore();

  return (
    <div className={`${darkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gray-950 max-w-lg mx-auto overflow-x-hidden" dir="rtl">
        <AnimatePresence mode="wait">
          {currentScreen === 'splash' && <SplashScreen key="splash" />}
          {currentScreen === 'menu' && <MainMenu key="menu" />}
          {currentScreen === 'modeSelect' && <ModeSelectScreen key="modeSelect" />}
          {currentScreen === 'categorySelect' && <CategorySelectScreen key="categorySelect" />}
          {currentScreen === 'gameplay' && <GameplayScreen key="gameplay" />}
          {currentScreen === 'results' && <ResultsScreen key="results" />}
          {currentScreen === 'leaderboard' && <LeaderboardScreen key="leaderboard" />}
          {currentScreen === 'profile' && <ProfileScreen key="profile" />}
          {currentScreen === 'shop' && <ShopScreen key="shop" />}
          {currentScreen === 'achievements' && <AchievementsScreen key="achievements" />}
          {currentScreen === 'team' && <TeamScreen key="team" />}
          {currentScreen === 'dailyChallenge' && <DailyChallengeScreen key="dailyChallenge" />}
          {currentScreen === 'spinWheel' && <SpinWheelScreen key="spinWheel" />}
        </AnimatePresence>
      </div>
    </div>
  );
}
