import { usePaymentSheet } from '@/contexts/PaymentSheetContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GestureResponderEvent, Text, TouchableOpacity, ViewStyle } from 'react-native';

interface DonasiTabButtonProps {
    style?: ViewStyle;
    onPress?: (e: GestureResponderEvent) => void;
    [key: string]: unknown;
}

export default function DonasiTabButton({ style, onPress, ...otherProps }: DonasiTabButtonProps) {
    const { openPaymentSheet } = usePaymentSheet();

    const handlePress = (e: GestureResponderEvent) => {
        e.preventDefault?.();
        openPaymentSheet('zakat');
    };

    return (
        <TouchableOpacity
            onPress={handlePress}
            style={[style, {
                top: -30,
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 10,
                height: 80,
                flexDirection: 'column',
            }]}
            {...otherProps}
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
                    borderColor: '#064e3b',
                }}
                className="shadow-lg"
            >
                <MaterialCommunityIcons name="hand-coin" size={30} color="#064e3b" />
            </LinearGradient>
            <Text className="text-xs mt-1 text-amber-400 font-poppins font-medium">Donasi</Text>
        </TouchableOpacity>
    );
}
