// The orchestrator's plan, as far as the running app needs it
// (docs/orchestrator/SPEC.md). Generated — do not edit; regenerated on every
// build and update from the stored plan. Without a plan every map is empty.
//
//   SYSTEM_ASSIGNED entity → fields a tool fills when a record is CREATED — the
//                   value does not exist before; dialogs hide these on create and
//                   the form-polish sets no default on them. A scheduled or
//                   update-triggered tool owns its field but is NOT in here.
//   PLAN_SENTENCES  slug → the plan in the owner's words (flows' field page)
//
// The runtime write guard (FLOW_WRITES/OWNERSHIP, planGuard.ts) left on
// 23.09.2026: a flow page composes against its generated hook, whose submit
// plan IS the Schreibliste — there is no way to spell a write outside it.

export const SYSTEM_ASSIGNED: Record<string, string[]> = {};

export const PLAN_SENTENCES: Record<string, string[]> = {
  "entnahme-erfassen": [
    "Legt an: bestandsbewegungen",
    "Automatisch: bewegungsart (fester Wert „entnahme“), zeitpunkt (aktueller Zeitpunkt, automatisch)"
  ],
  "rueckgabe-erfassen": [
    "Legt an: bestandsbewegungen",
    "Automatisch: bewegungsart (fester Wert „rueckgabe“), zeitpunkt (aktueller Zeitpunkt, automatisch)"
  ],
  "wareneingang-erfassen": [
    "Legt an: bestandsbewegungen",
    "Automatisch: bewegungsart (fester Wert „wareneingang“), zeitpunkt (aktueller Zeitpunkt, automatisch)"
  ],
  "artikel-aussondern": [
    "Legt an: bestandsbewegungen",
    "Automatisch: bewegungsart (fester Wert „aussonderung“), zeitpunkt (aktueller Zeitpunkt, automatisch)"
  ]
};

export const PLAN_SUMMARY = "Die Anwendung verwaltet das Inventar der Werkstatt: Werkzeuge, Maschinen, Messgeräte und Verbrauchsmaterial mit Lagerort, Lieferant und aktuellem Bestand. Jede Entnahme, Rückgabe oder Lieferung wird als Bestandsbewegung festgehalten, damit jederzeit klar ist, was wo liegt und was nachbestellt oder geprüft werden muss.";

/** slug → the lists a flow writes (the plan's Schreibliste). The nav leaves a
 *  flow out for a user who may not write one of them (lib/permissions.ts). */
export const FLOW_ENTITIES: Record<string, string[]> = {
  "entnahme-erfassen": [
    "bestandsbewegungen"
  ],
  "rueckgabe-erfassen": [
    "bestandsbewegungen"
  ],
  "wareneingang-erfassen": [
    "bestandsbewegungen"
  ],
  "artikel-aussondern": [
    "bestandsbewegungen"
  ]
};
