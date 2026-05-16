/**
 * Huawei IAP (In-App Purchase) Integration
 * Full integration with Huawei AppGallery In-App Purchases
 *
 * Supported product types:
 * - Consumable (0): Can be purchased multiple times (e.g., coins, gems)
 * - Non-Consumable (1): Purchased once (e.g., ad removal)
 * - Subscription (2): Recurring billing (e.g., VIP membership)
 */

export interface IAPProduct {
  productId: string;
  price: string;
  title: string;
  description: string;
  currency: string;
  priceType: number;
  status: number;
}

export interface IAPPurchaseResult {
  success: boolean;
  purchaseToken?: string;
  inAppPurchaseData?: string;
  inAppDataSignature?: string;
}

export interface IAPPurchaseInfo {
  purchaseToken: string;
  productId: string;
  purchaseState: number;
  purchaseTime: number;
}

export type IAPType = 'consumable' | 'non_consumable' | 'subscription';

// Huawei IAP Price Type Constants
export const IAP_PRICE_TYPE = {
  CONSUMABLE: 0,
  NON_CONSUMABLE: 1,
  SUBSCRIPTION: 2,
} as const;

// Package ID to Huawei IAP Product ID mapping
// These product IDs must match exactly what you configure in AppGallery Connect
export const IAP_PRODUCT_MAP: Record<string, {
  productId: string;
  type: IAPType;
  coins: number;
  gems: number;
  defaultPrice: number;
}> = {
  '1': {
    productId: 'com.quizchampion.starter_pack',
    type: 'consumable',
    coins: 500,
    gems: 0,
    defaultPrice: 4.99,
  },
  '2': {
    productId: 'com.quizchampion.adventurer_pack',
    type: 'consumable',
    coins: 1500,
    gems: 5,
    defaultPrice: 9.99,
  },
  '3': {
    productId: 'com.quizchampion.hero_pack',
    type: 'consumable',
    coins: 3500,
    gems: 15,
    defaultPrice: 19.99,
  },
  '4': {
    productId: 'com.quizchampion.legend_pack',
    type: 'consumable',
    coins: 8000,
    gems: 40,
    defaultPrice: 39.99,
  },
  // Non-consumable: Remove Ads
  '5': {
    productId: 'com.quizchampion.remove_ads',
    type: 'non_consumable',
    coins: 0,
    gems: 0,
    defaultPrice: 2.99,
  },
  // Subscription: VIP Monthly
  '6': {
    productId: 'com.quizchampion.vip_monthly',
    type: 'subscription',
    coins: 200,
    gems: 5,
    defaultPrice: 4.99,
  },
};

class HuaweiIAPService {
  private plugin: any = null;
  private isAvailable = false;
  private products: Map<string, IAPProduct> = new Map();
  private initialized = false;

  /**
   * Initialize the Huawei IAP service
   * Must be called before any other IAP operations
   */
  async init(): Promise<boolean> {
    if (this.initialized) return this.isAvailable;

    try {
      // Check if running in Capacitor native environment
      if (typeof window !== 'undefined' && (window as any).Capacitor) {
        const { registerPlugin } = await import('@capacitor/core');
        this.plugin = registerPlugin('HuaweiIAP');

        const result = await this.plugin.isHuaweiServicesAvailable();
        this.isAvailable = result.available === true;
        console.log('Huawei IAP available:', this.isAvailable);

        if (this.isAvailable) {
          // Pre-fetch product information
          await this.fetchAllProducts();
        }
      } else {
        console.log('Not running in native environment - IAP unavailable');
        this.isAvailable = false;
      }
    } catch (error) {
      console.log('Huawei IAP init failed:', error);
      this.isAvailable = false;
    }

    this.initialized = true;
    return this.isAvailable;
  }

  get available(): boolean {
    return this.isAvailable;
  }

  get initializedStatus(): boolean {
    return this.initialized;
  }

  /**
   * Get cached product info
   */
  getProduct(productId: string): IAPProduct | undefined {
    return this.products.get(productId);
  }

  /**
   * Get all cached products
   */
  getAllProducts(): IAPProduct[] {
    return Array.from(this.products.values());
  }

  /**
   * Fetch all configured products from Huawei IAP
   */
  private async fetchAllProducts(): Promise<void> {
    try {
      // Fetch consumable products
      const consumableIds = Object.values(IAP_PRODUCT_MAP)
        .filter(p => p.type === 'consumable')
        .map(p => p.productId);

      if (consumableIds.length > 0) {
        const result = await this.getProducts(consumableIds, 'consumable');
        result.forEach(p => this.products.set(p.productId, p));
      }

      // Fetch non-consumable products
      const nonConsumableIds = Object.values(IAP_PRODUCT_MAP)
        .filter(p => p.type === 'non_consumable')
        .map(p => p.productId);

      if (nonConsumableIds.length > 0) {
        const result = await this.getProducts(nonConsumableIds, 'non_consumable');
        result.forEach(p => this.products.set(p.productId, p));
      }

      // Fetch subscription products
      const subscriptionIds = Object.values(IAP_PRODUCT_MAP)
        .filter(p => p.type === 'subscription')
        .map(p => p.productId);

      if (subscriptionIds.length > 0) {
        const result = await this.getProducts(subscriptionIds, 'subscription');
        result.forEach(p => this.products.set(p.productId, p));
      }

      console.log(`Fetched ${this.products.size} products from Huawei IAP`);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  }

  /**
   * Get product details from Huawei IAP
   */
  async getProducts(productIds: string[], type: IAPType = 'consumable'): Promise<IAPProduct[]> {
    if (!this.plugin) return [];
    try {
      const typeNum = type === 'consumable' ? IAP_PRICE_TYPE.CONSUMABLE
        : type === 'non_consumable' ? IAP_PRICE_TYPE.NON_CONSUMABLE
        : IAP_PRICE_TYPE.SUBSCRIPTION;

      const result = await this.plugin.getProducts({ productIds, type: typeNum });
      return result.products || [];
    } catch (error) {
      console.error('Failed to get products:', error);
      return [];
    }
  }

  /**
   * Purchase a product by package ID
   * Opens the Huawei payment interface
   */
  async purchase(packageId: string): Promise<IAPPurchaseResult> {
    if (!this.plugin) {
      throw new Error('IAP not available. Please ensure HMS Core is installed.');
    }

    const productInfo = IAP_PRODUCT_MAP[packageId];
    if (!productInfo) {
      throw new Error('Invalid package ID: ' + packageId);
    }

    try {
      const typeNum = productInfo.type === 'consumable' ? IAP_PRICE_TYPE.CONSUMABLE
        : productInfo.type === 'non_consumable' ? IAP_PRICE_TYPE.NON_CONSUMABLE
        : IAP_PRICE_TYPE.SUBSCRIPTION;

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

      // User-friendly error messages
      const errorMsg = error?.message || '';
      if (errorMsg.includes('cancelled')) {
        throw new Error('تم إلغاء عملية الشراء');
      } else if (errorMsg.includes('already owned')) {
        throw new Error('لقد اشتريت هذا المنتج مسبقاً');
      } else if (errorMsg.includes('login') || errorMsg.includes('HWID')) {
        throw new Error('يرجى تسجيل الدخول بحساب هواوي أولاً');
      } else if (errorMsg.includes('region') || errorMsg.includes('area')) {
        throw new Error('المشتريات غير متاحة في منطقتك حالياً');
      }

      return { success: false };
    }
  }

  /**
   * Consume a purchase (mark as consumed so it can be purchased again)
   * MUST be called for consumable products after successful delivery
   */
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

  /**
   * Get owned (unconsumed) purchases
   * Useful for checking pending purchases on app restart
   */
  async getOwnedPurchases(type: IAPType = 'consumable'): Promise<IAPPurchaseInfo[]> {
    if (!this.plugin) return [];
    try {
      const typeNum = type === 'consumable' ? IAP_PRICE_TYPE.CONSUMABLE
        : type === 'non_consumable' ? IAP_PRICE_TYPE.NON_CONSUMABLE
        : IAP_PRICE_TYPE.SUBSCRIPTION;

      const result = await this.plugin.getOwnedPurchases({ type: typeNum });
      return result.purchases || [];
    } catch (error) {
      console.error('Failed to get owned purchases:', error);
      return [];
    }
  }

  /**
   * Restore all purchases
   * Important for users who reinstall the app or switch devices
   */
  async restorePurchases(): Promise<IAPPurchaseInfo[]> {
    if (!this.plugin) return [];
    try {
      const result = await this.plugin.restorePurchases();
      return result.purchases || [];
    } catch (error) {
      console.error('Failed to restore purchases:', error);
      return [];
    }
  }

  /**
   * Handle pending purchases on app start
   * Checks for any unconsumed purchases and processes them
   */
  async handlePendingPurchases(): Promise<{ coins: number; gems: number }> {
    let totalCoins = 0;
    let totalGems = 0;

    try {
      const purchases = await this.getOwnedPurchases('consumable');
      for (const purchase of purchases) {
        // Find which package this product belongs to
        const packageEntry = Object.entries(IAP_PRODUCT_MAP).find(
          ([_, info]) => info.productId === purchase.productId
        );

        if (packageEntry) {
          const [pkgId, info] = packageEntry;
          totalCoins += info.coins;
          totalGems += info.gems;

          // Consume the purchase to allow repurchase
          if (purchase.purchaseToken) {
            await this.consumePurchase(purchase.purchaseToken);
          }
        }
      }

      if (totalCoins > 0 || totalGems > 0) {
        console.log(`Restored pending purchases: ${totalCoins} coins, ${totalGems} gems`);
      }
    } catch (error) {
      console.error('Failed to handle pending purchases:', error);
    }

    return { coins: totalCoins, gems: totalGems };
  }

  /**
   * Get the localized price for a product
   * Falls back to default price if not available from IAP
   */
  getLocalizedPrice(packageId: string): string {
    const productInfo = IAP_PRODUCT_MAP[packageId];
    if (!productInfo) return '';

    const cachedProduct = this.products.get(productInfo.productId);
    if (cachedProduct && cachedProduct.price) {
      return cachedProduct.price;
    }

    // Fallback to default price in SAR
    return `${productInfo.defaultPrice} ر.س`;
  }
}

export const huaweiIAP = new HuaweiIAPService();
