'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, AdConfig } from '@/lib/game-store';
import { useAuthStore } from '@/lib/auth-local';
import { huaweiIAP, IAP_PRODUCT_MAP } from '@/lib/huawei-iap';
import { useWalletStore } from '@/lib/wallet-store';
import { categoryInfo, QuestionCategory, questions as defaultQuestions } from '@/lib/questions';
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
      <motion.p className="text-xs text-white/20 mt-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>الإصدار 3.5 — إصلاح مشاكل النشر + تحسينات</motion.p>
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
  const [showPassword, setShowPassword] = useState(false);
  const [welcomeBonus, setWelcomeBonus] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 300));

    try {
      if (tab === 'register') {
        const result = authStore.getState().register(name, email, password);
        if (!result.success) { setError(result.error || 'حدث خطأ'); setLoading(false); return; }
        if (result.user) {
          login({ id: result.user.id, email: result.user.email, name: result.user.name, avatar: result.user.avatar, role: result.user.role, level: result.user.level, coins: result.user.coins, gems: result.user.gems });
          setWelcomeBonus(true);
          setTimeout(() => { setWelcomeBonus(false); setScreen('menu'); }, 2500);
          return;
        }
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

  if (welcomeBonus) {
    return (
      <motion.div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 p-6 flex flex-col items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 12 }} className="text-7xl mb-4">🎁</motion.div>
        <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-2xl font-extrabold text-yellow-400 mb-2">مرحباً بك!</motion.h2>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-5 text-center">
          <div className="text-white/60 text-sm mb-2">مكافأة التسجيل</div>
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-1"><span className="text-2xl">🪙</span><span className="text-xl font-bold text-yellow-400">+150</span></div>
            <div className="flex items-center gap-1"><span className="text-2xl">💎</span><span className="text-xl font-bold text-purple-400">+8</span></div>
          </div>
        </motion.div>
      </motion.div>
    );
  }

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
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="الاسم" dir="rtl"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:border-yellow-500/50 focus:outline-none" />
            </motion.div>
          )}
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="البريد الإلكتروني" type="email" dir="ltr"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:border-yellow-500/50 focus:outline-none" />
          <div className="relative">
            <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="كلمة المرور" type={showPassword ? 'text' : 'password'} dir="ltr"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder:text-white/30 focus:border-yellow-500/50 focus:outline-none" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 text-lg">
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mt-3 text-center">
              <span className="text-red-400 text-sm">⚠️ {error}</span>
            </motion.div>
          )}
        </AnimatePresence>
        <GlowButton onClick={handleSubmit} disabled={loading} className="w-full mt-4">
          {loading ? '⏳ جارٍ المعالجة...' : tab === 'login' ? '🔑 تسجيل الدخول' : '✨ إنشاء حساب'}
        </GlowButton>
        <div className="mt-4">
          <div className="text-center text-white/20 text-xs mb-3">— أو —</div>
          <button onClick={handleGuestLogin} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/60 hover:bg-white/10 transition-all flex items-center justify-center gap-2">
            <span className="text-lg">🎮</span><span className="text-sm">دخول كزائر</span>
          </button>
        </div>
        <p className="text-white/20 text-xs text-center mt-6">بتسجيلك، تحصل على 150 عملة + 8 جواهر مجاناً! 🎁</p>
      </div>
    </motion.div>
  );
}

// ===== Main Menu =====
function MainMenu() {
  const { setScreen, playerName, playerAvatar, totalScore, gamesPlayed, currentStreak, bestStreak, dailyCompleted, isAdmin, playerCoins, playerGems, announcements } = useGameStore();
  const [dailyBonusPopup, setDailyBonusPopup] = useState<{ show: boolean; bonus: number }>({ show: false, bonus: 0 });
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState<Set<string>>(new Set());
  const today = new Date().toLocaleDateString('ar');

  // Check daily bonus on mount
  useEffect(() => {
    const result = useAuthStore.getState().claimDailyBonus();
    if (result.claimed) {
      // Sync bonus coins to game-store
      useGameStore.setState({ playerCoins: useAuthStore.getState().currentUser?.coins ?? playerCoins });
      // Record wallet transaction
      useWalletStore.getState().addTransaction({ type: 'bonus', amount: result.bonus, currency: 'coins', description: `مكافأة تسجيل الدخول اليومي${result.bonus > 30 ? ' (سلسلة!)' : ''}` });
      // Use microtask to avoid synchronous setState in effect
      queueMicrotask(() => setDailyBonusPopup({ show: true, bonus: result.bonus }));
    }
  }, []);

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
      {/* Daily Bonus Popup */}
      <AnimatePresence>
        {dailyBonusPopup.show && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setDailyBonusPopup({ show: false, bonus: 0 })}>
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-gradient-to-br from-yellow-500/20 to-amber-600/20 border border-yellow-500/30 rounded-3xl p-6 max-w-sm w-full text-center">
              <motion.div animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }} transition={{ duration: 1, repeat: 2 }} className="text-6xl mb-3">🎁</motion.div>
              <h3 className="text-yellow-400 font-extrabold text-xl mb-2">مكافأة اليوم!</h3>
              <div className="bg-yellow-500/10 rounded-2xl p-4 mb-4">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-3xl">🪙</span>
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.3 }} className="text-3xl font-extrabold text-yellow-400">+{dailyBonusPopup.bonus}</motion.span>
                </div>
                {dailyBonusPopup.bonus > 30 && <div className="text-yellow-400/60 text-xs mt-1">🔥 مكافأة السلسلة المتتالية!</div>}
              </div>
              <GlowButton onClick={() => setDailyBonusPopup({ show: false, bonus: 0 })} className="w-full">🎉 شكراً!</GlowButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Announcements */}
      {announcements.filter(a => a.isActive && !dismissedAnnouncements.has(a.id)).length > 0 && (
        <div className="space-y-2 mb-4">
          {announcements.filter(a => a.isActive && !dismissedAnnouncements.has(a.id)).map(ann => (
            <motion.div key={ann.id} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl p-3 border relative ${
                ann.type === 'warning' ? 'bg-orange-500/10 border-orange-500/30' :
                ann.type === 'reward' ? 'bg-emerald-500/10 border-emerald-500/30' :
                'bg-blue-500/10 border-blue-500/30'
              }`}>
              <button onClick={() => setDismissedAnnouncements(prev => new Set(prev).add(ann.id))}
                className="absolute top-2 left-2 text-white/30 hover:text-white/60 text-xs">✕</button>
              <div className="flex items-start gap-2 pr-4">
                <span className="text-lg mt-0.5">{ann.type === 'info' ? 'ℹ️' : ann.type === 'warning' ? '⚠️' : '🎁'}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-bold text-xs">{ann.title}</div>
                  <div className="text-white/50 text-[10px] mt-0.5">{ann.message}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

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
  const { score, correctCount, questions, maxCombo, playerCoins, playerLevel, setScreen, resetGame, playerGems, adminSettings } = useGameStore();
  const totalQuestions = questions.length;
  const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const coinsEarned = Math.round(score * 0.1) + correctCount * adminSettings.coinRewardPerGame;
  const gemsEarned = correctCount === totalQuestions ? adminSettings.gemRewardPerfect : 0;
  const xpEarned = Math.round(score * 0.5 * adminSettings.xpMultiplier);

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
  const APK_DOWNLOAD_URL = 'https://github.com/yayass3r/quiz-champion-game/releases/latest/download/app-debug.apk';
  const REPO_URL = 'https://github.com/yayass3r/quiz-champion-game';

  const handleDownloadAPK = async () => {
    try {
      const response = await fetch(APK_DOWNLOAD_URL, { method: 'HEAD' });
      if (response.ok) {
        window.open(APK_DOWNLOAD_URL, '_blank');
      } else {
        window.open(`${REPO_URL}/releases`, '_blank');
      }
    } catch {
      window.open(`${REPO_URL}/releases`, '_blank');
    }
  };

  const handleShareApp = async () => {
    const shareData = {
      title: 'بطل الأسئلة',
      text: 'جرب لعبة بطل الأسئلة! تتحدى عقلك وتتنافس مع الآخرين 🏆',
      url: REPO_URL,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch { /* user cancelled */ }
    } else {
      try { await navigator.clipboard.writeText(REPO_URL); alert('تم نسخ الرابط!'); } catch { /* fallback */ }
    }
  };

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

      {/* Download APK Section */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="mt-6 bg-gradient-to-r from-emerald-500/10 to-teal-600/10 border border-emerald-500/20 rounded-2xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">📱</span>
          <div>
            <div className="text-white font-bold text-sm">تحميل التطبيق (APK)</div>
            <div className="text-white/40 text-xs">آخر إصدار من GitHub</div>
          </div>
        </div>
        <GlowButton onClick={handleDownloadAPK} className="w-full text-sm py-2">
          ⬇️ تحميل APK الآن
        </GlowButton>
        <p className="text-white/20 text-[10px] text-center mt-2">
          يتطلب تفعيل التثبيت من مصادر خارجية
        </p>
      </motion.div>

      <div className="mt-4 space-y-3">
        <a href="https://play.google.com/store/apps/details?id=com.quizchampion.game" target="_blank" rel="noopener noreferrer"
          className="w-full flex items-center gap-3 p-4 bg-white/5 rounded-xl text-white/60 hover:text-white transition-all">
          <span>⭐</span><span className="text-sm">قيّم التطبيق</span>
        </a>
        <button onClick={handleShareApp} className="w-full flex items-center gap-3 p-4 bg-white/5 rounded-xl text-white/60 hover:text-white transition-all"><span>📤</span><span className="text-sm">شارك التطبيق</span></button>
        <button onClick={() => setScreen('privacy')} className="w-full flex items-center gap-3 p-4 bg-white/5 rounded-xl text-white/60 hover:text-white transition-all"><span>📜</span><span className="text-sm">سياسة الخصوصية</span></button>
        <a href={REPO_URL} target="_blank" rel="noopener noreferrer"
          className="w-full flex items-center gap-3 p-4 bg-white/5 rounded-xl text-white/60 hover:text-white transition-all">
          <span>ℹ️</span><span className="text-sm">حول التطبيق</span>
        </a>
      </div>
      <div className="mt-4 text-center">
        <p className="text-white/20 text-[10px]">بطل الأسئلة - الإصدار 3.5.0</p>
        <p className="text-white/15 text-[10px]">com.quizchampion.game</p>
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
  const [purchasing, setPurchasing] = useState(false);
  const [iapAvailable, setIapAvailable] = useState(false);
  const [iapLoading, setIapLoading] = useState(true);
  const [localizedPrices, setLocalizedPrices] = useState<Record<string, string>>({});
  const [purchaseStatus, setPurchaseStatus] = useState<{show: boolean; success: boolean; message: string}>({show: false, success: false, message: ''});

  useEffect(() => {
    const initIAP = async () => {
      setIapLoading(true);
      const available = await huaweiIAP.init();
      setIapAvailable(available);

      if (available) {
        // Load localized prices from Huawei IAP
        const prices: Record<string, string> = {};
        Object.keys(IAP_PRODUCT_MAP).forEach(pkgId => {
          prices[pkgId] = huaweiIAP.getLocalizedPrice(pkgId);
        });
        setLocalizedPrices(prices);

        // Handle any pending purchases from previous sessions
        const pending = await huaweiIAP.handlePendingPurchases();
        if (pending.coins > 0 || pending.gems > 0) {
          updateUserCoins(pending.coins);
          updateUserGems(pending.gems);
          const wallet = useWalletStore.getState();
          if (pending.coins > 0) wallet.addTransaction({ type: 'purchase', amount: pending.coins, currency: 'coins', description: 'استرداد مشتريات معلقة - متجر هواوي' });
          if (pending.gems > 0) wallet.addTransaction({ type: 'reward', amount: pending.gems, currency: 'gems', description: 'استرداد مشتريات معلقة - متجر هواوي' });
        }
      }
      setIapLoading(false);
    };
    initIAP();
  }, []);

  const defaultPackages: PackageData[] = packages.length > 0 ? packages : [
    { id: '1', name: 'باقة المبتدئ', description: 'بداية رائعة لمغامرتك!', icon: '🎒', coins: 500, gems: 0, price: 4.99, color: 'from-emerald-500 to-teal-600', isActive: true },
    { id: '2', name: 'باقة المغامر', description: 'المزيد من العملات!', icon: '⚔️', coins: 1500, gems: 5, price: 9.99, color: 'from-yellow-500 to-amber-600', isActive: true },
    { id: '3', name: 'باقة البطل', description: 'أسلحة قوية للبطل!', icon: '🛡️', coins: 3500, gems: 15, price: 19.99, color: 'from-purple-500 to-violet-600', isActive: true },
    { id: '4', name: 'باقة الأسطورة', description: 'أقوى باقة للمحترفين!', icon: '👑', coins: 8000, gems: 40, price: 39.99, color: 'from-red-500 to-rose-600', isActive: true },
  ];

  const getPriceDisplay = (pkg: PackageData): string => {
    if (iapAvailable && localizedPrices[pkg.id]) {
      return localizedPrices[pkg.id];
    }
    return `${pkg.price} ر.س`;
  };

  const handleBuy = (pkg: PackageData) => { setSelectedPkg(pkg); setShowConfirm(true); };
  
  const confirmBuy = async () => {
    if (!selectedPkg) return;
    setPurchasing(true);

    try {
      if (iapAvailable) {
        const result = await huaweiIAP.purchase(selectedPkg.id);
        if (result.success) {
          updateUserCoins(selectedPkg.coins);
          updateUserGems(selectedPkg.gems);
          // Consume the purchase to allow repurchasing (consumable items)
          if (result.purchaseToken) {
            await huaweiIAP.consumePurchase(result.purchaseToken);
          }
          setPurchaseStatus({show: true, success: true, message: `تم شحن ${selectedPkg.coins} عملة${selectedPkg.gems > 0 ? ` و ${selectedPkg.gems} جوهرة` : ''} بنجاح!`});
          const wallet = useWalletStore.getState();
          wallet.addTransaction({ type: 'purchase', amount: selectedPkg.coins, currency: 'coins', description: `شراء ${selectedPkg.name} - متجر هواوي` });
          if (selectedPkg.gems > 0) {
            wallet.addTransaction({ type: 'purchase', amount: selectedPkg.gems, currency: 'gems', description: `شراء ${selectedPkg.name} - متجر هواوي` });
          }
        } else {
          setPurchaseStatus({show: true, success: false, message: 'فشل عملية الشراء. يرجى المحاولة مرة أخرى.'});
        }
      } else {
        // Demo mode - direct credit without payment
        updateUserCoins(selectedPkg.coins);
        updateUserGems(selectedPkg.gems);
        setPurchaseStatus({show: true, success: true, message: `تم شحن ${selectedPkg.coins} عملة${selectedPkg.gems > 0 ? ` و ${selectedPkg.gems} جوهرة` : ''}! (وضع تجريبي)`});
        const wallet = useWalletStore.getState();
        wallet.addTransaction({ type: 'earn', amount: selectedPkg.coins, currency: 'coins', description: `شحن تجريبي - ${selectedPkg.name}` });
      }
    } catch (error: any) {
      const errorMsg = error?.message || 'حدث خطأ أثناء الشراء';
      setPurchaseStatus({show: true, success: false, message: errorMsg});
    }

    setPurchasing(false);
    setShowConfirm(false);
    setSelectedPkg(null);
  };

  const handleRestorePurchases = async () => {
    if (!iapAvailable) return;
    try {
      const purchases = await huaweiIAP.restorePurchases();
      if (purchases.length > 0) {
        let totalCoins = 0;
        let totalGems = 0;
        for (const purchase of purchases) {
          const pkgEntry = Object.entries(IAP_PRODUCT_MAP).find(([_, info]) => info.productId === purchase.productId);
          if (pkgEntry) {
            totalCoins += pkgEntry[1].coins;
            totalGems += pkgEntry[1].gems;
            if (purchase.purchaseToken) {
              await huaweiIAP.consumePurchase(purchase.purchaseToken);
            }
          }
        }
        if (totalCoins > 0 || totalGems > 0) {
          updateUserCoins(totalCoins);
          updateUserGems(totalGems);
          setPurchaseStatus({show: true, success: true, message: `تم استرداد ${totalCoins} عملة${totalGems > 0 ? ` و ${totalGems} جوهرة` : ''}!`});
        } else {
          setPurchaseStatus({show: true, success: true, message: 'لا توجد مشتريات لاستردادها'});
        }
      } else {
        setPurchaseStatus({show: true, success: true, message: 'لا توجد مشتريات سابقة'});
      }
    } catch {
      setPurchaseStatus({show: true, success: false, message: 'فشل استرداد المشتريات'});
    }
  };

  return (
    <motion.div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 p-4" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="flex items-center gap-3 mb-4">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setScreen('menu')} className="text-white/60 hover:text-white text-2xl">→</motion.button>
        <h2 className="text-xl font-bold text-white">📦 باقات الشحن</h2>
      </div>

      {/* IAP Status Banner */}
      {iapLoading ? (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-2 mb-4 text-center">
          <span className="text-xs text-blue-400">⏳ جارٍ الاتصال بمتجر هواوي...</span>
        </div>
      ) : iapAvailable ? (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2 mb-4 text-center">
          <span className="text-xs text-emerald-400">Huawei AppGallery ✅ الشراء الآمن متاح</span>
        </div>
      ) : (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-2 mb-4 text-center">
          <span className="text-xs text-yellow-400">⚠️ وضع تجريبي - المتجر غير متاح على هذا الجهاز</span>
        </div>
      )}

      <div className="space-y-4">
        {defaultPackages.filter(p => p.isActive).map((pkg, i) => (
          <motion.div key={pkg.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className={`bg-gradient-to-r ${pkg.color} rounded-2xl p-5 relative overflow-hidden`}>
            {i === 0 && <div className="absolute top-2 right-2 bg-white/20 rounded-full px-2 py-0.5 text-[10px] text-white font-bold">الأكثر طلباً</div>}
            {i === 3 && <div className="absolute top-2 right-2 bg-yellow-400 rounded-full px-2 py-0.5 text-[10px] text-black font-bold">أفضل قيمة</div>}
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
              <GlowButton onClick={() => handleBuy(pkg)} className="text-sm px-4 py-2">{getPriceDisplay(pkg)}</GlowButton>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Restore Purchases Button */}
      {iapAvailable && (
        <div className="mt-4">
          <button onClick={handleRestorePurchases}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/60 hover:bg-white/10 transition-all flex items-center justify-center gap-2">
            <span className="text-sm">🔄</span><span className="text-sm">استرداد المشتريات السابقة</span>
          </button>
        </div>
      )}

      {showConfirm && selectedPkg && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="bg-gray-900 rounded-2xl p-6 max-w-sm w-full text-center border border-white/10">
            <span className="text-5xl">{selectedPkg.icon}</span>
            <h3 className="text-white font-bold text-lg mt-3">{selectedPkg.name}</h3>
            <p className="text-white/50 text-sm mt-1">سيتم شحن {selectedPkg.coins} عملة{selectedPkg.gems > 0 ? ` و ${selectedPkg.gems} جوهرة` : ''}</p>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-2 mt-3">
              <span className="text-yellow-400 text-xs">{iapAvailable ? '💳 الدفع الآمن عبر متجر هواوي AppGallery' : '🎮 شحن تجريبي مباشر'}</span>
            </div>
            <div className="flex gap-3 mt-4">
              <GlowButton onClick={confirmBuy} disabled={purchasing} className="flex-1">
                {purchasing ? 'جارٍ الشراء...' : 'تأكيد الشراء'}
              </GlowButton>
              <GlowButton onClick={() => setShowConfirm(false)} variant="outline" className="flex-1">إلغاء</GlowButton>
            </div>
          </motion.div>
        </motion.div>
      )}
      <AnimatePresence>
        {purchaseStatus.show && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setPurchaseStatus({show: false, success: false, message: ''})}>
            <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }}
              onClick={e => e.stopPropagation()}
              className={`rounded-2xl p-6 max-w-sm w-full text-center border ${
                purchaseStatus.success ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'
              }`}>
              <span className="text-5xl block mb-3">{purchaseStatus.success ? '🎉' : '😔'}</span>
              <h3 className={`font-bold text-lg ${purchaseStatus.success ? 'text-emerald-400' : 'text-red-400'}`}>
                {purchaseStatus.success ? 'تم الشراء بنجاح!' : 'فشل الشراء'}
              </h3>
              <p className="text-white/50 text-sm mt-2">{purchaseStatus.message}</p>
              <GlowButton onClick={() => setPurchaseStatus({show: false, success: false, message: ''})} className="mt-4">حسناً</GlowButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
  const { setScreen, isAdmin, packages, adConfigs, announcements, adminSettings,
    togglePackageActive, toggleAdEnabled, addPackage, removePackage, updatePackage,
    addAnnouncement, removeAnnouncement, toggleAnnouncement, updateAdminSettings,
    gamesPlayed, totalScore, playerCoins, playerGems, customQuestions,
    addCustomQuestion, removeCustomQuestion } = useGameStore();
  const authStore = useAuthStore;
  const walletStore = useWalletStore();
  const [tab, setTab] = useState<'stats' | 'users' | 'packages' | 'ads' | 'questions' | 'transactions' | 'settings' | 'bulk'>('stats');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [, forceUpdate] = useState(0);

  // User management states
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [editUserModal, setEditUserModal] = useState(false);
  const [banModal, setBanModal] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [userDetailModal, setUserDetailModal] = useState(false);

  // Package creation states
  const [showAddPackage, setShowAddPackage] = useState(false);
  const [newPkg, setNewPkg] = useState({ name: '', description: '', icon: '📦', coins: 0, gems: 0, price: 0, color: 'from-yellow-500 to-amber-600' });

  // Announcement states
  const [showAddAnnouncement, setShowAddAnnouncement] = useState(false);
  const [newAnn, setNewAnn] = useState({ title: '', message: '', type: 'info' as const });

  // Edit user form
  const [editForm, setEditForm] = useState({ name: '', email: '', coins: 0, gems: 0, level: 1, role: 'user' as 'user' | 'admin' });

  // Reset password states
  const [resetPwModal, setResetPwModal] = useState(false);
  const [resetPwUserId, setResetPwUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');

  // Question management states
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [newQ, setNewQ] = useState({ text: '', option1: '', option2: '', option3: '', option4: '', correctIndex: 0, category: 'science' as QuestionCategory, difficulty: 'easy' as 'easy' | 'medium' | 'hard' | 'expert', hint: '', funFact: '', points: 100, timeLimit: 20 });

  // Bulk operations states
  const [bulkBonusAmount, setBulkBonusAmount] = useState(50);
  const [bulkBonusCurrency, setBulkBonusCurrency] = useState<'coins' | 'gems'>('coins');

  // Import ref
  const importFileRef = useRef<HTMLInputElement>(null);

  if (!isAdmin) { setScreen('menu'); return null; }

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const allUsers = authStore.getState().getAllUsersIncludingAdmin();
  const filteredUsers = userSearch.trim()
    ? allUsers.filter(u => u.name.includes(userSearch) || u.email.includes(userSearch))
    : allUsers;

  const selectedUser = selectedUserId ? allUsers.find(u => u.id === selectedUserId) : null;

  const totalCoinsInSystem = allUsers.reduce((sum, u) => sum + u.coins, 0);
  const totalGemsInSystem = allUsers.reduce((sum, u) => sum + u.gems, 0);
  const bannedCount = allUsers.filter(u => u.banned).length;
  const allTransactions = walletStore.getState().transactions;
  const allQuestionsList = [...defaultQuestions, ...customQuestions];

  const defaultAds: AdConfig[] = adConfigs.length > 0 ? adConfigs : [
    { adType: 'banner', isEnabled: false, frequency: 1, position: 'bottom' },
    { adType: 'interstitial', isEnabled: false, frequency: 3, position: 'between' },
    { adType: 'rewarded', isEnabled: false, frequency: 5, position: 'bottom' },
  ];

  const handleAddPackage = () => {
    if (!newPkg.name || newPkg.coins <= 0) { showToast('يرجى ملء الحقول المطلوبة', 'error'); return; }
    addPackage({
      id: `pkg-${Date.now()}`,
      name: newPkg.name,
      description: newPkg.description || newPkg.name,
      icon: newPkg.icon,
      coins: newPkg.coins,
      gems: newPkg.gems,
      price: newPkg.price,
      color: newPkg.color,
      isActive: true,
    });
    setShowAddPackage(false);
    setNewPkg({ name: '', description: '', icon: '📦', coins: 0, gems: 0, price: 0, color: 'from-yellow-500 to-amber-600' });
    showToast('تمت إضافة الباقة بنجاح');
  };

  const handleAddAnnouncement = () => {
    if (!newAnn.title || !newAnn.message) { showToast('يرجى ملء العنوان والرسالة', 'error'); return; }
    addAnnouncement({ ...newAnn, isActive: true });
    setShowAddAnnouncement(false);
    setNewAnn({ title: '', message: '', type: 'info' });
    showToast('تمت إضافة الإعلان بنجاح');
  };

  const handleBanUser = () => {
    if (!selectedUserId || !banReason.trim()) { showToast('يرجى إدخال سبب الحظر', 'error'); return; }
    const result = authStore.getState().banUser(selectedUserId, banReason);
    if (result.success) { showToast('تم حظر المستخدم'); setBanModal(false); setBanReason(''); forceUpdate(n => n + 1); }
    else { showToast(result.error || 'فشل الحظر', 'error'); }
  };

  const handleEditUser = () => {
    if (!selectedUserId) return;
    authStore.getState().updateUserById(selectedUserId, {
      name: editForm.name,
      email: editForm.email,
      coins: editForm.coins,
      gems: editForm.gems,
      level: editForm.level,
      role: editForm.role,
    });
    setEditUserModal(false);
    showToast('تم تحديث بيانات المستخدم');
    forceUpdate(n => n + 1);
  };

  const handleDeleteUser = (userId: string) => {
    const result = authStore.getState().deleteUser(userId);
    if (result.success) { showToast('تم حذف المستخدم'); setSelectedUserId(null); forceUpdate(n => n + 1); }
    else { showToast(result.error || 'فشل الحذف', 'error'); }
  };

  const openEditModal = (user: typeof allUsers[0]) => {
    setEditForm({ name: user.name, email: user.email, coins: user.coins, gems: user.gems, level: user.level, role: user.role as 'user' | 'admin' });
    setEditUserModal(true);
  };

  const handleAddQuestion = () => {
    if (!newQ.text || !newQ.option1 || !newQ.option2 || !newQ.option3 || !newQ.option4) { showToast('يرجى ملء السؤال وجميع الخيارات', 'error'); return; }
    addCustomQuestion({
      id: `cq-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: newQ.text,
      options: [newQ.option1, newQ.option2, newQ.option3, newQ.option4],
      correctIndex: newQ.correctIndex,
      category: newQ.category,
      difficulty: newQ.difficulty,
      hint: newQ.hint || 'لا يوجد تلميح',
      funFact: newQ.funFact || '',
      points: newQ.points,
      timeLimit: newQ.timeLimit,
      isUserSubmitted: true,
      qualityScore: 100,
    });
    setShowAddQuestion(false);
    setNewQ({ text: '', option1: '', option2: '', option3: '', option4: '', correctIndex: 0, category: 'science', difficulty: 'easy', hint: '', funFact: '', points: 100, timeLimit: 20 });
    showToast('تمت إضافة السؤال بنجاح');
  };

  const handleBulkBonus = () => {
    const users = allUsers.filter(u => u.role !== 'admin' && !u.banned);
    users.forEach(u => {
      if (bulkBonusCurrency === 'coins') {
        authStore.getState().updateUserById(u.id, { coins: u.coins + bulkBonusAmount });
      } else {
        authStore.getState().updateUserById(u.id, { gems: u.gems + bulkBonusAmount });
      }
    });
    walletStore.getState().addTransaction({ type: 'bonus', amount: bulkBonusAmount, currency: bulkBonusCurrency, description: `مكافأة جماعية من المسؤول: ${bulkBonusAmount} ${bulkBonusCurrency === 'coins' ? 'عملة' : 'جوهرة'} لكل مستخدم` });
    showToast(`تم إرسال ${bulkBonusAmount} ${bulkBonusCurrency === 'coins' ? 'عملة' : 'جوهرة'} إلى ${users.length} مستخدم`);
    forceUpdate(n => n + 1);
  };

  const handleExportData = (type: 'users' | 'transactions') => {
    let data: object[];
    let filename: string;
    if (type === 'users') {
      data = allUsers.map(u => ({ id: u.id, name: u.name, email: u.email, coins: u.coins, gems: u.gems, level: u.level, role: u.role, banned: u.banned, createdAt: u.createdAt }));
      filename = 'quiz-champion-users.json';
    } else {
      data = allTransactions;
      filename = 'quiz-champion-transactions.json';
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
    showToast('تم تصدير البيانات بنجاح');
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (Array.isArray(data)) {
          // Detect data type from first item
          const first = data[0];
          if (first && first.email && first.name) {
            // Users import - merge: add users that don't exist by email
            let addedCount = 0;
            let skippedCount = 0;
            const existingEmails = new Set(allUsers.map(u => u.email.toLowerCase()));
            data.forEach((u: any) => {
              if (u.email && !existingEmails.has(u.email.toLowerCase())) {
                authStore.setState(prev => ({
                  users: [...prev.users, {
                    id: u.id || `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    email: u.email.toLowerCase(),
                    name: u.name || 'مستخدم',
                    password: u.password || '',
                    avatar: u.avatar || '🦁',
                    role: u.role || 'user',
                    level: u.level || 1,
                    coins: u.coins || 0,
                    gems: u.gems || 0,
                    provider: u.provider || 'email',
                    createdAt: u.createdAt || new Date().toISOString(),
                  }],
                }));
                addedCount++;
              } else {
                skippedCount++;
              }
            });
            showToast(`تم استيراد ${addedCount} مستخدم (${skippedCount} موجود مسبقاً)`);
            forceUpdate(n => n + 1);
          } else if (first && first.text && first.options && first.correctIndex !== undefined) {
            // Questions import - merge with existing custom questions
            let addedCount = 0;
            data.forEach((q: any) => {
              const exists = customQuestions.some((cq: any) => cq.text === q.text);
              if (!exists) {
                addCustomQuestion({
                  id: q.id || `cq-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  text: q.text,
                  options: q.options,
                  correctIndex: q.correctIndex,
                  category: q.category || 'science',
                  difficulty: q.difficulty || 'easy',
                  hint: q.hint || 'لا يوجد تلميح',
                  funFact: q.funFact || '',
                  points: q.points || 100,
                  timeLimit: q.timeLimit || 20,
                  isUserSubmitted: true,
                  qualityScore: 100,
                });
                addedCount++;
              }
            });
            showToast(`تم استيراد ${addedCount} سؤال جديد`);
          } else {
            showToast('صيغة الملف غير معروفة', 'error');
          }
        } else {
          showToast('الملف لا يحتوي على مصفوفة بيانات صالحة', 'error');
        }
      } catch {
        showToast('خطأ في قراءة الملف - تأكد من صيغة JSON', 'error');
      }
    };
    reader.readAsText(file);
    // Reset the file input so the same file can be selected again
    event.target.value = '';
  };

  const tabItems = [
    { id: 'stats' as const, icon: '📊', label: 'الإحصائيات' },
    { id: 'users' as const, icon: '👥', label: 'المستخدمين' },
    { id: 'questions' as const, icon: '❓', label: 'الأسئلة' },
    { id: 'packages' as const, icon: '📦', label: 'الباقات' },
    { id: 'ads' as const, icon: '📢', label: 'الإعلانات' },
    { id: 'transactions' as const, icon: '💰', label: 'المعاملات' },
    { id: 'bulk' as const, icon: '🚀', label: 'عمليات جماعية' },
    { id: 'settings' as const, icon: '⚙️', label: 'الإعدادات' },
  ];

  const pkgIcons = ['📦', '🎁', '🏆', '💎', '⭐', '🎯', '🎪', '🌟'];
  const pkgColors = [
    'from-yellow-500 to-amber-600', 'from-emerald-500 to-teal-600', 'from-purple-500 to-violet-600',
    'from-blue-500 to-cyan-600', 'from-red-500 to-rose-600', 'from-pink-500 to-fuchsia-600',
    'from-cyan-500 to-blue-600', 'from-orange-500 to-red-600',
  ];

  return (
    <motion.div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 p-4 pb-8" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setScreen('menu')} className="text-white/60 hover:text-white text-2xl">→</motion.button>
        <h2 className="text-xl font-bold text-white">👑 لوحة التحكم</h2>
        <div className="flex-1" />
        <button onClick={() => { handleExportData('users'); }} className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-1 rounded-lg">📥 تصدير</button>
        <button onClick={() => importFileRef.current?.click()} className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-lg">📤 استيراد</button>
        <input ref={importFileRef} type="file" accept=".json" className="hidden" onChange={handleImportData} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
        {tabItems.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-2.5 py-2 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all flex items-center gap-1 ${tab === t.id ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-white/5 text-white/40'}`}>
            <span>{t.icon}</span><span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* ===== Stats Tab ===== */}
      {tab === 'stats' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: '👥', value: allUsers.length, label: 'إجمالي المستخدمين', color: 'from-blue-500/20 to-cyan-500/20' },
              { icon: '🎮', value: gamesPlayed, label: 'الألعاب المُلعبة', color: 'from-emerald-500/20 to-teal-500/20' },
              { icon: '🪙', value: totalCoinsInSystem.toLocaleString(), label: 'إجمالي العملات', color: 'from-yellow-500/20 to-amber-500/20' },
              { icon: '💎', value: totalGemsInSystem.toLocaleString(), label: 'إجمالي الجواهر', color: 'from-purple-500/20 to-violet-500/20' },
              { icon: '🚫', value: bannedCount, label: 'محظورين', color: 'from-red-500/20 to-rose-500/20' },
              { icon: '📦', value: packages.filter(p => p.isActive).length, label: 'باقات نشطة', color: 'from-orange-500/20 to-amber-500/20' },
              { icon: '❓', value: allQuestionsList.length, label: 'إجمالي الأسئلة', color: 'from-indigo-500/20 to-blue-500/20' },
              { icon: '📢', value: announcements.filter(a => a.isActive).length, label: 'إعلانات نشطة', color: 'from-cyan-500/20 to-blue-500/20' },
            ].map(stat => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`bg-gradient-to-br ${stat.color} border border-white/5 rounded-2xl p-4 text-center`}>
                <span className="text-2xl">{stat.icon}</span>
                <div className="text-white font-bold text-lg mt-1">{stat.value}</div>
                <div className="text-white/40 text-[10px]">{stat.label}</div>
              </motion.div>
            ))}
          </div>
          {/* Quick Stats Bar */}
          <div className="bg-gradient-to-r from-yellow-500/10 to-amber-600/10 border border-yellow-500/20 rounded-2xl p-4">
            <div className="text-yellow-400/70 text-xs font-bold mb-2">📈 ملخص سريع</div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div><div className="text-white font-bold text-sm">{allUsers.filter(u => u.provider !== 'guest').length}</div><div className="text-white/30 text-[9px]">حسابات مسجلة</div></div>
              <div><div className="text-white font-bold text-sm">{allUsers.filter(u => u.provider === 'guest').length}</div><div className="text-white/30 text-[9px]">زوار</div></div>
              <div><div className="text-white font-bold text-sm">{customQuestions.length}</div><div className="text-white/30 text-[9px]">أسئلة مضافة</div></div>
            </div>
          </div>
          {/* Recent Activity */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="text-white/50 text-sm font-bold mb-3">🕐 آخر النشاطات</div>
            {allTransactions.length === 0 ? (
              <div className="text-white/30 text-sm text-center py-4">لا توجد نشاطات بعد</div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
                {allTransactions.slice(0, 10).map(tx => (
                  <div key={tx.id} className="flex items-center gap-2 bg-white/5 rounded-lg p-2 text-xs">
                    <span>{tx.type === 'earn' || tx.type === 'bonus' || tx.type === 'reward' ? '🟢' : tx.type === 'transfer_in' ? '📥' : tx.type === 'transfer_out' ? '📤' : '🔴'}</span>
                    <span className="text-white/70 flex-1 truncate">{tx.description}</span>
                    <span className="text-white/30 text-[10px]">{new Date(tx.timestamp).toLocaleDateString('ar')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== Users Tab ===== */}
      {tab === 'users' && (
        <div className="space-y-4">
          {/* Search */}
          <input value={userSearch} onChange={(e) => setUserSearch(e.target.value)} placeholder="🔍 ابحث عن مستخدم..." dir="rtl"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:border-yellow-500/50 focus:outline-none text-sm" />

          {/* Users List */}
          <div className="space-y-2 max-h-[60vh] overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
            {filteredUsers.length === 0 ? (
              <div className="text-white/30 text-sm text-center py-8">لا يوجد مستخدمون</div>
            ) : (
              filteredUsers.map(user => (
                <motion.div key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className={`bg-white/5 border rounded-xl p-3 ${user.banned ? 'border-red-500/30 bg-red-500/5' : selectedUserId === user.id ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-white/5'}`}>
                  <div className="flex items-center gap-3">
                    <button onClick={() => { setSelectedUserId(user.id); setUserDetailModal(true); }} className="w-10 h-10 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-lg border border-white/10">
                      {user.avatar}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold text-sm truncate">{user.name}</span>
                        {user.role === 'admin' && <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full">مسؤول</span>}
                        {user.banned && <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full">🚫 محظور</span>}
                      </div>
                      <div className="text-white/30 text-[10px] truncate">{user.email}</div>
                      <div className="flex items-center gap-3 mt-1 text-[10px]">
                        <span className="text-yellow-400">🪙 {user.coins}</span>
                        <span className="text-purple-400">💎 {user.gems}</span>
                        <span className="text-white/30">Lv.{user.level}</span>
                        <span className="text-white/20">{user.gamesPlayed || 0} لعبة</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button onClick={() => { setSelectedUserId(user.id); openEditModal(user); }}
                        className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-1 rounded-lg hover:bg-blue-500/30">✏️ تعديل</button>
                      {user.role !== 'admin' && (
                        <>
                          <button onClick={() => { setResetPwUserId(user.id); setNewPassword(''); setResetPwModal(true); }}
                            className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-1 rounded-lg hover:bg-amber-500/30">🔑 كلمة المرور</button>
                          {user.banned ? (
                            <button onClick={() => { authStore.getState().unbanUser(user.id); showToast('تم إلغاء الحظر'); forceUpdate(n => n + 1); }}
                              className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-lg hover:bg-emerald-500/30">✅ فك</button>
                          ) : (
                            <button onClick={() => { setSelectedUserId(user.id); setBanModal(true); }}
                              className="text-[10px] bg-red-500/20 text-red-400 px-2 py-1 rounded-lg hover:bg-red-500/30">🚫 حظر</button>
                          )}
                          <button onClick={() => handleDeleteUser(user.id)}
                            className="text-[10px] bg-red-500/20 text-red-400 px-2 py-1 rounded-lg hover:bg-red-500/30">🗑️ حذف</button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ===== Questions Tab ===== */}
      {tab === 'questions' && (
        <div className="space-y-4">
          {/* Question Stats */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="text-white/50 text-sm font-bold mb-3">📊 إحصائيات الأسئلة</div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <div className="text-white font-bold text-lg">{defaultQuestions.length}</div>
                <div className="text-white/30 text-[10px]">أساسية</div>
              </div>
              <div className="bg-yellow-500/10 rounded-xl p-3 text-center">
                <div className="text-yellow-400 font-bold text-lg">{customQuestions.length}</div>
                <div className="text-white/30 text-[10px]">مضافة</div>
              </div>
              <div className="bg-emerald-500/10 rounded-xl p-3 text-center">
                <div className="text-emerald-400 font-bold text-lg">{allQuestionsList.length}</div>
                <div className="text-white/30 text-[10px]">الإجمالي</div>
              </div>
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="text-white/50 text-sm font-bold mb-3">📚 توزيع التصنيفات</div>
            <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
              {Object.entries(categoryInfo).map(([key, info]) => {
                const count = allQuestionsList.filter(q => q.category === key).length;
                return (
                  <div key={key} className={`bg-gradient-to-br ${info.gradient} rounded-xl p-2 text-center relative`}>
                    <div className="text-sm">{info.icon}</div>
                    <div className="text-white text-[9px] font-bold">{info.name}</div>
                    <div className="text-white/50 text-[8px]">{count} سؤال</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Difficulty Distribution */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="text-white/50 text-sm font-bold mb-3">📈 توزيع الصعوبة</div>
            <div className="space-y-2">
              {(['easy', 'medium', 'hard', 'expert'] as const).map(d => {
                const count = allQuestionsList.filter(q => q.difficulty === d).length;
                const percent = allQuestionsList.length > 0 ? Math.round((count / allQuestionsList.length) * 100) : 0;
                const colors = { easy: 'bg-emerald-500', medium: 'bg-yellow-500', hard: 'bg-orange-500', expert: 'bg-red-500' };
                const labels = { easy: 'سهل', medium: 'متوسط', hard: 'صعب', expert: 'خبير' };
                return (
                  <div key={d} className="flex items-center gap-3">
                    <span className="text-white/50 text-xs w-12">{labels[d]}</span>
                    <div className="flex-1 bg-white/10 rounded-full h-3 overflow-hidden">
                      <div className={`${colors[d]} h-full rounded-full`} style={{ width: `${percent}%` }} />
                    </div>
                    <span className="text-white/40 text-[10px] w-16 text-left">{count} ({percent}%)</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom Questions List */}
          {customQuestions.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="text-white/50 text-sm font-bold mb-3">✍️ الأسئلة المضافة ({customQuestions.length})</div>
              <div className="space-y-2 max-h-48 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
                {customQuestions.map(q => (
                  <div key={q.id} className="bg-white/5 rounded-xl p-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-white/80 text-xs font-medium truncate">{q.text}</div>
                      <div className="flex items-center gap-2 mt-1 text-[10px]">
                        <span>{categoryInfo[q.category]?.icon} {categoryInfo[q.category]?.name}</span>
                        <span className="text-white/20">•</span>
                        <span className={q.difficulty === 'easy' ? 'text-emerald-400' : q.difficulty === 'medium' ? 'text-yellow-400' : q.difficulty === 'hard' ? 'text-orange-400' : 'text-red-400'}>{q.difficulty === 'easy' ? 'سهل' : q.difficulty === 'medium' ? 'متوسط' : q.difficulty === 'hard' ? 'صعب' : 'خبير'}</span>
                        <span className="text-white/20">•</span>
                        <span className="text-yellow-400">{q.points} نقطة</span>
                      </div>
                    </div>
                    <button onClick={() => { removeCustomQuestion(q.id); showToast('تم حذف السؤال'); }}
                      className="text-[10px] bg-red-500/20 text-red-400 px-2 py-1 rounded-lg">🗑️</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <GlowButton onClick={() => setShowAddQuestion(true)} className="w-full text-sm">➕ إضافة سؤال جديد</GlowButton>
        </div>
      )}

      {/* ===== Packages Tab ===== */}
      {tab === 'packages' && (
        <div className="space-y-4">
          <GlowButton onClick={() => setShowAddPackage(true)} className="w-full text-sm">➕ إضافة باقة جديدة</GlowButton>
          {packages.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-4xl block mb-3">📦</span>
              <p className="text-white/30 text-sm">لا توجد باقات. أضف باقة جديدة!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {packages.map(pkg => (
                <div key={pkg.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{pkg.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-bold text-sm">{pkg.name}</div>
                      <div className="text-white/40 text-xs">🪙 {pkg.coins} • 💎 {pkg.gems} • {pkg.price} ر.س</div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button onClick={() => togglePackageActive(pkg.id)}
                        className={`text-[10px] px-2 py-1 rounded-lg font-bold ${pkg.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                        {pkg.isActive ? '✅ معروضة' : '❌ مخفية'}
                      </button>
                      <button onClick={() => removePackage(pkg.id)}
                        className="text-[10px] bg-red-500/20 text-red-400 px-2 py-1 rounded-lg">🗑️ حذف</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== Ads Tab ===== */}
      {tab === 'ads' && (
        <div className="space-y-4">
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
          </div>

          {/* Announcements Section */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-white/50 text-sm font-bold">📢 إعلانات النظام</div>
              <button onClick={() => setShowAddAnnouncement(true)}
                className="text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-lg hover:bg-yellow-500/30">➕ إضافة</button>
            </div>
            {announcements.length === 0 ? (
              <div className="text-white/30 text-sm text-center py-4">لا توجد إعلانات</div>
            ) : (
              <div className="space-y-2">
                {announcements.map(ann => (
                  <div key={ann.id} className={`p-3 rounded-xl border ${ann.isActive ? 'bg-white/5 border-white/10' : 'bg-white/2 border-white/5 opacity-50'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span>{ann.type === 'info' ? 'ℹ️' : ann.type === 'warning' ? '⚠️' : '🎁'}</span>
                      <span className="text-white font-bold text-xs flex-1">{ann.title}</span>
                      <button onClick={() => toggleAnnouncement(ann.id)}
                        className={`text-[10px] px-1.5 py-0.5 rounded ${ann.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                        {ann.isActive ? '✅' : '❌'}
                      </button>
                      <button onClick={() => removeAnnouncement(ann.id)}
                        className="text-[10px] text-red-400 hover:text-red-300">🗑️</button>
                    </div>
                    <div className="text-white/40 text-[10px]">{ann.message}</div>
                    <div className="text-white/20 text-[9px] mt-1">{new Date(ann.createdAt).toLocaleDateString('ar')}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-center">
            <span className="text-yellow-400 text-xs">📢 الإعلانات النشطة تظهر لجميع المستخدمين في القائمة الرئيسية</span>
          </div>
        </div>
      )}

      {/* ===== Transactions Tab ===== */}
      {tab === 'transactions' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
              <div className="text-xs text-emerald-400/70 mb-1">إجمالي التحويلات</div>
              <div className="text-sm font-bold text-emerald-400">{allTransactions.filter(t => t.type === 'transfer_out').length}</div>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-center">
              <div className="text-xs text-yellow-400/70 mb-1">إجمالي المكافآت</div>
              <div className="text-sm font-bold text-yellow-400">{allTransactions.filter(t => t.type === 'bonus' || t.type === 'reward').length}</div>
            </div>
          </div>
          <button onClick={() => handleExportData('transactions')} className="w-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs rounded-xl p-2 text-center">📥 تصدير المعاملات (JSON)</button>
          {allTransactions.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-4xl block mb-3">📭</span>
              <p className="text-white/30 text-sm">لا توجد معاملات بعد</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[60vh] overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
              {allTransactions.slice(0, 50).map(tx => (
                <div key={tx.id} className="bg-white/5 rounded-xl p-3 flex items-center gap-3">
                  <div className="text-lg w-8 text-center">
                    {tx.type === 'earn' || tx.type === 'bonus' || tx.type === 'reward' ? '🟢' :
                     tx.type === 'transfer_in' ? '📥' : tx.type === 'transfer_out' ? '📤' : '🔴'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white/80 text-xs font-medium truncate">{tx.description}</div>
                    <div className="flex items-center gap-2 text-[10px] text-white/30">
                      <span>{new Date(tx.timestamp).toLocaleDateString('ar')} {new Date(tx.timestamp).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })}</span>
                      {tx.fromUserName && <span>من: {tx.fromUserName}</span>}
                      {tx.toUserName && <span>إلى: {tx.toUserName}</span>}
                    </div>
                  </div>
                  <div className="text-left flex-shrink-0">
                    <div className={`text-xs font-bold ${tx.type === 'earn' || tx.type === 'transfer_in' || tx.type === 'bonus' || tx.type === 'reward' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {tx.type === 'earn' || tx.type === 'transfer_in' || tx.type === 'bonus' || tx.type === 'reward' ? '+' : '-'}{tx.amount}
                    </div>
                    <div className="text-white/30 text-[10px]">{tx.currency === 'coins' ? '🪙' : '💎'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== Bulk Operations Tab ===== */}
      {tab === 'bulk' && (
        <div className="space-y-4">
          {/* Send Bonus to All Users */}
          <div className="bg-gradient-to-br from-yellow-500/10 to-amber-600/10 border border-yellow-500/20 rounded-2xl p-4">
            <div className="text-yellow-400 font-bold text-sm mb-3">🎁 إرسال مكافأة جماعية</div>
            <p className="text-white/40 text-xs mb-3">أرسل مكافأة لجميع المستخدمين النشطين (باستثناء المسؤولين والمحظورين)</p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-white/60 text-xs w-20">المبلغ:</span>
                <input value={bulkBonusAmount} onChange={(e) => setBulkBonusAmount(parseInt(e.target.value) || 0)} type="number" dir="ltr"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-center text-sm" />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-white/60 text-xs w-20">العملة:</span>
                <div className="flex gap-2 flex-1">
                  <button onClick={() => setBulkBonusCurrency('coins')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold ${bulkBonusCurrency === 'coins' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-white/5 text-white/40'}`}>
                    🪙 عملات
                  </button>
                  <button onClick={() => setBulkBonusCurrency('gems')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold ${bulkBonusCurrency === 'gems' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-white/5 text-white/40'}`}>
                    💎 جواهر
                  </button>
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-2 text-center text-white/30 text-[10px]">
                سيستلم {allUsers.filter(u => u.role !== 'admin' && !u.banned).length} مستخدم × {bulkBonusAmount} = {bulkBonusAmount * allUsers.filter(u => u.role !== 'admin' && !u.banned).length} {bulkBonusCurrency === 'coins' ? 'عملة' : 'جوهرة'}
              </div>
              <GlowButton onClick={handleBulkBonus} className="w-full text-sm">🚀 إرسال المكافأة</GlowButton>
            </div>
          </div>

          {/* Export Data */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="text-white/50 text-sm font-bold mb-3">📥 تصدير واستيراد البيانات</div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <button onClick={() => handleExportData('users')} className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-center hover:bg-blue-500/20 transition-all">
                <span className="text-2xl block mb-1">👥</span>
                <span className="text-blue-400 text-xs font-bold">تصدير المستخدمين</span>
              </button>
              <button onClick={() => handleExportData('transactions')} className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center hover:bg-emerald-500/20 transition-all">
                <span className="text-2xl block mb-1">💰</span>
                <span className="text-emerald-400 text-xs font-bold">تصدير المعاملات</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => importFileRef.current?.click()} className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-center hover:bg-amber-500/20 transition-all">
                <span className="text-2xl block mb-1">📤</span>
                <span className="text-amber-400 text-xs font-bold">استيراد مستخدمين/أسئلة</span>
              </button>
              <button onClick={() => {
                const questionsData = customQuestions;
                const blob = new Blob([JSON.stringify(questionsData, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = 'quiz-champion-questions.json'; a.click();
                URL.revokeObjectURL(url);
                showToast('تم تصدير الأسئلة بنجاح');
              }} className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 text-center hover:bg-purple-500/20 transition-all">
                <span className="text-2xl block mb-1">❓</span>
                <span className="text-purple-400 text-xs font-bold">تصدير الأسئلة</span>
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-4">
            <div className="text-red-400/70 text-sm font-bold mb-3">⚠️ منطقة الخطر</div>
            <div className="space-y-2">
              <GlowButton variant="danger" className="w-full text-sm"
                onClick={() => {
                  if (confirm('هل أنت متأكد من حذف جميع المعاملات؟ هذا الإجراء لا يمكن التراجع عنه!')) {
                    useWalletStore.setState({ transactions: [] });
                    showToast('تم حذف جميع المعاملات');
                  }
                }}>
                🗑️ مسح سجل المعاملات
              </GlowButton>
              <GlowButton variant="danger" className="w-full text-sm"
                onClick={() => {
                  if (confirm('هل أنت متأكد من حذف جميع الأسئلة المضافة؟')) {
                    customQuestions.forEach(q => removeCustomQuestion(q.id));
                    showToast('تم حذف جميع الأسئلة المضافة');
                  }
                }}>
                🗑️ مسح الأسئلة المضافة
              </GlowButton>
            </div>
          </div>
        </div>
      )}

      {/* ===== Settings Tab ===== */}
      {tab === 'settings' && (
        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="text-white/50 text-sm font-bold mb-4">🎁 مكافآت التسجيل</div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">عملات الترحيب</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateAdminSettings({ welcomeCoins: Math.max(0, adminSettings.welcomeCoins - 10) })}
                    className="w-7 h-7 rounded-lg bg-white/10 text-white/50 text-sm flex items-center justify-center">-</button>
                  <span className="text-yellow-400 font-bold w-12 text-center">{adminSettings.welcomeCoins}</span>
                  <button onClick={() => updateAdminSettings({ welcomeCoins: adminSettings.welcomeCoins + 10 })}
                    className="w-7 h-7 rounded-lg bg-white/10 text-white/50 text-sm flex items-center justify-center">+</button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">جواهر الترحيب</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateAdminSettings({ welcomeGems: Math.max(0, adminSettings.welcomeGems - 1) })}
                    className="w-7 h-7 rounded-lg bg-white/10 text-white/50 text-sm flex items-center justify-center">-</button>
                  <span className="text-purple-400 font-bold w-12 text-center">{adminSettings.welcomeGems}</span>
                  <button onClick={() => updateAdminSettings({ welcomeGems: adminSettings.welcomeGems + 1 })}
                    className="w-7 h-7 rounded-lg bg-white/10 text-white/50 text-sm flex items-center justify-center">+</button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">مكافأة الدخول اليومي</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateAdminSettings({ dailyBonusCoins: Math.max(0, adminSettings.dailyBonusCoins - 5) })}
                    className="w-7 h-7 rounded-lg bg-white/10 text-white/50 text-sm flex items-center justify-center">-</button>
                  <span className="text-yellow-400 font-bold w-12 text-center">{adminSettings.dailyBonusCoins}</span>
                  <button onClick={() => updateAdminSettings({ dailyBonusCoins: adminSettings.dailyBonusCoins + 5 })}
                    className="w-7 h-7 rounded-lg bg-white/10 text-white/50 text-sm flex items-center justify-center">+</button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="text-white/50 text-sm font-bold mb-4">💸 رسوم التحويل</div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">رسوم العملات (%)</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateAdminSettings({ transferFeeCoins: Math.max(0, adminSettings.transferFeeCoins - 1) })}
                    className="w-7 h-7 rounded-lg bg-white/10 text-white/50 text-sm flex items-center justify-center">-</button>
                  <span className="text-white font-bold w-12 text-center">{adminSettings.transferFeeCoins}%</span>
                  <button onClick={() => updateAdminSettings({ transferFeeCoins: Math.min(50, adminSettings.transferFeeCoins + 1) })}
                    className="w-7 h-7 rounded-lg bg-white/10 text-white/50 text-sm flex items-center justify-center">+</button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">رسوم الجواهر (%)</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateAdminSettings({ transferFeeGems: Math.max(0, adminSettings.transferFeeGems - 1) })}
                    className="w-7 h-7 rounded-lg bg-white/10 text-white/50 text-sm flex items-center justify-center">-</button>
                  <span className="text-white font-bold w-12 text-center">{adminSettings.transferFeeGems}%</span>
                  <button onClick={() => updateAdminSettings({ transferFeeGems: Math.min(50, adminSettings.transferFeeGems + 1) })}
                    className="w-7 h-7 rounded-lg bg-white/10 text-white/50 text-sm flex items-center justify-center">+</button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">الحد الأدنى للتحويل</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateAdminSettings({ minTransferAmount: Math.max(1, adminSettings.minTransferAmount - 5) })}
                    className="w-7 h-7 rounded-lg bg-white/10 text-white/50 text-sm flex items-center justify-center">-</button>
                  <span className="text-white font-bold w-12 text-center">{adminSettings.minTransferAmount}</span>
                  <button onClick={() => updateAdminSettings({ minTransferAmount: adminSettings.minTransferAmount + 5 })}
                    className="w-7 h-7 rounded-lg bg-white/10 text-white/50 text-sm flex items-center justify-center">+</button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="text-white/50 text-sm font-bold mb-4">🎮 مكافآت اللعب</div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">عملات لكل إجابة صحيحة</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateAdminSettings({ coinRewardPerGame: Math.max(0, adminSettings.coinRewardPerGame - 1) })}
                    className="w-7 h-7 rounded-lg bg-white/10 text-white/50 text-sm flex items-center justify-center">-</button>
                  <span className="text-yellow-400 font-bold w-12 text-center">{adminSettings.coinRewardPerGame}</span>
                  <button onClick={() => updateAdminSettings({ coinRewardPerGame: adminSettings.coinRewardPerGame + 1 })}
                    className="w-7 h-7 rounded-lg bg-white/10 text-white/50 text-sm flex items-center justify-center">+</button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">جواهر للعبة مثالية</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateAdminSettings({ gemRewardPerfect: Math.max(0, adminSettings.gemRewardPerfect - 1) })}
                    className="w-7 h-7 rounded-lg bg-white/10 text-white/50 text-sm flex items-center justify-center">-</button>
                  <span className="text-purple-400 font-bold w-12 text-center">{adminSettings.gemRewardPerfect}</span>
                  <button onClick={() => updateAdminSettings({ gemRewardPerfect: adminSettings.gemRewardPerfect + 1 })}
                    className="w-7 h-7 rounded-lg bg-white/10 text-white/50 text-sm flex items-center justify-center">+</button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">مضاعف الخبرة</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateAdminSettings({ xpMultiplier: Math.max(0.5, Number((adminSettings.xpMultiplier - 0.1).toFixed(1))) })}
                    className="w-7 h-7 rounded-lg bg-white/10 text-white/50 text-sm flex items-center justify-center">-</button>
                  <span className="text-emerald-400 font-bold w-12 text-center">×{adminSettings.xpMultiplier}</span>
                  <button onClick={() => updateAdminSettings({ xpMultiplier: Math.min(5, Number((adminSettings.xpMultiplier + 0.1).toFixed(1))) })}
                    className="w-7 h-7 rounded-lg bg-white/10 text-white/50 text-sm flex items-center justify-center">+</button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="text-white/50 text-sm font-bold mb-4">📱 إدارة التطبيق</div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">الحد الأدنى لإصدار التطبيق</span>
                <input value={adminSettings.minAppVersion} onChange={(e) => updateAdminSettings({ minAppVersion: e.target.value })} dir="ltr"
                  className="w-24 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-white text-center text-sm focus:border-yellow-500/50 focus:outline-none" placeholder="3.0.0" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">فرض التحديث</span>
                <button onClick={() => updateAdminSettings({ forceUpdate: !adminSettings.forceUpdate })}
                  className={`w-12 h-7 rounded-full transition-all relative ${adminSettings.forceUpdate ? 'bg-emerald-500' : 'bg-white/10'}`}>
                  <div className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-all ${adminSettings.forceUpdate ? 'left-1' : 'right-1'}`} />
                </button>
              </div>
              <div className="border-t border-white/5 pt-3 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-sm">وضع الصيانة</span>
                  <button onClick={() => updateAdminSettings({ maintenanceMode: !adminSettings.maintenanceMode })}
                    className={`w-12 h-7 rounded-full transition-all relative ${adminSettings.maintenanceMode ? 'bg-red-500' : 'bg-white/10'}`}>
                    <div className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-all ${adminSettings.maintenanceMode ? 'left-1' : 'right-1'}`} />
                  </button>
                </div>
                {adminSettings.maintenanceMode && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-2 text-center mb-2">
                      <span className="text-red-400 text-[10px]">⚠️ التطبيق في وضع الصيانة - المستخدمون يرون شاشة الصيانة</span>
                    </div>
                    <input value={adminSettings.maintenanceMessage} onChange={(e) => updateAdminSettings({ maintenanceMessage: e.target.value })} placeholder="رسالة الصيانة" dir="rtl"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder:text-white/30 focus:border-yellow-500/50 focus:outline-none text-sm" />
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-4">
            <div className="text-red-400/70 text-sm font-bold mb-3">⚠️ منطقة الخطر</div>
            <GlowButton variant="danger" className="w-full text-sm"
              onClick={() => {
                if (confirm('هل أنت متأكد من إعادة ضبط الإعدادات؟')) {
                  updateAdminSettings({
                    welcomeCoins: 150, welcomeGems: 8, dailyBonusCoins: 30,
                    transferFeeCoins: 5, transferFeeGems: 10, minTransferAmount: 10,
                    coinRewardPerGame: 5, gemRewardPerfect: 3, xpMultiplier: 1,
                    minAppVersion: '3.0.0', forceUpdate: false, maintenanceMode: false, maintenanceMessage: 'صيانة المؤقتة، نعود قريباً!',
                  });
                  showToast('تم إعادة ضبط الإعدادات');
                }
              }}>
              🔄 إعادة ضبط الإعدادات الافتراضية
            </GlowButton>
          </div>
        </div>
      )}

      {/* ===== Modals ===== */}

      {/* Add Question Modal */}
      <AnimatePresence>
        {showAddQuestion && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowAddQuestion(false)}>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 border border-white/10 rounded-2xl p-5 w-full max-w-sm max-h-[85vh] overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
              <h3 className="text-white font-bold text-lg mb-4 text-center">❓ إضافة سؤال جديد</h3>
              <div className="space-y-3">
                <textarea value={newQ.text} onChange={(e) => setNewQ({ ...newQ, text: e.target.value })} placeholder="نص السؤال" dir="rtl" rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:border-yellow-500/50 focus:outline-none text-sm resize-none" />
                {['option1', 'option2', 'option3', 'option4'].map((key, i) => (
                  <div key={key} className="flex items-center gap-2">
                    <button onClick={() => setNewQ({ ...newQ, correctIndex: i })}
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${newQ.correctIndex === i ? 'bg-emerald-500/30 border-2 border-emerald-500 text-emerald-400' : 'bg-white/5 border border-white/10 text-white/40'}`}>
                      {['أ', 'ب', 'ج', 'د'][i]}
                    </button>
                    <input value={(newQ as any)[key]} onChange={(e) => setNewQ({ ...newQ, [key]: e.target.value })} placeholder={`الخيار ${['أ', 'ب', 'ج', 'د'][i]}`} dir="rtl"
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder:text-white/30 focus:border-yellow-500/50 focus:outline-none text-sm" />
                  </div>
                ))}
                <div className="text-white/40 text-[10px] mt-1">👆 اضغط على الحرف لتحديد الإجابة الصحيحة</div>
                <div className="flex gap-2">
                  <select value={newQ.category} onChange={(e) => setNewQ({ ...newQ, category: e.target.value as QuestionCategory })}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm">
                    {Object.entries(categoryInfo).map(([key, info]) => (
                      <option key={key} value={key} className="bg-gray-900">{info.icon} {info.name}</option>
                    ))}
                  </select>
                  <select value={newQ.difficulty} onChange={(e) => setNewQ({ ...newQ, difficulty: e.target.value as any })}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm">
                    <option value="easy" className="bg-gray-900">سهل</option>
                    <option value="medium" className="bg-gray-900">متوسط</option>
                    <option value="hard" className="bg-gray-900">صعب</option>
                    <option value="expert" className="bg-gray-900">خبير</option>
                  </select>
                </div>
                <input value={newQ.hint} onChange={(e) => setNewQ({ ...newQ, hint: e.target.value })} placeholder="تلميح (اختياري)" dir="rtl"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:border-yellow-500/50 focus:outline-none text-sm" />
                <input value={newQ.funFact} onChange={(e) => setNewQ({ ...newQ, funFact: e.target.value })} placeholder="معلومة طريفة (اختياري)" dir="rtl"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:border-yellow-500/50 focus:outline-none text-sm" />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-white/40 text-[10px]">النقاط</label>
                    <input value={newQ.points} onChange={(e) => setNewQ({ ...newQ, points: parseInt(e.target.value) || 100 })} type="number" dir="ltr"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-center text-sm" />
                  </div>
                  <div>
                    <label className="text-white/40 text-[10px]">الوقت (ثانية)</label>
                    <input value={newQ.timeLimit} onChange={(e) => setNewQ({ ...newQ, timeLimit: parseInt(e.target.value) || 20 })} type="number" dir="ltr"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-center text-sm" />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <GlowButton onClick={handleAddQuestion} className="flex-1 text-sm">✅ إضافة</GlowButton>
                <GlowButton onClick={() => setShowAddQuestion(false)} variant="outline" className="flex-1 text-sm">إلغاء</GlowButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Package Modal */}
      <AnimatePresence>
        {showAddPackage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowAddPackage(false)}>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 border border-white/10 rounded-2xl p-5 w-full max-w-sm max-h-[85vh] overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
              <h3 className="text-white font-bold text-lg mb-4 text-center">📦 إضافة باقة جديدة</h3>
              <div className="space-y-3">
                <input value={newPkg.name} onChange={(e) => setNewPkg({ ...newPkg, name: e.target.value })} placeholder="اسم الباقة" dir="rtl"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:border-yellow-500/50 focus:outline-none text-sm" />
                <input value={newPkg.description} onChange={(e) => setNewPkg({ ...newPkg, description: e.target.value })} placeholder="الوصف (اختياري)" dir="rtl"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:border-yellow-500/50 focus:outline-none text-sm" />
                <div className="text-white/40 text-xs">اختر الأيقونة:</div>
                <div className="flex flex-wrap gap-2">
                  {pkgIcons.map(icon => (
                    <button key={icon} onClick={() => setNewPkg({ ...newPkg, icon })}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${newPkg.icon === icon ? 'bg-yellow-500/30 border-2 border-yellow-500' : 'bg-white/5'}`}>{icon}</button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-white/40 text-[10px]">العملات 🪙</label>
                    <input value={newPkg.coins || ''} onChange={(e) => setNewPkg({ ...newPkg, coins: parseInt(e.target.value) || 0 })} type="number" dir="ltr"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-center text-sm" />
                  </div>
                  <div>
                    <label className="text-white/40 text-[10px]">الجواهر 💎</label>
                    <input value={newPkg.gems || ''} onChange={(e) => setNewPkg({ ...newPkg, gems: parseInt(e.target.value) || 0 })} type="number" dir="ltr"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-center text-sm" />
                  </div>
                </div>
                <div>
                  <label className="text-white/40 text-[10px]">السعر (ر.س)</label>
                  <input value={newPkg.price || ''} onChange={(e) => setNewPkg({ ...newPkg, price: parseInt(e.target.value) || 0 })} type="number" dir="ltr"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-center text-sm" />
                </div>
                <div className="text-white/40 text-xs">اللون:</div>
                <div className="flex flex-wrap gap-2">
                  {pkgColors.map(color => (
                    <button key={color} onClick={() => setNewPkg({ ...newPkg, color })}
                      className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} ${newPkg.color === color ? 'ring-2 ring-yellow-500 ring-offset-2 ring-offset-gray-900' : ''}`} />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <GlowButton onClick={handleAddPackage} className="flex-1 text-sm">✅ إضافة</GlowButton>
                <GlowButton onClick={() => setShowAddPackage(false)} variant="outline" className="flex-1 text-sm">إلغاء</GlowButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Announcement Modal */}
      <AnimatePresence>
        {showAddAnnouncement && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowAddAnnouncement(false)}>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 border border-white/10 rounded-2xl p-5 w-full max-w-sm">
              <h3 className="text-white font-bold text-lg mb-4 text-center">📢 إضافة إعلان</h3>
              <div className="space-y-3">
                <input value={newAnn.title} onChange={(e) => setNewAnn({ ...newAnn, title: e.target.value })} placeholder="العنوان" dir="rtl"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:border-yellow-500/50 focus:outline-none text-sm" />
                <textarea value={newAnn.message} onChange={(e) => setNewAnn({ ...newAnn, message: e.target.value })} placeholder="الرسالة" dir="rtl" rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:border-yellow-500/50 focus:outline-none text-sm resize-none" />
                <div className="text-white/40 text-xs">النوع:</div>
                <div className="flex gap-2">
                  {([['info', 'ℹ️ معلومة'], ['warning', '⚠️ تحذير'], ['reward', '🎁 مكافأة']] as const).map(([type, label]) => (
                    <button key={type} onClick={() => setNewAnn({ ...newAnn, type })}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold ${newAnn.type === type ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-white/5 text-white/40'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <GlowButton onClick={handleAddAnnouncement} className="flex-1 text-sm">✅ إضافة</GlowButton>
                <GlowButton onClick={() => setShowAddAnnouncement(false)} variant="outline" className="flex-1 text-sm">إلغاء</GlowButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ban User Modal */}
      <AnimatePresence>
        {banModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setBanModal(false)}>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 border border-red-500/20 rounded-2xl p-5 w-full max-w-sm text-center">
              <div className="text-4xl mb-3">🚫</div>
              <h3 className="text-white font-bold text-lg mb-2">حظر المستخدم</h3>
              {selectedUser && <p className="text-white/60 text-sm mb-3">هل أنت متأكد من حظر <span className="text-red-400 font-bold">{selectedUser.name}</span>؟</p>}
              <input value={banReason} onChange={(e) => setBanReason(e.target.value)} placeholder="سبب الحظر" dir="rtl"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:border-red-500/50 focus:outline-none text-sm mb-4" />
              <div className="flex gap-3">
                <GlowButton onClick={handleBanUser} variant="danger" className="flex-1 text-sm">🚫 حظر</GlowButton>
                <GlowButton onClick={() => { setBanModal(false); setBanReason(''); }} variant="outline" className="flex-1 text-sm">إلغاء</GlowButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset Password Modal */}
      <AnimatePresence>
        {resetPwModal && resetPwUserId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => { setResetPwModal(false); setResetPwUserId(null); setNewPassword(''); }}>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 border border-amber-500/20 rounded-2xl p-5 w-full max-w-sm text-center">
              <div className="text-4xl mb-3">🔑</div>
              <h3 className="text-white font-bold text-lg mb-2">إعادة كلمة المرور</h3>
              {(() => {
                const u = allUsers.find(u => u.id === resetPwUserId);
                return u ? <p className="text-white/60 text-sm mb-3">تعيين كلمة مرور جديدة لـ <span className="text-amber-400 font-bold">{u.name}</span></p> : null;
              })()}
              <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="كلمة المرور الجديدة (6 أحرف على الأقل)" type="text" dir="ltr"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:border-amber-500/50 focus:outline-none text-sm mb-4" />
              <div className="flex gap-3">
                <GlowButton onClick={() => {
                  const result = authStore.getState().resetUserPassword(resetPwUserId, newPassword);
                  if (result.success) {
                    showToast('تم إعادة تعيين كلمة المرور بنجاح');
                    setResetPwModal(false); setResetPwUserId(null); setNewPassword('');
                  } else {
                    showToast(result.error || 'فشل إعادة التعيين', 'error');
                  }
                }} className="flex-1 text-sm">🔑 إعادة التعيين</GlowButton>
                <GlowButton onClick={() => { setResetPwModal(false); setResetPwUserId(null); setNewPassword(''); }} variant="outline" className="flex-1 text-sm">إلغاء</GlowButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit User Modal */}
      <AnimatePresence>
        {editUserModal && selectedUser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setEditUserModal(false)}>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 border border-white/10 rounded-2xl p-5 w-full max-w-sm max-h-[85vh] overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
              <h3 className="text-white font-bold text-lg mb-4 text-center">✏️ تعديل المستخدم</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-white/40 text-[10px]">الاسم</label>
                  <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} dir="rtl"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:border-yellow-500/50 focus:outline-none" />
                </div>
                <div>
                  <label className="text-white/40 text-[10px]">البريد الإلكتروني</label>
                  <input value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} dir="ltr"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:border-yellow-500/50 focus:outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-white/40 text-[10px]">العملات 🪙</label>
                    <input value={editForm.coins} onChange={(e) => setEditForm({ ...editForm, coins: parseInt(e.target.value) || 0 })} type="number" dir="ltr"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-center text-sm" />
                  </div>
                  <div>
                    <label className="text-white/40 text-[10px]">الجواهر 💎</label>
                    <input value={editForm.gems} onChange={(e) => setEditForm({ ...editForm, gems: parseInt(e.target.value) || 0 })} type="number" dir="ltr"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-center text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-white/40 text-[10px]">المستوى</label>
                    <input value={editForm.level} onChange={(e) => setEditForm({ ...editForm, level: parseInt(e.target.value) || 1 })} type="number" dir="ltr"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-center text-sm" />
                  </div>
                  <div>
                    <label className="text-white/40 text-[10px]">الصلاحية</label>
                    <div className="flex gap-2 mt-1">
                      <button onClick={() => setEditForm({ ...editForm, role: 'user' })}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold ${editForm.role === 'user' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-white/5 text-white/40'}`}>
                        مستخدم
                      </button>
                      <button onClick={() => setEditForm({ ...editForm, role: 'admin' })}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold ${editForm.role === 'admin' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-white/5 text-white/40'}`}>
                        مسؤول
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <GlowButton onClick={handleEditUser} className="flex-1 text-sm">✅ حفظ</GlowButton>
                <GlowButton onClick={() => setEditUserModal(false)} variant="outline" className="flex-1 text-sm">إلغاء</GlowButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl text-sm font-bold z-[60] ${toast.type === 'success' ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'}`}>
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
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
  const [copied, setCopied] = useState(false);
  const [showReceiveCard, setShowReceiveCard] = useState(false);

  // Check if daily bonus is available
  const today = new Date().toDateString();
  const dailyBonusAvailable = currentUser ? currentUser.lastBonusDate !== today : false;

  const handleCopyId = () => {
    if (!currentUser) return;
    navigator.clipboard.writeText(currentUser.id).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      // Fallback for environments where clipboard API isn't available
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setScreen('menu')} className="text-white/60 hover:text-white text-2xl">→</motion.button>
          <h2 className="text-xl font-bold text-white">💰 محفظتي</h2>
        </div>
        <CoinDisplay />
      </div>

      {/* Daily Bonus Indicator */}
      {dailyBonusAvailable && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-yellow-500/20 to-amber-600/20 border border-yellow-500/30 rounded-2xl p-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 1, repeat: Infinity }}>🎁</motion.span>
            <span className="text-yellow-400 text-sm font-bold">مكافأة يومية متاحة!</span>
          </div>
          <button onClick={() => setScreen('menu')} className="text-yellow-400 text-xs font-bold hover:underline">ادخل القائمة</button>
        </motion.div>
      )}

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
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowReceiveCard(!showReceiveCard)}
          className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center hover:bg-white/10 transition-colors">
          <div className="text-2xl mb-1">📥</div>
          <div className="text-white/70 text-xs font-bold">استلام</div>
        </motion.button>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setScreen('spinWheel')}
          className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center hover:bg-white/10 transition-colors">
          <div className="text-2xl mb-1">🎰</div>
          <div className="text-white/70 text-xs font-bold">عجلة الحظ</div>
        </motion.button>
      </div>

      {/* Receive Card with Copy ID */}
      {currentUser && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-emerald-500/10 to-teal-600/10 border border-emerald-500/20 rounded-2xl p-4 mb-5">
          <div className="text-white/50 text-xs text-center mb-2">معرّفك للاستلام</div>
          <div className="bg-white/5 rounded-xl p-3 flex items-center gap-2">
            <span className="text-emerald-400 font-mono text-sm font-bold flex-1 text-center">{currentUser.id.slice(0, 16)}</span>
            <motion.button whileTap={{ scale: 0.9 }} onClick={handleCopyId}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${copied ? 'bg-emerald-500/30 text-emerald-400' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}>
              {copied ? '✅ تم النسخ' : '📋 نسخ'}
            </motion.button>
          </div>
          <div className="text-white/30 text-[10px] text-center mt-2">شارك هذا المعرّف مع الآخرين لاستلام التحويلات</div>
        </motion.div>
      )}

      {/* Share/Receive Expandable Card */}
      <AnimatePresence>
        {showReceiveCard && currentUser && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-emerald-500/20 rounded-2xl p-4 mb-5 overflow-hidden">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500/20 to-amber-600/20 flex items-center justify-center text-3xl border border-yellow-500/30 mx-auto mb-3">{currentUser.avatar}</div>
              <div className="text-white font-bold">{currentUser.name}</div>
              <div className="text-emerald-400/60 text-xs font-mono mt-1">ID: {currentUser.id.slice(0, 16)}</div>
              <div className="text-white/30 text-[10px] mt-3">أرسل هذا المعرّف لصديقك ليتمكن من التحويل إليك</div>
              <GlowButton onClick={handleCopyId} className="mt-3 text-sm px-6 py-2">
                {copied ? '✅ تم النسخ!' : '📋 نسخ المعرّف'}
              </GlowButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/5 rounded-2xl p-8 text-center">
            <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-4xl mb-3">📭</motion.div>
            <div className="text-white/40 text-sm font-bold">لا توجد معاملات بعد</div>
            <div className="text-white/20 text-xs mt-1">العب ألعاباً لكسب العملات!</div>
            <GlowButton onClick={() => setScreen('modeSelect')} className="mt-4 text-sm px-6 py-2">🎮 ابدأ اللعب</GlowButton>
          </motion.div>
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
  const [copiedId, setCopiedId] = useState(false);

  const currentUser = useAuthStore.getState().currentUser;
  const allUsers = useAuthStore.getState().getAllUsers();
  const recentTransfers = useWalletStore.getState().getTransactions(10).filter(t => t.type === 'transfer_out');
  const filteredUsers = searchQuery.trim()
    ? allUsers.filter(u => u.name.includes(searchQuery) || u.email.includes(searchQuery))
    : allUsers;

  const quickAmounts = [50, 100, 200, 500];
  const feeRate = currency === 'coins' ? 0.05 : 0.10;
  const amountNum = parseInt(amount) || 0;
  const fee = amountNum > 0 ? Math.ceil(amountNum * feeRate) : 0;
  const totalDeducted = amountNum + fee;
  const currentBalance = currency === 'coins' ? playerCoins : playerGems;
  const canAfford = amountNum >= 10 && totalDeducted <= currentBalance;

  const handleCopyMyId = () => {
    if (!currentUser) return;
    navigator.clipboard.writeText(currentUser.id).then(() => {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }).catch(() => {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    });
  };

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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setScreen('wallet')} className="text-white/60 hover:text-white text-2xl">→</motion.button>
          <h2 className="text-xl font-bold text-white">📤 تحويل</h2>
        </div>
        <CoinDisplay />
      </div>

      {/* Copy Your ID */}
      {currentUser && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-emerald-500/10 to-teal-600/10 border border-emerald-500/20 rounded-xl p-3 mb-4 flex items-center justify-between">
          <div className="text-emerald-400/70 text-xs">معرّفك: <span className="font-mono font-bold">{currentUser.id.slice(0, 12)}</span></div>
          <motion.button whileTap={{ scale: 0.9 }} onClick={handleCopyMyId}
            className={`px-3 py-1 rounded-lg text-xs font-bold ${copiedId ? 'bg-emerald-500/30 text-emerald-400' : 'bg-white/10 text-white/60'}`}>
            {copiedId ? '✅ تم النسخ' : '📋 نسخ'}
          </motion.button>
        </motion.div>
      )}

      {/* Select Recipient */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4">
        <div className="text-white/50 text-sm font-bold mb-3">👤 اختر المستلم</div>
        {selectedUser ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-600/20 flex items-center justify-center text-3xl border border-emerald-500/30">{selectedUser.avatar}</div>
            <div className="flex-1"><div className="text-emerald-400 font-bold">{selectedUser.name}</div><div className="text-white/30 text-[10px]">تم الاختيار</div></div>
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
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-lg border border-white/10">{user.avatar}</div>
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
        {/* Quick Amount Buttons */}
        <div className="flex gap-2 mb-3">
          {quickAmounts.map(qa => (
            <motion.button key={qa} whileTap={{ scale: 0.95 }} onClick={() => setAmount(String(qa))}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${amount === String(qa) ? (currency === 'coins' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-purple-500/20 text-purple-400 border border-purple-500/30') : 'bg-white/5 text-white/40 hover:bg-white/10'}`}>
              {qa}
            </motion.button>
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

      {/* Recent Transfers */}
      {recentTransfers.length > 0 && !selectedUser && (
        <div className="mb-4">
          <div className="text-white/50 text-sm font-bold mb-2">📋 آخر التحويلات</div>
          <div className="space-y-1">
            {recentTransfers.slice(0, 3).map(tx => (
              <div key={tx.id} className="bg-white/5 rounded-xl p-2.5 flex items-center gap-2">
                <span className="text-sm">📤</span>
                <span className="text-white/60 text-xs flex-1 truncate">{tx.description}</span>
                <span className="text-red-400 text-xs font-bold">-{tx.amount}</span>
              </div>
            ))}
          </div>
        </div>
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
            <motion.div initial={{ scale: 0.8, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-b from-gray-900 to-gray-950 border border-white/10 rounded-2xl p-6 w-full max-w-sm text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: 'spring' }} className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500/20 to-amber-600/20 flex items-center justify-center text-3xl border border-yellow-500/30 mx-auto mb-3">{selectedUser.avatar}</motion.div>
              <div className="text-white/40 text-xs mb-1">تحويل إلى</div>
              <div className="text-white font-bold text-lg mb-3">{selectedUser.name}</div>
              <div className="bg-white/5 rounded-xl p-4 mb-4">
                <div className="text-3xl font-extrabold text-white mb-1">{amountNum.toLocaleString()} {currency === 'coins' ? '🪙' : '💎'}</div>
                <div className="text-white/30 text-xs">+ {fee} رسوم = {totalDeducted} إجمالي</div>
              </div>
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
// ===== Maintenance Screen =====
// ===== Privacy Policy Screen =====
function PrivacyPolicyScreen() {
  const { setScreen } = useGameStore();
  return (
    <motion.div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 p-4 pb-8" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="flex items-center gap-3 mb-6">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setScreen('settings')} className="text-white/60 hover:text-white text-2xl">→</motion.button>
        <h2 className="text-xl font-bold text-white">📜 سياسة الخصوصية</h2>
      </div>
      <div className="space-y-4 text-white/70 text-sm leading-relaxed">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <h3 className="text-yellow-400 font-bold text-base mb-2">1. مقدمة</h3>
          <p>مرحباً بك في تطبيق "بطل الأسئلة". نحن نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. توضح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية المعلومات عند استخدامك لتطبيقنا. باستخدامك للتطبيق، فإنك توافق على الشروط الموضحة في هذه السياسة.</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <h3 className="text-yellow-400 font-bold text-base mb-2">2. المعلومات التي نجمعها</h3>
          <p className="mb-2">يقوم التطبيق بتخزين البيانات التالية محلياً على جهازك فقط:</p>
          <ul className="list-disc pr-5 space-y-1 text-white/60">
            <li>الاسم والبريد الإلكتروني عند التسجيل</li>
            <li>تقدمك في اللعبة (المستوى، النقاط، العملات، الجواهر)</li>
            <li>سجل المعاملات المالية داخل التطبيق</li>
            <li>إعدادات التطبيق المفضلة</li>
          </ul>
          <p className="mt-2 text-emerald-400/80 text-xs">✅ لا نقوم بإرسال أي بيانات إلى خوادم خارجية. جميع البيانات مخزنة محلياً على جهازك.</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <h3 className="text-yellow-400 font-bold text-base mb-2">3. كيف نستخدم المعلومات</h3>
          <p>نستخدم المعلومات المخزنة محلياً حصرياً لتوفير تجربة اللعب وتحسينها، بما في ذلك: حفظ تقدمك في اللعبة، وإدارة حسابك والمحفظة الافتراضية، وعرض لوحة المتصدرين والإنجازات، وتخصيص تجربة المستخدم. لا يتم مشاركة أي معلومات مع أطراف ثالثة.</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <h3 className="text-yellow-400 font-bold text-base mb-2">4. حماية البيانات</h3>
          <p>نظراً لأن جميع بياناتك مخزنة محلياً على جهازك، فإن حماية هذه البيانات تعتمد على إجراءات أمان جهازك نفسه. نوصي بتعيين قفل شاشة وتحديث نظام التشغيل بانتظام. يرجى ملاحظة أن إلغاء تثبيت التطبيق أو مسح بيانات التطبيق سيؤدي إلى حذف جميع بيانات اللعبة بشكل دائم.</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <h3 className="text-yellow-400 font-bold text-base mb-2">5. الأطفال والخصوصية</h3>
          <p>تطبيق "بطل الأسئلة" مناسب لجميع الأعمار. لا نقوم بجمع معلومات شخصية من الأطفال عمداً. بما أن البيانات مخزنة محلياً فقط ولا يتم إرسالها لأي خادم، فإننا لا نحتاج للوصول إلى بيانات الأطفال. نشجع أولياء الأمور على مراقبة استخدام أطفالهم للتطبيق.</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <h3 className="text-yellow-400 font-bold text-base mb-2">6. العملات الافتراضية</h3>
          <p>العملات والجواهر الموجودة في التطبيق هي عملات افتراضية ليس لها قيمة حقيقية ولا يمكن استبدالها بأموال حقيقية. عمليات الشراء داخل التطبيق (إن وجدت) تخضع لسياسات متجر Google Play. جميع المعاملات بين المستخدمين هي معاملات افتراضية داخل اللعبة فقط.</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <h3 className="text-yellow-400 font-bold text-base mb-2">7. الإعلانات</h3>
          <p>قد يحتوي التطبيق على إعلانات من أطراف ثالثة عبر خدمات Google AdMob. تخضع هذه الإعلانات لسياسة خصوصية Google الخاصة بها. يمكنك الاطلاع على سياسة خصوصية Google على موقعهم الرسمي.</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <h3 className="text-yellow-400 font-bold text-base mb-2">8. تغييرات السياسة</h3>
          <p>قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. سيتم إعلامك بأي تغييرات جوهرية عبر إشعار داخل التطبيق. استمرارك في استخدام التطبيق بعد نشر التغييرات يعني موافقتك على السياسة المحدثة.</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <h3 className="text-yellow-400 font-bold text-base mb-2">9. الاتصال بنا</h3>
          <p>إذا كان لديك أي أسئلة أو استفسارات حول سياسة الخصوصية أو معالجة البيانات، يمكنك التواصل معنا عبر البريد الإلكتروني: admin@quizchampion.com</p>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-center text-yellow-400/70 text-xs">
          آخر تحديث: مايو 2026 | الإصدار 3.5.0
        </div>
      </div>
    </motion.div>
  );
}

function MaintenanceScreen({ message }: { message: string }) {
  return (
    <motion.div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex flex-col items-center justify-center p-6 text-center"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.div
        animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
        className="text-8xl mb-8">
        🔧
      </motion.div>
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="text-3xl font-extrabold text-white mb-4">صيانة المؤقتة</motion.h1>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="bg-white/5 border border-white/10 rounded-3xl p-6 max-w-sm w-full mb-6">
        <p className="text-white/70 text-lg leading-relaxed">{message}</p>
      </motion.div>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
        className="text-white/30 text-sm">نعتذر عن الإزعاج، سنعود قريباً! 🙏</motion.p>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
        className="mt-8 flex items-center gap-2">
        <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-2 h-2 rounded-full bg-yellow-500" />
        <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }} className="w-2 h-2 rounded-full bg-yellow-500" />
        <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }} className="w-2 h-2 rounded-full bg-yellow-500" />
      </motion.div>
    </motion.div>
  );
}

export default function Home() {
  const { currentScreen, adminSettings, isAdmin } = useGameStore();

  // Initialize Huawei IAP on app start
  useEffect(() => {
    huaweiIAP.init().then(available => {
      if (available) {
        console.log('Huawei IAP initialized successfully');
        // Handle any pending purchases from previous sessions
        huaweiIAP.handlePendingPurchases().then(({ coins, gems }) => {
          if (coins > 0 || gems > 0) {
            useGameStore.getState().updateUserCoins(coins);
            useGameStore.getState().updateUserGems(gems);
          }
        });
      }
    });
  }, []);

  // Maintenance mode check: show maintenance screen to non-admin users
  if (adminSettings.maintenanceMode && !isAdmin) {
    return (
      <main className="min-h-screen" dir="rtl" lang="ar">
        <MaintenanceScreen message={adminSettings.maintenanceMessage} />
      </main>
    );
  }

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
      case 'privacy': return <PrivacyPolicyScreen />;
      default: return <MainMenu />;
    }
  };
  return (
    <main className="min-h-screen" dir="rtl" lang="ar">
      <AnimatePresence mode="wait">{renderScreen()}</AnimatePresence>
    </main>
  );
}
