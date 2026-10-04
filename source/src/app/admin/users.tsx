import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../services/api';
import { COLORS, GlobalStyles } from '../../styles/GlobalStyles';

export default function AdminUsersScreen() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('BUYER');

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data.users);
    } catch {
      alert('Không tải được danh sách');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSave = async () => {
    if (!fullName || !email) return alert('Vui lòng nhập tên và email!');
    try {
      if (isEditing) {
        await api.put(`/admin/users/${currentId}`, { fullName, email, role, password });
        alert('Đã cập nhật thành công!');
      } else {
        await api.post('/admin/users', { fullName, email, password, role });
        alert('Đã thêm mới thành công!');
      }
      setModalVisible(false);
      fetchUsers();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      alert('Đã xóa thành công!');
      fetchUsers();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Không thể xóa');
    }
  };

  if (loading) return <SafeAreaView style={GlobalStyles.center}><ActivityIndicator size="large" color={COLORS.primary} /></SafeAreaView>;

  return (
    <SafeAreaView style={GlobalStyles.screen} edges={['top']}>
      {/* Header căn giữa + nút Thêm */}
      <View style={styles.header}>
        <Pressable onPress={() => router.push('/')}><Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>{'< Trang chủ'}</Text></Pressable>
        <Text style={styles.title}>Quản lý người dùng</Text>
        <Pressable style={styles.btnAdd} onPress={() => { setIsEditing(false); setFullName(''); setEmail(''); setPassword(''); setRole('BUYER'); setModalVisible(true); }}>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>+ Thêm mới</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {users.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#1e293b' }}>{item.fullName}</Text>
              <Text style={{ color: '#64748b', marginTop: 2 }}>{item.email} - <Text style={{ color: item.role === 'ADMIN' ? 'green' : 'blue', fontWeight: 'bold' }}>{item.role}</Text></Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              <Pressable style={styles.btnEdit} onPress={() => { setIsEditing(true); setCurrentId(item.id); setFullName(item.fullName); setEmail(item.email); setPassword(''); setRole(item.role); setModalVisible(true); }}>
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>Sửa</Text>
              </Pressable>
              <Pressable style={styles.btnDel} onPress={() => handleDelete(item.id)}>
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>Xóa</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Modal Thêm/Sửa */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalBox}>
            <Text style={{ fontSize: 17, fontWeight: 'bold', marginBottom: 12, color: '#1e293b' }}>{isEditing ? 'Sửa thông tin' : 'Thêm người dùng'}</Text>
            
            <Text style={styles.label}>Họ tên</Text>
            <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Nhập họ tên" />

            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Nhập email" autoCapitalize="none" />

            <Text style={styles.label}>Mật khẩu {isEditing && '(để trống nếu không đổi)'}</Text>
            <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Mật khẩu" secureTextEntry />

            <Text style={styles.label}>Quyền hạn</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
              <Pressable style={[styles.roleBtn, role === 'BUYER' && styles.roleActive]} onPress={() => setRole('BUYER')}>
                <Text style={{ color: role === 'BUYER' ? '#fff' : '#334155', fontWeight: 'bold' }}>BUYER</Text>
              </Pressable>
              <Pressable style={[styles.roleBtn, role === 'ADMIN' && styles.roleActive]} onPress={() => setRole('ADMIN')}>
                <Text style={{ color: role === 'ADMIN' ? '#fff' : '#334155', fontWeight: 'bold' }}>ADMIN</Text>
              </Pressable>
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
              <Pressable style={[styles.modalBtn, { backgroundColor: '#cbd5e1' }]} onPress={() => setModalVisible(false)}><Text style={{ fontWeight: 'bold', color: '#334155' }}>Hủy</Text></Pressable>
              <Pressable style={[styles.modalBtn, { backgroundColor: COLORS.primary }]} onPress={handleSave}><Text style={{ fontWeight: 'bold', color: '#fff' }}>Lưu</Text></Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#fff' },
  title: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', flex: 1, color: '#1e293b' },
  btnAdd: { backgroundColor: '#10b981', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  card: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 10, flexDirection: 'row', alignItems: 'center', elevation: 2 },
  btnEdit: { backgroundColor: '#f59e0b', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  btnDel: { backgroundColor: '#ef4444', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  modalBox: { backgroundColor: '#fff', padding: 20, borderRadius: 10, width: '100%', maxWidth: 380 },
  label: { fontSize: 13, fontWeight: '600', color: '#475569', marginTop: 10, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 6, padding: 8, backgroundColor: '#f8fafc', fontSize: 14 },
  roleBtn: { flex: 1, padding: 8, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 6, alignItems: 'center' },
  roleActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  modalBtn: { flex: 1, padding: 10, alignItems: 'center', borderRadius: 6 }
});