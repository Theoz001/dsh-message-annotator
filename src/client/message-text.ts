/**
 * Message-text helpers: resolve the finalized assistant message addressed by
 * an assistant-actions entry, and normalize a live DOM selection for staging.
 * @module @deepseek-ai/dsh-client-ui-annotator/client/message-text
 */
import type { ConversationNode } from '@deepseek-ai/dsh-client-runtime/client'
import type { MessageId } from '@deepseek-ai/dsh-client-connection/client'

/**
 * Concatenated prose of one finalized assistant message (the same projection
 * the chat view's copy action uses: text blocks joined verbatim).
 * @param nodes - the conversation snapshot's finalized node list.
 * @param id - the message identity carried by the actions strip owner props.
 * @returns the message's text, or undefined while the node is out of window.
 */
export function assistantTextByMessageId(nodes: readonly ConversationNode[], id: MessageId): string | undefined {
  const node = nodes.find((n) => n.kind === 'assistant' && n.messageId === id)
  if (!node || node.kind !== 'assistant') return undefined
  return node.blocks.flatMap((block) => (block.kind === 'text' ? [block.text] : [])).join('')
}

/**
 * Read the live window selection when — and only when — it sits inside the
 * chat scrollport: the quote is the rendered prose the user just read, which
 * is exactly what belongs in the annotation (the markdown source is not).
 * @returns the trimmed selected text, or an empty string for none/foreign.
 */
export function chatSelection(): string {
  const sel = typeof window === 'undefined' ? null : window.getSelection()
  if (!sel || sel.isCollapsed || sel.rangeCount === 0) return ''
  const range = sel.getRangeAt(0)
  const container = range.commonAncestorContainer
  const el = container.nodeType === 1 ? (container as Element) : container.parentElement
  if (!el || el.closest('[data-chat-flow-key]') === null) return ''
  return sel.toString().trim()
}
