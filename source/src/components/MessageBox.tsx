// Hộp thông báo (messagebox) dùng chung — chạy được trên cả Web lẫn Android/iOS.
// Lý do tự viết: `Alert.alert` của React Native KHÔNG hiển thị gì trên bản web,
// nên lỗi đăng nhập/đăng ký sẽ "im lặng". Component này dùng <Modal> nên luôn hiện.
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { COLORS } from '../styles/GlobalStyles';
import { ExtraStyles } from '../styles/ExtraStyles';

export type MessageType = 'error' | 'success' | 'warning' | 'info';

export type MessageOptions = {
  title: string;
  message: string;
  type?: MessageType;
  confirmText?: string;
  onConfirm?: () => void;
  // Nếu có cancelText thì hiện thêm nút thứ hai (vd: "Để sau")
  cancelText?: string;
  onCancel?: () => void;
};

type MessageBoxContextValue = {
  showMessage: (options: MessageOptions) => void;
  showError: (message: string, title?: string) => void;
  showSuccess: (message: string, title?: string, onConfirm?: () => void) => void;
};

const MessageBoxContext = createContext<MessageBoxContextValue | undefined>(undefined);

const TYPE_META: Record<MessageType, { icon: string; color: string; soft: string }> = {
  error: { icon: '⚠️', color: COLORS.danger, soft: COLORS.dangerSoft },
  success: { icon: '✅', color: COLORS.success, soft: COLORS.successSoft },
  warning: { icon: '🔔', color: COLORS.warning, soft: COLORS.warningSoft },
  info: { icon: 'ℹ️', color: COLORS.primary, soft: COLORS.primarySoft },
};

export function MessageBoxProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<MessageOptions | null>(null);

  const showMessage = useCallback((options: MessageOptions) => setCurrent(options), []);
  const showError = useCallback(
    (message: string, title = 'Có lỗi xảy ra') => setCurrent({ type: 'error', title, message }),
    []
  );
  const showSuccess = useCallback(
    (message: string, title = 'Thành công', onConfirm?: () => void) =>
      setCurrent({ type: 'success', title, message, onConfirm }),
    []
  );

  const close = () => setCurrent(null);

  const value = useMemo(
    () => ({ showMessage, showError, showSuccess }),
    [showMessage, showError, showSuccess]
  );

  const meta = TYPE_META[current?.type ?? 'info'];

  return (
    <MessageBoxContext.Provider value={value}>
      {children}
      <Modal visible={!!current} transparent animationType="fade" onRequestClose={close}>
        <View style={ExtraStyles.msgOverlay}>
          <View style={ExtraStyles.msgCard}>
            <View style={[ExtraStyles.msgIconCircle, { backgroundColor: meta.soft }]}>
              <Text style={ExtraStyles.msgIcon}>{meta.icon}</Text>
            </View>
            <Text style={ExtraStyles.msgTitle}>{current?.title}</Text>
            <Text style={ExtraStyles.msgText}>{current?.message}</Text>

            <View style={ExtraStyles.msgButtonRow}>
              {current?.cancelText ? (
                <Pressable
                  style={({ pressed }) => [ExtraStyles.msgButtonGhost, pressed && { opacity: 0.7 }]}
                  onPress={() => {
                    const cb = current.onCancel;
                    close();
                    cb?.();
                  }}
                >
                  <Text style={ExtraStyles.msgButtonGhostText}>{current.cancelText}</Text>
                </Pressable>
              ) : null}
              <Pressable
                style={({ pressed }) => [
                  ExtraStyles.msgButton,
                  { backgroundColor: meta.color },
                  pressed && { opacity: 0.85 },
                ]}
                onPress={() => {
                  const cb = current?.onConfirm;
                  close();
                  cb?.();
                }}
              >
                <Text style={ExtraStyles.msgButtonText}>{current?.confirmText || 'Đã hiểu'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </MessageBoxContext.Provider>
  );
}

export function useMessageBox() {
  const ctx = useContext(MessageBoxContext);
  if (!ctx) throw new Error('useMessageBox phải được dùng bên trong <MessageBoxProvider>');
  return ctx;
}
