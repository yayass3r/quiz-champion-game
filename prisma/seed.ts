import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

async function seed() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const existingAdmin = await db.user.findUnique({ where: { email: 'admin@quizchampion.com' } });
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 12);
    await db.user.create({
      data: {
        email: 'admin@quizchampion.com',
        name: 'المسؤول',
        password: hashedPassword,
        avatar: '👑',
        role: 'admin',
        coins: 99999,
        gems: 9999,
        level: 50,
        xp: 100000,
      },
    });
    console.log('✅ Admin user created: admin@quizchampion.com / admin123');
  }

  // Create achievements
  const achievements = [
    { key: 'first_win', name: 'البداية', description: 'أكمل أول لعبة', icon: '🌟', category: 'general', requirement: 1 },
    { key: 'streak_5', name: 'رامي محترف', description: 'حقق سلسلة 5 إجابات صحيحة', icon: '🔥', category: 'streak', requirement: 5 },
    { key: 'streak_10', name: 'بطل الأسئلة', description: 'حقق سلسلة 10 إجابات صحيحة', icon: '💎', category: 'streak', requirement: 10 },
    { key: 'streak_20', name: 'الأسطورة', description: 'حقق سلسلة 20 إجابة صحيحة', icon: '👑', category: 'streak', requirement: 20 },
    { key: 'games_10', name: 'لاعب نشيط', description: 'العب 10 ألعاب', icon: '🎮', category: 'games', requirement: 10 },
    { key: 'games_50', name: 'مدمن الألعاب', description: 'العب 50 لعبة', icon: '🏆', category: 'games', requirement: 50 },
    { key: 'score_1000', name: 'ألف نقطة', description: 'اجمع 1000 نقطة', icon: '💰', category: 'score', requirement: 1000 },
    { key: 'score_5000', name: 'خبير الأسئلة', description: 'اجمع 5000 نقطة', icon: '🎓', category: 'score', requirement: 5000 },
    { key: 'level_5', name: 'صاعد', description: 'صل للمستوى 5', icon: '⬆️', category: 'level', requirement: 5 },
    { key: 'level_10', name: 'محترف', description: 'صل للمستوى 10', icon: '🏅', category: 'level', requirement: 10 },
    { key: 'daily_7', name: 'متحدي أسبوعي', description: 'أكمل التحدي اليومي 7 أيام متتالية', icon: '📅', category: 'daily', requirement: 7 },
    { key: 'survival_10', name: 'الناجي', description: 'أجب على 10 أسئلة في وضع البقاء', icon: '🏕️', category: 'survival', requirement: 10 },
    { key: 'all_categories', name: 'موسوعة', description: 'العب في جميع التصنيفات', icon: '📖', category: 'categories', requirement: 10 },
    { key: 'perfect_game', name: 'لعبة مثالية', description: 'أجب على جميع الأسئلة بشكل صحيح', icon: '💯', category: 'special', requirement: 1 },
    { key: 'speed_demon', name: 'شيطان السرعة', description: 'أجب على سؤال في أقل من 3 ثوان', icon: '⚡', category: 'special', requirement: 1 },
  ];

  for (const ach of achievements) {
    await db.achievement.upsert({
      where: { key: ach.key },
      update: {},
      create: ach,
    });
  }
  console.log('✅ Achievements seeded');

  // Create packages
  const packages = [
    { name: 'باقة المبتدئ', description: 'بداية رائعة لمغامرتك!', icon: '🎒', coins: 500, gems: 0, price: 4.99, color: 'from-emerald-500 to-teal-600', order: 1 },
    { name: 'باقة المغامر', description: 'المزيد من العملات للاستمتاع!', icon: '⚔️', coins: 1500, gems: 5, price: 9.99, color: 'from-yellow-500 to-amber-600', order: 2 },
    { name: 'باقة البطل', description: 'أسلحة قوية للبطل!', icon: '🛡️', coins: 3500, gems: 15, price: 19.99, color: 'from-purple-500 to-violet-600', order: 3 },
    { name: 'باقة الأسطورة', description: 'أقوى باقة للمحترفين!', icon: '👑', coins: 8000, gems: 40, price: 39.99, color: 'from-red-500 to-rose-600', order: 4 },
    { name: 'باقة الجواهر', description: 'جواهر نادرة للتميز!', icon: '💎', coins: 2000, gems: 50, price: 29.99, color: 'from-cyan-500 to-blue-600', order: 5 },
    { name: 'باقة VIP', description: 'عضوية مميزة مع مكافآت حصرية!', icon: '🌟', coins: 15000, gems: 100, price: 79.99, color: 'from-amber-500 to-yellow-600', order: 6 },
  ];

  for (const pkg of packages) {
    await db.package.upsert({
      where: { id: pkg.name },
      update: {},
      create: pkg,
    });
  }
  console.log('✅ Packages seeded');

  // Create ad configs
  const adTypes = [
    { adType: 'banner', isEnabled: false, frequency: 1, adUnitId: '', position: 'bottom' },
    { adType: 'interstitial', isEnabled: false, frequency: 3, adUnitId: '', position: 'between' },
    { adType: 'rewarded', isEnabled: false, frequency: 5, adUnitId: '', position: 'bottom' },
  ];

  for (const ad of adTypes) {
    await db.adConfig.upsert({
      where: { adType: ad.adType },
      update: {},
      create: ad,
    });
  }
  console.log('✅ Ad configs seeded');

  // Create app settings
  const settings = [
    { key: 'app_name', value: 'بطل الأسئلة' },
    { key: 'maintenance_mode', value: 'false' },
    { key: 'welcome_bonus_coins', value: '150' },
    { key: 'welcome_bonus_gems', value: '8' },
    { key: 'daily_reward_coins', value: '50' },
    { key: 'referral_bonus_coins', value: '200' },
  ];

  for (const setting of settings) {
    await db.appSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }
  console.log('✅ App settings seeded');

  // Create some demo users for leaderboard
  const demoUsers = [
    { name: 'سارة المحمد', avatar: '🦅', level: 28, totalScore: 12500 },
    { name: 'أحمد الخالدي', avatar: '🐉', level: 25, totalScore: 11200 },
    { name: 'فاطمة العلي', avatar: '👑', level: 24, totalScore: 10800 },
    { name: 'عمر السعيد', avatar: '🦁', level: 22, totalScore: 9600 },
    { name: 'نورة الحربي', avatar: '💎', level: 20, totalScore: 8900 },
  ];

  for (const du of demoUsers) {
    const email = du.name.replace(/\s/g, '').toLowerCase() + '@demo.com';
    const existing = await db.user.findUnique({ where: { email } });
    if (!existing) {
      const u = await db.user.create({
        data: {
          email,
          name: du.name,
          avatar: du.avatar,
          level: du.level,
          xp: du.level * 200,
          totalScore: du.totalScore,
          gamesPlayed: Math.floor(Math.random() * 100) + 10,
          gamesWon: Math.floor(Math.random() * 50) + 5,
          password: await bcrypt.hash('demo123', 12),
        },
      });
      await db.leaderboardEntry.create({
        data: { userId: u.id, score: du.totalScore },
      });
    }
  }
  console.log('✅ Demo users seeded');

  console.log('🎉 Seeding complete!');
}

seed()
  .catch(console.error)
  .finally(() => db.$disconnect());
