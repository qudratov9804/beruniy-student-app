import React, { Component, type ReactNode, type ErrorInfo } from 'react';
import { View, Text } from 'react-native';
import { Button } from '@/components/ui';
import { ErrorIllustration } from './illustrations';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <View className="flex-1 items-center justify-center px-6">
          <ErrorIllustration size={160} />
          <Text className="text-xl font-sans-bold text-slate-800 mt-4 mb-2">Xatolik yuz berdi</Text>
          <Text className="text-sm text-slate-500 text-center mb-6">
            Nimadir noto&apos;g&apos;ri ketdi. Sahifani yangilang.
          </Text>
          <Button onPress={() => this.setState({ hasError: false })}>Qayta urinish</Button>
        </View>
      );
    }
    return this.props.children;
  }
}
