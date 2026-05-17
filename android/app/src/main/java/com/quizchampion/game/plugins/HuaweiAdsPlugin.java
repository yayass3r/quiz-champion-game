package com.quizchampion.game.plugins;

import android.app.Activity;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;

import com.huawei.hms.ads.AdParam;
import com.huawei.hms.ads.HwAds;
import com.huawei.hms.ads.InterstitialAd;
import com.huawei.hms.ads.RewardAd;
import com.huawei.hms.ads.rewarded.Reward;
import com.huawei.hms.ads.rewarded.RewardAdLoadListener;
import com.huawei.hms.ads.rewarded.RewardAdStatusListener;
import com.huawei.hms.ads.interstitial.InterstitialAdLoadListener;

@CapacitorPlugin(
    name = "HuaweiAds",
    permissions = {}
)
public class HuaweiAdsPlugin extends Plugin {
    private static final String TAG = "HuaweiAdsPlugin";
    private RewardAd rewardAd;
    private InterstitialAd interstitialAd;
    private Handler mainHandler = new Handler(Looper.getMainLooper());

    @PluginMethod
    public void initialize(PluginCall call) {
        try {
            Activity activity = getActivity();
            if (activity == null) {
                call.reject("Activity is null");
                return;
            }
            
            mainHandler.post(() -> {
                try {
                    HwAds.init(activity);
                    JSObject result = new JSObject();
                    result.put("initialized", true);
                    call.resolve(result);
                } catch (Exception e) {
                    Log.e(TAG, "Failed to initialize HwAds: " + e.getMessage());
                    call.reject("Failed to initialize HwAds: " + e.getMessage());
                }
            });
        } catch (Exception e) {
            call.reject("Failed to initialize: " + e.getMessage());
        }
    }

    @PluginMethod
    public void loadRewardAd(PluginCall call) {
        String adId = call.getString("adId", "");
        if (adId.isEmpty()) {
            call.reject("adId is required");
            return;
        }

        Activity activity = getActivity();
        if (activity == null) {
            call.reject("Activity is null");
            return;
        }

        mainHandler.post(() -> {
            try {
                rewardAd = new RewardAd(activity, adId);
                RewardAdLoadListener loadListener = new RewardAdLoadListener() {
                    @Override
                    public void onRewardAdFailedToLoad(int errorCode) {
                        Log.e(TAG, "Reward ad failed to load: " + errorCode);
                        JSObject result = new JSObject();
                        result.put("loaded", false);
                        result.put("errorCode", errorCode);
                        call.resolve(result);
                    }

                    @Override
                    public void onRewardedLoaded() {
                        Log.d(TAG, "Reward ad loaded successfully");
                        JSObject result = new JSObject();
                        result.put("loaded", true);
                        call.resolve(result);
                    }
                };
                rewardAd.loadAd(new AdParam.Builder().build(), loadListener);
            } catch (Exception e) {
                Log.e(TAG, "Failed to load reward ad: " + e.getMessage());
                call.reject("Failed to load reward ad: " + e.getMessage());
            }
        });
    }

    @PluginMethod
    public void showRewardAd(PluginCall call) {
        Activity activity = getActivity();
        if (activity == null) {
            call.reject("Activity is null");
            return;
        }

        if (rewardAd == null || !rewardAd.isLoaded()) {
            call.reject("Reward ad is not loaded");
            return;
        }

        mainHandler.post(() -> {
            try {
                rewardAd.show(activity, new RewardAdStatusListener() {
                    @Override
                    public void onRewardAdClosed() {
                        Log.d(TAG, "Reward ad closed");
                    }

                    @Override
                    public void onRewardAdFailedToShow(int errorCode) {
                        Log.e(TAG, "Reward ad failed to show: " + errorCode);
                    }

                    @Override
                    public void onRewardAdOpened() {
                        Log.d(TAG, "Reward ad opened");
                    }

                    @Override
                    public void onRewarded(Reward rewardItem) {
                        Log.d(TAG, "User earned reward: " + rewardItem.getName());
                        JSObject result = new JSObject();
                        result.put("rewarded", true);
                        result.put("rewardName", rewardItem.getName());
                        result.put("rewardAmount", rewardItem.getAmount());
                        call.resolve(result);
                    }
                });
            } catch (Exception e) {
                Log.e(TAG, "Failed to show reward ad: " + e.getMessage());
                call.reject("Failed to show reward ad: " + e.getMessage());
            }
        });
    }

    @PluginMethod
    public void isRewardAdLoaded(PluginCall call) {
        JSObject result = new JSObject();
        result.put("loaded", rewardAd != null && rewardAd.isLoaded());
        call.resolve(result);
    }

    @PluginMethod
    public void loadInterstitialAd(PluginCall call) {
        String adId = call.getString("adId", "");
        if (adId.isEmpty()) {
            call.reject("adId is required");
            return;
        }

        Activity activity = getActivity();
        if (activity == null) {
            call.reject("Activity is null");
            return;
        }

        mainHandler.post(() -> {
            try {
                interstitialAd = new InterstitialAd(activity);
                interstitialAd.setAdId(adId);
                InterstitialAdLoadListener loadListener = new InterstitialAdLoadListener() {
                    @Override
                    public void onInterstitialAdFailedToLoad(int errorCode) {
                        Log.e(TAG, "Interstitial ad failed to load: " + errorCode);
                        JSObject result = new JSObject();
                        result.put("loaded", false);
                        result.put("errorCode", errorCode);
                        call.resolve(result);
                    }

                    @Override
                    public void onInterstitialAdLoaded() {
                        Log.d(TAG, "Interstitial ad loaded successfully");
                        JSObject result = new JSObject();
                        result.put("loaded", true);
                        call.resolve(result);
                    }
                };
                interstitialAd.loadAd(new AdParam.Builder().build());
            } catch (Exception e) {
                Log.e(TAG, "Failed to load interstitial ad: " + e.getMessage());
                call.reject("Failed to load interstitial ad: " + e.getMessage());
            }
        });
    }

    @PluginMethod
    public void showInterstitialAd(PluginCall call) {
        Activity activity = getActivity();
        if (activity == null) {
            call.reject("Activity is null");
            return;
        }

        if (interstitialAd == null || !interstitialAd.isLoaded()) {
            call.reject("Interstitial ad is not loaded");
            return;
        }

        mainHandler.post(() -> {
            try {
                interstitialAd.show(activity);
                JSObject result = new JSObject();
                result.put("shown", true);
                call.resolve(result);
            } catch (Exception e) {
                Log.e(TAG, "Failed to show interstitial ad: " + e.getMessage());
                call.reject("Failed to show interstitial ad: " + e.getMessage());
            }
        });
    }

    @PluginMethod
    public void isInterstitialAdLoaded(PluginCall call) {
        JSObject result = new JSObject();
        result.put("loaded", interstitialAd != null && interstitialAd.isLoaded());
        call.resolve(result);
    }
}
