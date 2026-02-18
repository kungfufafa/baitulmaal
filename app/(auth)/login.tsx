import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text as RNText,
  TextInput as RNTextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Href, Link, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react-native';
import Logo from '@/components/Logo';
import { SafeAreaView } from 'react-native-safe-area-context';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isAndroid = Platform.OS === 'android';
const textScaleProps = isAndroid
  ? { allowFontScaling: false, maxFontSizeMultiplier: 1 as const }
  : undefined;

function Text(props: React.ComponentProps<typeof RNText>) {
  return <RNText {...textScaleProps} {...props} />;
}

function TextInput(props: React.ComponentProps<typeof RNTextInput>) {
  return <RNTextInput {...textScaleProps} {...props} />;
}

const extractErrorMessage = (error: any): string => {
  const status = error?.response?.status;
  const response = error?.response?.data;
  const validationErrors = response?.errors;

  if (status === 401) {
    return 'Email atau password salah.';
  }

  if (status === 429) {
    return 'Terlalu banyak percobaan. Silakan tunggu sebentar lalu coba lagi.';
  }

  if (!error?.response) {
    if (error?.code === 'ECONNABORTED') {
      return 'Koneksi ke server timeout. Coba lagi.';
    }
    return 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
  }

  if (validationErrors && typeof validationErrors === 'object') {
    const firstFieldErrors = Object.values(validationErrors).find(
      (fieldErrors) => Array.isArray(fieldErrors) && fieldErrors.length > 0
    ) as string[] | undefined;

    if (firstFieldErrors?.[0]) {
      return firstFieldErrors[0];
    }
  }

  if (typeof response === 'string' && response.trim().length > 0) {
    return response;
  }

  return response?.message || error?.message || 'Gagal login. Coba lagi.';
};

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isButtonDisabled = useMemo(
    () => isSubmitting || loading,
    [isSubmitting, loading],
  );

  const handleLogin = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password;

    if (!normalizedEmail || normalizedPassword.trim().length === 0) {
      Alert.alert('Validasi', 'Email dan password wajib diisi.');
      return;
    }

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      Alert.alert('Validasi', 'Format email tidak valid.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email: normalizedEmail, password: normalizedPassword });
    } catch (error: any) {
      Alert.alert('Login Gagal', extractErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-emerald-900" edges={['top', 'left', 'right', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
          className="px-6"
        >
          <View className="items-center pt-8">
            <Logo width={96} height={96} />
          </View>

          <View className="items-center mt-6 mb-10">
            <Text className="text-3xl font-bold text-white mb-2 font-poppins-bold">
              Selamat Datang
            </Text>
            <Text className="text-emerald-100 font-poppins text-center text-lg leading-8">
              Masuk untuk melanjutkan perjalanan kebaikan Anda
            </Text>
          </View>

          <View className="w-full">
            <View className="mb-5">
              <Text className="text-emerald-100 mb-2 font-poppins-medium ml-1">Email</Text>
              <View className="flex-row items-center bg-white/10 border border-white/20 rounded-2xl px-4 h-14">
                <Mail size={20} color="#D1FAE5" />
                <TextInput
                  className="flex-1 ml-3 text-white font-poppins"
                  placeholder="Masukkan email"
                  placeholderTextColor="rgba(209,250,229,0.7)"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  returnKeyType="next"
                />
              </View>
            </View>

            <View className="mb-7">
              <Text className="text-emerald-100 mb-2 font-poppins-medium ml-1">Password</Text>
              <View className="flex-row items-center bg-white/10 border border-white/20 rounded-2xl px-4 h-14">
                <Lock size={20} color="#D1FAE5" />
                <TextInput
                  className="flex-1 ml-3 text-white font-poppins"
                  placeholder="Masukkan password"
                  placeholderTextColor="rgba(209,250,229,0.7)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  textContentType="password"
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity onPress={() => setShowPassword((value) => !value)}>
                  {showPassword
                    ? <EyeOff size={20} color="#D1FAE5" />
                    : <Eye size={20} color="#D1FAE5" />}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              className="bg-emerald-400 h-14 rounded-2xl flex-row items-center justify-center shadow-lg shadow-emerald-900/50"
              onPress={handleLogin}
              disabled={isButtonDisabled}
              activeOpacity={0.85}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#022C22" />
              ) : (
                <View className="flex-row items-center justify-center">
                  <Text className="text-emerald-950 font-poppins-bold text-lg">
                    Masuk
                  </Text>
                  <ArrowRight size={20} color="#022C22" strokeWidth={2.5} style={{ marginLeft: 8 }} />
                </View>
              )}
            </TouchableOpacity>

            <View className="flex-row justify-center mt-7 mb-8">
              <Text className="text-emerald-200 font-poppins">Belum punya akun? </Text>
              <Link href={'/register' as Href} asChild>
                <TouchableOpacity>
                  <Text className="text-emerald-400 font-poppins-bold">Daftar</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
