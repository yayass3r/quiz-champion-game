/**
 * Huawei IAP (In-App Purchase) Integration
 * This module handles communication between the web app and the Huawei IAP native plugin.
 */

export interface IAPProduct {
  productId: string;
  price: string;
  title: string;
  description: string;
  currency: string;
}

export interface IAPPurchaseResult {
  success: boolean;
  purchaseToken?: string;
  inAppPurchaseData?: string;
  inAppDataSignature?: string;
}

export type IAPType = 'consumable' | 'non_consumable' | 'subscription';

// Package ID to Huawei IAP Product ID mapping
export const IAP_PRODUCT_MAP: Record<string, { productId: string; type: IAPType; coins: number; gems: number }> = {
  '1': { productId: 'com.quizchampion.starter_pack', type: 'consumable', coins: 500, gems: 0 },
  '2': { productId: 'com.quizchampion.adventurer_pack', type: 'consumable', coins: 1500, gems: 5 },
  '3': { productId: 'com.quizchampion.hero_pack', type: 'consumable', coins: 3500, gems: 15 },
  '4': { productId: 'com.quizchampion.legend_pack', type: 'consumable', coins: 8000, gems: 40 },
};

class HuaweiIAPService {
  private plugin: any = null;
  private isAvailable = false;

  async init(): Promise<boolean> {
    try {
      // Check if running in Capacitor native environment
      if (typeof window !== 'undefined' && (window as any).Capacitor) {
        const { registerPlugin } = await import('@capacitor/core');
        this.plugin = registerPlugin('HuaweiIAP');
        
        const result = await this.plugin.isHuaweiServicesAvailable();
        this.isAvailable = result.available === true;
        console.log('Huawei IAP available:', this.isAvailable);
        return this.isAvailable;
      }
      console.log('Not running in native environment');
      return false;
    } catch (error) {
      console.log('Huawei IAP init failed:', error);
      this.isAvailable = false;
      return false;
    }
  }

  get available(): boolean {
    return this.isAvailable;
  }

  async getProducts(productIds: string[], type: IAPType = 'consumable'): Promise<IAPProduct[]> {
    if (!this.plugin) return [];
    try {
      const typeNum = type === 'consumable' ? 0 : type === 'non_consumable' ? 1 : 2;
      const result = await this.plugin.getProducts({ productIds, type: typeNum });
      return result.products || [];
    } catch (error) {
      console.error('Failed to get products:', error);
      return [];
    }
  }

  async purchase(packageId: string): Promise<IAPPurchaseResult> {
    if (!this.plugin) {
      throw new Error('IAP not available');
    }
    try {
      const productInfo = IAP_PRODUCT_MAP[packageId];
      if (!productInfo) throw new Error('Invalid package');

      const typeNum = productInfo.type === 'consumable' ? 0 : productInfo.type === 'non_consumable' ? 1 : 2;
      const result = await this.plugin.purchase({
        productId: productInfo.productId,
        type: typeNum,
      });

      return {
        success: true,
        purchaseToken: result.purchaseToken,
        inAppPurchaseData: result.inAppPurchaseData,
        inAppDataSignature: result.inAppDataSignature,
      };
    } catch (error: any) {
      console.error('Purchase failed:', error);
      return { success: false };
    }
  }

  async consumePurchase(purchaseToken: string): Promise<boolean> {
    if (!this.plugin) return false;
    try {
      const result = await this.plugin.consumePurchase({ purchaseToken });
      return result.consumed === true;
    } catch (error) {
      console.error('Consume failed:', error);
      return false;
    }
  }

  async getOwnedPurchases(type: IAPType = 'consumable'): Promise<any[]> {
    if (!this.plugin) return [];
    try {
      const typeNum = type === 'consumable' ? 0 : type === 'non_consumable' ? 1 : 2;
      const result = await this.plugin.getOwnedPurchases({ type: typeNum });
      return result.purchases || [];
    } catch (error) {
      console.error('Failed to get owned purchases:', error);
      return [];
    }
  }
}

export const huaweiIAP = new HuaweiIAPService();
