import { EMERALD_900 } from '@/constants/colors';
import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { GestureResponderEvent, Text, TouchableOpacity } from 'react-native';

export default function DonasiTabButton({
    style,
    accessibilityState,
    accessibilityLabel,
    accessibilityRole,
    accessibilityHint,
    testID,
    onLongPress,
}: BottomTabBarButtonProps) {
    const router = useRouter();

    const handlePress = (e: GestureResponderEvent) => {
        e.preventDefault?.();
        router.push({
            pathname: '/donation/flow',
            params: { category: 'sedekah' },
        });
    };

    return (
        <TouchableOpacity
            onPress={handlePress}
            onLongPress={onLongPress ?? undefined}
            activeOpacity={0.9}
            accessibilityState={accessibilityState}
            accessibilityLabel={accessibilityLabel}
            accessibilityRole={accessibilityRole}
            accessibilityHint={accessibilityHint}
            testID={testID}
            style={[style, {
                top: -30,
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 10,
                height: 80,
                flexDirection: 'column',
            }]}
        >
            <LinearGradient
                colors={['#d4af37', '#f4d03f', '#d4af37']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 4,
                    borderColor: EMERALD_900,
                }}
                className="shadow-lg"
            >
                <MaterialCommunityIcons name="hand-coin" size={30} color={EMERALD_900} />
            </LinearGradient>
            <Text className="text-xs mt-1 text-amber-400 font-poppins font-medium">Donasi</Text>
        </TouchableOpacity>
    );
}
