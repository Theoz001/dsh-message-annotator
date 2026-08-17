window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-annotator",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client/index.ts
var index_exports = {};
__export(index_exports, {
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(index_exports);

// src/client/controller.ts
var AnnotationController = class {
  view = Object.freeze({ items: Object.freeze([]), collapsed: false });
  nextId = 1;
  listeners = /* @__PURE__ */ new Set();
  disposed = false;
  /** Current immutable snapshot. */
  getSnapshot = () => this.view;
  /** Subscribe to view replacement. */
  subscribe = (fn) => {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  };
  /** Stage one annotation; returns its per-session identity. */
  add = (draft) => {
    if (this.disposed) return -1;
    const id = this.nextId++;
    this.commit([...this.view.items, { id, messageId: draft.messageId, quote: draft.quote, comment: draft.comment, createdAt: Date.now() }]);
    return id;
  };
  /** Replace one annotation's comment text. */
  setComment = (id, comment) => {
    if (this.disposed) return;
    this.commit(this.view.items.map((item) => item.id === id ? { ...item, comment } : item));
  };
  /** Drop one staged annotation. */
  remove = (id) => {
    if (this.disposed) return;
    this.commit(this.view.items.filter((item) => item.id !== id));
  };
  /** Drop every staged annotation (after send, or on demand). */
  clear = () => {
    if (this.disposed || this.view.items.length === 0) return;
    this.commit([]);
  };
  /** Flip the dock's collapsed presentation. */
  setCollapsed = (collapsed) => {
    if (this.disposed) return;
    this.commitView(Object.freeze({ items: this.view.items, collapsed }));
  };
  /** Release the controller; later mutations no-op. */
  dispose = () => {
    this.disposed = true;
    this.listeners.clear();
  };
  /** Replace the item list immutably (presentation state carried over) and notify. */
  commit(items) {
    this.commitView(Object.freeze({ items: Object.freeze([...items]), collapsed: this.view.collapsed }));
  }
  /** Replace the whole snapshot immutably and notify synchronously. */
  commitView(view) {
    this.view = view;
    for (const fn of this.listeners) fn();
  }
};
function composeMessage(items, draft, copy) {
  const blocks = items.map((item, index) => {
    const head = "[" + copy.item(index + 1) + "]";
    const quote = item.quote ? item.quote.split(/\r?\n/).map((line) => "> " + line).join("\n") : copy.whole;
    return head + "\n" + quote + "\n" + item.comment;
  });
  const body = copy.header(items.length) + "\n\n" + blocks.join("\n\n");
  const own = draft.trim();
  return own ? own + "\n\n" + body : body;
}

// src/client/AnnotateButton.tsx
var import_react = require("react");
var import_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");

// src/client/message-text.ts
function assistantTextByMessageId(nodes, id) {
  const node = nodes.find((n) => n.kind === "assistant" && n.messageId === id);
  if (!node || node.kind !== "assistant") return void 0;
  return node.blocks.flatMap((block) => block.kind === "text" ? [block.text] : []).join("");
}
function chatSelection() {
  const sel = typeof window === "undefined" ? null : window.getSelection();
  if (!sel || sel.isCollapsed || sel.rangeCount === 0) return "";
  const range = sel.getRangeAt(0);
  const container = range.commonAncestorContainer;
  const el = container.nodeType === 1 ? container : container.parentElement;
  if (!el || el.closest("[data-chat-flow-key]") === null) return "";
  return sel.toString().trim();
}

// src/client/AnnotateButton.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var AnnotateIcon = () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "1.4", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [
  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M13.5 2.5h-11v8h6l3 2.5v-2.5h2v-8z" }),
  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M5.5 5.5h5M5.5 7.8h3" })
] });
var AnnotateButton = (0, import_react.memo)(function AnnotateButton2({ messageId, useSession, add, t }) {
  const fullText = useSession((s) => assistantTextByMessageId(s.nodes, messageId) ?? "");
  const [open, setOpen] = (0, import_react.useState)(false);
  const [quote, setQuote] = (0, import_react.useState)("");
  const [comment, setComment] = (0, import_react.useState)("");
  const rootRef = (0, import_react.useRef)(null);
  (0, import_react.useEffect)(() => {
    if (!open) return;
    const onDown = (event) => {
      if (rootRef.current && event.target instanceof Node && !rootRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown, true);
    return () => document.removeEventListener("mousedown", onDown, true);
  }, [open]);
  const openEditor = (0, import_react.useCallback)(() => {
    setQuote(chatSelection());
    setComment("");
    setOpen(true);
  }, []);
  const confirm = (0, import_react.useCallback)(() => {
    const text = comment.trim();
    if (text.length === 0) return;
    add({ messageId, quote, comment: text });
    setOpen(false);
    window.getSelection()?.removeAllRanges();
  }, [add, comment, messageId, quote]);
  const onKeyDown = (0, import_react.useCallback)((event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      return;
    }
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      confirm();
    }
  }, [confirm]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dsha-anchor", ref: rootRef, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.Tooltip, { label: t("action.hint"), side: "bottom", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsha-action", "aria-label": t("action.annotate"), onClick: openEditor, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnnotateIcon, {}) }) }),
    open ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dsha-pop", role: "dialog", "aria-label": t("editor.title"), children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsha-pop-title", children: t("editor.title") }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("blockquote", { className: "dsha-quote", children: quote || (fullText.trim() ? fullText.trim().slice(0, 200) : t("editor.wholeMessage")) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "textarea",
        {
          autoFocus: true,
          value: comment,
          placeholder: t("editor.placeholder"),
          onChange: (event) => setComment(event.target.value),
          onKeyDown
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dsha-pop-row", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsha-btn", onClick: () => setOpen(false), children: t("editor.cancel") }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsha-btn", "data-kind": "primary", disabled: comment.trim().length === 0, onClick: confirm, children: t("editor.confirm") })
      ] })
    ] }) : null
  ] });
});

// src/client/AnnotationDock.tsx
var import_react2 = require("react");
var import_jsx_runtime2 = require("react/jsx-runtime");
var AnnotationRow = (0, import_react2.memo)(function AnnotationRow2({
  item,
  index,
  setComment,
  remove,
  t
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dsha-item", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dsha-badge", children: t("dock.itemLabel", { n: index + 1 }) }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dsha-item-body", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("blockquote", { className: "dsha-quote", children: item.quote || t("compose.wholeMessage") }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        "input",
        {
          value: item.comment,
          placeholder: t("dock.commentPlaceholder"),
          onChange: (event) => setComment(item.id, event.target.value)
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "button", className: "dsha-remove", "aria-label": t("dock.remove"), title: t("dock.remove"), onClick: () => remove(item.id), children: "\xD7" })
  ] });
});
var AnnotationDock = (0, import_react2.memo)(function AnnotationDock2({ useAnnotations, setComment, remove, clear, setCollapsed, trackDock, useInput, inputActions, t }) {
  const items = useAnnotations((v) => v.items);
  const collapsed = useAnnotations((v) => v.collapsed);
  const draft = useInput((i) => i.draft);
  (0, import_react2.useEffect)(() => trackDock(), [trackDock]);
  const copy = {
    header: (count) => t("compose.header", { count }),
    item: (n) => t("compose.item", { n }),
    whole: t("compose.wholeMessage")
  };
  const onInsert = (0, import_react2.useCallback)(() => {
    inputActions.setDraft(composeMessage(items, draft, copy));
    clear();
  }, [inputActions, items, draft, clear]);
  const onSend = (0, import_react2.useCallback)(() => {
    inputActions.setDraft(composeMessage(items, draft, copy));
    inputActions.submit();
    clear();
  }, [inputActions, items, draft, clear]);
  if (items.length === 0) return null;
  const sendable = items.every((item) => item.comment.trim().length > 0);
  if (collapsed) {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "dsha-dock", "data-annotator-dock": "true", "data-collapsed": "true", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dsha-collapsed-row", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("button", { type: "button", className: "dsha-btn", title: t("dock.expand"), onClick: () => setCollapsed(false), children: [
        t("dock.title"),
        " (",
        items.length,
        ") \u25BE"
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "dsha-chips", children: items.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: "dsha-chip", title: item.comment || t("dock.commentPlaceholder"), children: [
        t("dock.itemLabel", { n: index + 1 }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "button", className: "dsha-chip-x", "aria-label": t("dock.remove"), onClick: () => remove(item.id), children: "\xD7" })
      ] }, item.id)) }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("button", { type: "button", className: "dsha-btn", "data-kind": "primary", disabled: !sendable, onClick: onSend, children: [
        t("dock.send"),
        " (",
        items.length,
        ")"
      ] })
    ] }) });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dsha-dock", "data-annotator-dock": "true", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dsha-dock-head", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: "dsha-dock-title", children: [
        t("dock.title"),
        " (",
        items.length,
        ")"
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: "dsha-head-actions", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "button", className: "dsha-btn", onClick: () => setCollapsed(true), children: t("dock.collapse") }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "button", className: "dsha-btn", onClick: clear, children: t("dock.clear") })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "dsha-dock-list", children: items.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(AnnotationRow, { item, index, setComment, remove, t }, item.id)) }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dsha-dock-foot", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "button", className: "dsha-btn", onClick: onInsert, children: t("dock.insert") }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("button", { type: "button", className: "dsha-btn", "data-kind": "primary", disabled: !sendable, onClick: onSend, children: [
        t("dock.send"),
        " (",
        items.length,
        ")"
      ] })
    ] })
  ] });
});

// src/client/floating.ts
function createFloatingAnnotator(opts) {
  const { t, submit } = opts;
  const root = document.createElement("div");
  root.className = "dsha-float-root";
  document.body.appendChild(root);
  let quote = "";
  let trigger = null;
  let editor = null;
  const clearTrigger = () => {
    trigger?.remove();
    trigger = null;
  };
  const clearEditor = () => {
    editor?.remove();
    editor = null;
  };
  const hideAll = () => {
    clearTrigger();
    clearEditor();
  };
  const selectionInChat = () => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) return null;
    const range = sel.getRangeAt(0);
    const node = range.commonAncestorContainer;
    const el = node.nodeType === 1 ? node : node.parentElement;
    if (!el || el.closest("[data-chat-flow-key]") === null) return null;
    if (el.closest("[data-annotator-dock], .dsha-pop, .dsha-float-root") !== null) return null;
    const text = sel.toString().trim();
    return text.length > 0 ? { text, rect: range.getBoundingClientRect() } : null;
  };
  const place = (el, rect, gap) => {
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    const x = Math.min(Math.max(8, rect.left), Math.max(8, window.innerWidth - w - 8));
    let y = rect.bottom + gap;
    if (y + h > window.innerHeight - 8) y = Math.max(8, rect.top - h - gap);
    el.style.left = x + "px";
    el.style.top = y + "px";
  };
  const openEditor = () => {
    const sel = window.getSelection();
    const rect = sel && sel.rangeCount > 0 && !sel.isCollapsed ? sel.getRangeAt(0).getBoundingClientRect() : null;
    clearTrigger();
    clearEditor();
    const ed = document.createElement("div");
    ed.className = "dsha-pop dsha-float";
    ed.setAttribute("role", "dialog");
    ed.setAttribute("aria-label", t("editor.title"));
    const title = document.createElement("div");
    title.className = "dsha-pop-title";
    title.textContent = t("editor.title");
    const quoteEl = document.createElement("blockquote");
    quoteEl.className = "dsha-quote";
    quoteEl.textContent = quote;
    const area = document.createElement("textarea");
    area.placeholder = t("editor.placeholder");
    const row = document.createElement("div");
    row.className = "dsha-pop-row";
    const cancel = document.createElement("button");
    cancel.type = "button";
    cancel.className = "dsha-btn";
    cancel.textContent = t("editor.cancel");
    cancel.addEventListener("click", clearEditor);
    const ok = document.createElement("button");
    ok.type = "button";
    ok.className = "dsha-btn";
    ok.dataset.kind = "primary";
    ok.textContent = t("editor.confirm");
    ok.disabled = true;
    const confirm = () => {
      const comment = area.value.trim();
      if (comment.length === 0) return;
      submit(quote, comment);
      clearEditor();
      window.getSelection()?.removeAllRanges();
    };
    ok.addEventListener("click", confirm);
    area.addEventListener("input", () => {
      ok.disabled = area.value.trim().length === 0;
    });
    area.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        clearEditor();
        return;
      }
      if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
        event.preventDefault();
        confirm();
      }
    });
    row.append(cancel, ok);
    ed.append(title, quoteEl, area, row);
    root.appendChild(ed);
    editor = ed;
    if (rect) place(ed, rect, 8);
    else {
      ed.style.left = "50%";
      ed.style.top = "30%";
      ed.style.transform = "translateX(-50%)";
    }
    area.focus();
  };
  const onMouseUp = (event) => {
    if (event.button !== 0) return;
    if (event.target instanceof Node && root.contains(event.target)) return;
    if (editor) return;
    const found = selectionInChat();
    if (!found) {
      clearTrigger();
      return;
    }
    quote = found.text;
    clearTrigger();
    const b = document.createElement("button");
    b.type = "button";
    b.className = "dsha-float-trigger";
    b.textContent = t("action.annotate");
    b.addEventListener("mousedown", (event2) => event2.preventDefault());
    b.addEventListener("click", openEditor);
    root.appendChild(b);
    trigger = b;
    place(b, found.rect, 6);
  };
  const onSelectionChange = () => {
    const sel = window.getSelection();
    if ((!sel || sel.isCollapsed) && !editor) clearTrigger();
  };
  const onKeyDown = (event) => {
    if (event.key === "Escape") hideAll();
  };
  const onDocDown = (event) => {
    if (editor && event.target instanceof Node && !editor.contains(event.target)) clearEditor();
  };
  const onScroll = () => hideAll();
  document.addEventListener("mouseup", onMouseUp);
  document.addEventListener("selectionchange", onSelectionChange);
  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("mousedown", onDocDown, true);
  document.addEventListener("scroll", onScroll, true);
  return () => {
    document.removeEventListener("mouseup", onMouseUp);
    document.removeEventListener("selectionchange", onSelectionChange);
    document.removeEventListener("keydown", onKeyDown);
    document.removeEventListener("mousedown", onDocDown, true);
    document.removeEventListener("scroll", onScroll, true);
    root.remove();
  };
}

// src/client/styles.ts
var TAG_ID = "@deepseek-ai/dsh-client-ui-annotator/annotator.css";
var CSS = `
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
`;
function ensureStyles() {
  const existing = document.querySelector("style[data-plugin-css=" + JSON.stringify(TAG_ID) + "]");
  if (existing) return () => {
  };
  const tag = document.createElement("style");
  tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-annotator";
  tag.dataset.pluginCss = TAG_ID;
  tag.textContent = CSS;
  document.head.appendChild(tag);
  return () => {
    tag.remove();
  };
}

// src/client/locales.ts
var NS = "annotator";
var zh = {
  "action.annotate": "\u6279\u6CE8",
  "action.hint": "\u6279\u6CE8\u8FD9\u6761\u56DE\u590D\uFF08\u53EF\u5148\u7528\u9F20\u6807\u9009\u4E2D\u5176\u4E2D\u4E00\u6BB5\u6587\u5B57\uFF09",
  "editor.title": "\u6DFB\u52A0\u6279\u6CE8",
  "editor.quoteLabel": "\u5F15\u7528",
  "editor.wholeMessage": "\uFF08\u6574\u6761\u56DE\u590D\uFF09",
  "editor.placeholder": "\u5199\u4E0B\u6279\u6CE8\u5185\u5BB9\u2026\uFF08Enter \u63D0\u4EA4\uFF0CShift+Enter \u6362\u884C\uFF09",
  "editor.confirm": "\u786E\u5B9A",
  "editor.cancel": "\u53D6\u6D88",
  "dock.title": "\u6279\u6CE8",
  "dock.itemLabel": "\u6279\u6CE8{n}",
  "dock.commentPlaceholder": "\u6279\u6CE8\u5185\u5BB9\u2026",
  "dock.remove": "\u79FB\u9664",
  "dock.clear": "\u6E05\u7A7A",
  "dock.collapse": "\u6536\u8D77",
  "dock.expand": "\u5C55\u5F00\u6279\u6CE8",
  "dock.insert": "\u63D2\u5165\u8349\u7A3F",
  "dock.send": "\u53D1\u9001\u6279\u6CE8",
  "compose.header": "\u4EE5\u4E0B\u662F\u6211\u5BF9\u8FD9\u6761\u56DE\u590D\u7684\u6279\u6CE8\uFF08\u5171{count}\u6761\uFF0C\u5F15\u7528\u4E0E\u6279\u6CE8\u9010\u6761\u5BF9\u5E94\uFF09\uFF1A",
  "compose.item": "\u6279\u6CE8 {n}",
  "compose.wholeMessage": "\uFF08\u6574\u6761\u56DE\u590D\uFF09"
};
var en = {
  "action.annotate": "Annotate",
  "action.hint": "Annotate this reply (select a passage first to quote it)",
  "editor.title": "Add annotation",
  "editor.quoteLabel": "Quote",
  "editor.wholeMessage": "(whole message)",
  "editor.placeholder": "Write the annotation\u2026 (Enter to submit, Shift+Enter for a newline)",
  "editor.confirm": "OK",
  "editor.cancel": "Cancel",
  "dock.title": "Annotations",
  "dock.itemLabel": "Annotation {n}",
  "dock.commentPlaceholder": "Annotation text\u2026",
  "dock.remove": "Remove",
  "dock.clear": "Clear all",
  "dock.collapse": "Collapse",
  "dock.expand": "Expand annotations",
  "dock.insert": "Insert into draft",
  "dock.send": "Send annotations",
  "compose.header": "My annotations on this reply ({count} in total, each quote paired with its note):",
  "compose.item": "Annotation {n}",
  "compose.wholeMessage": "(whole message)"
};

// src/client/index.ts
var inject = ["slots", "locale"];
function apply(ctx) {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), "annotator: dictionaries");
  ctx.effect(() => ensureStyles(), "annotator: stylesheet");
  const controllers = /* @__PURE__ */ new Map();
  const controllerFor = (sessionId) => {
    let controller = controllers.get(sessionId);
    if (!controller) {
      controller = new AnnotationController();
      controllers.set(sessionId, controller);
    }
    return controller;
  };
  ctx.effect(() => () => {
    for (const controller of controllers.values()) controller.dispose();
    controllers.clear();
  }, "annotator: controllers");
  const mountedDocks = /* @__PURE__ */ new Map();
  const currentSession = () => {
    let last = null;
    for (const id of mountedDocks.keys()) last = id;
    return last;
  };
  const face = (sessionId) => {
    const controller = controllerFor(sessionId);
    return {
      hooks: { annotations: controller },
      add: controller.add,
      setComment: controller.setComment,
      remove: controller.remove,
      clear: controller.clear,
      setCollapsed: controller.setCollapsed,
      trackDock: () => {
        mountedDocks.set(sessionId, true);
        return () => {
          mountedDocks.delete(sessionId);
        };
      }
    };
  };
  ctx.effect(
    () => createFloatingAnnotator({
      t: ctx.locale.bind(NS),
      submit: (quote, comment) => {
        const sessionId = currentSession();
        if (sessionId === null) return;
        controllerFor(sessionId).add({ messageId: null, quote, comment });
      }
    }),
    "annotator: floating"
  );
  ctx.slots.inject("conversation.chat.assistant-actions", () => ctx.slots.register({
    name: "conversation.chat.assistant-actions",
    id: "annotator",
    order: 20,
    locale: NS,
    inject: (sessionId) => face(sessionId)
  }, AnnotateButton));
  ctx.slots.inject("conversation.input.dock", () => ctx.slots.register({
    name: "conversation.input.dock",
    id: "annotator",
    order: 100,
    locale: NS,
    inject: (sessionId) => face(sessionId)
  }, AnnotationDock));
}
		return module.exports;
	}
});
//# sourceMappingURL=client.js.map
