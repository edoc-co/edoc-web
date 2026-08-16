'use client';

import { useEffect, useRef } from 'react';
import CodeMirror, { type EditorView } from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { pythonEditorTheme } from '@/lib/editor/pythonTheme';
import { damageLineExtension, setDamageLine } from '@/lib/editor/damageLineExtension';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  /** Line to flash at 12% --fail, or null to clear. */
  damageLine: number | null;
}

/**
 * DESIGN.md §7 Zone B: "The calmest surface in the product... no
 * ambient motion... nothing animates while the editor has focus."
 * This component has no animation of its own — the damage-line
 * decoration is a flat background, not a transition — and the
 * flash/vignette/HP-bar effects it sits beside all live outside it.
 */
export default function Editor({ value, onChange, damageLine }: EditorProps) {
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    viewRef.current?.dispatch({ effects: setDamageLine.of(damageLine) });
  }, [damageLine]);

  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      height="320px"
      theme="none"
      extensions={[python(), ...pythonEditorTheme, ...damageLineExtension]}
      basicSetup={{
        highlightActiveLine: false,
        highlightActiveLineGutter: false,
        foldGutter: false,
      }}
      onCreateEditor={(view: EditorView) => {
        viewRef.current = view;
      }}
    />
  );
}
