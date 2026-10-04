/**
 * Các hàm format dùng chung toàn ứng dụng.
 */

/**
 * Format giá tiền sang định dạng Việt Nam (VD: 100000 -> 100.000đ)
 */
export function formatPrice(price: string | number): string {
  const value = Number(price);
  if (!Number.isFinite(value)) return 'Liên hệ';
  return `${value.toLocaleString('vi-VN')}đ`;
}

/**
 * Format số tiền (không phụ thuộc "Liên hệ" như formatPrice).
 * Dùng cho ví, giao dịch, hóa đơn...
 */
export function formatMoney(value: string | number): string {
  const n = Number(value);
  return Number.isFinite(n) ? `${n.toLocaleString('vi-VN')}đ` : String(value);
}

/**
 * Format ngày giờ đầy đủ dạng: 01/01/2026 14:30
 */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Chỉ lấy giờ:phút (VD: 14:30). Dùng cho bubble chat.
 */
export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format ngày giờ ngắn gọn cho danh sách hội thoại: 14:30 01/01
 */
export function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
  });
}