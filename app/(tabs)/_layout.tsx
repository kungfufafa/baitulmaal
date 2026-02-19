import DonasiTabButton from '@/components/DonasiTabButton';
import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function TabBarIcon({ name, label, focused }: { name: keyof typeof Feather.glyphMap; label: string; focused: boolean }) {
    return (
        <View className="items-center justify-center">
            <Feather name={name} size={24} color={focused ? '#fbbf24' : 'rgba(255, 255, 255, 0.7)'} />
            <Text
                className={`text-[10px] mt-1 font-poppins ${focused ? 'text-amber-400 font-medium' : 'text-white/70'
                    }`}
                numberOfLines={1}
                allowFontScaling={Platform.OS !== 'android'}
                maxFontSizeMultiplier={Platform.OS === 'android' ? 1 : undefined}
            >
                {label}
            </Text>
        </View>
    );
}

export default function TabLayout() {
    const insets = useSafeAreaInsets();
    const baseHeight = Platform.OS === 'ios' ? 60 : 56;
    const bottomInset = Math.max(insets.bottom, Platform.OS === 'ios' ? 28 : 12);
    const tabBarHeight = baseHeight + bottomInset;

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#064e3b',
                    borderTopColor: 'rgba(4, 120, 87, 0.5)',
                    height: tabBarHeight,
                    paddingBottom: bottomInset,
                    paddingTop: 8,
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    elevation: 0,
                    overflow: 'visible',
                },
                tabBarShowLabel: false,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Beranda',
                    tabBarIcon: ({ focused }) => <TabBarIcon name="home" label="Beranda" focused={focused} />,
                }}
            />
            <Tabs.Screen
                name="quran"
                options={{
                    title: 'Al-Quran',
                    tabBarIcon: ({ focused }) => <TabBarIcon name="book-open" label="Al-Quran" focused={focused} />,
                }}
            />
            <Tabs.Screen
                name="quran/[surah]"
                options={{
                    href: null,
                    tabBarStyle: { display: 'none' },
                }}
            />
            <Tabs.Screen
                name="donasi"
                listeners={{
                    tabPress: (event) => {
                        event.preventDefault();
                    },
                }}
                options={{
                    title: 'Donasi',
                    tabBarButton: (props) => <DonasiTabButton {...props} />,
                }}
            />
            <Tabs.Screen
                name="doa"
                options={{
                    title: 'Doa',
                    tabBarIcon: ({ focused }) => <TabBarIcon name="heart" label="Doa" focused={focused} />,
                }}
            />
            <Tabs.Screen
                name="history"
                options={{
                    title: 'Riwayat',
                    tabBarIcon: ({ focused }) => <TabBarIcon name="clipboard" label="Riwayat" focused={focused} />,
                }}
            />
        </Tabs>
    );
}
