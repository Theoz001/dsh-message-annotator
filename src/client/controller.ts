/**
 * Per-session annotation store: the staged quote+comment cards backing both
 * the per-message annotate button and the composer dock strip. One controller
 * per session (minted by the plugin body's inject factories), disposed with
 * the plugin fiber. View snapshots are replaced immutably so the framework's
 * useSyncExternalStore binding re-renders on every mutation.
 * @module @deepseek-ai/dsh-client-ui-annotator/client/controller
 */
import type { MessageId } from '@deepseek-ai/dsh-client-connection/client'
import type { HostObservable } from '@deepseek-ai/dsh-client-ui-slots'

/** One staged annotation: a quote anchored to an assistant message plus the human's note. */
export interface AnnotationItem {
  /** Per-session monotonic identity. */
  readonly id: number
  /** The finalized assistant message this annotation addresses. */
  readonly messageId: MessageId | null
  /** Selected passage as rendered (empty = the whole message). */
  readonly quote: string
  /** The human's annotation text. */
  readonly comment: string
  /** Unix epoch ms of staging. */
  readonly createdAt: number
}

/** Immutable staged-annotation view (uSES currency). */
export interface AnnotationView {
  readonly items: readonly AnnotationItem[]
  /** Dock presentation: collapsed shows one chip row, expanded shows full cards. */
  readonly collapsed: boolean
}

/** Input for staging a new annotation. */
export interface AnnotationDraft {
  readonly messageId: MessageId | null
  /** Empty string addresses the whole message. */
  readonly quote: string
  readonly comment: string
}

/** Per-session staged-annotation controller (HostObservable over {@link AnnotationView}). */
export class AnnotationController implements HostObservable<AnnotationView> {
  private view: AnnotationView = Object.freeze({ items: Object.freeze([]) as readonly AnnotationItem[], collapsed: false })
  private nextId = 1
  private readonly listeners = new Set<() => void>()
  private disposed = false

  /** Current immutable snapshot. */
  getSnapshot = (): AnnotationView => this.view

  /** Subscribe to view replacement. */
  subscribe = (fn: () => void): (() => void) => {
    this.listeners.add(fn)
    return () => {
      this.listeners.delete(fn)
    }
  }

  /** Stage one annotation; returns its per-session identity. */
  add = (draft: AnnotationDraft): number => {
    if (this.disposed) return -1
    const id = this.nextId++
    this.commit([...this.view.items, { id, messageId: draft.messageId, quote: draft.quote, comment: draft.comment, createdAt: Date.now() }])
    return id
  }

  /** Replace one annotation's comment text. */
  setComment = (id: number, comment: string): void => {
    if (this.disposed) return
    this.commit(this.view.items.map((item) => (item.id === id ? { ...item, comment } : item)))
  }

  /** Drop one staged annotation. */
  remove = (id: number): void => {
    if (this.disposed) return
    this.commit(this.view.items.filter((item) => item.id !== id))
  }

  /** Drop every staged annotation (after send, or on demand). */
  clear = (): void => {
    if (this.disposed || this.view.items.length === 0) return
    this.commit([])
  }

  /** Flip the dock's collapsed presentation. */
  setCollapsed = (collapsed: boolean): void => {
    if (this.disposed) return
    this.commitView(Object.freeze({ items: this.view.items, collapsed }))
  }

  /** Release the controller; later mutations no-op. */
  dispose = (): void => {
    this.disposed = true
    this.listeners.clear()
  }

  /** Replace the item list immutably (presentation state carried over) and notify. */
  private commit(items: readonly AnnotationItem[]): void {
    this.commitView(Object.freeze({ items: Object.freeze([...items]), collapsed: this.view.collapsed }))
  }

  /** Replace the whole snapshot immutably and notify synchronously. */
  private commitView(view: AnnotationView): void {
    this.view = view
    for (const fn of this.listeners) fn()
  }
}

/** Copy needed by {@link composeMessage} so the pure builder stays locale-free. */
export interface ComposeCopy {
  /** Message head line, e.g. `以下是我对这条回复的批注（共2条…）：`. */
  readonly header: (count: number) => string
  /** Per-item label, e.g. `批注 1`. */
  readonly item: (n: number) => string
  /** Placeholder line for whole-message annotations. */
  readonly whole: string
}

/**
 * Compose the final outbound text: the user's own draft first (when present),
 * then the numbered annotations, each quote block aligned with its note.
 * @param items - staged annotations in display order.
 * @param draft - the current composer draft (appended ahead of the block).
 * @param copy - localized strings.
 * @returns the message to hand to inputActions.setDraft + submit.
 */
export function composeMessage(items: readonly AnnotationItem[], draft: string, copy: ComposeCopy): string {
  const blocks = items.map((item, index) => {
    const head = '[' + copy.item(index + 1) + ']'
    const quote = item.quote
      ? item.quote.split(/\r?\n/).map((line) => '> ' + line).join('\n')
      : copy.whole
    return head + '\n' + quote + '\n' + item.comment
  })
  const body = copy.header(items.length) + '\n\n' + blocks.join('\n\n')
  const own = draft.trim()
  return own ? own + '\n\n' + body : body
}
