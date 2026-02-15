import { Image, Platform } from 'react-native';

const APP_LOGO = Platform.select({
  ios: require('@/assets/images/ios_appstore_icon_1024.png'),
  android: require('@/assets/images/playstore_icon_1024.png'),
  default: require('@/assets/images/playstore_icon_1024.png'),
});

type LogoProps = {
  width?: number;
  height?: number;
};

export default function Logo({ width = 40, height = 40 }: LogoProps) {
  const radius = Math.min(width, height) * 0.2;

  return (
    <Image
      source={APP_LOGO}
      style={{ width, height, borderRadius: radius }}
      resizeMode="contain"
    />
  );
}
