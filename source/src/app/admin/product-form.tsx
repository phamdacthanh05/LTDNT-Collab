// Admin: form THÊM sản phẩm mới (không có ?id) hoặc SỬA sản phẩm (?id=...).
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMessageBox } from '../../components/MessageBox';
import { useRoleGuard } from '../../hooks/use-role-guard';
import {
  createProduct,
  fetchStockProducts,
  updateProduct,
  type AdminStockProduct,
} from '../../services/adminStock.api';
import { AdminStyles as styles } from '../../styles/AdminStyles';
import { COLORS } from '../../styles/GlobalStyles';

export default function AdminProductFormScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const isEdit = !!id;

  const router = useRouter();
  const { allowed } = useRoleGuard('ADMIN');
  const { showMessage, showError } = useMessageBox();

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [available, setAvailable] = useState(0);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!allowed || !id) return;
    (async () => {
      try {
        const list = await fetchStockProducts();
        const p: AdminStockProduct | undefined = list.find((x) => x.id === id);
        if (!p) {
          showError('Không tìm thấy sản phẩm (có thể đã bị xoá).');
          router.back();
          return;
        }
        setName(p.name);
        setPrice(String(Number(p.price)));
        setCategory(p.category || '');
        setImageUrl(p.imageUrl || '');
        setDescription(p.description || '');
        setIsActive(p.isActive);
        setAvailable(p.available);
      } catch (err) {
        showError(
          err instanceof Error ? err.message : 'Không tải được sản phẩm.'
        );
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowed, id]);

  const handleSave = async () => {
    const priceNumber = Number(price.replace(/\D/g, ''));
    if (!name.trim()) {
      showMessage({
        type: 'warning',
        title: 'Thiếu thông tin',
        message: 'Vui lòng nhập tên sản phẩm.',
      });
      return;
    }
    if (!Number.isInteger(priceNumber) || priceNumber < 1) {
      showMessage({
        type: 'warning',
        title: 'Giá chưa hợp lệ',
        message: 'Giá phải là số lớn hơn 0 (đơn vị: đồng).',
      });
      return;
    }

    const payload = {
      name: name.trim(),
      price: priceNumber,
      category: category.trim(),
      imageUrl: imageUrl.trim(),
      description: description.trim(),
      isActive,
    };

    setSaving(true);
    try {
      if (isEdit && id) {
        const r = await updateProduct(id, payload);
        showMessage({
          type: 'success',
          title: 'Đã lưu',
          message: r.message,
          onConfirm: () => router.back(),
        });
      } else {
        const r = await createProduct(payload);
        showMessage({
          type: 'success',
          title: 'Đã thêm sản phẩm',
          message: r.message,
          confirmText: 'Nhập tài khoản vào kho',
          cancelText: 'Để sau',
          onConfirm: () => router.replace('/admin/accounts' as any),
          onCancel: () => router.back(),
        });
      }
    } catch (err) {
      showError(
        err instanceof Error ? err.message : 'Không lưu được sản phẩm.',
        'Lưu thất bại'
      );
    } finally {
      setSaving(false);
    }
  };

  if (!allowed || loading) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

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
          <Text style={styles.greeting}>
            {isEdit ? 'QUẢN TRỊ · SỬA' : 'QUẢN TRỊ · THÊM MỚI'}
          </Text>
          <Text style={styles.topTitle} numberOfLines={1}>
            {isEdit ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Text style={styles.inputLabel}>Tên sản phẩm *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="VD: Canva Pro 1 tháng"
              placeholderTextColor={COLORS.textSecondary}
              maxLength={191}
              editable={!saving}
            />

            <Text style={styles.inputLabel}>Giá bán (đ) *</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={(t) => setPrice(t.replace(/\D/g, ''))}
              keyboardType="number-pad"
              placeholder="VD: 49000"
              placeholderTextColor={COLORS.textSecondary}
              editable={!saving}
            />

            <Text style={styles.inputLabel}>Danh mục</Text>
            <TextInput
              style={styles.input}
              value={category}
              onChangeText={setCategory}
              placeholder="VD: Canva Pro, Tool, Tài khoản"
              placeholderTextColor={COLORS.textSecondary}
              maxLength={191}
              editable={!saving}
            />

            <Text style={styles.inputLabel}>Link ảnh (tuỳ chọn)</Text>
            <TextInput
              style={styles.input}
              value={imageUrl}
              onChangeText={setImageUrl}
              placeholder="https://..."
              placeholderTextColor={COLORS.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              maxLength={191}
              editable={!saving}
            />

            <Text style={styles.inputLabel}>Mô tả</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              value={description}
              onChangeText={setDescription}
              placeholder="Mô tả ngắn về sản phẩm"
              placeholderTextColor={COLORS.textSecondary}
              multiline
              editable={!saving}
            />

            <View style={styles.switchRow}>
              <View style={styles.switchLabelWrap}>
                <Text style={styles.switchLabel}>Đang bán</Text>
                <Text style={styles.switchHint}>
                  Tắt để ẩn sản phẩm khỏi cửa hàng (không xoá).
                </Text>
              </View>
              <Switch
                value={isActive}
                onValueChange={setIsActive}
                disabled={saving}
                trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
                thumbColor={isActive ? COLORS.primary : '#f4f3f4'}
              />
            </View>

            <Text style={styles.readonlyNote}>
              {isEdit
                ? `Số lượng trong kho: ${available.toLocaleString('vi-VN')} (tự tính theo số tài khoản; nhập thêm ở màn "Kho tài khoản").`
                : 'Số lượng bắt đầu từ 0. Sau khi thêm, hãy nhập tài khoản vào kho để bắt đầu bán.'}
            </Text>

            <Pressable
              style={({ pressed }) => [
                styles.primaryBtn,
                saving && { opacity: 0.6 },
                pressed && !saving && styles.pressed,
              ]}
              onPress={handleSave}
              disabled={saving}
              accessibilityRole="button"
            >
              {saving ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.primaryBtnText}>
                  {isEdit ? 'LƯU THAY ĐỔI' : 'THÊM SẢN PHẨM'}
                </Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}