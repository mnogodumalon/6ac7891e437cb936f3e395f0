// Auto-generated. Per-entity form-enhancements config for "Artikel".
// Written by the backend form polish (app/services/form_polish.py) from the
// generator's manifest; scripts/parse-formulas.mjs expands the formula strings.
// Schema: see ./types.ts.

import type { FormEnhancements } from './types';

export const formEnhancements: FormEnhancements = {
  fieldOrder: [{"row": ["bezeichnung", "artikelnummer"], "cols": "2fr 1fr"}, {"row": ["kategorie", "einheit"], "cols": "1fr 1fr"}, {"row": ["hersteller", "modell"], "cols": "1fr 1fr"}, "seriennummer", {"row": ["bestand", "mindestbestand"], "cols": "1fr 1fr"}, "zustand", {"row": ["anschaffungsdatum", "anschaffungspreis"], "cols": "1fr 1fr"}, "naechste_pruefung", {"row": ["lagerort", "lieferant"], "cols": "1fr 1fr"}, "bemerkungen"],
  defaults: {
    'anschaffungsdatum': { kind: 'today' },
    'zustand': { kind: 'lookup', key: 'neu', label: 'Neu' },
  },
  computed: {},
};

export const computedDeps: Record<string, string[]> = {};
export const computedApplookupRefs: Record<string, {lookupKey: string}[]> = {};
