package com.quizchampion.game.plugins;

import android.app.Activity;
import android.content.Intent;
import android.util.Log;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import com.huawei.hms.common.ApiException;
import com.huawei.hms.iap.Iap;
import com.huawei.hms.iap.IapApiException;
import com.huawei.hms.iap.IapClient;
import com.huawei.hms.iap.entity.OrderStatusCode;
import com.huawei.hms.iap.entity.ProductInfo;
import com.huawei.hms.iap.entity.ProductInfoReq;
import com.huawei.hms.iap.entity.ProductInfoResult;
import com.huawei.hms.iap.entity.PurchaseIntentReq;
import com.huawei.hms.iap.entity.PurchaseResultInfo;
import com.huawei.hms.iap.entity.ConsumeOwnedPurchaseReq;
import com.huawei.hms.iap.entity.OwnedPurchasesReq;
import com.huawei.hms.iap.entity.OwnedPurchasesResult;
import com.huawei.hms.support.api.client.Status;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

@CapacitorPlugin(name = "HuaweiIAP")
public class HuaweiIAPPlugin extends Plugin {
    private static final String TAG = "HuaweiIAP";
    private static final int PURCHASE_REQUEST_CODE = 10001;
    private IapClient iapClient;
    private PluginCall savedPurchaseCall;

    @Override
    public void load() {
        super.load();
        try {
            iapClient = Iap.getIapClient(getActivity());
            Log.i(TAG, "Huawei IAP Client initialized successfully");
        } catch (Exception e) {
            Log.e(TAG, "Failed to init IAP Client: " + e.getMessage());
        }
    }

    /**
     * Check if Huawei Mobile Services are available on the device
     */
    @PluginMethod
    public void isHuaweiServicesAvailable(PluginCall call) {
        JSObject result = new JSObject();
        try {
            if (iapClient != null) {
                boolean isAvailable = true;
                result.put("available", isAvailable);
                result.put("message", "HMS Services available");
            } else {
                result.put("available", false);
                result.put("message", "IAP Client not initialized");
            }
        } catch (Exception e) {
            result.put("available", false);
            result.put("message", "HMS check failed: " + e.getMessage());
        }
        call.resolve(result);
    }

    /**
     * Fetch product details from Huawei IAP
     * Returns product info including localized price, title, description
     */
    @PluginMethod
    public void getProducts(PluginCall call) {
        if (iapClient == null) {
            call.reject("IAP not initialized. Make sure HMS Core is available.");
            return;
        }
        try {
            JSONArray idsArray = call.getArray("productIds");
            List<String> productIdList = new ArrayList<>();
            for (int i = 0; i < idsArray.length(); i++) {
                productIdList.add(idsArray.getString(i));
            }
            int priceType = call.getInt("type", 0);

            ProductInfoReq req = new ProductInfoReq();
            req.setProductIds(new ArrayList<>(productIdList));
            req.setPriceType(priceType);

            iapClient.obtainProductInfo(req).addOnSuccessListener(productInfoResult -> {
                JSObject response = new JSObject();
                JSArray products = new JSArray();
                try {
                    if (productInfoResult.getProductInfoList() != null) {
                        for (ProductInfo productInfo : productInfoResult.getProductInfoList()) {
                            JSObject product = new JSObject();
                            product.put("productId", productInfo.getProductId());
                            product.put("price", productInfo.getPrice());
                            product.put("title", productInfo.getProductName());
                            product.put("description", productInfo.getProductDesc());
                            product.put("currency", productInfo.getCurrency());
                            product.put("priceType", productInfo.getPriceType());
                            product.put("status", productInfo.getStatus());
                            products.put(product);
                        }
                    }
                } catch (Exception e) {
                    Log.e(TAG, "Error parsing products: " + e.getMessage());
                }
                response.put("products", products);
                call.resolve(response);
            }).addOnFailureListener(e -> {
                if (e instanceof IapApiException) {
                    IapApiException iapException = (IapApiException) e;
                    Log.e(TAG, "getProducts failed, status: " + iapException.getStatus());
                    call.reject("Failed to get products (HMS Error " + iapException.getStatusCode() + "): " + iapException.getMessage());
                } else {
                    call.reject("Failed to get products: " + e.getMessage());
                }
            });
        } catch (Exception e) {
            call.reject("Error getting products: " + e.getMessage());
        }
    }

    /**
     * Initiate a purchase for a product
     * Opens the Huawei payment UI
     */
    @PluginMethod
    public void purchase(PluginCall call) {
        if (iapClient == null) {
            call.reject("IAP not initialized. Make sure HMS Core is available.");
            return;
        }
        try {
            String productId = call.getString("productId");
            int priceType = call.getInt("type", 0);

            if (productId == null || productId.isEmpty()) {
                call.reject("productId is required");
                return;
            }

            PurchaseIntentReq req = new PurchaseIntentReq();
            req.setProductId(productId);
            req.setPriceType(priceType);
            req.setDeveloperPayload("quizchampion_" + System.currentTimeMillis());

            savedPurchaseCall = call;

            iapClient.createPurchaseIntent(req).addOnSuccessListener(result -> {
                Status status = result.getStatus();
                if (status.hasResolution()) {
                    try {
                        status.startResolutionForResult(getActivity(), PURCHASE_REQUEST_CODE);
                    } catch (Exception e) {
                        Log.e(TAG, "Failed to start purchase resolution: " + e.getMessage());
                        call.reject("Failed to start purchase UI: " + e.getMessage());
                        savedPurchaseCall = null;
                    }
                } else {
                    int statusCode = status.getStatusCode();
                    String errorMsg = "Purchase cannot proceed (status: " + statusCode + ")";
                    if (statusCode == OrderStatusCode.ORDER_HWID_NOT_LOGIN) {
                        errorMsg = "Please login to your Huawei ID first";
                    } else if (statusCode == OrderStatusCode.ORDER_ACCOUNT_AREA_NOT_SUPPORTED) {
                        errorMsg = "IAP is not supported in your region";
                    }
                    call.reject(errorMsg);
                    savedPurchaseCall = null;
                }
            }).addOnFailureListener(e -> {
                Log.e(TAG, "createPurchaseIntent failed: " + e.getMessage());
                if (e instanceof IapApiException) {
                    IapApiException iapException = (IapApiException) e;
                    call.reject("Purchase initiation failed (HMS Error " + iapException.getStatusCode() + "): " + iapException.getMessage());
                } else {
                    call.reject("Failed to create purchase: " + e.getMessage());
                }
                savedPurchaseCall = null;
            });
        } catch (Exception e) {
            call.reject("Error starting purchase: " + e.getMessage());
            savedPurchaseCall = null;
        }
    }

    /**
     * Handle purchase result from Huawei payment UI
     */
    @Override
    public void handleOnActivityResult(int requestCode, int resultCode, Intent data) {
        super.handleOnActivityResult(requestCode, resultCode, data);
        if (requestCode == PURCHASE_REQUEST_CODE && savedPurchaseCall != null) {
            PluginCall call = savedPurchaseCall;
            savedPurchaseCall = null;

            if (resultCode == Activity.RESULT_OK && data != null) {
                try {
                    PurchaseResultInfo purchaseResultInfo = Iap.getIapClient(getActivity())
                            .parsePurchaseResultInfoFromIntent(data);
                    int returnCode = purchaseResultInfo.getReturnCode();

                    if (returnCode == OrderStatusCode.ORDER_STATE_SUCCESS) {
                        JSObject result = new JSObject();
                        result.put("success", true);
                        result.put("inAppPurchaseData", purchaseResultInfo.getInAppPurchaseData());
                        result.put("inAppDataSignature", purchaseResultInfo.getInAppDataSignature());
                        String purchaseData = purchaseResultInfo.getInAppPurchaseData();
                        result.put("purchaseToken", extractPurchaseToken(purchaseData));
                        call.resolve(result);
                    } else if (returnCode == OrderStatusCode.ORDER_STATE_CANCEL) {
                        call.reject("Purchase cancelled by user");
                    } else if (returnCode == OrderStatusCode.ORDER_PRODUCT_OWNED) {
                        call.reject("Product already owned. Please consume it first.");
                    } else if (returnCode == OrderStatusCode.ORDER_STATE_FAILED) {
                        call.reject("Purchase failed");
                    } else {
                        call.reject("Purchase failed with code: " + returnCode);
                    }
                } catch (Exception e) {
                    Log.e(TAG, "Error parsing purchase result: " + e.getMessage());
                    call.reject("Error parsing purchase result: " + e.getMessage());
                }
            } else {
                call.reject("Purchase cancelled or failed");
            }
        }
    }

    /**
     * Consume a purchase (mark it as consumed so it can be purchased again)
     * Required for consumable products
     */
    @PluginMethod
    public void consumePurchase(PluginCall call) {
        if (iapClient == null) {
            call.reject("IAP not initialized");
            return;
        }
        try {
            String purchaseToken = call.getString("purchaseToken");
            if (purchaseToken == null || purchaseToken.isEmpty()) {
                call.reject("purchaseToken is required");
                return;
            }

            ConsumeOwnedPurchaseReq req = new ConsumeOwnedPurchaseReq();
            req.setPurchaseToken(purchaseToken);
            req.setDeveloperChallenge("quizchampion_consume_" + System.currentTimeMillis());

            iapClient.consumeOwnedPurchase(req).addOnSuccessListener(result -> {
                JSObject response = new JSObject();
                response.put("consumed", true);
                call.resolve(response);
            }).addOnFailureListener(e -> {
                Log.e(TAG, "Consume failed: " + e.getMessage());
                if (e instanceof IapApiException) {
                    IapApiException iapException = (IapApiException) e;
                    call.reject("Consume failed (HMS Error " + iapException.getStatusCode() + "): " + iapException.getMessage());
                } else {
                    call.reject("Failed to consume purchase: " + e.getMessage());
                }
            });
        } catch (Exception e) {
            call.reject("Error consuming purchase: " + e.getMessage());
        }
    }

    /**
     * Get list of owned (unconsumed) purchases
     * Useful for restoring purchases
     */
    @PluginMethod
    public void getOwnedPurchases(PluginCall call) {
        if (iapClient == null) {
            call.reject("IAP not initialized");
            return;
        }
        try {
            int priceType = call.getInt("type", 0);
            OwnedPurchasesReq req = new OwnedPurchasesReq();
            req.setPriceType(priceType);

            iapClient.obtainOwnedPurchases(req).addOnSuccessListener(result -> {
                JSObject response = new JSObject();
                JSArray purchases = new JSArray();
                try {
                    if (result.getInAppPurchaseDataList() != null) {
                        for (String purchaseData : result.getInAppPurchaseDataList()) {
                            try {
                                JSONObject purchaseJson = new JSONObject(purchaseData);
                                JSObject purchase = new JSObject();
                                purchase.put("purchaseToken", purchaseJson.optString("purchaseToken", ""));
                                purchase.put("productId", purchaseJson.optString("productId", ""));
                                purchase.put("purchaseState", purchaseJson.optInt("purchaseState", 0));
                                purchase.put("purchaseTime", purchaseJson.optLong("purchaseTime", 0));
                                purchase.put("developerPayload", purchaseJson.optString("developerPayload", ""));
                                purchases.put(purchase);
                            } catch (Exception e) {
                                Log.w(TAG, "Failed to parse purchase data: " + e.getMessage());
                            }
                        }
                    }
                } catch (Exception e) {
                    Log.e(TAG, "Error parsing owned purchases: " + e.getMessage());
                }
                response.put("purchases", purchases);
                call.resolve(response);
            }).addOnFailureListener(e -> {
                Log.e(TAG, "getOwnedPurchases failed: " + e.getMessage());
                if (e instanceof IapApiException) {
                    IapApiException iapException = (IapApiException) e;
                    call.reject("Failed to get owned purchases (HMS Error " + iapException.getStatusCode() + "): " + iapException.getMessage());
                } else {
                    call.reject("Failed to get owned purchases: " + e.getMessage());
                }
            });
        } catch (Exception e) {
            call.reject("Error getting owned purchases: " + e.getMessage());
        }
    }

    /**
     * Restore all consumable purchases that haven't been consumed
     */
    @PluginMethod
    public void restorePurchases(PluginCall call) {
        if (iapClient == null) {
            call.reject("IAP not initialized");
            return;
        }
        try {
            OwnedPurchasesReq req = new OwnedPurchasesReq();
            req.setPriceType(0); // consumable

            iapClient.obtainOwnedPurchases(req).addOnSuccessListener(result -> {
                JSObject response = new JSObject();
                JSArray restoredPurchases = new JSArray();
                int unconsumedCount = 0;

                try {
                    if (result.getInAppPurchaseDataList() != null) {
                        for (String purchaseData : result.getInAppPurchaseDataList()) {
                            try {
                                JSONObject purchaseJson = new JSONObject(purchaseData);
                                String purchaseToken = purchaseJson.optString("purchaseToken", "");
                                String productId = purchaseJson.optString("productId", "");

                                JSObject purchase = new JSObject();
                                purchase.put("purchaseToken", purchaseToken);
                                purchase.put("productId", productId);
                                purchase.put("purchaseState", purchaseJson.optInt("purchaseState", 0));
                                restoredPurchases.put(purchase);
                                unconsumedCount++;
                            } catch (Exception e) {
                                Log.w(TAG, "Failed to parse purchase: " + e.getMessage());
                            }
                        }
                    }
                } catch (Exception e) {
                    Log.e(TAG, "Error in restore: " + e.getMessage());
                }

                response.put("purchases", restoredPurchases);
                response.put("count", unconsumedCount);
                call.resolve(response);
            }).addOnFailureListener(e -> {
                call.reject("Failed to restore purchases: " + e.getMessage());
            });
        } catch (Exception e) {
            call.reject("Error restoring purchases: " + e.getMessage());
        }
    }

    /**
     * Extract purchaseToken from JSON purchase data
     */
    private String extractPurchaseToken(String purchaseData) {
        try {
            JSONObject json = new JSONObject(purchaseData);
            return json.optString("purchaseToken", "");
        } catch (Exception e) {
            Log.e(TAG, "Failed to extract purchaseToken: " + e.getMessage());
            return "";
        }
    }
}
