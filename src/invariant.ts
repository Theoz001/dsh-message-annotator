/**
 * Package-owned invariant companion for `@deepseek-ai/dsh-client-ui-annotator`.
 * @module @deepseek-ai/dsh-client-ui-annotator/invariant
 */

import type { Context } from '@deepseek-ai/cordis'
import type { InvariantInstaller } from '@deepseek-ai/dsh-invariants'

const PACKAGE_NAME = '@deepseek-ai/dsh-client-ui-annotator'

/** Cordis companion plugin name. */
export const name = 'client-ui-annotator-invariant'
/** Service required before the companion can reserve package ownership. */
export const inject = ['invariants']

/**
 * No runtime invariant: staged annotations live in per-session controllers
 * owned by the client plugin fiber and disposed with it; nothing crosses
 * plugin boundaries.
 */
const install: InvariantInstaller = () => {}

/**
 * Register this package's invariant companion.
 * @param ctx - Cordis context carrying the invariant service.
 * @returns the installed registration's disposer after setup succeeds.
 */
export const apply = (ctx: Context): Promise<() => void> =>
  Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install))
