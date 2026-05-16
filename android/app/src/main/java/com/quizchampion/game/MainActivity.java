package com.quizchampion.game;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.quizchampion.game.plugins.HuaweiIAPPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(HuaweiIAPPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
