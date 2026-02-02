import { Text, View } from 'react-native';

// This component is a placeholder. 
// The actual interaction is handled by the TabBar listener in _layout.tsx
// which intercepts the press and opens the payment modal.
// However, we need this file to exist for Expo Router to recognize the "donasi" route 
// and render the tab button.

export default function DonasiPlaceholder() {
    return (
        <View className="flex-1 items-center justify-center bg-emerald-900">
            <Text className="text-white">Donasi</Text>
        </View>
    );
}
