import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (__DEV__) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <View className="flex-1 bg-emerald-900 items-center justify-center p-6">
          <MaterialCommunityIcons name="alert-circle-outline" size={64} color="#fbbf24" />
          <Text className="text-white text-xl font-poppins-bold mt-4 mb-2">
            Terjadi Kesalahan
          </Text>
          <Text className="text-white/70 text-center text-sm leading-6 mb-6">
            Maaf, aplikasi mengalami masalah. Silakan restart aplikasi.
          </Text>
          {__DEV__ && this.state.error && (
            <Text className="text-white/50 text-xs text-center">
              {this.state.error.message}
            </Text>
          )}
        </View>
      );
    }

    return this.props.children;
  }
}
