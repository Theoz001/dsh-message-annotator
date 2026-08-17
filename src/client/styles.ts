/**
 * Plugin stylesheet, managed by hand: one <style> tag stamped with the
 * data-plugin markers the shell's CSS pipeline uses, installed as an owned
 * effect so the rules leave the document with the plugin. Colors ride the
 * shell's --dsw-alias tokens, so light/dark follow the theme for free.
 * @module @deepseek-ai/dsh-client-ui-annotator/client/styles
 */

const TAG_ID = '@deepseek-ai/dsh-client-ui-annotator/annotator.css'

const CSS = `
.dsha-anchor{position:relative;display:inline-flex}
.dsha-action{display:inline-flex;align-items:center;gap:4px;border:none;background:none;cursor:pointer;color:inherit;font:inherit;padding:2px;border-radius:4px}
.dsha-action:hover{color:var(--dsw-alias-label-primary)}
.dsha-action svg{width:14px;height:14px;flex:none}
.dsha-pop{position:absolute;z-index:60;left:0;top:calc(100% + 6px);width:320px;max-width:calc(100vw - 48px);padding:12px;border:1px solid var(--dsw-alias-border-l2);border-radius:12px;background:var(--dsw-alias-bg-layer-1);box-shadow:var(--dsw-shadow-lv2);display:flex;flex-direction:column;gap:8px}
.dsha-pop-title{font-size:13px;font-weight:500;color:var(--dsw-alias-label-primary);line-height:18px}
.dsha-quote{margin:0;padding:6px 10px;border-left:3px solid var(--dsw-alias-border-l2);border-radius:0 6px 6px 0;background:var(--dsw-alias-interactive-bg-hover-solid);color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px;max-height:96px;overflow:hidden;white-space:pre-wrap;word-break:break-word}
.dsha-pop textarea{resize:vertical;min-height:56px;max-height:160px;padding:8px 10px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:18px;outline:none}
.dsha-pop textarea:focus{border-color:var(--dsw-static-deepseek-500)}
.dsha-pop-row{display:flex;justify-content:flex-end;gap:8px}
.dsha-btn{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);cursor:pointer;border-radius:8px;padding:4px 12px;font-size:12px;line-height:18px}
.dsha-btn:hover{background:var(--dsw-alias-interactive-bg-hover-solid)}
.dsha-btn[data-kind='primary']{border-color:transparent;background:var(--dsw-static-deepseek-500);color:#fff}
.dsha-btn[data-kind='primary']:hover{background:var(--dsw-static-deepseek-600, var(--dsw-static-deepseek-500))}
.dsha-btn[data-kind='primary']:disabled{opacity:.5;cursor:default}
.dsha-dock{margin:0 auto 8px;width:100%;max-width:var(--dsh-chat-content-width, 100%);border:1px solid var(--dsw-alias-border-l2);border-radius:12px;background:var(--dsw-alias-bg-layer-1);padding:10px 12px;display:flex;flex-direction:column;gap:8px}
.dsha-dock-head{display:flex;align-items:center;justify-content:space-between;gap:8px}
.dsha-dock-title{font-size:13px;font-weight:500;color:var(--dsw-alias-label-primary);line-height:18px}
.dsha-dock-list{display:flex;flex-direction:column;gap:8px;max-height:240px;overflow-y:auto}
.dsha-item{display:flex;gap:8px;align-items:flex-start}
.dsha-badge{flex:none;min-width:44px;text-align:center;padding:2px 6px;border-radius:6px;background:var(--dsw-alias-interactive-bg-hover-solid);color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px;white-space:nowrap}
.dsha-item-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px}
.dsha-item input{width:100%;box-sizing:border-box;padding:6px 10px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:18px;outline:none}
.dsha-item input:focus{border-color:var(--dsw-static-deepseek-500)}
.dsha-remove{flex:none;border:none;background:none;cursor:pointer;color:var(--dsw-alias-label-tertiary);font-size:14px;line-height:18px;padding:2px 4px;border-radius:4px}
.dsha-remove:hover{color:var(--dsw-alias-state-error-primary, #d4380d)}
.dsha-dock-foot{display:flex;justify-content:flex-end;gap:8px}
.dsha-float-root{position:fixed;inset:0;pointer-events:none;z-index:70}
.dsha-float-root>*{pointer-events:auto}
/* The floating trigger must pop against the white transcript: brand-blue fill, white label. */
.dsha-float-trigger{position:fixed;z-index:71;border:1px solid transparent;background:var(--dsw-static-deepseek-500);color:#fff;font-weight:500;cursor:pointer;border-radius:8px;padding:3px 10px;font-size:12px;line-height:18px;box-shadow:var(--dsw-shadow-lv2)}
.dsha-float-trigger:hover{filter:brightness(1.08)}
.dsha-head-actions{display:flex;gap:8px;align-items:center}
.dsha-dock[data-collapsed='true']{padding:6px 12px}
.dsha-collapsed-row{display:flex;align-items:center;gap:8px}
.dsha-chips{flex:1;min-width:0;display:flex;gap:6px;overflow-x:auto}
.dsha-chip{flex:none;display:inline-flex;align-items:center;gap:4px;padding:2px 4px 2px 8px;border-radius:6px;background:var(--dsw-alias-interactive-bg-hover-solid);color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px;white-space:nowrap}
.dsha-chip-x{border:none;background:none;cursor:pointer;color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:16px;padding:0 2px;border-radius:3px}
.dsha-chip-x:hover{color:var(--dsw-alias-state-error-primary, #d4380d)}
.dsha-float{position:fixed;z-index:71}
`

/**
 * Install the stylesheet once (idempotent); the returned disposer removes it.
 * @returns style-tag disposer.
 */
export function ensureStyles(): () => void {
  const existing = document.querySelector('style[data-plugin-css=' + JSON.stringify(TAG_ID) + ']')
  if (existing) return () => {}
  const tag = document.createElement('style')
  tag.dataset.plugin = '@deepseek-ai/dsh-client-ui-annotator'
  tag.dataset.pluginCss = TAG_ID
  tag.textContent = CSS
  document.head.appendChild(tag)
  return () => {
    tag.remove()
  }
}
