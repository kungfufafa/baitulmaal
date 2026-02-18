import { cn } from '@/lib/utils';
import { Text } from '@/components/ui/text';
import * as React from 'react';
import { Platform, TextInput, type TextInputProps, View } from 'react-native';

const Input = React.forwardRef<React.ElementRef<typeof TextInput>, TextInputProps>(
  ({ className, placeholderTextColor, allowFontScaling, maxFontSizeMultiplier, ...props }, ref) => {
    return (
      <TextInput
        ref={ref}
        className={cn(
          'web:flex h-10 native:h-12 w-full rounded-md border border-input bg-background px-3 web:py-2 text-base lg:text-sm native:text-lg native:leading-[1.25] text-foreground placeholder:text-muted-foreground web:ring-offset-background file:border-0 file:bg-transparent file:font-medium web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2',
          props.editable === false && 'opacity-50 web:cursor-not-allowed',
          className
        )}
        placeholderTextColor={placeholderTextColor ?? 'hsl(164 40% 70%)'}
        allowFontScaling={
          allowFontScaling
          ?? (Platform.OS === 'android' ? false : undefined)
        }
        maxFontSizeMultiplier={
          maxFontSizeMultiplier
          ?? (Platform.OS === 'android' ? 1 : undefined)
        }
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

interface InputWithLabelProps extends TextInputProps {
  label?: string;
  labelClassName?: string;
  containerClassName?: string;
}

const InputWithLabel = React.forwardRef<React.ElementRef<typeof TextInput>, InputWithLabelProps>(
  ({ label, labelClassName, containerClassName, className, ...props }, ref) => {
    return (
      <View className={cn('gap-1.5', containerClassName)}>
        {label && (
          <View className="flex-row">
            <Text className={cn('text-sm font-medium text-foreground', labelClassName)}>
              {label}
            </Text>
          </View>
        )}
        <Input ref={ref} className={className} {...props} />
      </View>
    );
  }
);
InputWithLabel.displayName = 'InputWithLabel';

export { Input, InputWithLabel };
