import Svg, { Circle } from 'react-native-svg';

export default function Logo({ width = 40, height = 40 }: { width?: number; height?: number }) {
    return (
        <Svg width={width} height={height} viewBox="0 0 40 40">
            <Circle cx={20} cy={20} r={16} fill="#fbbf24" />
            <Circle cx={17} cy={20} r={12} fill="#064e3b" />
        </Svg>
    );
}
