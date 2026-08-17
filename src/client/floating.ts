/**
 * Selection-borne floating annotator: watches the document for text
 * selections inside the chat flow and offers a floating 批注 trigger beside
 * the selection; its editor stages the quote+note into the visible session's
 * controller through the submit callback. Pure DOM (no slot seat), so it
 * covers every rendered position — including mid-turn steps the
 * assistant-actions strip never reaches.
 * @module @deepseek-ai/dsh-client-ui-annotator/client/floating
 */
import type { TranslateNS } from '@deepseek-ai/dsh-client-ui-slots'

/** Widget wiring: translated copy plus the staging sink. */
export interface FloatingAnnotatorOptions {
  /** Namespace-bound translate (reads the active locale at call time). */
  readonly t: TranslateNS<'annotator'>
  /** Stage one floating annotation into the visible session's controller. */
  readonly submit: (quote: string, comment: string) => void
}

/**
 * Install the floating annotator.
 * @param opts - copy + staging sink.
 * @returns disposer removing every listener and the DOM root.
 */
export function createFloatingAnnotator(opts: FloatingAnnotatorOptions): () => void {
  const { t, submit } = opts
  const root = document.createElement('div')
  root.className = 'dsha-float-root'
  document.body.appendChild(root)

  let quote = ''
  let trigger: HTMLButtonElement | null = null
  let editor: HTMLDivElement | null = null

  const clearTrigger = (): void => {
    trigger?.remove()
    trigger = null
  }
  const clearEditor = (): void => {
    editor?.remove()
    editor = null
  }
  const hideAll = (): void => {
    clearTrigger()
    clearEditor()
  }

  /** Selection gate: inside a chat flow row, outside our own chrome, non-trivial. */
  const selectionInChat = (): { text: string; rect: DOMRect } | null => {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) return null
    const range = sel.getRangeAt(0)
    const node = range.commonAncestorContainer
    const el = node.nodeType === 1 ? (node as Element) : node.parentElement
    if (!el || el.closest('[data-chat-flow-key]') === null) return null
    if (el.closest('[data-annotator-dock], .dsha-pop, .dsha-float-root') !== null) return null
    const text = sel.toString().trim()
    return text.length > 0 ? { text, rect: range.getBoundingClientRect() } : null
  }

  /** Place a fixed-position element near rect, clamped into the viewport. */
  const place = (el: HTMLElement, rect: DOMRect, gap: number): void => {
    const w = el.offsetWidth
    const h = el.offsetHeight
    const x = Math.min(Math.max(8, rect.left), Math.max(8, window.innerWidth - w - 8))
    let y = rect.bottom + gap
    if (y + h > window.innerHeight - 8) y = Math.max(8, rect.top - h - gap)
    el.style.left = x + 'px'
    el.style.top = y + 'px'
  }

  const openEditor = (): void => {
    const sel = window.getSelection()
    const rect = sel && sel.rangeCount > 0 && !sel.isCollapsed ? sel.getRangeAt(0).getBoundingClientRect() : null
    clearTrigger()
    clearEditor()
    const ed = document.createElement('div')
    ed.className = 'dsha-pop dsha-float'
    ed.setAttribute('role', 'dialog')
    ed.setAttribute('aria-label', t('editor.title'))

    const title = document.createElement('div')
    title.className = 'dsha-pop-title'
    title.textContent = t('editor.title')
    const quoteEl = document.createElement('blockquote')
    quoteEl.className = 'dsha-quote'
    quoteEl.textContent = quote
    const area = document.createElement('textarea')
    area.placeholder = t('editor.placeholder')
    const row = document.createElement('div')
    row.className = 'dsha-pop-row'
    const cancel = document.createElement('button')
    cancel.type = 'button'
    cancel.className = 'dsha-btn'
    cancel.textContent = t('editor.cancel')
    cancel.addEventListener('click', clearEditor)
    const ok = document.createElement('button')
    ok.type = 'button'
    ok.className = 'dsha-btn'
    ok.dataset.kind = 'primary'
    ok.textContent = t('editor.confirm')
    ok.disabled = true
    const confirm = (): void => {
      const comment = area.value.trim()
      if (comment.length === 0) return
      submit(quote, comment)
      clearEditor()
      window.getSelection()?.removeAllRanges()
    }
    ok.addEventListener('click', confirm)
    area.addEventListener('input', () => {
      ok.disabled = area.value.trim().length === 0
    })
    area.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        clearEditor()
        return
      }
      /* Enter submits; isComposing keeps IME confirm keystrokes out of it. */
      if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
        event.preventDefault()
        confirm()
      }
    })
    row.append(cancel, ok)
    ed.append(title, quoteEl, area, row)
    root.appendChild(ed)
    editor = ed
    if (rect) place(ed, rect, 8)
    else {
      ed.style.left = '50%'
      ed.style.top = '30%'
      ed.style.transform = 'translateX(-50%)'
    }
    area.focus()
  }

  const onMouseUp = (event: MouseEvent): void => {
    if (event.button !== 0) return
    /* Clicks on our own chrome: mouseup precedes click, so rebuilding the
       trigger here would detach the click's target and cancel it. */
    if (event.target instanceof Node && root.contains(event.target)) return
    if (editor) return
    const found = selectionInChat()
    if (!found) {
      clearTrigger()
      return
    }
    quote = found.text
    clearTrigger()
    const b = document.createElement('button')
    b.type = 'button'
    b.className = 'dsha-float-trigger'
    b.textContent = t('action.annotate')
    /* Keep the selection alive until the click reads it. */
    b.addEventListener('mousedown', (event) => event.preventDefault())
    b.addEventListener('click', openEditor)
    root.appendChild(b)
    trigger = b
    place(b, found.rect, 6)
  }

  const onSelectionChange = (): void => {
    const sel = window.getSelection()
    if ((!sel || sel.isCollapsed) && !editor) clearTrigger()
  }

  const onKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') hideAll()
  }

  /* Click-away closes the editor (the trigger follows selection collapse). */
  const onDocDown = (event: MouseEvent): void => {
    if (editor && event.target instanceof Node && !editor.contains(event.target)) clearEditor()
  }

  /* Any scroll stales the selection rect — hide rather than trail. */
  const onScroll = (): void => hideAll()

  document.addEventListener('mouseup', onMouseUp)
  document.addEventListener('selectionchange', onSelectionChange)
  document.addEventListener('keydown', onKeyDown)
  document.addEventListener('mousedown', onDocDown, true)
  document.addEventListener('scroll', onScroll, true)

  return () => {
    document.removeEventListener('mouseup', onMouseUp)
    document.removeEventListener('selectionchange', onSelectionChange)
    document.removeEventListener('keydown', onKeyDown)
    document.removeEventListener('mousedown', onDocDown, true)
    document.removeEventListener('scroll', onScroll, true)
    root.remove()
  }
}
