import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMessageBox } from '../../components/MessageBox';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, GlobalStyles } from '../../styles/GlobalStyles';
import { validateLogin } from '../../utils/validation';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const { showMessage, showError } = useMessageBox();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<'email' | 'password' | null>(null);

  const handleLogin = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    // Kiểm tra định dạng ngay trên app trước khi gọi server
    const invalid = validateLogin(normalizedEmail, password);
    if (invalid) {
      showMessage({ type: 'warning', title: invalid.title, message: invalid.message });
      return;
    }

    setLoading(true);
    try {
      await login(normalizedEmail, password);
      router.replace('/');
    } catch (error) {
      // Lỗi từ server: sai mật khẩu, email chưa đăng ký, mất kết nối...
      const message = error instanceof Error ? error.message : 'Đăng nhập thất bại.';
      showError(message, 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={GlobalStyles.screen} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={GlobalStyles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={GlobalStyles.authContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={GlobalStyles.logoArea}>
            <View style={GlobalStyles.cartCircle}>
              <Text style={GlobalStyles.cartIcon}>🛒</Text>
            </View>
            <Text style={GlobalStyles.logoText}>DIGITAL RESOURCES</Text>
            <Text style={GlobalStyles.logoSubText}>Kho tài nguyên số dành cho bạn</Text>
          </View>

          <View style={GlobalStyles.box}>
            <Text style={GlobalStyles.title}>Chào mừng trở lại</Text>
            <Text style={GlobalStyles.subtitle}>
              Đăng nhập để tiếp tục khám phá kho tài nguyên số.
            </Text>

            <Text style={GlobalStyles.inputLabel}>Email</Text>
            <TextInput
              style={[GlobalStyles.input, focused === 'email' && GlobalStyles.inputFocused]}
              placeholder="you@example.com"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused(null)}
              editable={!loading}
            />

            <Text style={GlobalStyles.inputLabel}>Mật khẩu</Text>
            <TextInput
              style={[GlobalStyles.input, focused === 'password' && GlobalStyles.inputFocused]}
              placeholder="Nhập mật khẩu"
              placeholderTextColor={COLORS.textMuted}
              secureTextEntry
              autoComplete="password"
              textContentType="password"
              returnKeyType="done"
              value={password}
              onChangeText={setPassword}
              onFocus={() => setFocused('password')}
              onBlur={() => setFocused(null)}
              onSubmitEditing={handleLogin}
              editable={!loading}
            />

            <Pressable
              style={({ pressed }) => [GlobalStyles.button, pressed && GlobalStyles.buttonPressed]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={GlobalStyles.buttonText}>Đăng nhập</Text>
              )}
            </Pressable>

            <Pressable
              onPress={() =>
                showMessage({ type: 'info', title: 'Thông báo', message: 'Chức năng đang được phát triển.' })
              }
              disabled={loading}
            >
              <Text style={GlobalStyles.forgot}>Quên mật khẩu?</Text>
            </Pressable>

            <View style={GlobalStyles.bottomRow}>
              <Text style={GlobalStyles.normalText}>Chưa có tài khoản?</Text>
              <Pressable onPress={() => router.push('/auth/register')} disabled={loading}>
                <Text style={GlobalStyles.linkText}> Đăng ký ngay</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
