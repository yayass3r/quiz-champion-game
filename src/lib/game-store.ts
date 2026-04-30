'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Question, QuestionCategory, getQuestions, getRandomQuestions, getSurvivalQuestions, categoryInfo, questions as defaultQuestions, registerCustomQuestions } from './questions';
import { useAuthStore } from './auth-local';

export type GameMode = 'classic' | 'speed' | 'survival' | 'marathon' | 'daily' | 'teamBattle';
export type GameScreen =
  | 'splash'
  | 'login'
  | 'menu'
  | 'modeSelect'
  | 'categorySelect'
  | 'gameplay'
  | 'results'
  | 'leaderboard'
  | 'profile'
  | 'shop'
  | 'achievements'
  | 'team'
  | 'dailyChallenge'
  | 'settings'
  | 'spinWheel'
  | 'admin'
  | 'packages'
  | 'submitQuestion'
  | 'wallet'
  | 'transfer';

export interface PowerUp {
  id: string; name: string; icon: string; description: string; count: number; cost: number;
}

export interface Achievement {
  id: string; name: string; description: string; icon: string; unlocked: boolean; progress: number; target: number; reward: number;
}

export interface ShopItem {
  id: string; name: string; icon: string; description: string; cost: number; currency: 'coins' | 'gems'; type: 'avatar' | 'powerup'; owned: boolean;
}

export interface TeamData {
  id: string; name: string; logo: string; members: number; score: number; rank: number;
}

export interface LeaderboardEntry {
  rank: number; name: string; avatar: string; score: number; level: number; isPlayer: boolean;
}

export interface PackageData {
  id: string; name: string; description: string; icon: string; coins: number; gems: number; price: number; color: string; isActive: boolean;
}

export interface AdConfig {
  adType: string; isEnabled: boolean; frequency: number; position: string;
}

export interface Announcement {
  id: string; title: string; message: string; type: 'info' | 'warning' | 'reward'; createdAt: string; isActive: boolean;
}

export interface AdminSettings {
  welcomeCoins: number; welcomeGems: number; dailyBonusCoins: number; transferFeeCoins: number; transferFeeGems: number;
  minTransferAmount: number; coinRewardPerGame: number; gemRewardPerfect: number; xpMultiplier: number;
}

export interface AuthUser {
  id: string; email: string; name: string; avatar: string; role: string; level: number; coins: number; gems: number;
}

export interface GameState {
  currentScreen: GameScreen;
  previousScreen: GameScreen | null;
  playerName: string; playerAvatar: string; playerLevel: number; playerXP: number;
  playerCoins: number; playerGems: number; totalScore: number;
  gamesPlayed: number; gamesWon: number; currentStreak: number; bestStreak: number;
  currentMode: GameMode; currentCategory: QuestionCategory | null;
  questions: Question[]; currentQuestionIndex: number; score: number;
  correctCount: number; timeRemaining: number; isTimerActive: boolean;
  answeredCurrent: boolean; selectedAnswer: number | null; isCorrect: boolean | null;
  comboCount: number; maxCombo: number; usedPowerUps: string[];
  powerUps: PowerUp[]; currentTeam: TeamData | null; teams: TeamData[];
  leaderboard: LeaderboardEntry[]; achievements: Achievement[]; shopItems: ShopItem[];
  dailyCompleted: boolean; dailyScore: number; lastDailyDate: string;
  soundEnabled: boolean; vibrationEnabled: boolean; darkMode: boolean;
  // Auth
  user: AuthUser | null; isLoggedIn: boolean; isAdmin: boolean;
  authToken: string | null;
  // Admin
  packages: PackageData[]; adConfigs: AdConfig[];
  announcements: Announcement[];
  adminSettings: AdminSettings;
  // Question submission
  lastQuestionScore: number | null; lastQuestionFeedback: string;

  setScreen: (screen: GameScreen) => void;
  goBack: () => void;
  startGame: (mode: GameMode, category?: QuestionCategory) => void;
  answerQuestion: (answerIndex: number) => void;
  nextQuestion: () => void;
  usePowerUp: (powerUpId: string) => void;
  endGame: () => void;
  resetGame: () => void;
  setPlayerName: (name: string) => void;
  setPlayerAvatar: (avatar: string) => void;
  toggleSound: () => void;
  toggleVibration: () => void;
  toggleDarkMode: () => void;
  buyShopItem: (itemId: string) => void;
  joinTeam: (team: TeamData) => void;
  createTeam: (name: string, logo: string) => void;
  checkAchievements: () => void;
  // Auth actions
  login: (user: AuthUser, token?: string) => void;
  logout: () => void;
  updateUserCoins: (coins: number) => void;
  updateUserGems: (gems: number) => void;
  // Admin actions
  setPackages: (packages: PackageData[]) => void;
  togglePackageActive: (packageId: string) => void;
  addPackage: (pkg: PackageData) => void;
  removePackage: (packageId: string) => void;
  updatePackage: (packageId: string, updates: Partial<PackageData>) => void;
  setAdConfigs: (configs: AdConfig[]) => void;
  toggleAdEnabled: (adType: string) => void;
  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'createdAt'>) => void;
  removeAnnouncement: (id: string) => void;
  toggleAnnouncement: (id: string) => void;
  updateAdminSettings: (settings: Partial<AdminSettings>) => void;
  // Question
  setLastQuestionScore: (score: number | null, feedback?: string) => void;
  // Custom questions
  customQuestions: Question[];
  addCustomQuestion: (question: Question) => void;
  removeCustomQuestion: (questionId: string) => void;
  updateCustomQuestion: (questionId: string, updates: Partial<Question>) => void;
  getAllQuestions: () => Question[];
}

const initialPowerUps: PowerUp[] = [
  { id: 'fifty_fifty', name: 'حذف نصف الإجابات', icon: '✂️', description: 'يحذف إجابتين خاطئتين', count: 3, cost: 50 },
  { id: 'freeze_time', name: 'تجميد الوقت', icon: '⏸️', description: 'يوقف المؤقت لمدة 10 ثوان', count: 2, cost: 75 },
  { id: 'double_points', name: 'مضاعفة النقاط', icon: '✨', description: 'يضاعف نقاط السؤال الحالي', count: 2, cost: 100 },
  { id: 'hint', name: 'تلميح', icon: '💡', description: 'يكشف تلميحاً عن الإجابة الصحيحة', count: 3, cost: 30 },
  { id: 'skip', name: 'تخطي السؤال', icon: '⏭️', description: 'يتخطى السؤال بدون خسارة', count: 2, cost: 60 },
  { id: 'shield', name: 'درع الحماية', icon: '🛡️', description: 'يمنحك فرصة ثانية عند الخطأ', count: 1, cost: 150 },
];

const initialAchievements: Achievement[] = [
  { id: 'first_win', name: 'البداية', description: 'أكمل أول لعبة', icon: '🌟', unlocked: false, progress: 0, target: 1, reward: 50 },
  { id: 'streak_5', name: 'رامي محترف', description: 'حقق سلسلة 5 إجابات صحيحة', icon: '🔥', unlocked: false, progress: 0, target: 5, reward: 100 },
  { id: 'streak_10', name: 'بطل الأسئلة', description: 'حقق سلسلة 10 إجابات صحيحة', icon: '💎', unlocked: false, progress: 0, target: 10, reward: 200 },
  { id: 'streak_20', name: 'الأسطورة', description: 'حقق سلسلة 20 إجابة صحيحة', icon: '👑', unlocked: false, progress: 0, target: 20, reward: 500 },
  { id: 'games_10', name: 'لاعب نشيط', description: 'العب 10 ألعاب', icon: '🎮', unlocked: false, progress: 0, target: 10, reward: 100 },
  { id: 'games_50', name: 'مدمن الألعاب', description: 'العب 50 لعبة', icon: '🏆', unlocked: false, progress: 0, target: 50, reward: 300 },
  { id: 'score_1000', name: 'ألف نقطة', description: 'اجمع 1000 نقطة', icon: '💰', unlocked: false, progress: 0, target: 1000, reward: 150 },
  { id: 'score_5000', name: 'خبير الأسئلة', description: 'اجمع 5000 نقطة', icon: '🎓', unlocked: false, progress: 0, target: 5000, reward: 300 },
  { id: 'level_5', name: 'صاعد', description: 'صل للمستوى 5', icon: '⬆️', unlocked: false, progress: 0, target: 5, reward: 100 },
  { id: 'level_10', name: 'محترف', description: 'صل للمستوى 10', icon: '🏅', unlocked: false, progress: 0, target: 10, reward: 250 },
  { id: 'daily_7', name: 'متحدي أسبوعي', description: 'أكمل التحدي اليومي 7 أيام متتالية', icon: '📅', unlocked: false, progress: 0, target: 7, reward: 200 },
  { id: 'survival_10', name: 'الناجي', description: 'أجب على 10 أسئلة في وضع البقاء', icon: '🏕️', unlocked: false, progress: 0, target: 10, reward: 200 },
  { id: 'all_categories', name: 'موسوعة', description: 'العب في جميع التصنيفات', icon: '📖', unlocked: false, progress: 0, target: 17, reward: 300 },
  { id: 'perfect_game', name: 'لعبة مثالية', description: 'أجب على جميع الأسئلة بشكل صحيح', icon: '💯', unlocked: false, progress: 0, target: 1, reward: 500 },
  { id: 'speed_demon', name: 'شيطان السرعة', description: 'أجب على سؤال في أقل من 3 ثوان', icon: '⚡', unlocked: false, progress: 0, target: 1, reward: 150 },
];

const initialShopItems: ShopItem[] = [
  { id: 'avatar_lion', name: 'أسد', icon: '🦁', description: 'أفاتار الأسد', cost: 100, currency: 'coins', type: 'avatar', owned: false },
  { id: 'avatar_eagle', name: 'نسر', icon: '🦅', description: 'أفاتار النسر', cost: 100, currency: 'coins', type: 'avatar', owned: false },
  { id: 'avatar_dragon', name: 'تنين', icon: '🐉', description: 'أفاتار التنين', cost: 200, currency: 'coins', type: 'avatar', owned: false },
  { id: 'avatar_phoenix', name: 'عنقاء', icon: '🔥', description: 'أفاتار العنقاء', cost: 300, currency: 'coins', type: 'avatar', owned: false },
  { id: 'avatar_crown', name: 'تاج', icon: '👑', description: 'أفاتار التاج', cost: 5, currency: 'gems', type: 'avatar', owned: false },
  { id: 'avatar_diamond', name: 'ألماس', icon: '💎', description: 'أفاتار الألماس', cost: 10, currency: 'gems', type: 'avatar', owned: false },
  { id: 'pu_fifty', name: 'حذف نصف الإجابات ×3', icon: '✂️', description: '3 استخدامات', cost: 50, currency: 'coins', type: 'powerup', owned: false },
  { id: 'pu_freeze', name: 'تجميد الوقت ×2', icon: '⏸️', description: '2 استخدامات', cost: 75, currency: 'coins', type: 'powerup', owned: false },
  { id: 'pu_double', name: 'مضاعفة النقاط ×2', icon: '✨', description: '2 استخدامات', cost: 100, currency: 'coins', type: 'powerup', owned: false },
  { id: 'pu_shield', name: 'درع الحماية ×1', icon: '🛡️', description: '1 استخدام', cost: 150, currency: 'coins', type: 'powerup', owned: false },
  { id: 'pu_hint', name: 'تلميح ×3', icon: '💡', description: '3 استخدامات', cost: 30, currency: 'coins', type: 'powerup', owned: false },
  { id: 'pu_skip', name: 'تخطي ×2', icon: '⏭️', description: '2 استخدامات', cost: 60, currency: 'coins', type: 'powerup', owned: false },
];

const initialTeams: TeamData[] = [
  { id: '1', name: 'فرسان المعرفة', logo: '⚔️', members: 156, score: 45230, rank: 1 },
  { id: '2', name: 'أسياد الذكاء', logo: '🧠', members: 132, score: 42100, rank: 2 },
  { id: '3', name: 'محاربو الفكر', logo: '🏹', members: 98, score: 38750, rank: 3 },
  { id: '4', name: 'عباقرة العرب', logo: '🌟', members: 210, score: 35200, rank: 4 },
  { id: '5', name: 'نسور العلوم', logo: '🦅', members: 87, score: 31800, rank: 5 },
  { id: '6', name: 'صولجان المعرفة', logo: '👑', members: 145, score: 29400, rank: 6 },
  { id: '7', name: 'شعلات الفكر', logo: '🔥', members: 67, score: 25600, rank: 7 },
  { id: '8', name: 'أقمار الحكمة', logo: '🌙', members: 93, score: 22100, rank: 8 },
];

const initialLeaderboard: LeaderboardEntry[] = [
  { rank: 1, name: 'سارة المحمد', avatar: '🦅', score: 12500, level: 28, isPlayer: false },
  { rank: 2, name: 'أحمد الخالدي', avatar: '🐉', score: 11200, level: 25, isPlayer: false },
  { rank: 3, name: 'فاطمة العلي', avatar: '👑', score: 10800, level: 24, isPlayer: false },
  { rank: 4, name: 'عمر السعيد', avatar: '🦁', score: 9600, level: 22, isPlayer: false },
  { rank: 5, name: 'نورة الحربي', avatar: '💎', score: 8900, level: 20, isPlayer: false },
  { rank: 6, name: 'خالد العمري', avatar: '🔥', score: 8200, level: 19, isPlayer: false },
  { rank: 7, name: 'مريم الشريف', avatar: '🌟', score: 7500, level: 18, isPlayer: false },
  { rank: 8, name: 'أنت', avatar: '🦁', score: 0, level: 1, isPlayer: true },
];

function getXPForLevel(level: number): number { return level * 200; }

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      currentScreen: 'splash',
      previousScreen: null,
      playerName: 'لاعب', playerAvatar: '🦁', playerLevel: 1, playerXP: 0,
      playerCoins: 100, playerGems: 5, totalScore: 0,
      gamesPlayed: 0, gamesWon: 0, currentStreak: 0, bestStreak: 0,
      currentMode: 'classic', currentCategory: null,
      questions: [], currentQuestionIndex: 0, score: 0,
      correctCount: 0, timeRemaining: 0, isTimerActive: false,
      answeredCurrent: false, selectedAnswer: null, isCorrect: null,
      comboCount: 0, maxCombo: 0, usedPowerUps: [],
      powerUps: initialPowerUps, currentTeam: null, teams: initialTeams,
      leaderboard: initialLeaderboard, achievements: initialAchievements, shopItems: initialShopItems,
      dailyCompleted: false, dailyScore: 0, lastDailyDate: '',
      soundEnabled: true, vibrationEnabled: true, darkMode: false,
      user: null, isLoggedIn: false, isAdmin: false, authToken: null,
      packages: [], adConfigs: [], announcements: [],
      adminSettings: {
        welcomeCoins: 150, welcomeGems: 8, dailyBonusCoins: 30,
        transferFeeCoins: 5, transferFeeGems: 10, minTransferAmount: 10,
        coinRewardPerGame: 5, gemRewardPerfect: 3, xpMultiplier: 1,
      },
      lastQuestionScore: null, lastQuestionFeedback: '',
      customQuestions: [],

      setScreen: (screen) => set((state) => ({ previousScreen: state.currentScreen, currentScreen: screen })),
      goBack: () => set((state) => ({ currentScreen: state.previousScreen || 'menu', previousScreen: null })),

      startGame: (mode, category) => {
        let gameQuestions: Question[] = []; let timePerQuestion = 20;
        switch (mode) {
          case 'classic': gameQuestions = category ? getQuestions(category, undefined, 10) : getRandomQuestions(10); timePerQuestion = 20; break;
          case 'speed': gameQuestions = category ? getQuestions(category, 'easy', 15) : getQuestions(undefined, 'easy', 15); timePerQuestion = 8; break;
          case 'survival': gameQuestions = getSurvivalQuestions(20); timePerQuestion = 15; break;
          case 'marathon': gameQuestions = getRandomQuestions(30); timePerQuestion = 30; break;
          case 'daily': gameQuestions = getRandomQuestions(10); timePerQuestion = 20; break;
          case 'teamBattle': gameQuestions = getRandomQuestions(15); timePerQuestion = 15; break;
        }
        set({
          currentMode: mode, currentCategory: category || null, questions: gameQuestions,
          currentQuestionIndex: 0, score: 0, correctCount: 0,
          timeRemaining: timePerQuestion, isTimerActive: true,
          answeredCurrent: false, selectedAnswer: null, isCorrect: null,
          comboCount: 0, maxCombo: 0, usedPowerUps: [], currentScreen: 'gameplay',
        });
      },

      answerQuestion: (answerIndex) => {
        const state = get();
        if (state.answeredCurrent) return;
        const currentQuestion = state.questions[state.currentQuestionIndex];
        if (!currentQuestion) return;

        const correct = answerIndex === currentQuestion.correctIndex;
        // FIX: Apply double points multiplier when doubleActive power-up is used
        const isDoubled = state.usedPowerUps.includes('double_points');
        let points = correct ? currentQuestion.points * (1 + Math.floor(state.comboCount / 3) * 0.5) : 0;
        if (correct && isDoubled) points *= 2;

        // FIX: Apply shield - if shield is active and answer is wrong, don't break streak
        const hasShield = state.usedPowerUps.includes('shield');
        const shouldBreakStreak = correct ? false : !hasShield;

        set({
          answeredCurrent: true, selectedAnswer: answerIndex,
          isCorrect: correct, isTimerActive: false,
          score: state.score + Math.round(points),
          correctCount: state.correctCount + (correct ? 1 : 0),
          comboCount: correct ? state.comboCount + 1 : (shouldBreakStreak ? 0 : state.comboCount),
          maxCombo: Math.max(state.maxCombo, correct ? state.comboCount + 1 : state.maxCombo),
          currentStreak: correct ? state.currentStreak + 1 : (shouldBreakStreak ? 0 : state.currentStreak),
          bestStreak: Math.max(state.bestStreak, correct ? state.currentStreak + 1 : state.bestStreak),
        });
      },

      nextQuestion: () => {
        const state = get();
        const nextIndex = state.currentQuestionIndex + 1;
        const isLastQuestion = nextIndex >= state.questions.length;

        // FIX: Check survival game-over based on current question result BEFORE transitioning
        if (state.currentMode === 'survival' && !state.isCorrect && state.answeredCurrent) {
          get().endGame(); return;
        }

        if (isLastQuestion) { get().endGame(); return; }

        const nextQuestion = state.questions[nextIndex];
        let timeLimit = nextQuestion.timeLimit;
        if (state.currentMode === 'speed') timeLimit = 8;

        set({
          currentQuestionIndex: nextIndex, answeredCurrent: false,
          selectedAnswer: null, isCorrect: null,
          timeRemaining: timeLimit, isTimerActive: true, usedPowerUps: [],
        });
      },

      usePowerUp: (powerUpId) => {
        const state = get();
        if (state.answeredCurrent) return;
        const powerUp = state.powerUps.find(p => p.id === powerUpId);
        if (!powerUp || powerUp.count <= 0) return;

        const newPowerUps = state.powerUps.map(p => p.id === powerUpId ? { ...p, count: p.count - 1 } : p);
        set({ powerUps: newPowerUps, usedPowerUps: [...state.usedPowerUps, powerUpId] });

        if (powerUpId === 'freeze_time') {
          set({ isTimerActive: false });
          setTimeout(() => set({ isTimerActive: true }), 10000);
        }
      },

      endGame: () => {
        const state = get();
        const adminSettings = state.adminSettings;
        const xpEarned = Math.round(state.score * 0.5 * adminSettings.xpMultiplier);
        const coinsEarned = Math.round(state.score * 0.1) + (state.correctCount * adminSettings.coinRewardPerGame);
        const gemsEarned = state.correctCount === state.questions.length ? adminSettings.gemRewardPerfect : 0;
        const newXP = state.playerXP + xpEarned;
        let newLevel = state.playerLevel;
        let remainingXP = newXP;
        // FIX: Handle multiple level-ups properly
        while (remainingXP >= getXPForLevel(newLevel)) {
          remainingXP -= getXPForLevel(newLevel);
          newLevel++;
        }
        const isWon = state.correctCount >= Math.ceil(state.questions.length * 0.6);
        const newLeaderboard = [...state.leaderboard];
        const playerIndex = newLeaderboard.findIndex(e => e.isPlayer);
        if (playerIndex >= 0) {
          newLeaderboard[playerIndex] = { ...newLeaderboard[playerIndex], score: state.totalScore + state.score, level: newLevel, avatar: state.playerAvatar, name: state.playerName };
          newLeaderboard.sort((a, b) => b.score - a.score);
          newLeaderboard.forEach((entry, i) => entry.rank = i + 1);
        }
        set({
          currentScreen: 'results', isTimerActive: false,
          playerLevel: newLevel, playerXP: newXP,
          playerCoins: state.playerCoins + coinsEarned, playerGems: state.playerGems + gemsEarned,
          totalScore: state.totalScore + state.score, gamesPlayed: state.gamesPlayed + 1,
          gamesWon: state.gamesWon + (isWon ? 1 : 0), leaderboard: newLeaderboard,
        });
        // Sync to auth store
        const newState = get();
        const authState = useAuthStore.getState();
        if (authState.currentUser) {
          authState.updateUser({
            coins: newState.playerCoins,
            gems: newState.playerGems,
            level: newState.playerLevel,
          });
        }
        get().checkAchievements();
      },

      resetGame: () => set({
        currentScreen: 'menu', currentMode: 'classic', currentCategory: null,
        questions: [], currentQuestionIndex: 0, score: 0, correctCount: 0,
        timeRemaining: 0, isTimerActive: false, answeredCurrent: false,
        selectedAnswer: null, isCorrect: null, comboCount: 0, maxCombo: 0, usedPowerUps: [],
      }),

      setPlayerName: (name) => set({ playerName: name }),
      setPlayerAvatar: (avatar) => set({ playerAvatar: avatar }),
      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
      toggleVibration: () => set((s) => ({ vibrationEnabled: !s.vibrationEnabled })),
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),

      buyShopItem: (itemId) => {
        const state = get();
        const item = state.shopItems.find(i => i.id === itemId);
        if (!item) return;
        // FIX: Avatar items show "owned", powerup items are always purchasable
        if (item.type === 'avatar' && item.owned) return;
        const canAfford = item.currency === 'coins' ? state.playerCoins >= item.cost : state.playerGems >= item.cost;
        if (!canAfford) return;

        if (item.type === 'avatar') {
          set({
            shopItems: state.shopItems.map(i => i.id === itemId ? { ...i, owned: true } : i),
            playerAvatar: item.icon,
            playerCoins: item.currency === 'coins' ? state.playerCoins - item.cost : state.playerCoins,
            playerGems: item.currency === 'gems' ? state.playerGems - item.cost : state.playerGems,
          });
        } else if (item.type === 'powerup') {
          const puMap: Record<string, string> = { 'pu_fifty': 'fifty_fifty', 'pu_freeze': 'freeze_time', 'pu_double': 'double_points', 'pu_shield': 'shield', 'pu_hint': 'hint', 'pu_skip': 'skip' };
          const puId = puMap[itemId];
          const newPowerUps = state.powerUps.map(p => p.id === puId ? { ...p, count: p.count + (puId === 'shield' ? 1 : 3) } : p);
          set({
            powerUps: newPowerUps,
            playerCoins: item.currency === 'coins' ? state.playerCoins - item.cost : state.playerCoins,
            playerGems: item.currency === 'gems' ? state.playerGems - item.cost : state.playerGems,
          });
        }
        // Sync to auth store after purchase
        const newState = get();
        const authState = useAuthStore.getState();
        if (authState.currentUser) {
          authState.updateUser({
            coins: newState.playerCoins,
            gems: newState.playerGems,
            avatar: newState.playerAvatar,
          });
        }
      },

      joinTeam: (team) => set({ currentTeam: team }),
      createTeam: (name, logo) => {
        const newTeam: TeamData = { id: Date.now().toString(), name, logo, members: 1, score: 0, rank: 9 };
        set((state) => ({ currentTeam: newTeam, teams: [...state.teams, newTeam] }));
      },

      checkAchievements: () => {
        const state = get();
        const newAchievements = state.achievements.map(a => {
          let progress = a.progress;
          switch (a.id) {
            case 'first_win': progress = state.gamesPlayed >= 1 ? 1 : 0; break;
            case 'streak_5': progress = state.bestStreak; break;
            case 'streak_10': progress = state.bestStreak; break;
            case 'streak_20': progress = state.bestStreak; break;
            case 'games_10': progress = state.gamesPlayed; break;
            case 'games_50': progress = state.gamesPlayed; break;
            case 'score_1000': progress = state.totalScore; break;
            case 'score_5000': progress = state.totalScore; break;
            case 'level_5': progress = state.playerLevel; break;
            case 'level_10': progress = state.playerLevel; break;
          }
          const newlyUnlocked = !a.unlocked && progress >= a.target;
          if (newlyUnlocked) set((s) => ({ playerCoins: s.playerCoins + a.reward }));
          return { ...a, progress, unlocked: a.unlocked || progress >= a.target };
        });
        set({ achievements: newAchievements });
      },

      // Auth actions
      login: (user, token) => set({
        user, isLoggedIn: true, isAdmin: user.role === 'admin',
        authToken: token || null,
        playerName: user.name, playerAvatar: user.avatar,
        playerCoins: user.coins, playerGems: user.gems, playerLevel: user.level,
      }),
      logout: () => set({
        user: null, isLoggedIn: false, isAdmin: false, authToken: null, currentScreen: 'splash',
      }),
      updateUserCoins: (coins) => {
        set((s) => ({ playerCoins: s.playerCoins + coins }));
        const newState = get();
        const authState = useAuthStore.getState();
        if (authState.currentUser) authState.updateUser({ coins: newState.playerCoins });
      },
      updateUserGems: (gems) => {
        set((s) => ({ playerGems: s.playerGems + gems }));
        const newState = get();
        const authState = useAuthStore.getState();
        if (authState.currentUser) authState.updateUser({ gems: newState.playerGems });
      },
      // Admin
      setPackages: (packages) => set({ packages }),
      togglePackageActive: (packageId) => set((s) => ({
        packages: s.packages.map(p => p.id === packageId ? { ...p, isActive: !p.isActive } : p),
      })),
      setAdConfigs: (configs) => set({ adConfigs: configs }),
      toggleAdEnabled: (adType) => set((s) => ({
        adConfigs: s.adConfigs.map(c => c.adType === adType ? { ...c, isEnabled: !c.isEnabled } : c),
      })),
      addPackage: (pkg) => set((s) => ({ packages: [...s.packages, pkg] })),
      removePackage: (packageId) => set((s) => ({ packages: s.packages.filter(p => p.id !== packageId) })),
      updatePackage: (packageId, updates) => set((s) => ({
        packages: s.packages.map(p => p.id === packageId ? { ...p, ...updates } : p),
      })),
      addAnnouncement: (announcement) => set((s) => ({
        announcements: [...s.announcements, {
          ...announcement,
          id: `ann-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
        }],
      })),
      removeAnnouncement: (id) => set((s) => ({
        announcements: s.announcements.filter(a => a.id !== id),
      })),
      toggleAnnouncement: (id) => set((s) => ({
        announcements: s.announcements.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a),
      })),
      updateAdminSettings: (settings) => set((s) => ({
        adminSettings: { ...s.adminSettings, ...settings },
      })),
      // Question
      setLastQuestionScore: (score, feedback) => set({ lastQuestionScore: score, lastQuestionFeedback: feedback || '' }),

      // Custom questions management
      addCustomQuestion: (question) => {
        set((s) => ({ customQuestions: [...s.customQuestions, question] }));
        registerCustomQuestions(get().customQuestions);
      },
      removeCustomQuestion: (questionId) => {
        set((s) => ({ customQuestions: s.customQuestions.filter(q => q.id !== questionId) }));
        registerCustomQuestions(get().customQuestions);
      },
      updateCustomQuestion: (questionId, updates) => {
        set((s) => ({
          customQuestions: s.customQuestions.map(q => q.id === questionId ? { ...q, ...updates } : q),
        }));
        registerCustomQuestions(get().customQuestions);
      },
      getAllQuestions: () => [...defaultQuestions, ...get().customQuestions],

      tick: () => set((state) => {
        if (!state.isTimerActive || state.timeRemaining <= 0) return {};
        const newTime = state.timeRemaining - 1;
        if (newTime <= 0) {
          return { timeRemaining: 0, isTimerActive: false, answeredCurrent: true, isCorrect: false, selectedAnswer: -1 };
        }
        return { timeRemaining: newTime };
      }),
    }),
    {
      name: 'quiz-champion-game',
      partialize: (state) => ({
        playerName: state.playerName, playerAvatar: state.playerAvatar,
        playerLevel: state.playerLevel, playerXP: state.playerXP,
        playerCoins: state.playerCoins, playerGems: state.playerGems,
        totalScore: state.totalScore, gamesPlayed: state.gamesPlayed,
        gamesWon: state.gamesWon, currentStreak: state.currentStreak,
        bestStreak: state.bestStreak, powerUps: state.powerUps,
        currentTeam: state.currentTeam, leaderboard: state.leaderboard,
        achievements: state.achievements, shopItems: state.shopItems,
        dailyCompleted: state.dailyCompleted, dailyScore: state.dailyScore,
        lastDailyDate: state.lastDailyDate, soundEnabled: state.soundEnabled,
        vibrationEnabled: state.vibrationEnabled, darkMode: state.darkMode,
        user: state.user, isLoggedIn: state.isLoggedIn, isAdmin: state.isAdmin,
        authToken: state.authToken,
        packages: state.packages, adConfigs: state.adConfigs,
        announcements: state.announcements, adminSettings: state.adminSettings,
        customQuestions: state.customQuestions,
      }),
    }
  )
);
