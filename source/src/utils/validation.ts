// Kiểm tra dữ liệu nhập ở phía app. Trả về chuỗi lỗi (tiếng Việt) hoặc null nếu hợp lệ.
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export type ValidationError = { title: string; message: string };

export function validateLogin(email: string, password: string): ValidationError | null {
  if (!email && !password) {
    return { title: 'Thiếu thông tin', message: 'Vui lòng nhập email và mật khẩu.' };
  }
  if (!email) return { title: 'Thiếu email', message: 'Vui lòng nhập email của bạn.' };
  if (!EMAIL_REGEX.test(email)) {
    return {
      title: 'Email không đúng định dạng',
      message: 'Email phải có dạng ten@gmail.com (không có khoảng trắng, có @ và tên miền).',
    };
  }
  if (!password) return { title: 'Thiếu mật khẩu', message: 'Vui lòng nhập mật khẩu.' };
  return null;
}

export function validateRegister(
  fullName: string,
  email: string,
  password: string,
  confirm: string
): ValidationError | null {
  if (!fullName || !email || !password || !confirm) {
    return { title: 'Thiếu thông tin', message: 'Vui lòng nhập đầy đủ họ tên, email và mật khẩu.' };
  }
  if (fullName.length < 2) {
    return { title: 'Họ tên không hợp lệ', message: 'Họ và tên phải có ít nhất 2 ký tự.' };
  }
  if (!EMAIL_REGEX.test(email)) {
    return {
      title: 'Email không đúng định dạng',
      message: 'Email phải có dạng ten@gmail.com (không có khoảng trắng, có @ và tên miền).',
    };
  }
  if (password.length < 6) {
    return { title: 'Mật khẩu quá ngắn', message: 'Mật khẩu phải có ít nhất 6 ký tự.' };
  }
  if (password.length > 72) {
    return { title: 'Mật khẩu quá dài', message: 'Mật khẩu tối đa 72 ký tự.' };
  }
  if (password !== confirm) {
    return { title: 'Mật khẩu không khớp', message: 'Mật khẩu xác nhận không giống mật khẩu đã nhập.' };
  }
  return null;
}
