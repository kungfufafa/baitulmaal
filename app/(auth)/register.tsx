import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Href, Link, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, User, ArrowLeft, Eye, EyeOff, Phone } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const extractErrorMessage = (error: any): string => {
  const response = error?.response?.data;
  const validationErrors = response?.errors;

  if (validationErrors && typeof validationErrors === 'object') {
    const firstFieldErrors = Object.values(validationErrors).find(
      (fieldErrors) => Array.isArray(fieldErrors) && fieldErrors.length > 0
    ) as string[] | undefined;

    if (firstFieldErrors?.[0]) {
      return firstFieldErrors[0];
    }
  }

  return response?.message || 'Gagal membuat akun. Coba lagi.';
};

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isButtonDisabled = useMemo(
    () => isSubmitting || loading,
    [isSubmitting, loading],
  );

  const handleRegister = async () => {
    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone.trim();
    const normalizedPassword = password;
    const normalizedConfirmPassword = confirmPassword;

    if (
      !normalizedName
      || !normalizedEmail
      || normalizedPassword.trim().length === 0
      || normalizedConfirmPassword.trim().length === 0
    ) {
      Alert.alert('Validasi', 'Semua field wajib diisi.');
      return;
    }

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      Alert.alert('Validasi', 'Format email tidak valid.');
      return;
    }

    if (normalizedPassword.length < 8) {
      Alert.alert('Validasi', 'Password minimal 8 karakter.');
      return;
    }

    if (normalizedPassword !== normalizedConfirmPassword) {
      Alert.alert('Validasi', 'Konfirmasi password tidak sama.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        name: normalizedName,
        email: normalizedEmail,
        phone: normalizedPhone,
        password: normalizedPassword,
        password_confirmation: normalizedConfirmPassword,
      });
    } catch (error: any) {
      Alert.alert('Registrasi Gagal', extractErrorMessage(error));
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
          <View className="mt-4 mb-9">
            <Link href={'/login' as Href} asChild>
              <TouchableOpacity className="w-10 h-10 bg-white/10 rounded-full items-center justify-center border border-white/20 mb-6">
                <ArrowLeft size={20} color="white" />
              </TouchableOpacity>
            </Link>
            <Text className="text-3xl font-bold text-white mb-2 font-poppins-bold">
              Buat Akun
            </Text>
            <Text className="text-emerald-100 font-poppins text-lg leading-8">
              Gabung dalam komunitas kebaikan
            </Text>
          </View>

          <View className="w-full">
            <View className="mb-5">
              <Text className="text-emerald-100 mb-2 font-poppins-medium ml-1">Nama Lengkap</Text>
              <View className="flex-row items-center bg-white/10 border border-white/20 rounded-2xl px-4 h-14">
                <User size={20} color="#D1FAE5" />
                <TextInput
                  className="flex-1 ml-3 text-white font-poppins"
                  placeholder="Masukkan nama lengkap"
                  placeholderTextColor="rgba(209,250,229,0.7)"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  textContentType="name"
                  returnKeyType="next"
                />
              </View>
            </View>

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

            <View className="mb-5">
              <Text className="text-emerald-100 mb-2 font-poppins-medium ml-1">Nomor HP</Text>
              <View className="flex-row items-center bg-white/10 border border-white/20 rounded-2xl px-4 h-14">
                <Phone size={20} color="#D1FAE5" />
                <TextInput
                  className="flex-1 ml-3 text-white font-poppins"
                  placeholder="Masukkan nomor HP (contoh: 08123456789)"
                  placeholderTextColor="rgba(209,250,229,0.7)"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  textContentType="telephoneNumber"
                  returnKeyType="next"
                />
              </View>
            </View>

            <View className="mb-5">
              <Text className="text-emerald-100 mb-2 font-poppins-medium ml-1">Password</Text>
              <View className="flex-row items-center bg-white/10 border border-white/20 rounded-2xl px-4 h-14">
                <Lock size={20} color="#D1FAE5" />
                <TextInput
                  className="flex-1 ml-3 text-white font-poppins"
                  placeholder="Buat password (min. 8 karakter)"
                  placeholderTextColor="rgba(209,250,229,0.7)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  textContentType="newPassword"
                  returnKeyType="next"
                />
                <TouchableOpacity onPress={() => setShowPassword((value) => !value)}>
                  {showPassword
                    ? <EyeOff size={20} color="#D1FAE5" />
                    : <Eye size={20} color="#D1FAE5" />}
                </TouchableOpacity>
              </View>
            </View>

            <View className="mb-7">
              <Text className="text-emerald-100 mb-2 font-poppins-medium ml-1">Konfirmasi Password</Text>
              <View className="flex-row items-center bg-white/10 border border-white/20 rounded-2xl px-4 h-14">
                <Lock size={20} color="#D1FAE5" />
                <TextInput
                  className="flex-1 ml-3 text-white font-poppins"
                  placeholder="Ulangi password"
                  placeholderTextColor="rgba(209,250,229,0.7)"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  textContentType="newPassword"
                  returnKeyType="done"
                  onSubmitEditing={handleRegister}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword((value) => !value)}>
                  {showConfirmPassword
                    ? <EyeOff size={20} color="#D1FAE5" />
                    : <Eye size={20} color="#D1FAE5" />}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              className="bg-emerald-400 h-14 rounded-2xl flex-row items-center justify-center shadow-lg shadow-emerald-900/50"
              onPress={handleRegister}
              disabled={isButtonDisabled}
              activeOpacity={0.85}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#022C22" />
              ) : (
                <Text className="text-emerald-950 font-poppins-bold text-lg text-center w-full">
                  Daftar
                </Text>
              )}
            </TouchableOpacity>

            <View className="flex-row justify-center mt-7 mb-10">
              <Text className="text-emerald-200 font-poppins">Sudah punya akun? </Text>
              <Link href={'/login' as Href} asChild>
                <TouchableOpacity>
                  <Text className="text-emerald-400 font-poppins-bold">Masuk</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
