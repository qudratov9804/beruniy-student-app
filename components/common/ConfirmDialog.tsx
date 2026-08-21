import React from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import { Button } from '@/components/ui';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  cancelLabel: string;
  confirmLabel: string;
  destructive?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title,
  message,
  cancelLabel,
  confirmLabel,
  destructive = false,
  onCancel,
  onConfirm,
}) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        <View style={styles.actions}>
          <Button variant="outline" size="md" onPress={onCancel} className="flex-1">
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? 'danger' : 'primary'}
            size="md"
            onPress={onConfirm}
            className="flex-1"
          >
            {confirmLabel}
          </Button>
        </View>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 390,
    backgroundColor: 'rgba(15,23,42,0.97)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    padding: 24,
  },
  title: { color: '#ffffff', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  message: { color: 'rgba(255,255,255,0.60)', fontSize: 14, lineHeight: 20, marginBottom: 24 },
  actions: { flexDirection: 'row', gap: 12 },
});
