import { cn } from '@/lib/utils';
import { TextClassContext } from '@/lib/theme';
import * as Slot from '@rn-primitives/slot';
import * as React from 'react';
import { Text as RNText, type TextProps } from 'react-native';

const Text = React.forwardRef<React.ElementRef<typeof RNText>, TextProps & { asChild?: boolean }>(
  ({ className, asChild = false, ...props }, ref) => {
    const textClass = React.useContext(TextClassContext);
    const Component = asChild ? Slot.Text : RNText;
    return (
      <Component
        className={cn(
          'text-base text-foreground web:select-text font-poppins',
          textClass,
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Text.displayName = 'Text';

export { Text };
