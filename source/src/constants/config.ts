// Đổi giá trị này theo môi trường:
// - Giả lập Android: dùng http://10.0.2.2:4000 (không phải localhost)
// - Điện thoại thật / Expo Go: dùng IP LAN của máy tính, vd http://192.168.1.5:4000
// - Đã deploy backend: dùng domain thật, vd https://api.tenmien.com
export const API_BASE_URL = 'http://localhost:4000/api';
