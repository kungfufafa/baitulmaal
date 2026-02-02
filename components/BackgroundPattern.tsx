import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, Path, Pattern, Rect } from 'react-native-svg';

export default function BackgroundPattern() {
    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Svg height="100%" width="100%">
                <Defs>
                    <Pattern
                        id="pattern"
                        x="0"
                        y="0"
                        width="60"
                        height="60"
                        patternUnits="userSpaceOnUse"
                    >
                        <Path
                            d="M30 0L60 30L30 60L0 30z"
                            fill="#ffffff"
                            fillOpacity="0.03"
                        />
                    </Pattern>
                </Defs>
                <Rect x="0" y="0" width="100%" height="100%" fill="url(#pattern)" />
            </Svg>
        </View>
    );
}
