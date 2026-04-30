// ===== Client-Side Authentication System =====
// Works entirely offline using localStorage - no server required for APK mode

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LocalUser {
  id: string;
  email: string;
  name: string;
  password: string; // stored locally only - not secure but works for offline APK
  avatar: string;
  role: 'user' | 'admin';
  level: number;
  coins: number;
  gems: number;
  provider: string;
  createdAt: string;
}

interface AuthState {
  users: LocalUser[];
  currentUser: LocalUser | null;
  isLoggedIn: boolean;

  // Actions
  register: (name: string, email: string, password: string) => { success: boolean; error?: string; user?: LocalUser };
  loginWithEmail: (email: string, password: string) => { success: boolean; error?: string; user?: LocalUser };
  loginAsGuest: () => { success: boolean; user?: LocalUser };
  logout: () => void;
  updateUser: (updates: Partial<LocalUser>) => void;
  getUserByEmail: (email: string) => LocalUser | undefined;
  getUserById: (id: string) => LocalUser | undefined;
  searchUsers: (query: string) => LocalUser[];
  getAllUsers: () => LocalUser[];
  updateUserById: (userId: string, updates: Partial<LocalUser>) => void;
}

// Simple hash for password (not cryptographically secure, but works for local storage)
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

// Pre-seeded admin account
const ADMIN_USER: LocalUser = {
  id: 'admin-001',
  email: 'admin@quizchampion.com',
  name: 'المسؤول',
  password: simpleHash('admin123'),
  avatar: '👑',
  role: 'admin',
  level: 50,
  coins: 9999,
  gems: 999,
  provider: 'email',
  createdAt: new Date().toISOString(),
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      users: [ADMIN_USER],
      currentUser: null,
      isLoggedIn: false,

      register: (name, email, password) => {
        const { users } = get();

        // Validation
        if (!name || !email || !password) {
          return { success: false, error: 'يرجى ملء جميع الحقول' };
        }
        if (password.length < 6) {
          return { success: false, error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' };
        }
        if (!email.includes('@')) {
          return { success: false, error: 'البريد الإلكتروني غير صالح' };
        }

        // Check if email already exists
        const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (existing) {
          return { success: false, error: 'البريد الإلكتروني مستخدم بالفعل' };
        }

        // Create new user
        const newUser: LocalUser = {
          id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          email: email.toLowerCase(),
          name,
          password: simpleHash(password),
          avatar: '🦁',
          role: 'user',
          level: 1,
          coins: 150, // Welcome bonus
          gems: 8,
          provider: 'email',
          createdAt: new Date().toISOString(),
        };

        set({
          users: [...users, newUser],
          currentUser: newUser,
          isLoggedIn: true,
        });

        return { success: true, user: newUser };
      },

      loginWithEmail: (email, password) => {
        const { users } = get();

        if (!email || !password) {
          return { success: false, error: 'يرجى إدخال البريد وكلمة المرور' };
        }

        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (!user) {
          return { success: false, error: 'لا يوجد حساب بهذا البريد الإلكتروني' };
        }

        if (user.password !== simpleHash(password)) {
          return { success: false, error: 'كلمة المرور غير صحيحة' };
        }

        set({
          currentUser: user,
          isLoggedIn: true,
        });

        return { success: true, user };
      },

      loginAsGuest: () => {
        const guestUser: LocalUser = {
          id: `guest-${Date.now()}`,
          email: 'guest@local',
          name: 'لاعب زائر',
          password: '',
          avatar: '🦁',
          role: 'user',
          level: 1,
          coins: 50,
          gems: 2,
          provider: 'guest',
          createdAt: new Date().toISOString(),
        };

        set({
          currentUser: guestUser,
          isLoggedIn: true,
        });

        return { success: true, user: guestUser };
      },

      logout: () => {
        set({
          currentUser: null,
          isLoggedIn: false,
        });
      },

      updateUser: (updates) => {
        const { currentUser, users } = get();
        if (!currentUser) return;

        const updatedUser = { ...currentUser, ...updates };

        // Update in users list too
        const updatedUsers = users.map(u =>
          u.id === currentUser.id ? { ...u, ...updates } : u
        );

        set({
          currentUser: updatedUser,
          users: updatedUsers,
        });
      },

      getUserByEmail: (email) => {
        return get().users.find(u => u.email.toLowerCase() === email.toLowerCase());
      },

      getUserById: (id) => {
        return get().users.find(u => u.id === id);
      },

      searchUsers: (query) => {
        const q = query.toLowerCase();
        return get().users.filter(u =>
          u.id !== get().currentUser?.id &&
          (u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
        );
      },

      getAllUsers: () => {
        const currentUser = get().currentUser;
        return get().users.filter(u => u.id !== currentUser?.id && u.provider !== 'guest');
      },

      updateUserById: (userId, updates) => {
        const { users, currentUser } = get();
        const updatedUsers = users.map(u =>
          u.id === userId ? { ...u, ...updates } : u
        );
        // If updating current user, also update currentUser
        if (currentUser && currentUser.id === userId) {
          set({
            users: updatedUsers,
            currentUser: { ...currentUser, ...updates },
          });
        } else {
          set({ users: updatedUsers });
        }
      },
    }),
    {
      name: 'quiz-champion-auth',
    }
  )
);
