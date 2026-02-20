import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console in development
    if (__DEV__) {
      console.error('ErrorBoundary caught an error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Component Stack:', errorInfo.componentStack);
    }

    // Store error info in state for potential reporting
    this.setState({
      error,
      errorInfo,
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <View className="flex-1 bg-emerald-900 items-center justify-center p-6">
          <MaterialCommunityIcons name="alert-circle-outline" size={64} color="#fbbf24" />
          <Text className="text-white text-xl font-poppins-bold mt-4 mb-2">
            Terjadi Kesalahan
          </Text>
          <Text className="text-white/70 text-center text-sm leading-6 mb-6">
            Maaf, aplikasi mengalami masalah tak terduga. Silakan restart aplikasi.
          </Text>
          {__DEV__ && this.state.error && (
            <View className="bg-white/10 rounded-lg p-4 w-full">
              <Text className="text-white/50 text-xs font-semibold mb-2">
                Error Details (DEV ONLY):
              </Text>
              <Text className="text-white/50 text-xs">
                {this.state.error.message}
              </Text>
              {this.state.errorInfo && (
                <Text className="text-white/30 text-xs mt-2" numberOfLines={10}>
                  {this.state.errorInfo.componentStack}
                </Text>
              )}
            </View>
          )}
        </View>
      );
    }

    return this.props.children;
  }
}
