import { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography, radius, sizing } from '@/theme';
import { Icon } from '@/components/Icon';
import { api } from '@/lib/api';
import type { MessageDto } from '@carrymate/shared';
import type { ScreenProps } from '@/navigation/types';

function clock(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export function ChatScreen({ route }: ScreenProps<'Chat'>) {
  const { conversationId } = route.params;
  const qc = useQueryClient();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<MessageDto>>(null);
  const [text, setText] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => api.messages(conversationId),
    refetchInterval: 4000,
  });

  const send = useMutation({
    mutationFn: (body: string) => api.sendMessage(conversationId, body),
    onSuccess: () => {
      setText('');
      qc.invalidateQueries({ queryKey: ['messages', conversationId] });
      qc.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  const onSend = () => {
    const body = text.trim();
    if (!body || send.isPending) return;
    send.mutate(body);
  };

  const renderItem = ({ item }: { item: MessageDto }) => {
    if (item.type === 'SYSTEM') {
      return <Text style={styles.system}>{item.body}</Text>;
    }
    const mine = item.mine;
    return (
      <View style={[styles.bubbleRow, mine ? styles.rowMine : styles.rowTheirs]}>
        <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
          <Text style={[styles.msgText, mine && styles.msgTextMine]}>{item.body}</Text>
          {item.piiRedacted && (
            <View style={styles.redactedRow}>
              <Icon name="lock" size={12} color={mine ? 'rgba(255,255,255,0.85)' : colors.textHint} />
              <Text style={[styles.redacted, mine && styles.redactedMine]}>
                Contact details hidden for your safety
              </Text>
            </View>
          )}
          <Text style={[styles.time, mine && styles.timeMine]}>{clock(item.createdAt)}</Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      {isLoading ? (
        <ActivityIndicator color={colors.skyBlue} style={{ marginTop: spacing['3xl'] }} />
      ) : (
        <FlatList
          ref={listRef}
          data={data ?? []}
          keyExtractor={(m) => m.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          ListHeaderComponent={
            <View style={styles.notice}>
              <Text style={styles.noticeText}>
                Keep chat on CarryMate. Phone numbers, emails & payment handles are removed
                automatically to protect both of you.
              </Text>
            </View>
          }
        />
      )}

      <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
        <TextInput
          style={styles.input}
          placeholder="Type a message…"
          placeholderTextColor={colors.textHint}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={2000}
        />
        <Pressable
          onPress={onSend}
          disabled={!text.trim() || send.isPending}
          style={[styles.sendBtn, (!text.trim() || send.isPending) && styles.sendBtnDisabled]}
        >
          <Icon name="send" size={20} color={colors.white} weight="fill" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgApp },
  list: { padding: sizing.screenPaddingX, gap: spacing.sm, paddingBottom: spacing.lg },
  notice: {
    backgroundColor: colors.skyLight,
    borderRadius: radius.card,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  noticeText: { ...typography.caption, color: '#185FA5', lineHeight: 16 },
  bubbleRow: { flexDirection: 'row' },
  rowMine: { justifyContent: 'flex-end' },
  rowTheirs: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '80%', borderRadius: radius.card + 2, padding: spacing.md },
  bubbleMine: { backgroundColor: colors.skyBlue, borderBottomRightRadius: 4 },
  bubbleTheirs: {
    backgroundColor: colors.bgCard,
    borderWidth: 0.5,
    borderColor: colors.borderLight,
    borderBottomLeftRadius: 4,
  },
  msgText: { ...typography.bodyM, color: colors.textPrimary },
  msgTextMine: { color: colors.white },
  redactedRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  redacted: { ...typography.caption, color: colors.textHint, fontStyle: 'italic' },
  redactedMine: { color: 'rgba(255,255,255,0.8)' },
  time: { ...typography.caption, color: colors.textHint, marginTop: 4, alignSelf: 'flex-end', fontSize: 10 },
  timeMine: { color: 'rgba(255,255,255,0.75)' },
  system: { ...typography.caption, color: colors.textHint, textAlign: 'center', marginVertical: spacing.xs },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: sizing.screenPaddingX,
    paddingTop: spacing.sm,
    backgroundColor: colors.bgCard,
    borderTopWidth: 0.5,
    borderTopColor: colors.borderLight,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.chip,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: colors.bgApp,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.skyBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#A9C7E2' },
});
