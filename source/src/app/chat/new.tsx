// src/app/chat/new.tsx
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMessageBox } from '../../components/MessageBox';
import { startConversation } from '../../services/chat.api';
import { ChatStyles as styles } from '../../styles/ChatStyles';
import { COLORS } from '../../styles/GlobalStyles';

export default function NewConversationScreen() {
  const router = useRouter();
  const { showMessage, showError } = useMessageBox();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    if (!message.trim()) {
      showMessage({
        type: 'warning',
        title: 'Thiếu nội dung',
        message: 'Vui lòng nhập nội dung cần hỏi.',
      });
      return;
    }
    setLoading(true);
    try {
      const conversation = await startConversation({
        subject: subject.trim() || undefined,
        message: message.trim(),
      });
      router.replace(`/chat/${conversation.id}`);
    } catch (err: any) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.main} edges={['top', 'bottom']}>
      {/* ============ Top Bar ============ */}
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
        >
          <Text style={styles.backButtonText}>‹</Text>
        </Pressable>

        <View style={styles.heading}>
          <Text style={styles.greeting}>LIÊN HỆ SHOP</Text>
          <Text style={styles.topTitle} numberOfLines={1}>
            Tạo hội thoại mới
          </Text>
        </View>
      </View>

      {/* ============ Form ============ */}
      <ScrollView
        contentContainerStyle={styles.formWrap}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Bạn cần hỗ trợ gì?</Text>
          <Text style={styles.formSubtitle}>
            Đặt câu hỏi về sản phẩm, đơn hàng hoặc bất kỳ vấn đề gì. Shop sẽ phản hồi sớm nhất có thể.
          </Text>

          <Text style={styles.inputLabel}>Tiêu đề (không bắt buộc)</Text>
          <TextInput
            style={styles.input}
            value={subject}
            onChangeText={setSubject}
            placeholder="VD: Hỏi về Canva Pro"
            placeholderTextColor={COLORS.textSecondary}
          />

          <Text style={styles.inputLabel}>Nội dung</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            value={message}
            onChangeText={setMessage}
            placeholder="Nhập nội dung cần hỏi..."
            placeholderTextColor={COLORS.textSecondary}
            multiline
          />

          <Pressable
            style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
            onPress={handleStart}
            disabled={loading}
            accessibilityRole="button"
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.primaryBtnText}>GỬI TIN NHẮN</Text>
            )}
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.cancelBtn, pressed && styles.pressed]}
            onPress={() => router.back()}
            accessibilityRole="button"
          >
            <Text style={styles.cancelBtnText}>Huỷ</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}