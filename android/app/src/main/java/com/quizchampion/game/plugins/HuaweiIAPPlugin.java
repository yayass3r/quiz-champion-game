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

import com.huawei.hms.iap.Iap;
import com.huawei.hms.iap.IapClient;
import com.huawei.hms.iap.entity.OrderStatusCode;
import com.huawei.hms.iap.entity.ProductInfoReq;
import com.huawei.hms.iap.entity.PurchaseIntentReq;
import com.huawei.hms.iap.entity.PurchaseResultInfo;
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
            Log.i(TAG, "Huawei IAP Client initialized");
        } catch (Exception e) {
            Log.e(TAG, "Failed to init IAP: " + e.getMessage());
        }
    }

    @PluginMethod
    public void isHuaweiServicesAvailable(PluginCall call) {
        JSObject result = new JSObject();
        result.put("available", iapClient != null);
        call.resolve(result);
    }

    @PluginMethod
    public void getProducts(PluginCall call) {
        if (iapClient == null) {
            call.reject("IAP not initialized");
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
            // Use setProductIdList properly for HMS IAP
            req.setProductIds(new ArrayList<>(productIdList));
            req.setPriceType(priceType);

            iapClient.obtainProductInfo(req).addOnSuccessListener(result -> {
                JSObject response = new JSObject();
                JSArray products = new JSArray();
                try {
                    if (result.getProductInfoList() != null) {
                        for (Object item : result.getProductInfoList()) {
                            products.put(item.toString());
                        }
                    }
                } catch (Exception e) {
                    Log.e(TAG, "Error parsing products: " + e.getMessage());
                }
                response.put("products", products);
                call.resolve(response);
            }).addOnFailureListener(e -> {
                call.reject("Failed to get products: " + e.getMessage());
            });
        } catch (Exception e) {
            call.reject("Error: " + e.getMessage());
        }
    }

    @PluginMethod
    public void purchase(PluginCall call) {
        if (iapClient == null) {
            call.reject("IAP not initialized");
            return;
        }
        try {
            String productId = call.getString("productId");
            int priceType = call.getInt("type", 0);

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
                        call.reject("Failed to start purchase: " + e.getMessage());
                    }
                } else {
                    call.reject("Purchase cannot proceed");
                }
            }).addOnFailureListener(e -> {
                call.reject("Failed to create purchase: " + e.getMessage());
            });
        } catch (Exception e) {
            call.reject("Error: " + e.getMessage());
        }
    }

    @Override
    public void handleOnActivityResult(int requestCode, int resultCode, Intent data) {
        super.handleOnActivityResult(requestCode, resultCode, data);
        if (requestCode == PURCHASE_REQUEST_CODE && savedPurchaseCall != null) {
            PluginCall call = savedPurchaseCall;
            savedPurchaseCall = null;
            
            if (resultCode == Activity.RESULT_OK && data != null) {
                try {
                    PurchaseResultInfo purchaseResultInfo = Iap.getIapClient(getActivity()).parsePurchaseResultInfoFromIntent(data);
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
                        call.reject("Purchase cancelled");
                    } else {
                        call.reject("Purchase failed: " + returnCode);
                    }
                } catch (Exception e) {
                    call.reject("Error parsing result: " + e.getMessage());
                }
            } else {
                call.reject("Purchase cancelled or failed");
            }
        }
    }

    @PluginMethod
    public void consumePurchase(PluginCall call) {
        if (iapClient == null) {
            call.reject("IAP not initialized");
            return;
        }
        try {
            String purchaseToken = call.getString("purchaseToken");
            com.huawei.hms.iap.entity.ConsumeOwnedPurchaseReq req = new com.huawei.hms.iap.entity.ConsumeOwnedPurchaseReq();
            req.setPurchaseToken(purchaseToken);

            iapClient.consumeOwnedPurchase(req).addOnSuccessListener(result -> {
                JSObject response = new JSObject();
                response.put("consumed", true);
                call.resolve(response);
            }).addOnFailureListener(e -> {
                call.reject("Failed to consume: " + e.getMessage());
            });
        } catch (Exception e) {
            call.reject("Error: " + e.getMessage());
        }
    }

    @PluginMethod
    public void getOwnedPurchases(PluginCall call) {
        if (iapClient == null) {
            call.reject("IAP not initialized");
            return;
        }
        try {
            int priceType = call.getInt("type", 0);
            com.huawei.hms.iap.entity.OwnedPurchasesReq req = new com.huawei.hms.iap.entity.OwnedPurchasesReq();
            req.setPriceType(priceType);

            iapClient.obtainOwnedPurchases(req).addOnSuccessListener(result -> {
                JSObject response = new JSObject();
                JSArray purchases = new JSArray();
                try {
                    if (result.getInAppPurchaseDataList() != null) {
                        for (Object item : result.getInAppPurchaseDataList()) {
                            purchases.put(item.toString());
                        }
                    }
                } catch (Exception e) {
                    Log.e(TAG, "Error parsing purchases: " + e.getMessage());
                }
                response.put("purchases", purchases);
                call.resolve(response);
            }).addOnFailureListener(e -> {
                call.reject("Failed to get owned purchases: " + e.getMessage());
            });
        } catch (Exception e) {
            call.reject("Error: " + e.getMessage());
        }
    }

    private String extractPurchaseToken(String purchaseData) {
        try {
            JSONObject json = new JSONObject(purchaseData);
            return json.optString("purchaseToken", "");
        } catch (Exception e) {
            return "";
        }
    }
}
