'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuthStore, LocalUser } from './auth-local';
import { useGameStore } from './game-store';

export type TransactionType = 'earn' | 'spend' | 'purchase' | 'transfer_in' | 'transfer_out' | 'bonus' | 'reward';
export type CurrencyType = 'coins' | 'gems';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: CurrencyType;
  description: string;
  timestamp: string;
  fromUserId?: string;
  fromUserName?: string;
  toUserId?: string;
  toUserName?: string;
}

export interface WalletState {
  transactions: Transaction[];
  
  // Actions
  addTransaction: (tx: Omit<Transaction, 'id' | 'timestamp'>) => void;
  transferToUser: (toUserId: string, amount: number, currency: CurrencyType) => { success: boolean; error?: string };
  getTransactions: (limit?: number) => Transaction[];
  getBalance: () => { coins: number; gems: number };
  getTotalEarned: () => { coins: number; gems: number };
  getTotalSpent: () => { coins: number; gems: number };
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      transactions: [],

      addTransaction: (tx) => {
        const newTx: Transaction = {
          ...tx,
          id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
        };

        set((state) => ({
          transactions: [newTx, ...state.transactions],
        }));

        // Note: Balance updates are now handled by the caller (game-store, page.tsx, etc.)
        // This function only records the transaction for history purposes.
      },

      transferToUser: (toUserId, amount, currency) => {
        const authState = useAuthStore.getState();
        const currentUser = authState.currentUser;

        if (!currentUser) {
          return { success: false, error: 'يجب تسجيل الدخول أولاً' };
        }

        if (amount <= 0) {
          return { success: false, error: 'يجب إدخال مبلغ صحيح' };
        }

        if (currentUser.id === toUserId) {
          return { success: false, error: 'لا يمكنك التحويل لنفسك' };
        }

        // Check balance
        const currentBalance = currency === 'coins' ? currentUser.coins : currentUser.gems;
        if (currentBalance < amount) {
          return { success: false, error: 'رصيدك غير كافٍ لإتمام التحويل' };
        }

        // Find target user
        const targetUser = authState.users.find(u => u.id === toUserId);
        if (!targetUser) {
          return { success: false, error: 'المستخدم المحدد غير موجود' };
        }

        // Get admin settings for transfer fees and min amount
        const adminSettings = useGameStore.getState().adminSettings;
        const minAmount = adminSettings.minTransferAmount;

        // Minimum transfer amount (from admin settings)
        if (amount < minAmount) {
          return { success: false, error: `الحد الأدنى للتحويل هو ${minAmount}` };
        }

        // Transfer fee from admin settings
        const feeRate = currency === 'coins' ? adminSettings.transferFeeCoins / 100 : adminSettings.transferFeeGems / 100;
        const fee = Math.ceil(amount * feeRate);
        const totalDeducted = amount + fee;

        if (currentBalance < totalDeducted) {
          return { success: false, error: `رصيدك غير كافٍ. المبلغ + الرسوم: ${totalDeducted} ${currency === 'coins' ? 'عملة' : 'جوهرة'}` };
        }

        // Deduct from sender
        if (currency === 'coins') {
          authState.updateUser({ coins: currentUser.coins - totalDeducted });
          // Add to receiver
          const updatedUsers = authState.users.map(u =>
            u.id === toUserId ? { ...u, coins: u.coins + amount } : u
          );
          useAuthStore.setState({ users: updatedUsers });
        } else {
          authState.updateUser({ gems: currentUser.gems - totalDeducted });
          const updatedUsers = authState.users.map(u =>
            u.id === toUserId ? { ...u, gems: u.gems + amount } : u
          );
          useAuthStore.setState({ users: updatedUsers });
        }

        // Sync game-store with auth-store after transfer
        const updatedCurrentUser = useAuthStore.getState().currentUser;
        if (updatedCurrentUser) {
          useGameStore.setState({
            playerCoins: updatedCurrentUser.coins,
            playerGems: updatedCurrentUser.gems,
          });
        }

        // Create transaction records
        const outTx: Omit<Transaction, 'id' | 'timestamp'> = {
          type: 'transfer_out',
          amount: totalDeducted,
          currency,
          description: `تحويل ${amount} ${currency === 'coins' ? 'عملة' : 'جوهرة'} إلى ${targetUser.name}${fee > 0 ? ` (رسوم: ${fee})` : ''}`,
          fromUserId: currentUser.id,
          fromUserName: currentUser.name,
          toUserId: targetUser.id,
          toUserName: targetUser.name,
        };

        const inTx: Omit<Transaction, 'id' | 'timestamp'> = {
          type: 'transfer_in',
          amount: amount,
          currency,
          description: `استلام ${amount} ${currency === 'coins' ? 'عملة' : 'جوهرة'} من ${currentUser.name}`,
          fromUserId: currentUser.id,
          fromUserName: currentUser.name,
          toUserId: targetUser.id,
          toUserName: targetUser.name,
        };

        // Add outgoing transaction
        const outTransaction: Transaction = {
          ...outTx,
          id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
        };

        set((state) => ({
          transactions: [outTransaction, ...state.transactions],
        }));

        return { success: true };
      },

      getTransactions: (limit = 50) => {
        return get().transactions.slice(0, limit);
      },

      getBalance: () => {
        const authState = useAuthStore.getState();
        const currentUser = authState.currentUser;
        return {
          coins: currentUser?.coins || 0,
          gems: currentUser?.gems || 0,
        };
      },

      getTotalEarned: () => {
        const txs = get().transactions;
        return {
          coins: txs.filter(t => t.currency === 'coins' && (t.type === 'earn' || t.type === 'transfer_in' || t.type === 'bonus' || t.type === 'reward')).reduce((sum, t) => sum + t.amount, 0),
          gems: txs.filter(t => t.currency === 'gems' && (t.type === 'earn' || t.type === 'transfer_in' || t.type === 'bonus' || t.type === 'reward')).reduce((sum, t) => sum + t.amount, 0),
        };
      },

      getTotalSpent: () => {
        const txs = get().transactions;
        return {
          coins: txs.filter(t => t.currency === 'coins' && (t.type === 'spend' || t.type === 'transfer_out')).reduce((sum, t) => sum + t.amount, 0),
          gems: txs.filter(t => t.currency === 'gems' && (t.type === 'spend' || t.type === 'transfer_out')).reduce((sum, t) => sum + t.amount, 0),
        };
      },
    }),
    {
      name: 'quiz-champion-wallet',
    }
  )
);
