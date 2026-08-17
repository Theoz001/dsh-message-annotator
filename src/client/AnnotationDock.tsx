/**
 * Composer dock strip: the staged annotation cards, stacked above the
 * composer card through the `conversation.input.dock` seat. Each row pairs
 * its quote with an editable note, in order; the footer hands the composed
 * block to the input machine (insert into draft, or send immediately).
 * @module @deepseek-ai/dsh-client-ui-annotator/client/AnnotationDock
 */
import { memo, useCallback, useEffect } from 'react'
import { composeMessage, type AnnotationItem, type ComposeCopy } from './controller.ts'
import type { AnnotationDockProps } from './slots.ts'

/** One staged annotation row: number badge, quote excerpt, note editor, remove. */
const AnnotationRow = memo(function AnnotationRow({
  item,
  index,
  setComment,
  remove,
  t,
}: {
  item: AnnotationItem
  index: number
  setComment: AnnotationDockProps['setComment']
  remove: AnnotationDockProps['remove']
  t: AnnotationDockProps['t']
}) {
  return (
    <div className="dsha-item">
      <span className="dsha-badge">{t('dock.itemLabel', { n: index + 1 })}</span>
      <div className="dsha-item-body">
        <blockquote className="dsha-quote">{item.quote || t('compose.wholeMessage')}</blockquote>
        <input
          value={item.comment}
          placeholder={t('dock.commentPlaceholder')}
          onChange={(event) => setComment(item.id, event.target.value)}
        />
      </div>
      <button type="button" className="dsha-remove" aria-label={t('dock.remove')} title={t('dock.remove')} onClick={() => remove(item.id)}>
        ×
      </button>
    </div>
  )
})

/**
 * The staged-annotation strip above the composer.
 * @param props - framework session kit (input machine), the injected
 * annotation face, and the locale seat.
 * @returns the strip, or nothing while no annotations are staged.
 */
export const AnnotationDock = memo(function AnnotationDock({ useAnnotations, setComment, remove, clear, setCollapsed, trackDock, useInput, inputActions, t }: AnnotationDockProps) {
  const items = useAnnotations((v) => v.items)
  const collapsed = useAnnotations((v) => v.collapsed)
  const draft = useInput((i) => i.draft)

  /* The floating selection widget stages into the most recently mounted dock's session. */
  useEffect(() => trackDock(), [trackDock])

  const copy: ComposeCopy = {
    header: (count) => t('compose.header', { count }),
    item: (n) => t('compose.item', { n }),
    whole: t('compose.wholeMessage'),
  }

  /* Insert: the composed block moves into the draft and the strip clears —
     the content now lives in the textarea, a second insert would double it. */
  const onInsert = useCallback(() => {
    inputActions.setDraft(composeMessage(items, draft, copy))
    clear()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- copy re-derives per render; the click reads the render-time one.
  }, [inputActions, items, draft, clear])

  /* Send: compose over the live draft, hand the whole text to the input
     machine, then release the staged cards. */
  const onSend = useCallback(() => {
    inputActions.setDraft(composeMessage(items, draft, copy))
    inputActions.submit()
    clear()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- same render-time copy discipline as onInsert.
  }, [inputActions, items, draft, clear])

  if (items.length === 0) return null

  const sendable = items.every((item) => item.comment.trim().length > 0)

  /* Collapsed: one compact chip row — numbered chips stay individually
     removable, and the primary send stays reachable without the cards. */
  if (collapsed) {
    return (
      <div className="dsha-dock" data-annotator-dock="true" data-collapsed="true">
        <div className="dsha-collapsed-row">
          <button type="button" className="dsha-btn" title={t('dock.expand')} onClick={() => setCollapsed(false)}>
            {t('dock.title')} ({items.length}) ▾
          </button>
          <div className="dsha-chips">
            {items.map((item, index) => (
              <span className="dsha-chip" key={item.id} title={item.comment || t('dock.commentPlaceholder')}>
                {t('dock.itemLabel', { n: index + 1 })}
                <button type="button" className="dsha-chip-x" aria-label={t('dock.remove')} onClick={() => remove(item.id)}>
                  ×
                </button>
              </span>
            ))}
          </div>
          <button type="button" className="dsha-btn" data-kind="primary" disabled={!sendable} onClick={onSend}>
            {t('dock.send')} ({items.length})
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="dsha-dock" data-annotator-dock="true">
      <div className="dsha-dock-head">
        <span className="dsha-dock-title">{t('dock.title')} ({items.length})</span>
        <span className="dsha-head-actions">
          <button type="button" className="dsha-btn" onClick={() => setCollapsed(true)}>{t('dock.collapse')}</button>
          <button type="button" className="dsha-btn" onClick={clear}>{t('dock.clear')}</button>
        </span>
      </div>
      <div className="dsha-dock-list">
        {items.map((item, index) => (
          <AnnotationRow key={item.id} item={item} index={index} setComment={setComment} remove={remove} t={t} />
        ))}
      </div>
      <div className="dsha-dock-foot">
        <button type="button" className="dsha-btn" onClick={onInsert}>{t('dock.insert')}</button>
        <button type="button" className="dsha-btn" data-kind="primary" disabled={!sendable} onClick={onSend}>
          {t('dock.send')} ({items.length})
        </button>
      </div>
    </div>
  )
})
