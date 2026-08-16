import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';

/**
 * The editor is the stillest, calmest surface in the product
 * (DESIGN.md §1, §7) — so its own syntax palette stays close to
 * monochrome. `--accent-text` is used for keywords only, which doubles
 * as the "lit by the language you're learning" signature applied to
 * the one place code actually lives. `--pass`/`--fail` are never used
 * decoratively here — they mean test outcomes and nothing else.
 */
const editorViewTheme = EditorView.theme(
  {
    '&': {
      backgroundColor: 'var(--panel)',
      color: 'var(--text-hi)',
      height: '100%',
      fontSize: 'var(--text-editor-size)',
    },
    '.cm-scroller': {
      fontFamily: 'var(--font-code)',
    },
    '.cm-content': {
      caretColor: 'var(--accent)',
      lineHeight: 'var(--text-editor-leading)',
      padding: '24px 0',
    },
    '.cm-line': {
      padding: '0 24px',
    },
    '.cm-cursor, .cm-dropCursor': {
      borderLeftColor: 'var(--accent)',
    },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection': {
      backgroundColor: 'var(--raised) !important',
    },
    '.cm-gutters': {
      backgroundColor: 'var(--panel)',
      color: 'var(--text-lo)',
      border: 'none',
      fontFamily: 'var(--font-hud)',
    },
    '.cm-activeLine, .cm-activeLineGutter': {
      backgroundColor: 'transparent',
    },
    '&.cm-editor.cm-focused': {
      outline: 'none',
    },
  },
  { dark: true },
);

const highlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: 'var(--accent-text)' },
  { tag: [t.function(t.variableName), t.labelName], color: 'var(--text-hi)', fontWeight: '700' },
  {
    tag: [t.name, t.propertyName, t.typeName, t.className, t.namespace, t.self, t.definition(t.name)],
    color: 'var(--text-hi)',
  },
  { tag: [t.number, t.bool, t.atom], color: 'var(--text-hi)' },
  { tag: [t.string, t.special(t.string)], color: 'var(--text-mid)' },
  { tag: [t.operator, t.operatorKeyword, t.punctuation], color: 'var(--text-mid)' },
  { tag: [t.comment, t.meta], color: 'var(--text-lo)', fontStyle: 'italic' },
  { tag: t.invalid, color: 'var(--fail)' },
]);

export const pythonEditorTheme = [editorViewTheme, syntaxHighlighting(highlightStyle)];
