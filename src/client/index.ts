/**
 * Message Annotator client plugin body: quote-and-comment staging for
 * assistant messages. Registers two entries sharing one per-session
 * controller each:
 * - the `annotator` button in `conversation.chat.assistant-actions` (the
 *   per-message strip, after feedback), which snapshots the chat selection
 *   as the quote and stages the note;
 * - the `annotator` strip in `conversation.input.dock` (above the composer
 *   card), which keeps the staged cards aligned and hands their composed
 *   block to the input machine (insert into draft or send immediately).
 * @module @deepseek-ai/dsh-client-ui-annotator/client
 */
import type { ClientContext, SessionId } from '@deepseek-ai/dsh-client-runtime/client'
// Type-only: the locale service's Context merge (ctx.locale).
import type {} from '@deepseek-ai/dsh-client-locale/client'
// Type-only: pulls the conversation SlotMap merges (both target slots).
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import { AnnotationController } from './controller.ts'
import type { AnnotatorInjected } from './slots.ts'
import { AnnotateButton } from './AnnotateButton.tsx'
import { AnnotationDock } from './AnnotationDock.tsx'
import { createFloatingAnnotator } from './floating.ts'
import { ensureStyles } from './styles.ts'
import { en, NS, zh } from './locales.ts'

/** Required services: the slot registry and the copy. */
export const inject = ['slots', 'locale']

/**
 * Client plugin body.
 * @param ctx - client cordis context.
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'annotator: dictionaries')
  ctx.effect(() => ensureStyles(), 'annotator: stylesheet')

  /* One controller per session, minted lazily by either entry's inject
     factory and shared by both; all released with the plugin fiber. */
  const controllers = new Map<SessionId, AnnotationController>()
  const controllerFor = (sessionId: SessionId): AnnotationController => {
    let controller = controllers.get(sessionId)
    if (!controller) {
      controller = new AnnotationController()
      controllers.set(sessionId, controller)
    }
    return controller
  }
  ctx.effect(() => () => {
    for (const controller of controllers.values()) controller.dispose()
    controllers.clear()
  }, 'annotator: controllers')

  /* Mounted docks, in mount order: the floating selection widget stages
     into the most recent one's session — the chat the user is looking at. */
  const mountedDocks = new Map<SessionId, true>()
  const currentSession = (): SessionId | null => {
    let last: SessionId | null = null
    for (const id of mountedDocks.keys()) last = id
    return last
  }

  const face = (sessionId: SessionId): AnnotatorInjected => {
    const controller = controllerFor(sessionId)
    return {
      hooks: { annotations: controller },
      add: controller.add,
      setComment: controller.setComment,
      remove: controller.remove,
      clear: controller.clear,
      setCollapsed: controller.setCollapsed,
      trackDock: () => {
        mountedDocks.set(sessionId, true)
        return () => {
          mountedDocks.delete(sessionId)
        }
      },
    }
  }

  /* Selection-borne floating annotate trigger: covers every rendered position,
     including mid-turn steps the assistant-actions strip never reaches. */
  ctx.effect(
    () =>
      createFloatingAnnotator({
        t: ctx.locale.bind(NS),
        submit: (quote, comment) => {
          const sessionId = currentSession()
          if (sessionId === null) return
          controllerFor(sessionId).add({ messageId: null, quote, comment })
        },
      }),
    'annotator: floating',
  )

  /* Per-message annotate button, beside the feedback pair. */
  ctx.slots.inject('conversation.chat.assistant-actions', () =>
    ctx.slots.register({
      name: 'conversation.chat.assistant-actions',
      id: 'annotator',
      order: 20,
      locale: NS,
      inject: (sessionId) => face(sessionId),
    }, AnnotateButton))

  /* Staged-annotation strip above the composer card. */
  ctx.slots.inject('conversation.input.dock', () =>
    ctx.slots.register({
      name: 'conversation.input.dock',
      id: 'annotator',
      order: 100,
      locale: NS,
      inject: (sessionId) => face(sessionId),
    }, AnnotationDock))
}
