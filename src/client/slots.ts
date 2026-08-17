/**
 * Slot-facing type surface: the injected business face shared by the
 * per-message annotate button and the composer dock strip, plus the composed
 * component props at each seat. Both slots are declared by ui-conversation;
 * this package only contributes entries, so no SlotMap merge lives here.
 * @module @deepseek-ai/dsh-client-ui-annotator/client/slots
 */
import type { HostObservable, InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { AnnotationController, AnnotationDraft, AnnotationView } from './controller.ts'

/** Injected business face of both annotator entries (one controller per session). */
export interface AnnotatorInjected {
  hooks: {
    /** The owning session's staged-annotation view. */
    annotations: HostObservable<AnnotationView>
  }
  /** Stage one annotation (quote may be empty = whole message). */
  add: (draft: AnnotationDraft) => number
  /** Replace one annotation's comment. */
  setComment: AnnotationController['setComment']
  /** Drop one staged annotation. */
  remove: AnnotationController['remove']
  /** Drop every staged annotation. */
  clear: AnnotationController['clear']
  /** Flip the dock's collapsed presentation. */
  setCollapsed: AnnotationController['setCollapsed']
  /** Mark this session's dock as mounted; the floating widget stages into the most recent one. */
  trackDock: () => () => void
}

/** Full props of the per-message annotate entry. */
export type AnnotateButtonProps = PropsRuntime<'conversation.chat.assistant-actions'> & InjectFace<AnnotatorInjected> & PropsLocale<'annotator'>
/** Full props of the composer dock strip entry. */
export type AnnotationDockProps = PropsRuntime<'conversation.input.dock'> & InjectFace<AnnotatorInjected> & PropsLocale<'annotator'>
