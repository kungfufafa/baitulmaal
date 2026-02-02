import { cn } from '@/lib/utils';
import * as React from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
} from 'react-native-reanimated';

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof View> {
  value?: number;
  max?: number;
  getValueLabel?: (value: number, max: number) => string;
  indicatorClassName?: string;
}

const Progress = React.forwardRef<React.ElementRef<typeof View>, ProgressProps>(
  (
    {
      className,
      value = 0,
      max = 100,
      getValueLabel,
      indicatorClassName,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(Math.max(0, (value / max) * 100), 100);

    const animatedWidth = useDerivedValue(() => {
      return withSpring(percentage, {
        damping: 15,
        stiffness: 100,
      });
    }, [percentage]);

    const animatedStyle = useAnimatedStyle(() => {
      return {
        width: `${animatedWidth.value}%`,
      };
    });

    return (
      <View
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={getValueLabel?.(value, max)}
        className={cn(
          'relative h-4 w-full overflow-hidden rounded-full bg-secondary',
          className
        )}
        {...props}
      >
        <Animated.View
          style={animatedStyle}
          className={cn('h-full bg-primary rounded-full', indicatorClassName)}
        />
      </View>
    );
  }
);
Progress.displayName = 'Progress';

export { Progress };
export type { ProgressProps };
