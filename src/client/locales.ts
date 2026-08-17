/** `annotator` namespace dictionaries (button, editor, dock, and composed copy). */

/** Dictionary namespace owned by this plugin. */
export const NS = 'annotator'

/** Simplified Chinese dictionary (the key-set source of truth). */
export const zh = {
  'action.annotate': '批注',
  'action.hint': '批注这条回复（可先用鼠标选中其中一段文字）',
  'editor.title': '添加批注',
  'editor.quoteLabel': '引用',
  'editor.wholeMessage': '（整条回复）',
  'editor.placeholder': '写下批注内容…（Enter 提交，Shift+Enter 换行）',
  'editor.confirm': '确定',
  'editor.cancel': '取消',
  'dock.title': '批注',
  'dock.itemLabel': '批注{n}',
  'dock.commentPlaceholder': '批注内容…',
  'dock.remove': '移除',
  'dock.clear': '清空',
  'dock.collapse': '收起',
  'dock.expand': '展开批注',
  'dock.insert': '插入草稿',
  'dock.send': '发送批注',
  'compose.header': '以下是我对这条回复的批注（共{count}条，引用与批注逐条对应）：',
  'compose.item': '批注 {n}',
  'compose.wholeMessage': '（整条回复）',
} satisfies Record<string, string>

/** English dictionary. */
export const en: Record<keyof typeof zh, string> = {
  'action.annotate': 'Annotate',
  'action.hint': 'Annotate this reply (select a passage first to quote it)',
  'editor.title': 'Add annotation',
  'editor.quoteLabel': 'Quote',
  'editor.wholeMessage': '(whole message)',
  'editor.placeholder': 'Write the annotation… (Enter to submit, Shift+Enter for a newline)',
  'editor.confirm': 'OK',
  'editor.cancel': 'Cancel',
  'dock.title': 'Annotations',
  'dock.itemLabel': 'Annotation {n}',
  'dock.commentPlaceholder': 'Annotation text…',
  'dock.remove': 'Remove',
  'dock.clear': 'Clear all',
  'dock.collapse': 'Collapse',
  'dock.expand': 'Expand annotations',
  'dock.insert': 'Insert into draft',
  'dock.send': 'Send annotations',
  'compose.header': 'My annotations on this reply ({count} in total, each quote paired with its note):',
  'compose.item': 'Annotation {n}',
  'compose.wholeMessage': '(whole message)',
}

/** Union of this namespace's dictionary keys. */
export type AnnotatorLocaleKey = keyof typeof zh

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** The annotator plugin's copy. */
    annotator: AnnotatorLocaleKey
  }
}
