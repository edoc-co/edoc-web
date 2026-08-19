import { StateEffect, StateField } from '@codemirror/state';
import { Decoration, EditorView, type DecorationSet } from '@codemirror/view';

/**
 * Drives the "failing line flashes --fail at 12%" damage feedback —
 * DESIGN.md §7 Zone B. Dispatch `setDamageLine.of(lineNumber)` to mark
 * a line, or `setDamageLine.of(null)` to clear it (e.g. on a pass, or
 * on rematch). The actual 12%-opacity fill lives in styles/tokens.css
 * as `.cm-damage-line`, not here — this only manages which line has it.
 */
export const setDamageLine = StateEffect.define<number | null>();

const damageLineMark = Decoration.line({ attributes: { class: 'cm-damage-line' } });

export const damageLineField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(decorations, tr) {
    decorations = decorations.map(tr.changes);
    for (const effect of tr.effects) {
      if (effect.is(setDamageLine)) {
        if (effect.value == null) {
          decorations = Decoration.none;
        } else {
          const lineNumber = Math.min(Math.max(1, effect.value), tr.state.doc.lines);
          const line = tr.state.doc.line(lineNumber);
          decorations = Decoration.set([damageLineMark.range(line.from)]);
        }
      }
    }
    return decorations;
  },
  provide: (field) => EditorView.decorations.from(field),
});

export const damageLineExtension = [damageLineField];
