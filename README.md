# dsh-message-annotator

**Quote-and-comment annotations for DeepSeek Harness (DSH), Codex-style.**

English | [中文](#中文说明)

Select any text in the chat — an assistant reply, a mid-turn step, a tool output — and a floating **Annotate** button appears beside the selection. Each annotation pairs the quoted passage with your note and is staged as a numbered card above the composer: aligned, editable, removable. Send them all at once: the plugin composes your draft plus every annotation into one structured message for the agent.

## Features

- **Selection floating trigger** — select any text in the chat flow and an Annotate chip pops up next to it; the quote is the selected passage.
- **Per-message action** — every finalized assistant message also gets an Annotate icon in its action row (next to like/dislike); without a selection it annotates the whole message.
- **Annotation dock above the composer** — numbered cards (`Annotation 1`, `Annotation 2`, …) each pairing the quote with an editable note; per-card remove, clear all.
- **Collapsible strip** — many annotations collapse into a single chip row (hover a chip to preview, click × to remove), with Send still one click away.
- **Aligned send** — `Send annotations` composes the draft plus all annotations into one message, each quote block aligned with its note; `Insert into draft` only stages the composed text for your review.
- Bilingual UI (zh/en follows the shell locale), theme-token styling (fits light/dark and glass themes).

## Install

Declares the official `dsh.bundle` manifest — one command installs and enables it:

```sh
dsh plugin --profile web add github:Theoz001/dsh-message-annotator
```

Then restart dsh and reload the Web UI.

Manual install (macOS/Linux):

```sh
git clone https://github.com/Theoz001/dsh-message-annotator
ln -s "$PWD/dsh-message-annotator" ~/.dsh/profiles/node_modules/@deepseek-ai/dsh-client-ui-annotator
```

then append to `~/.dsh/profiles/web/cordis.patch.yml`:

```yaml
- insert:
    - id: ui-annotator
      name: '@deepseek-ai/dsh-client-ui-annotator'
```

## Outbound format

```text
adjust per the annotations

My annotations on this reply (2 in total, each quote paired with its note):

[Annotation 1]
> the index should be on user_id
No — queries filter by order_id, index that instead

[Annotation 2]
(whole message)
Direction is fine; please add error handling
```

## Build

The repo ships prebuilt `lib/` artifacts; rebuilding needs only node + esbuild
(see `build.mjs` for how esbuild is located, or set `DSH_ESBUILD`):

```sh
node build.mjs
```

## How it works

Pure client plugin (no host changes): the per-message entry registers into
`conversation.chat.assistant-actions`, the dock into `conversation.input.dock`,
and both share one per-session controller; the floating trigger is a
document-level selection watcher. Sending rides the public input machine
(`inputActions.setDraft` + `submit`).

## Known limitations

- The action-row button appears only on each turn's closing message (a slot constraint); use the selection trigger for mid-turn steps.
- Staged annotations are in-memory per session — a page reload drops them (sent messages are unaffected).

## License

[MIT](LICENSE)

---

## 中文说明

在 DeepSeek Harness Web 聊天界面里对 Agent 的回复划重点、写批注：批注以卡片形式暂存在输入框上方、逐条与引用对齐，随后一键合并发送给 Agent。交互参考 Codex 桌面版的 quote-and-comment 模式。

### 功能

- **划词浮动批注**：聊天流里选中任意文字（Agent 回复、中间步骤、工具输出均可），选区旁浮出蓝色「批注」按钮，点击弹编辑框，引用即选中文本。
- **逐消息批注入口**：每条已完成的 Agent 回复的操作条（复制/点赞那一行）上也有「批注」按钮；不划词时批注整条回复。
- **批注条**：输入框上方列出全部暂存批注——编号、引用原文、可编辑批注内容、单条移除、一键清空。
- **缩略模式**：批注多时可「收起」为一行 chip（悬停看内容、× 单删），发送按钮保留，点标题处展开。
- **合并发送**：「发送批注」把当前草稿 + 编号对齐的批注块合成一条消息发出；「插入草稿」只排版进输入框供检查。

### 发送格式示例

```text
按批注调整一下

以下是我对这条回复的批注（共2条，引用与批注逐条对应）：

[批注 1]
> 这里的索引应该建在 user_id 上
不对，查询条件是 order_id，索引要跟着查询走

[批注 2]
（整条回复）
整体方向可以，再补一下错误处理
```

### 安装

```sh
dsh plugin --profile web add github:Theoz001/dsh-message-annotator
```

重启 dsh、刷新 Web UI 即生效。

### 已知限制

- 操作条按钮只出现在每个 turn 的收尾消息上（插槽固有约束）；批注中间步骤请用划词浮动按钮。
- 暂存批注为会话内内存态，刷新页面即丢失（已发送内容不受影响）。
