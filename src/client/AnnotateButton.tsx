/**
 * Per-message annotate entry: one button in the finalized assistant
 * message's IconActions row (the `conversation.chat.assistant-actions`
 * strip, beside feedback). Clicking it snapshots the live chat selection as
 * the quote (empty = whole message) and opens a small editor for the note;
 * confirming stages the card into the session's annotation controller.
 * @module @deepseek-ai/dsh-client-ui-annotator/client/AnnotateButton
 */
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { Tooltip } from '@deepseek-ai/dsh-client-ui-primitives'
import { assistantTextByMessageId, chatSelection } from './message-text.ts'
import type { AnnotateButtonProps } from './slots.ts'

/** Quill-in-bubble glyph for the action button. */
const AnnotateIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M13.5 2.5h-11v8h6l3 2.5v-2.5h2v-8z" />
    <path d="M5.5 5.5h5M5.5 7.8h3" />
  </svg>
)

/**
 * One message's annotate control.
 * @param props - owner message identity, framework session kit, injected
 * annotation face, and the locale seat.
 * @returns the action button, plus the note editor while it is open.
 */
export const AnnotateButton = memo(function AnnotateButton({ messageId, useSession, add, t }: AnnotateButtonProps) {
  const fullText = useSession((s) => assistantTextByMessageId(s.nodes, messageId) ?? '')
  const [open, setOpen] = useState(false)
  const [quote, setQuote] = useState('')
  const [comment, setComment] = useState('')
  const rootRef = useRef<HTMLSpanElement>(null)

  /* Click-away closes the editor without staging anything. */
  useEffect(() => {
    if (!open) return
    const onDown = (event: MouseEvent) => {
      if (rootRef.current && event.target instanceof Node && !rootRef.current.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown, true)
    return () => document.removeEventListener('mousedown', onDown, true)
  }, [open])

  const openEditor = useCallback(() => {
    setQuote(chatSelection())
    setComment('')
    setOpen(true)
  }, [])

  const confirm = useCallback(() => {
    const text = comment.trim()
    if (text.length === 0) return
    add({ messageId, quote, comment: text })
    setOpen(false)
    /* The staged card now owns the quote; drop the DOM highlight. */
    window.getSelection()?.removeAllRanges()
  }, [add, comment, messageId, quote])

  const onKeyDown = useCallback((event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      setOpen(false)
      return
    }
    /* Enter submits; isComposing keeps IME confirm keystrokes out of it. */
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      confirm()
    }
  }, [confirm])

  return (
    <span className="dsha-anchor" ref={rootRef}>
      <Tooltip label={t('action.hint')} side="bottom">
        <button type="button" className="dsha-action" aria-label={t('action.annotate')} onClick={openEditor}>
          <AnnotateIcon />
        </button>
      </Tooltip>
      {open ? (
        <span className="dsha-pop" role="dialog" aria-label={t('editor.title')}>
          <span className="dsha-pop-title">{t('editor.title')}</span>
          {/* Whole-message notes still show the head of the target message. */}
          <blockquote className="dsha-quote">{quote || (fullText.trim() ? fullText.trim().slice(0, 200) : t('editor.wholeMessage'))}</blockquote>
          <textarea
            autoFocus
            value={comment}
            placeholder={t('editor.placeholder')}
            onChange={(event) => setComment(event.target.value)}
            onKeyDown={onKeyDown}
          />
          <span className="dsha-pop-row">
            <button type="button" className="dsha-btn" onClick={() => setOpen(false)}>{t('editor.cancel')}</button>
            <button type="button" className="dsha-btn" data-kind="primary" disabled={comment.trim().length === 0} onClick={confirm}>
              {t('editor.confirm')}
            </button>
          </span>
        </span>
      ) : null}
    </span>
  )
})
