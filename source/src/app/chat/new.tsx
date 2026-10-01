// src/app/chat/new.tsx
// File MỚI HOÀN TOÀN.
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useMessageBox } from '../../components/MessageBox';
import { startConversation } from '../../services/chat.api';
import { COLORS, GlobalStyles } from '../../styles/GlobalStyles';

export default function NewConversationScreen() {
  const router = useRouter();
  const { showMessage, showError } = useMessageBox();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    if (!message.trim()) {
      showMessage({ type: 'warning', title: 'Thiếu nội dung', message: 'Vui lòng nhập nội dung cần hỏi.' });
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
    <ScrollView contentContainerStyle={GlobalStyles.containerCenter}>
      <View style={GlobalStyles.box}>
        <Text style={GlobalStyles.title}>Liên hệ Shop/Admin</Text>
        <Text style={GlobalStyles.subtitle}>Đặt câu hỏi về sản phẩm, đơn hàng hoặc bất kỳ vấn đề gì</Text>

        <Text style={GlobalStyles.inputLabel}>Tiêu đề (không bắt buộc)</Text>
        <TextInput
          style={GlobalStyles.input}
          value={subject}
          onChangeText={setSubject}
          placeholder="VD: Hỏi về Canva Pro"
        />

        <Text style={GlobalStyles.inputLabel}>Nội dung</Text>
        <TextInput
          style={[GlobalStyles.input, { height: 100, textAlignVertical: 'top', paddingTop: 14 }]}
          value={message}
          onChangeText={setMessage}
          placeholder="Nhập nội dung cần hỏi..."
          multiline
        />

        <Pressable style={GlobalStyles.button} onPress={handleStart} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={GlobalStyles.buttonText}>GỬI</Text>
          )}
        </Pressable>

        <Pressable onPress={() => router.back()}>
          <Text style={[GlobalStyles.forgot, { marginTop: 14 }]}>Huỷ</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
