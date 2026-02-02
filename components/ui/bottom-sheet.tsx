import { cn } from '@/lib/utils';
import BottomSheetLib, {
  BottomSheetBackdrop,
  BottomSheetScrollView as BottomSheetScrollViewLib,
  BottomSheetView as BottomSheetViewLib,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import * as React from 'react';
import { Platform, Pressable, ScrollView, View } from 'react-native';
import { Text } from './text';

const BottomSheetScrollView = ({ className, ...props }: any) => {
  if (Platform.OS === 'web') {
    return <ScrollView className={cn("flex-1", className)} {...props} />;
  }
  return <BottomSheetScrollViewLib className={className} {...props} />;
};

const BottomSheetView = (props: any) => {
  if (Platform.OS === 'web') {
    return <View {...props} />;
  }
  return <BottomSheetViewLib {...props} />;
};

export { BottomSheetScrollView, BottomSheetView };

interface BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  snapPoints?: (string | number)[];
  children: React.ReactNode;
  enablePanDownToClose?: boolean;
  enableDynamicSizing?: boolean;
}

const BottomSheet = React.forwardRef<BottomSheetLib, BottomSheetProps>(
  (
    {
      open,
      onOpenChange,
      snapPoints = ['50%', '85%'],
      children,
      enablePanDownToClose = true,
      enableDynamicSizing = false,
    },
    ref
  ) => {
    const internalRef = React.useRef<BottomSheetLib>(null);
    const sheetRef = (ref as React.RefObject<BottomSheetLib>) || internalRef;

    React.useEffect(() => {
      if (open) {
        sheetRef.current?.snapToIndex(0);
      } else {
        sheetRef.current?.close();
      }
    }, [open, sheetRef]);

    const renderBackdrop = React.useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.6}
          pressBehavior="close"
        />
      ),
      []
    );

    const handleSheetChanges = React.useCallback(
      (index: number) => {
        if (index === -1) {
          onOpenChange(false);
        }
      },
      [onOpenChange]
    );

    if (Platform.OS === 'web') {
      if (!open) return null;

      return (
        <View
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60"
          // @ts-ignore - React Native Web supports onClick but types might not
          onClick={() => onOpenChange(false)}
        >
          <View
            className="w-full bg-emerald-900 rounded-t-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300 shadow-xl relative"
            // @ts-ignore
            onClick={(e: any) => e.stopPropagation()}
          >
            {/* Handle Bar */}
            <View className="w-full flex items-center pt-3 pb-2 justify-center relative">
              <View className="w-12 h-1.5 bg-white/20 rounded-full" />

              {/* Close Button */}
              <Pressable
                onPress={() => onOpenChange(false)}
                className="absolute right-4 top-3 w-8 h-8 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 active:bg-white/30 transition-colors"
                hitSlop={8}
              >
                <Text className="text-white font-bold text-lg leading-none">×</Text>
              </Pressable>
            </View>

            {children}
          </View>
        </View>
      );
    }

    return (
      <BottomSheetLib
        ref={sheetRef}
        index={-1}
        snapPoints={enableDynamicSizing ? undefined : snapPoints}
        enableDynamicSizing={enableDynamicSizing}
        enablePanDownToClose={enablePanDownToClose}
        onChange={handleSheetChanges}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: '#064e3b' }}
        handleIndicatorStyle={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
      >
        {children}
      </BottomSheetLib>
    );
  }
);

BottomSheet.displayName = 'BottomSheet';

interface BottomSheetHeaderProps {
  children?: React.ReactNode;
  className?: string;
}

function BottomSheetHeader({ children, className }: BottomSheetHeaderProps) {
  return (
    <View className={cn('px-6 pt-2 pb-4', className)}>
      {children}
    </View>
  );
}

interface BottomSheetTitleProps {
  children: React.ReactNode;
  className?: string;
}

function BottomSheetTitle({ children, className }: BottomSheetTitleProps) {
  return (
    <Text className={cn('text-xl font-bold text-foreground text-center', className)}>
      {children}
    </Text>
  );
}

interface BottomSheetContentProps {
  children: React.ReactNode;
  className?: string;
}

function BottomSheetContent({ children, className }: BottomSheetContentProps) {
  return (
    <View className={cn('px-6 pb-6', className)}>
      {children}
    </View>
  );
}

interface BottomSheetFooterProps {
  children: React.ReactNode;
  className?: string;
}

function BottomSheetFooter({ children, className }: BottomSheetFooterProps) {
  return (
    <View className={cn('px-6 pb-8 pt-4 border-t border-white/10', className)}>
      {children}
    </View>
  );
}

export {
  BottomSheet,
  BottomSheetContent,
  BottomSheetFooter,
  BottomSheetHeader,
  BottomSheetTitle
};

