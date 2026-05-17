/**
 * Huawei Ads Kit Service - Petal Ads Integration
 * Provides rewarded video ads and interstitial ads for monetization
 */

import { registerPlugin } from '@capacitor/core';

interface HuaweiAdsPlugin {
  initialize(): Promise<{ initialized: boolean }>;
  loadRewardAd(options: { adId: string }): Promise<{ loaded: boolean; errorCode?: number }>;
  showRewardAd(): Promise<{ rewarded: boolean; rewardName?: string; rewardAmount?: number }>;
  isRewardAdLoaded(): Promise<{ loaded: boolean }>;
  loadInterstitialAd(options: { adId: string }): Promise<{ loaded: boolean; errorCode?: number }>;
  showInterstitialAd(): Promise<{ shown: boolean }>;
  isInterstitialAdLoaded(): Promise<{ loaded: boolean }>;
}

// Register the Capacitor plugin
const HuaweiAds = registerPlugin<HuaweiAdsPlugin>('HuaweiAds');

// Ad Unit IDs - Replace with your actual ad unit IDs from Huawei Petal Ads
// Get them from: https://developer.huawei.com/consumer/en/service/josp/petalAds/index.html
export const AD_UNIT_IDS = {
  // Test ad IDs (for development)
  REWARD_AD_TEST: 'testw6vs28auh3',
  INTERSTITIAL_AD_TEST: 'testb4zuon2bty',
  
  // Production ad IDs - Replace these after creating ad units in Petal Ads
  REWARD_AD: 'testw6vs28auh3', // TODO: Replace with production reward ad ID
  INTERSTITIAL_AD: 'testb4zuon2bty', // TODO: Replace with production interstitial ad ID
};

export type AdType = 'reward' | 'interstitial';

export interface AdReward {
  rewarded: boolean;
  rewardName?: string;
  rewardAmount?: number;
}

class HuaweiAdsService {
  private isInitialized = false;
  private isHuaweiDevice = false;

  /**
   * Check if running on a Huawei device
   */
  async checkHuaweiDevice(): Promise<boolean> {
    try {
      // Check if HMS Core is available
      const userAgent = navigator.userAgent.toLowerCase();
      this.isHuaweiDevice = userAgent.includes('huawei') || userAgent.includes('hms');
      return this.isHuaweiDevice;
    } catch {
      return false;
    }
  }

  /**
   * Initialize Huawei Ads SDK
   */
  async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized) return true;
      
      const result = await HuaweiAds.initialize();
      this.isInitialized = result.initialized;
      console.log('[HuaweiAds] Initialized:', this.isInitialized);
      return this.isInitialized;
    } catch (error) {
      console.error('[HuaweiAds] Initialization failed:', error);
      return false;
    }
  }

  /**
   * Load a rewarded video ad
   * Users watch a video ad and receive a reward (coins, hints, etc.)
   */
  async loadRewardAd(useTestAd = false): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      const adId = useTestAd ? AD_UNIT_IDS.REWARD_AD_TEST : AD_UNIT_IDS.REWARD_AD;
      const result = await HuaweiAds.loadRewardAd({ adId });
      console.log('[HuaweiAds] Reward ad loaded:', result.loaded);
      return result.loaded;
    } catch (error) {
      console.error('[HuaweiAds] Failed to load reward ad:', error);
      return false;
    }
  }

  /**
   * Show a rewarded video ad
   * Returns the reward if the user completed watching the ad
   */
  async showRewardAd(): Promise<AdReward> {
    try {
      const result = await HuaweiAds.showRewardAd();
      console.log('[HuaweiAds] Reward ad result:', result);
      return {
        rewarded: result.rewarded,
        rewardName: result.rewardName,
        rewardAmount: result.rewardAmount,
      };
    } catch (error) {
      console.error('[HuaweiAds] Failed to show reward ad:', error);
      return { rewarded: false };
    }
  }

  /**
   * Check if a reward ad is loaded and ready to show
   */
  async isRewardAdLoaded(): Promise<boolean> {
    try {
      const result = await HuaweiAds.isRewardAdLoaded();
      return result.loaded;
    } catch {
      return false;
    }
  }

  /**
   * Load an interstitial ad
   * Full-screen ads shown between game levels or sections
   */
  async loadInterstitialAd(useTestAd = false): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      const adId = useTestAd ? AD_UNIT_IDS.INTERSTITIAL_AD_TEST : AD_UNIT_IDS.INTERSTITIAL_AD;
      const result = await HuaweiAds.loadInterstitialAd({ adId });
      console.log('[HuaweiAds] Interstitial ad loaded:', result.loaded);
      return result.loaded;
    } catch (error) {
      console.error('[HuaweiAds] Failed to load interstitial ad:', error);
      return false;
    }
  }

  /**
   * Show an interstitial ad
   */
  async showInterstitialAd(): Promise<boolean> {
    try {
      const result = await HuaweiAds.showInterstitialAd();
      return result.shown;
    } catch (error) {
      console.error('[HuaweiAds] Failed to show interstitial ad:', error);
      return false;
    }
  }

  /**
   * Check if an interstitial ad is loaded and ready to show
   */
  async isInterstitialAdLoaded(): Promise<boolean> {
    try {
      const result = await HuaweiAds.isInterstitialAdLoaded();
      return result.loaded;
    } catch {
      return false;
    }
  }

  /**
   * Preload ads for better user experience
   * Call this when the app starts or after completing a level
   */
  async preloadAds(): Promise<void> {
    try {
      await this.initialize();
      await Promise.all([
        this.loadRewardAd(),
        this.loadInterstitialAd(),
      ]);
      console.log('[HuaweiAds] Ads preloaded');
    } catch (error) {
      console.error('[HuaweiAds] Failed to preload ads:', error);
    }
  }
}

// Singleton instance
export const huaweiAdsService = new HuaweiAdsService();
export default huaweiAdsService;
