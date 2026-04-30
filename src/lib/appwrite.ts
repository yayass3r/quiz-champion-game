// Appwrite Configuration for Quiz Champion Game
// بطل الأسئلة - إعدادات Appwrite

export const APPWRITE_CONFIG = {
  endpoint: 'https://cloud.appwrite.io/v1',
  projectId: 'quiz-champion',
  databaseId: 'quiz-champion-db',
  collections: {
    players: 'players',
    teams: 'teams',
    gameSessions: 'game_sessions',
  },
  // API Key for server-side operations
  apiKey: process.env.APPWRITE_API_KEY || '',
};

// Appwrite Project Info
export const APPWRITE_PROJECT = {
  projectId: 'quiz-champion',
  consoleUrl: 'https://cloud.appwrite.io/console/project/quiz-champion',
  region: 'fra',
};
