'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/game-store';
import { useAuthStore } from '@/lib/auth-local';
import { useWalletStore, CurrencyType } from '@/lib/wallet-store';
import { categoryInfo, QuestionCategory } from '@/lib/questions';
import { Progress } from '@/components/ui/progress';

const pageVariants = {
  initial: { opacity: 0, y: 30, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, y: -30, scale: 0.95, transition: { duration: 0.3, ease: 'easeIn' } },
};

function GlowButton({ children, onClick, className = '', disabled = false, variant = 'default' }: {
  children: React.ReactNode; onClick?: () => void; className?: string; disabled?: boolean; variant?: string;
}) {
  const baseClass = variant === 'outline'
    ? 'border-2 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10'
    : variant === 'danger'
    ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold shadow-lg shadow-red-500/25'
    : 'bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold hover:from-yellow-400 hover:to-amber-500 shadow-lg shadow-yellow-500/25';
  return (
    <motion.button whileHover={{ scale: disabled ? 1 : 1.03 }} whileTap={{ scale: disabled ? 1 : 0.97 }}
      onClick={disabled ? undefined : onClick} disabled={disabled}
      className={`${baseClass} rounded-xl px-6 py-3 text-base transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}>
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
    <button onClick={() => useGameStore.getState().setScreen('wallet')} className="flex items-center gap-3 hover:scale-105 transition-transform">
      <div className="flex items-center gap-1 bg-yellow-500/20 rounded-full px-3 py-1">
        <span className="text-sm">🪙</span><span className="text-sm font-bold text-yellow-400">{playerCoins}</span>
      </div>
      <div className="flex items-center gap-1 bg-purple-500/20 rounded-full px-3 py-1">
        <span className="text-sm">💎</span><span className="text-sm font-bold text-purple-400">{playerGems}</span>
      </div>
    </button>
  );
}

function LevelBar() {
  const { playerLevel, playerXP } = useGameStore();
  const xpNeeded = playerLevel * 200;
  const progress = Math.min((playerXP / xpNeeded) * 100, 100);
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 text-black font-bold text-xs">{playerLevel}</div>
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

// ===== Ad Banner Component =====
function AdBanner() {
  const { isAdmin, adConfigs } = useGameStore();
  const bannerAd = adConfigs.find(a => a.adType === 'banner' && a.isEnabled);
  if (!bannerAd || !isAdmin) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-white/10 rounded-xl p-3 text-center">
      <span className="text-white/40 text-xs">📢 إعلان - {bannerAd.position === 'bottom' ? 'أسفل' : 'أعلى'}</span>
      <div className="bg-white/5 rounded-lg h-12 flex items-center justify-center mt-1">
        <span className="text-white/20 text-sm">مساحة إعلانية</span>
      </div>
    </motion.div>
  );
}

// ===== Splash Screen =====
function SplashScreen() {
  const { setScreen } = useGameStore();
  return (
    <motion.div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 p-6 text-center" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <motion.div animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }} className="text-8xl mb-6">🏆</motion.div>
      <motion.h1 className="text-5xl font-extrabold bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent mb-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>بطل الأسئلة</motion.h1>
      <motion.p className="text-lg text-white/60 mb-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>تحدّى عقلك وتفوّق على الجميع!</motion.p>
      <motion.div className="flex items-center gap-2 text-sm text-white/30 mb-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
        <span>🔬</span><span>📜</span><span>🕌</span><span>📖</span><span>🌙</span><span>📿</span><span>🚀</span><span>🏥</span>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
        <GlowButton onClick={() => setScreen('login')} className="text-lg px-12 py-4">🚀 ابدأ المغامرة</GlowButton>
      </motion.div>
      <motion.p className="text-xs text-white/20 mt-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>الإصدار 3.0 — 17 تصنيف وأكثر من 120 سؤال</motion.p>
    </motion.div>
  );
}

// ===== Login Screen =====
function LoginScreen() {
  const { setScreen, login } = useGameStore();
  const authStore = useAuthStore;
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    // Small delay for UX feel
    await new Promise(r => setTimeout(r, 300));

    try {
      if (tab === 'register') {
        const result = authStore.getState().register(name, email, password);
        if (!result.success) { setError(result.error || 'حدث خطأ'); setLoading(false); return; }
        if (result.user) {
          login({ id: result.user.id, email: result.user.email, name: result.user.name, avatar: result.user.avatar, role: result.user.role, level: result.user.level, coins: result.user.coins, gems: result.user.gems });
        }
        setScreen('menu');
      } else {
        const result = authStore.getState().loginWithEmail(email, password);
        if (!result.success) { setError(result.error || 'حدث خطأ'); setLoading(false); return; }
        if (result.user) {
          login({ id: result.user.id, email: result.user.email, name: result.user.name, avatar: result.user.avatar, role: result.user.role, level: result.user.level, coins: result.user.coins, gems: result.user.gems });
        }
        setScreen('menu');
      }
    } catch { setError('حدث خطأ غير متوقع'); }
    setLoading(false);
  };

  const handleGuestLogin = () => {
    const result = authStore.getState().loginAsGuest();
    if (result.user) {
      login({ id: result.user.id, email: result.user.email, name: result.user.name, avatar: result.user.avatar, role: result.user.role, level: result.user.level, coins: result.user.coins, gems: result.user.gems });
    }
    setScreen('menu');
  };

  return (
    <motion.div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 p-6 flex flex-col justify-center" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🏆</div>
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">بطل الأسئلة</h1>
        <p className="text-white/40 mt-2">سجّل دخولك وابدأ التحدي!</p>
      </div>
      <div className="max-w-sm mx-auto w-full">
        <div className="flex gap-2 mb-6">
          {(['login', 'register'] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); setError(''); }}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${tab === t ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-white/5 text-white/40'}`}>
              {t === 'login' ? '🔑 تسجيل الدخول' : '✨ إنشاء حساب'}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {tab === 'register' && (
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="الاسم" dir="rtl"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:border-yellow-500/50 focus:outline-none" />
          )}
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="البريد الإلكتروني" type="email" dir="ltr"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:border-yellow-500/50 focus:outline-none" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="كلمة المرور" type="password" dir="ltr"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:border-yellow-500/50 focus:outline-none" />
        </div>
        {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mt-3 text-center"><span className="text-red-400 text-sm">{error}</span></div>}
        <GlowButton onClick={handleSubmit} disabled={loading} className="w-full mt-4">
          {loading ? '⏳ جارٍ المعالجة...' : tab === 'login' ? '🔑 تسجيل الدخول' : '✨ إنشاء حساب'}
        </GlowButton>
        <div className="mt-4">
          <div className="text-center text-white/20 text-xs mb-3">— أو —</div>
          <button onClick={handleGuestLogin} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/60 hover:bg-white/10 transition-all flex items-center justify-center gap-2">
            <span className="text-lg">🎮</span><span className="text-sm">دخول كزائر</span>
          </button>
        </div>
        <p className="text-white/20 text-xs text-center mt-6">بتسجيلك، تحصل على 150 عملة + 8 جواهر مجاناً!</p>
      </div>
    </motion.div>
  );
}

// ===== Main Menu =====
function MainMenu() {
  const { setScreen, playerName, playerAvatar, totalScore, gamesPlayed, currentStreak, bestStreak, dailyCompleted, isAdmin } = useGameStore();
  const today = new Date().toLocaleDateString('ar');
  const menuItems = [
    { icon: '💰', label: 'محفظتي', screen: 'wallet' as const, color: 'from-emerald-500 to-teal-600' },
    { icon: '🎮', label: 'العب الآن', screen: 'modeSelect' as const, color: 'from-yellow-500 to-amber-600' },
    { icon: '📅', label: 'التحدي اليومي', screen: 'dailyChallenge' as const, color: 'from-emerald-500 to-teal-600', badge: dailyCompleted ? '✅' : '🔥' },
    { icon: '🎰', label: 'عجلة الحظ', screen: 'spinWheel' as const, color: 'from-purple-500 to-violet-600' },
    { icon: '🏆', label: 'المتصدرين', screen: 'leaderboard' as const, color: 'from-blue-500 to-cyan-600' },
    { icon: '⚔️', label: 'الفرق', screen: 'team' as const, color: 'from-red-500 to-rose-600' },
    { icon: '🛍️', label: 'المتجر', screen: 'shop' as const, color: 'from-pink-500 to-fuchsia-600' },
    { icon: '🏅', label: 'الإنجازات', screen: 'achievements' as const, color: 'from-amber-500 to-orange-600' },
    { icon: '📦', label: 'باقات الشحن', screen: 'packages' as const, color: 'from-cyan-500 to-blue-600' },
    { icon: '✍️', label: 'أضف سؤالاً', screen: 'submitQuestion' as const, color: 'from-lime-500 to-green-600' },
    { icon: '👤', label: 'الملف الشخصي', screen: 'profile' as const, color: 'from-gray-500 to-gray-600' },
  ];

  return (
    <motion.div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 p-4 pb-8" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500/20 to-amber-600/20 flex items-center justify-center text-2xl border border-yellow-500/30">{playerAvatar}</div>
          <div><div className="text-white font-bold text-sm">{playerName}</div><LevelBar /></div>
        </div>
        <div className="flex items-center gap-2">
          <CoinDisplay />
          <button onClick={() => setScreen('settings')} className="text-white/40 hover:text-white text-xl">⚙️</button>
        </div>
      </div>
      <motion.div className="bg-gradient-to-r from-yellow-500/10 to-amber-600/10 border border-yellow-500/20 rounded-2xl p-4 mb-5" whileHover={{ scale: 1.01 }}>
        <div className="flex items-center justify-between">
          <div><div className="text-yellow-400 font-bold text-sm">🔥 سلسلة الأيام</div><div className="text-white/50 text-xs mt-1">{today}</div></div>
          <div className="flex items-center gap-4">
            <StatBadge icon="🎯" value={currentStreak} label="حالي" />
            <StatBadge icon="⭐" value={bestStreak} label="أفضل" />
            <StatBadge icon="🎮" value={gamesPlayed} label="ألعاب" />
          </div>
        </div>
      </motion.div>
      {isAdmin && (
        <motion.button onClick={() => setScreen('admin')} className="w-full bg-gradient-to-r from-red-500/20 to-rose-600/20 border border-red-500/30 rounded-2xl p-3 mb-4 text-center" whileTap={{ scale: 0.98 }}>
          <span className="text-red-400 font-bold text-sm">👑 لوحة تحكم المسؤول</span>
        </motion.button>
      )}
      <div className="grid grid-cols-2 gap-3">
        {menuItems.map((item, i) => (
          <motion.button key={item.screen} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setScreen(item.screen)}
            className={`relative bg-gradient-to-br ${item.color} rounded-2xl p-4 text-center overflow-hidden group`}>
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="text-2xl mb-1">{item.icon}</div>
            <div className="text-white font-bold text-xs relative z-10">{item.label}</div>
            {item.badge && <span className="absolute top-2 left-2 text-sm">{item.badge}</span>}
          </motion.button>
        ))}
      </div>
      <AdBanner />
    </motion.div>
  );
}

// ===== Mode Selection =====
function ModeSelectScreen() {
  const { setScreen, startGame } = useGameStore();
  const modes = [
    { id: 'classic' as const, icon: '🎯', name: 'الكلاسيكي', desc: '10 أسئلة - 20 ثانية', color: 'from-yellow-500 to-amber-600' },
    { id: 'speed' as const, icon: '⚡', name: 'السرعة', desc: '15 سؤال - 8 ثوان!', color: 'from-red-500 to-rose-600' },
    { id: 'survival' as const, icon: '🏕️', name: 'البقاء', desc: 'أخطئ واخرج!', color: 'from-emerald-500 to-teal-600' },
    { id: 'marathon' as const, icon: '🏃', name: 'الماراثون', desc: '30 سؤال تحدي طويل', color: 'from-purple-500 to-violet-600' },
    { id: 'daily' as const, icon: '📅', name: 'اليومي', desc: 'تحدي يومي خاص', color: 'from-blue-500 to-cyan-600' },
    { id: 'teamBattle' as const, icon: '⚔️', name: 'معركة الفرق', desc: 'تحدَّ مع فريقك!', color: 'from-orange-500 to-red-600' },
  ];
  return (
    <motion.div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 p-4" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="flex items-center gap-3 mb-6">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setScreen('menu')} className="text-white/60 hover:text-white text-2xl">→</motion.button>
        <h2 className="text-xl font-bold text-white">اختر نمط اللعب</h2>
      </div>
      <div className="space-y-3">
        {modes.map((mode, i) => (
          <motion.button key={mode.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => startGame(mode.id)}
            className={`w-full bg-gradient-to-r ${mode.color} rounded-2xl p-4 flex items-center gap-4 text-right`}>
            <span className="text-3xl">{mode.icon}</span>
            <div className="flex-1"><div className="text-white font-bold">{mode.name}</div><div className="text-white/70 text-sm">{mode.desc}</div></div>
            <span className="text-white/50 text-xl">‹</span>
          </motion.button>
        ))}
      </div>
      <div className="mt-4">
        <GlowButton onClick={() => setScreen('categorySelect')} variant="outline" className="w-full">📚 اختر تصنيف محدد</GlowButton>
      </div>
    </motion.div>
  );
}

// ===== Category Selection =====
function CategorySelectScreen() {
  const { setScreen, startGame } = useGameStore();
  const categories = Object.entries(categoryInfo) as [QuestionCategory, typeof categoryInfo[QuestionCategory]][];
  return (
    <motion.div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 p-4" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="flex items-center gap-3 mb-6">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setScreen('modeSelect')} className="text-white/60 hover:text-white text-2xl">→</motion.button>
        <h2 className="text-xl font-bold text-white">اختر التصنيف</h2>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {categories.map(([key, info], i) => (
          <motion.button key={key} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => startGame('classic', key)}
            className={`bg-gradient-to-br ${info.gradient} rounded-2xl p-4 text-center`}>
            <div className="text-3xl mb-1">{info.icon}</div>
            <div className="text-white font-bold text-xs">{info.name}</div>
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
    powerUps, usedPowerUps } = store;
  const question = questions[currentQuestionIndex];
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([]);
  const [skipUsed, setSkipUsed] = useState(false);

  useEffect(() => {
    if (isTimerActive && timeRemaining > 0 && !answeredCurrent) {
      timerRef.current = setTimeout(() => {
        useGameStore.setState((s) => {
          if (s.timeRemaining <= 1) return { timeRemaining: 0, isTimerActive: false, answeredCurrent: true, isCorrect: false, selectedAnswer: -1 };
          return { timeRemaining: s.timeRemaining - 1 };
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isTimerActive, timeRemaining, answeredCurrent]);

  useEffect(() => { setShowHint(false); setEliminatedOptions([]); setSkipUsed(false); }, [currentQuestionIndex]);

  if (!question) return null;

  const handleUsePowerUp = (puId: string) => {
    const pu = powerUps.find(p => p.id === puId);
    if (!pu || pu.count <= 0 || answeredCurrent) return;
    store.usePowerUp(puId);
    switch (puId) {
      case 'fifty_fifty': {
        const wrongIndices = question.options.map((_, i) => i).filter(i => i !== question.correctIndex);
        setEliminatedOptions(wrongIndices.sort(() => Math.random() - 0.5).slice(0, 2)); break;
      }
      case 'hint': setShowHint(true); break;
      case 'skip': setSkipUsed(true); setTimeout(() => store.nextQuestion(), 500); break;
    }
  };

  const timerColor = timeRemaining > 10 ? 'bg-emerald-500' : timeRemaining > 5 ? 'bg-yellow-500' : 'bg-red-500';
  const timerPercent = (timeRemaining / question.timeLimit) * 100;
  const modeNames: Record<string, string> = { classic: '🎯 الكلاسيكي', speed: '⚡ السرعة', survival: '🏕️ البقاء', marathon: '🏃 الماراثون', daily: '📅 اليومي', teamBattle: '⚔️ معركة الفرق' };
  const isDoubled = usedPowerUps.includes('double_points');

  return (
    <motion.div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 p-4 flex flex-col" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/40 bg-white/5 px-2 py-1 rounded-lg">{modeNames[currentMode]}</span>
          <span className="text-xs text-white/40">{currentQuestionIndex + 1}/{questions.length}</span>
        </div>
        <div className="flex items-center gap-3">
          {comboCount > 1 && <motion.span key={comboCount} initial={{ scale: 2 }} animate={{ scale: 1 }} className="text-sm font-bold text-yellow-400">🔥 x{comboCount}</motion.span>}
          {isDoubled && <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-lg">×2</span>}
          <div className="flex items-center gap-1 bg-yellow-500/20 rounded-full px-3 py-1"><span className="text-xs">⭐</span><span className="text-sm font-bold text-yellow-400">{score}</span></div>
        </div>
      </div>
      <div className="w-full bg-white/10 rounded-full h-2 mb-4 overflow-hidden">
        <motion.div className={`h-full ${timerColor} rounded-full`} initial={{ width: '100%' }} animate={{ width: `${timerPercent}%` }} transition={{ duration: 0.5 }} />
      </div>
      <div className="text-center mb-2"><span className={`text-3xl font-extrabold ${timeRemaining <= 5 ? 'text-red-500' : 'text-white/80'}`}>{timeRemaining}</span></div>
      <div className="flex justify-center gap-1 mb-4 flex-wrap">
        {questions.map((_, i) => (
          <div key={i} className={`w-2 h-2 rounded-full transition-all ${i < currentQuestionIndex ? 'bg-emerald-500' : i === currentQuestionIndex ? 'bg-yellow-400 scale-125' : 'bg-white/20'}`} />
        ))}
      </div>
      <motion.div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl p-6 mb-4 border border-white/10 flex-shrink-0" layout>
        <div className="text-center mb-1">
          <span className="text-xs text-white/30">{categoryInfo[question.category]?.icon} {categoryInfo[question.category]?.name} • {question.difficulty === 'easy' ? 'سهل' : question.difficulty === 'medium' ? 'متوسط' : question.difficulty === 'hard' ? 'صعب' : 'خبير'}</span>
        </div>
        <h3 className="text-xl font-bold text-white text-center leading-relaxed">{question.text}</h3>
        <div className="text-center text-sm text-yellow-400/70 mt-2">⭐ {question.points} {isDoubled ? '×2' : ''} نقطة</div>
      </motion.div>
      {showHint && !answeredCurrent && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 mb-3 text-center">
          <span className="text-sm text-yellow-300">💡 {question.hint}</span>
        </motion.div>
      )}
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
            <motion.button key={i} whileHover={!answeredCurrent && !isEliminated ? { scale: 1.02 } : {}} whileTap={!answeredCurrent && !isEliminated ? { scale: 0.98 } : {}}
              onClick={() => !isEliminated && store.answerQuestion(i)} disabled={answeredCurrent || isEliminated}
              className={`w-full rounded-xl p-4 border-2 text-right transition-all duration-300 ${optionClass}`}>
              <div className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border ${
                  answeredCurrent && isCorrectOption ? 'bg-emerald-500/30 border-emerald-500 text-emerald-300' :
                  answeredCurrent && isSelected && !isCorrect ? 'bg-red-500/30 border-red-500 text-red-300' :
                  'bg-white/10 border-white/20 text-white/60'}`}>
                  {answeredCurrent && isCorrectOption ? '✓' : answeredCurrent && isSelected && !isCorrect ? '✗' : ['أ', 'ب', 'ج', 'د'][i]}
                </span>
                <span className="flex-1 font-medium">{option}</span>
              </div>
            </motion.button>
          );
        })}
      </div>
      <AnimatePresence>
        {answeredCurrent && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-3">
            {isCorrect ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
                <span className="text-lg">🎉</span><span className="text-emerald-400 font-bold mr-2">إجابة صحيحة!</span>
                {comboCount > 1 && <span className="text-yellow-400 text-sm"> 🔥 كومبو ×{comboCount}!</span>}
              </div>
            ) : (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
                <span className="text-lg">😔</span><span className="text-red-400 font-bold mr-2">إجابة خاطئة!</span>
                <div className="text-white/50 text-xs mt-1">الإجابة الصحيحة: {question.options[question.correctIndex]}</div>
              </div>
            )}
            {question.funFact && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 mt-2 text-center"><span className="text-sm text-blue-300">🤓 {question.funFact}</span></div>
            )}
            <GlowButton onClick={() => store.nextQuestion()} className="w-full mt-3">{currentQuestionIndex < questions.length - 1 ? 'السؤال التالي ←' : 'عرض النتائج 🏆'}</GlowButton>
          </motion.div>
        )}
      </AnimatePresence>
      {!answeredCurrent && !skipUsed && (
        <div className="flex justify-center gap-2 mt-3 pb-2">
          {powerUps.map(pu => (
            <motion.button key={pu.id} whileTap={{ scale: 0.9 }} onClick={() => handleUsePowerUp(pu.id)}
              disabled={pu.count <= 0 || usedPowerUps.includes(pu.id)}
              className={`relative flex flex-col items-center px-3 py-2 rounded-xl transition-all ${pu.count > 0 && !usedPowerUps.includes(pu.id) ? 'bg-white/10 hover:bg-white/20' : 'bg-white/5 opacity-40'}`}>
              <span className="text-lg">{pu.icon}</span><span className="text-[10px] text-white/50 mt-0.5">{pu.count}</span>
            </motion.button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ===== Results Screen =====
function ResultsScreen() {
  const { score, correctCount, questions, maxCombo, playerCoins, playerLevel, setScreen, resetGame, playerGems } = useGameStore();
  const totalQuestions = questions.length;
  const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const coinsEarned = Math.round(score * 0.1) + correctCount * 5;
  const gemsEarned = correctCount === totalQuestions ? 3 : 0;
  const xpEarned = Math.round(score * 0.5);

  // Record wallet transaction once on mount
  const recordedRef = useRef(false);
  useEffect(() => {
    if (recordedRef.current) return;
    recordedRef.current = true;
    const wallet = useWalletStore.getState();
    if (coinsEarned > 0) {
      wallet.addTransaction({ type: 'earn', amount: coinsEarned, currency: 'coins', description: 'مكافأة إتمام اللعبة' });
    }
    if (gemsEarned > 0) {
      wallet.addTransaction({ type: 'reward', amount: gemsEarned, currency: 'gems', description: 'مكافأة إجابات كاملة' });
    }
  }, [coinsEarned, gemsEarned]);
  const getGrade = () => {
    if (percentage >= 90) return { emoji: '🏆', text: 'أسطوري!', color: 'text-yellow-400' };
    if (percentage >= 70) return { emoji: '🌟', text: 'ممتاز!', color: 'text-emerald-400' };
    if (percentage >= 50) return { emoji: '👍', text: 'جيد!', color: 'text-blue-400' };
    if (percentage >= 30) return { emoji: '💪', text: 'لا بأس', color: 'text-orange-400' };
    return { emoji: '📚', text: 'تحتاج مراجعة', color: 'text-red-400' };
  };
  const grade = getGrade();
  return (
    <motion.div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 p-4 flex flex-col items-center justify-center" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }} className="text-7xl mb-4">{grade.emoji}</motion.div>
      <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={`text-3xl font-extrabold ${grade.color} mb-2`}>{grade.text}</motion.h2>
      <div className="text-white/50 text-sm mb-6">{percentage}% إجابات صحيحة</div>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }} className="relative w-40 h-40 mb-6">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
          <circle cx="60" cy="60" r="50" fill="none" stroke="url(#scoreGrad)" strokeWidth="10" strokeDasharray={`${percentage * 3.14} 314`} strokeLinecap="round" />
          <defs><linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#f59e0b" /><stop offset="100%" stopColor="#ef4444" /></linearGradient></defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-3xl font-extrabold text-white">{score}</span><span className="text-xs text-white/40">نقطة</span></div>
      </motion.div>
      <div className="grid grid-cols-3 gap-3 mb-6 w-full max-w-sm">
        <StatBadge icon="✅" value={`${correctCount}/${totalQuestions}`} label="صحيح" />
        <StatBadge icon="🔥" value={maxCombo} label="أقصى كومبو" />
        <StatBadge icon="⭐" value={xpEarned} label="XP مكتسب" />
      </div>
      <div className="bg-white/5 rounded-2xl p-4 mb-6 w-full max-w-sm">
        <div className="text-white/40 text-xs text-center mb-3">المكافآت</div>
        <div className="flex justify-around">
          <div className="flex items-center gap-1"><span>🪙</span><span className="text-yellow-400 font-bold">+{coinsEarned}</span></div>
          <div className="flex items-center gap-1"><span>💎</span><span className="text-purple-400 font-bold">+{gemsEarned}</span></div>
          <div className="flex items-center gap-1"><span>⬆️</span><span className="text-emerald-400 font-bold">+{xpEarned} XP</span></div>
        </div>
      </div>
      <div className="flex flex-col gap-3 w-full max-w-sm">
        <GlowButton onClick={() => resetGame()} className="w-full">🔄 العب مرة أخرى</GlowButton>
        <GlowButton onClick={() => setScreen('menu')} variant="outline" className="w-full">🏠 القائمة الرئيسية</GlowButton>
      </div>
    </motion.div>
  );
}

// ===== Leaderboard =====
function LeaderboardScreen() {
  const { setScreen, leaderboard } = useGameStore();
  return (
    <motion.div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 p-4" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="flex items-center gap-3 mb-6">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setScreen('menu')} className="text-white/60 hover:text-white text-2xl">→</motion.button>
        <h2 className="text-xl font-bold text-white">🏆 المتصدرين</h2>
      </div>
      <div className="flex items-end justify-center gap-3 mb-6 h-48">
        {[1, 0, 2].map((idx) => {
          const entry = leaderboard[idx];
          if (!entry) return null;
          const heights = ['h-32', 'h-24', 'h-20'];
          return (
            <motion.div key={entry.rank} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="flex flex-col items-center">
              <span className="text-2xl mb-1">{entry.avatar}</span>
              <div className="text-white font-bold text-xs text-center mb-1 max-w-[80px] truncate">{entry.name}</div>
              <div className={`w-20 ${heights[idx]} rounded-t-xl flex flex-col items-center justify-center ${idx === 0 ? 'bg-gradient-to-t from-yellow-600 to-yellow-400' : idx === 1 ? 'bg-gradient-to-t from-gray-500 to-gray-400' : 'bg-gradient-to-t from-amber-700 to-amber-600'}`}>
                <span className="text-2xl font-extrabold text-white">{entry.rank}</span>
                <span className="text-[10px] text-white/70">{entry.score.toLocaleString()}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
      <div className="space-y-2">
        {leaderboard.slice(3).map((entry) => (
          <motion.div key={entry.rank} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className={`flex items-center gap-3 p-3 rounded-xl ${entry.isPlayer ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-white/5'}`}>
            <span className="text-lg font-bold text-white/40 w-6 text-center">{entry.rank}</span>
            <span className="text-xl">{entry.avatar}</span>
            <div className="flex-1"><div className={`text-sm font-bold ${entry.isPlayer ? 'text-yellow-400' : 'text-white'}`}>{entry.name}</div><div className="text-xs text-white/40">المستوى {entry.level}</div></div>
            <div className="text-sm font-bold text-white/60">{entry.score.toLocaleString()}</div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ===== Profile =====
function ProfileScreen() {
  const { setScreen, playerName, playerAvatar, playerLevel, playerXP, playerCoins, playerGems, totalScore, gamesPlayed, gamesWon, bestStreak, setPlayerName, isAdmin, user, logout } = useGameStore();
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(playerName);
  const winRate = gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0;
  const avatars = ['🦁', '🦅', '🐉', '🔥', '👑', '💎', '🌟', '⚔️', '🌙', '🏹', '🎯', '🏆', '⚡', '🧠', '🎭', '📖', '🕌', '🚀'];

  return (
    <motion.div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 p-4" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="flex items-center gap-3 mb-6">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setScreen('menu')} className="text-white/60 hover:text-white text-2xl">→</motion.button>
        <h2 className="text-xl font-bold text-white">الملف الشخصي</h2>
      </div>
      <div className="flex flex-col items-center mb-6">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-500/20 to-amber-600/20 flex items-center justify-center text-5xl border-2 border-yellow-500/30 mb-3">{playerAvatar}</div>
        {editing ? (
          <div className="flex items-center gap-2">
            <input value={nameInput} onChange={(e) => setNameInput(e.target.value)} className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-center text-sm" maxLength={20} dir="rtl" />
            <GlowButton onClick={() => { setPlayerName(nameInput); setEditing(false); }} className="text-sm px-4 py-2">حفظ</GlowButton>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="text-white font-bold text-lg">{playerName} ✏️</button>
        )}
        <LevelBar />
        {user && <div className="text-white/30 text-xs mt-2">{user.email} • {user.provider || 'بريد إلكتروني'}</div>}
      </div>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white/5 rounded-xl p-4 text-center"><div className="text-2xl font-bold text-white">{gamesPlayed}</div><div className="text-xs text-white/40">ألعاب</div></div>
        <div className="bg-white/5 rounded-xl p-4 text-center"><div className="text-2xl font-bold text-emerald-400">{winRate}%</div><div className="text-xs text-white/40">نسبة الفوز</div></div>
        <div className="bg-white/5 rounded-xl p-4 text-center"><div className="text-2xl font-bold text-yellow-400">{totalScore.toLocaleString()}</div><div className="text-xs text-white/40">مجموع النقاط</div></div>
        <div className="bg-white/5 rounded-xl p-4 text-center"><div className="text-2xl font-bold text-orange-400">🔥 {bestStreak}</div><div className="text-xs text-white/40">أفضل سلسلة</div></div>
      </div>
      <div className="bg-white/5 rounded-2xl p-4 mb-4">
        <div className="text-white/40 text-xs text-center mb-3">اختر أفاتارك</div>
        <div className="grid grid-cols-6 gap-2">
          {avatars.map(av => (
            <motion.button key={av} whileTap={{ scale: 0.9 }} onClick={() => useGameStore.getState().setPlayerAvatar(av)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${playerAvatar === av ? 'bg-yellow-500/30 border-2 border-yellow-500' : 'bg-white/5'}`}>{av}</motion.button>
          ))}
        </div>
      </div>
      {isAdmin && (
        <GlowButton onClick={() => setScreen('admin')} variant="outline" className="w-full mb-3">👑 لوحة تحكم المسؤول</GlowButton>
      )}
      <GlowButton onClick={() => { useAuthStore.getState().logout(); logout(); }} variant="danger" className="w-full">🚪 تسجيل الخروج</GlowButton>
    </motion.div>
  );
}

// ===== Shop =====
function ShopScreen() {
  const { setScreen, shopItems, playerCoins, playerGems, buyShopItem } = useGameStore();
  const [tab, setTab] = useState<'powerup' | 'avatar'>('powerup');
  const filteredItems = shopItems.filter(i => i.type === tab);
  return (
    <motion.div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 p-4" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setScreen('menu')} className="text-white/60 hover:text-white text-2xl">→</motion.button>
          <h2 className="text-xl font-bold text-white">🛍️ المتجر</h2>
        </div>
        <CoinDisplay />
      </div>
      <div className="flex gap-2 mb-4">
        {(['powerup', 'avatar'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${tab === t ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-white/5 text-white/40'}`}>
            {t === 'powerup' ? '⚡ أدوات مساعدة' : '🎭 الأفاتارات'}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {filteredItems.map(item => (
          <motion.div key={item.id} whileHover={{ scale: 1.02 }} className={`bg-white/5 rounded-2xl p-4 text-center ${item.type === 'avatar' && item.owned ? 'border border-emerald-500/20' : ''}`}>
            <div className="text-3xl mb-2">{item.icon}</div>
            <div className="text-white font-bold text-sm mb-1">{item.name}</div>
            <div className="text-white/40 text-xs mb-3">{item.description}</div>
            {item.type === 'avatar' && item.owned ? (
              <span className="text-emerald-400 text-xs font-bold">✅ مملوك</span>
            ) : (
              <GlowButton onClick={() => buyShopItem(item.id)}
                disabled={(item.currency === 'coins' && playerCoins < item.cost) || (item.currency === 'gems' && playerGems < item.cost)}
                className="text-xs px-3 py-1.5">{item.currency === 'coins' ? '🪙' : '💎'} {item.cost}</GlowButton>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ===== Achievements =====
function AchievementsScreen() {
  const { setScreen, achievements } = useGameStore();
  const unlocked = achievements.filter(a => a.unlocked).length;
  return (
    <motion.div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 p-4" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="flex items-center gap-3 mb-4">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setScreen('menu')} className="text-white/60 hover:text-white text-2xl">→</motion.button>
        <h2 className="text-xl font-bold text-white">🏅 الإنجازات</h2>
        <span className="text-white/40 text-sm mr-auto">{unlocked}/{achievements.length}</span>
      </div>
      <div className="space-y-3">
        {achievements.map((a, i) => (
          <motion.div key={a.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
            className={`flex items-center gap-4 p-4 rounded-xl ${a.unlocked ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-white/5'}`}>
            <span className="text-3xl">{a.icon}</span>
            <div className="flex-1">
              <div className={`font-bold text-sm ${a.unlocked ? 'text-yellow-400' : 'text-white/60'}`}>{a.name}</div>
              <div className="text-white/40 text-xs">{a.description}</div>
              {!a.unlocked && <Progress value={(a.progress / a.target) * 100} className="h-1.5 mt-2 bg-white/10 [&>div]:bg-yellow-500" />}
            </div>
            {a.unlocked && <span className="text-yellow-400 text-xs font-bold">🪙 +{a.reward}</span>}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ===== Team =====
function TeamScreen() {
  const { setScreen, teams, currentTeam, joinTeam, createTeam } = useGameStore();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  return (
    <motion.div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 p-4" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="flex items-center gap-3 mb-6">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setScreen('menu')} className="text-white/60 hover:text-white text-2xl">→</motion.button>
        <h2 className="text-xl font-bold text-white">⚔️ الفرق</h2>
      </div>
      {currentTeam && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 mb-4 text-center">
          <span className="text-3xl">{currentTeam.logo}</span>
          <div className="text-yellow-400 font-bold mt-1">{currentTeam.name}</div>
          <div className="text-white/40 text-xs">فريقك الحالي</div>
        </div>
      )}
      <GlowButton onClick={() => setShowCreate(!showCreate)} variant="outline" className="w-full mb-4">➕ إنشاء فريق جديد</GlowButton>
      {showCreate && (
        <div className="bg-white/5 rounded-xl p-4 mb-4 flex gap-2">
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="اسم الفريق" className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" dir="rtl" />
          <GlowButton onClick={() => { if (newName) { createTeam(newName, '⚔️'); setShowCreate(false); setNewName(''); } }} className="text-sm px-4 py-2">إنشاء</GlowButton>
        </div>
      )}
      <div className="space-y-3">
        {teams.map((team, i) => (
          <motion.div key={team.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 p-4 bg-white/5 rounded-xl">
            <span className="text-3xl">{team.logo}</span>
            <div className="flex-1">
              <div className="text-white font-bold text-sm">{team.name}</div>
              <div className="text-white/40 text-xs">👥 {team.members} عضو • ⭐ {team.score.toLocaleString()}</div>
            </div>
            <GlowButton onClick={() => joinTeam(team)} className="text-xs px-3 py-1.5">انضمام</GlowButton>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ===== Daily Challenge =====
function DailyChallengeScreen() {
  const { setScreen, startGame, dailyCompleted } = useGameStore();
  return (
    <motion.div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 p-4 flex flex-col items-center justify-center" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="flex items-center gap-3 mb-6 absolute top-4 right-4">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setScreen('menu')} className="text-white/60 hover:text-white text-2xl">→</motion.button>
      </div>
      <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-6xl mb-4">📅</motion.div>
      <h2 className="text-2xl font-extrabold text-white mb-2">التحدي اليومي</h2>
      <p className="text-white/40 text-sm mb-6 text-center px-8">تحدَّ نفسك كل يوم بأسئلة جديدة واربح مكافآت مضاعفة!</p>
      {dailyCompleted ? (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center"><span className="text-emerald-400 font-bold">✅ أكملت تحدي اليوم!</span></div>
      ) : (
        <GlowButton onClick={() => startGame('daily')} className="text-lg px-12 py-4">🔥 ابدأ التحدي</GlowButton>
      )}
    </motion.div>
  );
}

// ===== Spin Wheel =====
function SpinWheelScreen() {
  const { setScreen, playerCoins, updateUserCoins } = useGameStore();
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const prizes = ['🪙 +50', '💎 +3', '🪙 +100', '🎁 مفاجأة', '🪙 +25', '💎 +1', '🪙 +75', '⭐ ×2'];
  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);
    const newRotation = rotation + 1440 + Math.random() * 720;
    setRotation(newRotation);
    setTimeout(() => {
      const idx = Math.floor(Math.random() * prizes.length);
      setResult(prizes[idx]);
      if (idx === 0 || idx === 2 || idx === 4 || idx === 6) updateUserCoins([50, 100, 25, 75][[0, 2, 4, 6].indexOf(idx)]);
      if (idx === 1 || idx === 5) useGameStore.getState().updateUserGems([3, 1][[1, 5].indexOf(idx)]);
      setSpinning(false);
    }, 3000);
  };
  return (
    <motion.div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 p-4 flex flex-col items-center justify-center" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="flex items-center gap-3 mb-6 absolute top-4 right-4">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setScreen('menu')} className="text-white/60 hover:text-white text-2xl">→</motion.button>
      </div>
      <h2 className="text-2xl font-extrabold text-white mb-8">🎰 عجلة الحظ</h2>
      <div className="relative w-64 h-64 mb-8">
        <div className="absolute inset-0 flex items-center justify-center text-4xl z-10">🎰</div>
        <motion.div animate={{ rotate: rotation }} transition={{ duration: 3, ease: 'easeOut' }}
          className="w-full h-full rounded-full border-4 border-yellow-500/50 overflow-hidden"
          style={{ background: `conic-gradient(${prizes.map((_, i) => `${i % 2 === 0 ? 'rgba(234,179,8,0.3)' : 'rgba(168,85,247,0.3)'} ${(i * 360 / prizes.length)}deg ${((i + 1) * 360 / prizes.length)}deg`).join(', ')})` }}>
          {prizes.map((prize, i) => (
            <div key={i} className="absolute w-full h-full flex items-start justify-center pt-4" style={{ transform: `rotate(${i * 45}deg)`, transformOrigin: 'center' }}>
              <span className="text-white text-xs font-bold">{prize}</span>
            </div>
          ))}
        </motion.div>
      </div>
      {result && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-4 text-center">
          <span className="text-yellow-400 font-bold text-lg">فزت: {result}!</span>
        </motion.div>
      )}
      <GlowButton onClick={spin} disabled={spinning} className="text-lg px-12 py-4">
        {spinning ? '🎡 جارٍ الدوران...' : '🎰 أدر العجلة!'}
      </GlowButton>
    </motion.div>
  );
}

// ===== Settings =====
function SettingsScreen() {
  const { setScreen, soundEnabled, vibrationEnabled, darkMode, toggleSound, toggleVibration, toggleDarkMode, logout, isLoggedIn } = useGameStore();
  return (
    <motion.div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 p-4" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="flex items-center gap-3 mb-6">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setScreen('menu')} className="text-white/60 hover:text-white text-2xl">→</motion.button>
        <h2 className="text-xl font-bold text-white">⚙️ الإعدادات</h2>
      </div>
      <div className="space-y-3">
        {[
          { label: 'الصوت', icon: soundEnabled ? '🔊' : '🔇', value: soundEnabled, action: toggleSound },
          { label: 'الاهتزاز', icon: vibrationEnabled ? '📳' : '📴', value: vibrationEnabled, action: toggleVibration },
          { label: 'الوضع الداكن', icon: darkMode ? '🌙' : '☀️', value: darkMode, action: toggleDarkMode },
        ].map(item => (
          <div key={item.label} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div className="flex items-center gap-3"><span className="text-xl">{item.icon}</span><span className="text-white font-bold text-sm">{item.label}</span></div>
            <button onClick={item.action} className={`w-12 h-6 rounded-full transition-all ${item.value ? 'bg-yellow-500' : 'bg-white/20'}`}>
              <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${item.value ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
        ))}
      </div>
      <div className="mt-6 space-y-3">
        <button className="w-full flex items-center gap-3 p-4 bg-white/5 rounded-xl text-white/60 hover:text-white transition-all"><span>⭐</span><span className="text-sm">قيّم التطبيق</span></button>
        <button className="w-full flex items-center gap-3 p-4 bg-white/5 rounded-xl text-white/60 hover:text-white transition-all"><span>📤</span><span className="text-sm">شارك التطبيق</span></button>
        <button className="w-full flex items-center gap-3 p-4 bg-white/5 rounded-xl text-white/60 hover:text-white transition-all"><span>ℹ️</span><span className="text-sm">حول التطبيق</span></button>
      </div>
      {isLoggedIn && <GlowButton onClick={() => { useAuthStore.getState().logout(); logout(); }} variant="danger" className="w-full mt-6">🚪 تسجيل الخروج</GlowButton>}
    </motion.div>
  );
}

// ===== Packages Screen =====
function PackagesScreen() {
  const { setScreen, packages, updateUserCoins, updateUserGems } = useGameStore();
  const [selectedPkg, setSelectedPkg] = useState<PackageData | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const defaultPackages: PackageData[] = packages.length > 0 ? packages : [
    { id: '1', name: 'باقة المبتدئ', description: 'بداية رائعة لمغامرتك!', icon: '🎒', coins: 500, gems: 0, price: 4.99, color: 'from-emerald-500 to-teal-600', isActive: true },
    { id: '2', name: 'باقة المغامر', description: 'المزيد من العملات!', icon: '⚔️', coins: 1500, gems: 5, price: 9.99, color: 'from-yellow-500 to-amber-600', isActive: true },
    { id: '3', name: 'باقة البطل', description: 'أسلحة قوية للبطل!', icon: '🛡️', coins: 3500, gems: 15, price: 19.99, color: 'from-purple-500 to-violet-600', isActive: true },
    { id: '4', name: 'باقة الأسطورة', description: 'أقوى باقة للمحترفين!', icon: '👑', coins: 8000, gems: 40, price: 39.99, color: 'from-red-500 to-rose-600', isActive: true },
  ];

  const handleBuy = (pkg: PackageData) => { setSelectedPkg(pkg); setShowConfirm(true); };
  const confirmBuy = () => {
    if (selectedPkg) { updateUserCoins(selectedPkg.coins); updateUserGems(selectedPkg.gems); }
    setShowConfirm(false); setSelectedPkg(null);
  };

  return (
    <motion.div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 p-4" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="flex items-center gap-3 mb-6">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setScreen('menu')} className="text-white/60 hover:text-white text-2xl">→</motion.button>
        <h2 className="text-xl font-bold text-white">📦 باقات الشحن</h2>
      </div>
      <div className="space-y-4">
        {defaultPackages.filter(p => p.isActive).map((pkg, i) => (
          <motion.div key={pkg.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className={`bg-gradient-to-r ${pkg.color} rounded-2xl p-5 relative overflow-hidden`}>
            <div className="flex items-center gap-4">
              <span className="text-5xl">{pkg.icon}</span>
              <div className="flex-1">
                <div className="text-white font-bold text-lg">{pkg.name}</div>
                <div className="text-white/70 text-sm">{pkg.description}</div>
                <div className="flex gap-3 mt-2">
                  {pkg.coins > 0 && <span className="bg-black/20 rounded-full px-2 py-0.5 text-xs text-white">🪙 {pkg.coins.toLocaleString()}</span>}
                  {pkg.gems > 0 && <span className="bg-black/20 rounded-full px-2 py-0.5 text-xs text-white">💎 {pkg.gems}</span>}
                </div>
              </div>
              <GlowButton onClick={() => handleBuy(pkg)} className="text-sm px-4 py-2">{pkg.price} ر.س</GlowButton>
            </div>
          </motion.div>
        ))}
      </div>
      {showConfirm && selectedPkg && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="bg-gray-900 rounded-2xl p-6 max-w-sm w-full text-center border border-white/10">
            <span className="text-5xl">{selectedPkg.icon}</span>
            <h3 className="text-white font-bold text-lg mt-3">{selectedPkg.name}</h3>
            <p className="text-white/50 text-sm mt-1">سيتم شحن {selectedPkg.coins} عملة و {selectedPkg.gems} جوهرة</p>
            <div className="flex gap-3 mt-4">
              <GlowButton onClick={confirmBuy} className="flex-1">تأكيد الشراء</GlowButton>
              <GlowButton onClick={() => setShowConfirm(false)} variant="outline" className="flex-1">إلغاء</GlowButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}

// ===== Submit Question Screen =====
function SubmitQuestionScreen() {
  const { setScreen, lastQuestionScore, lastQuestionFeedback, setLastQuestionScore } = useGameStore();
  const [text, setText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [category, setCategory] = useState<QuestionCategory>('general');
  const [hint, setHint] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!text || options.some(o => !o)) return;
    setLoading(true);
    // Local quality check instead of API call
    await new Promise(r => setTimeout(r, 800));
    let qualityScore = 50;
    let aiFeedback = 'شكراً لمساهمتك!';
    if (text.length > 15) qualityScore += 15;
    if (text.length > 30) qualityScore += 10;
    if (hint && hint.length > 5) qualityScore += 10;
    if (options.every(o => o.length > 2)) qualityScore += 10;
    if (qualityScore >= 80) aiFeedback = 'سؤال ممتاز! سيتم مراجعته وإضافته قريباً.';
    else if (qualityScore >= 60) aiFeedback = 'سؤال جيد! حاول إضافة تلميح أو تفصيل أكثر.';
    else aiFeedback = 'السؤال قصير جداً. حاول كتابة سؤال أوضح مع تلميح.';
    qualityScore = Math.min(qualityScore, 100);
    setLastQuestionScore(qualityScore, aiFeedback);
    setLoading(false);
  };

  return (
    <motion.div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 p-4" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="flex items-center gap-3 mb-6">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => { setScreen('menu'); setLastQuestionScore(null); }} className="text-white/60 hover:text-white text-2xl">→</motion.button>
        <h2 className="text-xl font-bold text-white">✍️ أضف سؤالاً</h2>
      </div>
      <div className="space-y-4 max-w-lg mx-auto">
        <div>
          <label className="text-white/60 text-sm mb-1 block">التصنيف</label>
          <select value={category} onChange={(e) => setCategory(e.target.value as QuestionCategory)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-500/50">
            {Object.entries(categoryInfo).map(([key, info]) => (
              <option key={key} value={key} className="bg-gray-900">{info.icon} {info.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-white/60 text-sm mb-1 block">نص السؤال</label>
          <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="اكتب السؤال هنا..." dir="rtl" rows={2}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:border-yellow-500/50 focus:outline-none resize-none" />
        </div>
        {options.map((opt, i) => (
          <div key={i}>
            <label className="text-white/60 text-sm mb-1 flex items-center gap-2">
              <input type="radio" name="correct" checked={correctIndex === i} onChange={() => setCorrectIndex(i)} className="accent-yellow-500" />
              <span>الخيار {['أ', 'ب', 'ج', 'د'][i]} {correctIndex === i ? '✓' : ''}</span>
            </label>
            <input value={opt} onChange={(e) => { const newOpts = [...options]; newOpts[i] = e.target.value; setOptions(newOpts); }} placeholder={`الخيار ${['أ', 'ب', 'ج', 'د'][i]}`} dir="rtl"
              className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none ${correctIndex === i ? 'border-emerald-500/50' : 'border-white/10 focus:border-yellow-500/50'}`} />
          </div>
        ))}
        <div>
          <label className="text-white/60 text-sm mb-1 block">تلميح (اختياري)</label>
          <input value={hint} onChange={(e) => setHint(e.target.value)} placeholder="تلميح يساعد في الإجابة" dir="rtl"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:border-yellow-500/50 focus:outline-none" />
        </div>
        <GlowButton onClick={handleSubmit} disabled={loading || !text || options.some(o => !o)} className="w-full">
          {loading ? '🤖 جارٍ التقييم بالذكاء الاصطناعي...' : '✍️ إرسال السؤال'}
        </GlowButton>
        {lastQuestionScore !== null && (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className={`rounded-2xl p-4 text-center ${lastQuestionScore >= 70 ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-yellow-500/10 border border-yellow-500/20'}`}>
            <div className="text-4xl mb-2">{lastQuestionScore >= 70 ? '🎉' : '⏳'}</div>
            <div className={`font-bold text-lg ${lastQuestionScore >= 70 ? 'text-emerald-400' : 'text-yellow-400'}`}>
              {lastQuestionScore >= 70 ? 'تم قبول سؤالك!' : 'قيد المراجعة'}
            </div>
            <div className="text-white/50 text-sm mt-1">جودة السؤال: {lastQuestionScore}/100</div>
            {lastQuestionFeedback && <div className="text-white/40 text-xs mt-2">🤖 {lastQuestionFeedback}</div>}
            {lastQuestionScore >= 70 && <div className="text-yellow-400 text-sm mt-2 font-bold">🪙 حصلت على 25 عملة!</div>}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// ===== Admin Dashboard =====
function AdminScreen() {
  const { setScreen, isAdmin, packages, adConfigs, togglePackageActive, toggleAdEnabled } = useGameStore();
  const [tab, setTab] = useState<'stats' | 'packages' | 'ads' | 'users'>('stats');

  if (!isAdmin) { setScreen('menu'); return null; }

  const defaultAds: AdConfig[] = adConfigs.length > 0 ? adConfigs : [
    { adType: 'banner', isEnabled: false, frequency: 1, position: 'bottom' },
    { adType: 'interstitial', isEnabled: false, frequency: 3, position: 'between' },
    { adType: 'rewarded', isEnabled: false, frequency: 5, position: 'bottom' },
  ];

  return (
    <motion.div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 p-4" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="flex items-center gap-3 mb-4">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setScreen('menu')} className="text-white/60 hover:text-white text-2xl">→</motion.button>
        <h2 className="text-xl font-bold text-white">👑 لوحة التحكم</h2>
      </div>
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {(['stats', 'packages', 'ads', 'users'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${tab === t ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-white/5 text-white/40'}`}>
            {t === 'stats' ? '📊 الإحصائيات' : t === 'packages' ? '📦 الباقات' : t === 'ads' ? '📢 الإعلانات' : '👥 المستخدمين'}
          </button>
        ))}
      </div>

      {tab === 'stats' && (
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: '👥', value: '0', label: 'المستخدمين', color: 'from-blue-500/20 to-cyan-500/20' },
            { icon: '🎮', value: '0', label: 'الألعاب', color: 'from-emerald-500/20 to-teal-500/20' },
            { icon: '💰', value: '0', label: 'الإيرادات', color: 'from-yellow-500/20 to-amber-500/20' },
            { icon: '📦', value: packages.filter(p => p.isActive).length, label: 'باقات نشطة', color: 'from-purple-500/20 to-violet-500/20' },
          ].map(stat => (
            <div key={stat.label} className={`bg-gradient-to-br ${stat.color} border border-white/5 rounded-2xl p-4 text-center`}>
              <span className="text-3xl">{stat.icon}</span>
              <div className="text-white font-bold text-xl mt-1">{stat.value}</div>
              <div className="text-white/40 text-xs">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {tab === 'packages' && (
        <div className="space-y-3">
          {packages.map(pkg => (
            <div key={pkg.id} className="flex items-center gap-3 p-4 bg-white/5 rounded-xl">
              <span className="text-3xl">{pkg.icon}</span>
              <div className="flex-1">
                <div className="text-white font-bold text-sm">{pkg.name}</div>
                <div className="text-white/40 text-xs">🪙 {pkg.coins} • 💎 {pkg.gems} • {pkg.price} ر.س</div>
              </div>
              <button onClick={() => togglePackageActive(pkg.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${pkg.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                {pkg.isActive ? '✅ معروضة' : '❌ مخفية'}
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'ads' && (
        <div className="space-y-3">
          {defaultAds.map(ad => (
            <div key={ad.adType} className="flex items-center gap-3 p-4 bg-white/5 rounded-xl">
              <span className="text-2xl">{ad.adType === 'banner' ? '📢' : ad.adType === 'interstitial' ? '🎬' : '🎁'}</span>
              <div className="flex-1">
                <div className="text-white font-bold text-sm">{ad.adType === 'banner' ? 'إعلان بانر' : ad.adType === 'interstitial' ? 'إعلان بيني' : 'إعلان مكافأة'}</div>
                <div className="text-white/40 text-xs">كل {ad.frequency} ألعاب • {ad.position === 'bottom' ? 'أسفل' : 'بين الأسئلة'}</div>
              </div>
              <button onClick={() => toggleAdEnabled(ad.adType)}
                className={`w-12 h-6 rounded-full transition-all ${ad.isEnabled ? 'bg-yellow-500' : 'bg-white/20'}`}>
                <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${ad.isEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          ))}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-center mt-4">
            <span className="text-yellow-400 text-xs">⚠️ الإعلانات تظهر فقط عند تسجيل الدخول بحساب المسؤول للمعاينة</span>
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="text-center p-8">
          <span className="text-4xl mb-4 block">👥</span>
          <p className="text-white/40 text-sm">إدارة المستخدمين متاحة من خلال لوحة التحكم الكاملة</p>
        </div>
      )}
    </motion.div>
  );
}

// ===== Wallet Screen =====
function WalletScreen() {
  const { setScreen, playerCoins, playerGems } = useGameStore();
  const walletStore = useWalletStore();
  const balance = walletStore.getBalance();
  const totalEarned = walletStore.getTotalEarned();
  const totalSpent = walletStore.getTotalSpent();
  const transactions = walletStore.getTransactions(20);
  const currentUser = useAuthStore.getState().currentUser;

  const typeIcons: Record<string, string> = {
    earn: '🟢', spend: '🔴', transfer_in: '📥', transfer_out: '📤', bonus: '🎁', reward: '🏆',
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return 'الآن';
    if (diff < 3600000) return `منذ ${Math.floor(diff / 60000)} دقيقة`;
    if (diff < 86400000) return `منذ ${Math.floor(diff / 3600000)} ساعة`;
    return d.toLocaleDateString('ar');
  };

  const isPositive = (type: string) => type === 'earn' || type === 'transfer_in' || type === 'bonus' || type === 'reward';

  return (
    <motion.div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 p-4 pb-8" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="flex items-center gap-3 mb-6">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setScreen('menu')} className="text-white/60 hover:text-white text-2xl">→</motion.button>
        <h2 className="text-xl font-bold text-white">💰 محفظتي</h2>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-yellow-500/20 to-amber-600/10 border border-yellow-500/20 rounded-2xl p-4 text-center">
          <div className="text-3xl mb-1">🪙</div>
          <motion.div key={balance.coins} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="text-2xl font-extrabold text-yellow-400">{balance.coins.toLocaleString()}</motion.div>
          <div className="text-white/40 text-xs mt-1">عملة ذهبية</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-500/20 to-violet-600/10 border border-purple-500/20 rounded-2xl p-4 text-center">
          <div className="text-3xl mb-1">💎</div>
          <motion.div key={balance.gems} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="text-2xl font-extrabold text-purple-400">{balance.gems.toLocaleString()}</motion.div>
          <div className="text-white/40 text-xs mt-1">جوهرة</div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setScreen('transfer')}
          className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center hover:bg-white/10 transition-colors">
          <div className="text-2xl mb-1">📤</div>
          <div className="text-white/70 text-xs font-bold">إرسال</div>
        </motion.button>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center hover:bg-white/10 transition-colors">
          <div className="text-2xl mb-1">📥</div>
          <div className="text-white/70 text-xs font-bold">استلام</div>
        </motion.button>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center hover:bg-white/10 transition-colors">
          <div className="text-2xl mb-1">📋</div>
          <div className="text-white/70 text-xs font-bold">سجل المعاملات</div>
        </motion.button>
      </div>

      {/* Receive Card */}
      {currentUser && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-5">
          <div className="text-white/40 text-xs text-center mb-2">معرّفك للاستلام</div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <span className="text-emerald-400 font-mono text-sm font-bold">{currentUser.id.slice(0, 12)}</span>
          </div>
          <div className="text-white/30 text-[10px] text-center mt-2">شارك هذا المعرّف مع الآخرين لاستلام التحويلات</div>
        </motion.div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
          <div className="text-xs text-emerald-400/70 mb-1">إجمالي المكاسب</div>
          <div className="text-sm font-bold text-emerald-400">🪙 {totalEarned.coins} • 💎 {totalEarned.gems}</div>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
          <div className="text-xs text-red-400/70 mb-1">إجمالي المصروفات</div>
          <div className="text-sm font-bold text-red-400">🪙 {totalSpent.coins} • 💎 {totalSpent.gems}</div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="mb-4">
        <div className="text-white/50 text-sm font-bold mb-3">📋 آخر المعاملات</div>
        {transactions.length === 0 ? (
          <div className="bg-white/5 rounded-2xl p-6 text-center">
            <div className="text-3xl mb-2">📭</div>
            <div className="text-white/30 text-sm">لا توجد معاملات بعد</div>
            <div className="text-white/20 text-xs mt-1">العب ألعاباً لكسب العملات!</div>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
            {transactions.map((tx, i) => (
              <motion.div key={tx.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-white/5 rounded-xl p-3 flex items-center gap-3">
                <div className="text-lg w-8 text-center">{typeIcons[tx.type] || '💳'}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-white/80 text-sm font-medium truncate">{tx.description}</div>
                  <div className="text-white/30 text-[10px]">{formatTime(tx.timestamp)}</div>
                </div>
                <div className="text-left flex-shrink-0">
                  <div className={`text-sm font-bold ${isPositive(tx.type) ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isPositive(tx.type) ? '+' : '-'}{tx.amount}
                  </div>
                  <div className="text-white/30 text-[10px]">{tx.currency === 'coins' ? '🪙' : '💎'}</div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ===== Transfer Screen =====
function TransferScreen() {
  const { setScreen, playerCoins, playerGems } = useGameStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string; avatar: string } | null>(null);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<CurrencyType>('coins');
  const [showConfirm, setShowConfirm] = useState(false);
  const [transferResult, setTransferResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTransferring, setIsTransferring] = useState(false);

  const allUsers = useAuthStore.getState().getAllUsers();
  const filteredUsers = searchQuery.trim()
    ? allUsers.filter(u => u.name.includes(searchQuery) || u.email.includes(searchQuery))
    : allUsers;

  const feeRate = currency === 'coins' ? 0.05 : 0.10;
  const amountNum = parseInt(amount) || 0;
  const fee = amountNum > 0 ? Math.ceil(amountNum * feeRate) : 0;
  const totalDeducted = amountNum + fee;
  const currentBalance = currency === 'coins' ? playerCoins : playerGems;
  const canAfford = amountNum >= 10 && totalDeducted <= currentBalance;

  const handleTransfer = async () => {
    if (!selectedUser || amountNum <= 0) return;
    setIsTransferring(true);
    await new Promise(r => setTimeout(r, 800));

    const result = useWalletStore.getState().transferToUser(selectedUser.id, amountNum, currency);
    if (result.success) {
      setTransferResult({ success: true, message: `تم تحويل ${amountNum} ${currency === 'coins' ? 'عملة' : 'جوهرة'} إلى ${selectedUser.name} بنجاح!` });
    } else {
      setTransferResult({ success: false, message: result.error || 'فشل التحويل' });
    }
    setIsTransferring(false);
    setShowConfirm(false);
  };

  if (transferResult) {
    return (
      <motion.div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 p-4 flex flex-col items-center justify-center" variants={pageVariants} initial="initial" animate="animate" exit="exit">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }} className="text-6xl mb-4">
          {transferResult.success ? '✅' : '❌'}
        </motion.div>
        <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className={`text-xl font-bold mb-3 text-center ${transferResult.success ? 'text-emerald-400' : 'text-red-400'}`}>
          {transferResult.message}
        </motion.h2>
        <GlowButton onClick={() => setScreen('wallet')} className="mt-4">💰 العودة للمحفظة</GlowButton>
      </motion.div>
    );
  }

  return (
    <motion.div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 p-4 pb-8" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="flex items-center gap-3 mb-6">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setScreen('wallet')} className="text-white/60 hover:text-white text-2xl">→</motion.button>
        <h2 className="text-xl font-bold text-white">📤 تحويل</h2>
      </div>

      {/* Select Recipient */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4">
        <div className="text-white/50 text-sm font-bold mb-3">👤 اختر المستلم</div>
        {selectedUser ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-600/20 flex items-center justify-center text-xl border border-emerald-500/30">{selectedUser.avatar}</div>
            <div className="flex-1"><div className="text-emerald-400 font-bold text-sm">{selectedUser.name}</div><div className="text-white/30 text-[10px]">تم الاختيار</div></div>
            <button onClick={() => setSelectedUser(null)} className="text-white/40 hover:text-red-400 text-lg">✕</button>
          </motion.div>
        ) : (
          <>
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="🔍 ابحث عن مستخدم..." dir="rtl"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:border-emerald-500/50 focus:outline-none mb-3 text-sm" />
            <div className="space-y-2 max-h-48 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
              {filteredUsers.length === 0 ? (
                <div className="text-white/30 text-sm text-center py-4">لا يوجد مستخدمون</div>
              ) : (
                filteredUsers.slice(0, 10).map(user => (
                  <motion.button key={user.id} whileTap={{ scale: 0.98 }} onClick={() => setSelectedUser({ id: user.id, name: user.name, avatar: user.avatar })}
                    className="w-full bg-white/5 rounded-xl p-3 flex items-center gap-3 hover:bg-white/10 transition-colors text-right">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-sm border border-white/10">{user.avatar}</div>
                    <div className="flex-1"><div className="text-white/80 text-sm font-medium">{user.name}</div><div className="text-white/30 text-[10px]">{user.email}</div></div>
                    <span className="text-white/20">‹</span>
                  </motion.button>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Amount & Currency */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4">
        <div className="text-white/50 text-sm font-bold mb-3">💵 المبلغ</div>
        <div className="flex gap-2 mb-3">
          {(['coins', 'gems'] as const).map(c => (
            <button key={c} onClick={() => setCurrency(c)}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${currency === c ? (c === 'coins' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-purple-500/20 text-purple-400 border border-purple-500/30') : 'bg-white/5 text-white/40'}`}>
              {c === 'coins' ? '🪙 عملات' : '💎 جواهر'}
            </button>
          ))}
        </div>
        <input value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))} placeholder="أدخل المبلغ" dir="ltr" type="number"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:border-emerald-500/50 focus:outline-none text-center text-lg font-bold" />
        <div className="flex justify-between mt-3 text-xs">
          <div className="text-white/30">الحد الأدنى: 10</div>
          <div className="text-white/30">رصيدك: {currentBalance.toLocaleString()} {currency === 'coins' ? '🪙' : '💎'}</div>
        </div>
      </div>

      {/* Fee Summary */}
      {amountNum > 0 && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
          className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-white/50">المبلغ</span>
            <span className="text-white">{amountNum.toLocaleString()} {currency === 'coins' ? '🪙' : '💎'}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-white/50">الرسوم ({feeRate === 0.05 ? '5%' : '10%'})</span>
            <span className="text-red-400">{fee} {currency === 'coins' ? '🪙' : '💎'}</span>
          </div>
          <div className="border-t border-white/10 pt-2 flex justify-between text-sm">
            <span className="text-white/70 font-bold">الإجمالي</span>
            <span className={`font-bold ${canAfford ? 'text-emerald-400' : 'text-red-400'}`}>{totalDeducted.toLocaleString()} {currency === 'coins' ? '🪙' : '💎'}</span>
          </div>
        </motion.div>
      )}

      {/* Transfer Button */}
      <GlowButton onClick={() => setShowConfirm(true)} disabled={!selectedUser || !canAfford || amountNum < 10} className="w-full mb-4">
        {isTransferring ? '⏳ جارٍ التحويل...' : '📤 تحويل الآن'}
      </GlowButton>

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {showConfirm && selectedUser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowConfirm(false)}>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm text-center">
              <div className="text-4xl mb-3">⚠️</div>
              <h3 className="text-white font-bold text-lg mb-2">تأكيد التحويل</h3>
              <p className="text-white/60 text-sm mb-4">
                هل تريد تحويل <span className="text-yellow-400 font-bold">{amountNum}</span> {currency === 'coins' ? 'عملة' : 'جوهرة'} إلى <span className="text-emerald-400 font-bold">{selectedUser.name}</span>؟
              </p>
              <p className="text-white/40 text-xs mb-4">شامل الرسوم: {totalDeducted} {currency === 'coins' ? '🪙' : '💎'}</p>
              <div className="flex gap-3">
                <GlowButton onClick={handleTransfer} className="flex-1" disabled={isTransferring}>
                  {isTransferring ? '⏳...' : '✅ تأكيد'}
                </GlowButton>
                <GlowButton onClick={() => setShowConfirm(false)} variant="outline" className="flex-1">إلغاء</GlowButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ===== Main App =====
export default function Home() {
  const { currentScreen } = useGameStore();
  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash': return <SplashScreen />;
      case 'login': return <LoginScreen />;
      case 'menu': return <MainMenu />;
      case 'modeSelect': return <ModeSelectScreen />;
      case 'categorySelect': return <CategorySelectScreen />;
      case 'gameplay': return <GameplayScreen />;
      case 'results': return <ResultsScreen />;
      case 'leaderboard': return <LeaderboardScreen />;
      case 'profile': return <ProfileScreen />;
      case 'shop': return <ShopScreen />;
      case 'achievements': return <AchievementsScreen />;
      case 'team': return <TeamScreen />;
      case 'dailyChallenge': return <DailyChallengeScreen />;
      case 'spinWheel': return <SpinWheelScreen />;
      case 'settings': return <SettingsScreen />;
      case 'packages': return <PackagesScreen />;
      case 'submitQuestion': return <SubmitQuestionScreen />;
      case 'admin': return <AdminScreen />;
      case 'wallet': return <WalletScreen />;
      case 'transfer': return <TransferScreen />;
      default: return <MainMenu />;
    }
  };
  return (
    <main className="min-h-screen" dir="rtl" lang="ar">
      <AnimatePresence mode="wait">{renderScreen()}</AnimatePresence>
    </main>
  );
}
