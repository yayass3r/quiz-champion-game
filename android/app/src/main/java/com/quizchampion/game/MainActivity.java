package com.quizchampion.game;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.quizchampion.game.plugins.HuaweiIAPPlugin;
import com.quizchampion.game.plugins.HuaweiAdsPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(HuaweiIAPPlugin.class);
        registerPlugin(HuaweiAdsPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
