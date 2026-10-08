import { lookupLabel } from '@/i18n';

// AUTOMATICALLY GENERATED TYPES - DO NOT EDIT

export type LookupValue = { key: string; label: string };
/** A raw record URL (applookup reference). NEVER render this directly
 *  in JSX — it is a URL, not a display value. Show the enriched `*Name`
 *  field or resolve it via the entity map instead. Assignable to/from
 *  string everywhere; the `& {}` keeps the alias NAME visible in tsc
 *  error messages (a plain primitive alias gets normalized away). */
export type RecordUrl = string & {};
export type GeoLocation = { lat: number; long: number; info?: string };

export type AttachmentType = 'file' | 'note' | 'url' | 'json';
export interface Attachment {
  id: string;
  type: AttachmentType;
  label: string | null;
  value: string | null;
  active: boolean;
  createdat?: string | null;
  updatedat?: string | null;
}

export interface AttachmentInput {
  type: AttachmentType;
  label?: string;
  value: string;
  active?: boolean;
}

export interface Lagerorte {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    bezeichnung?: string;
    raum?: string;
    regal?: string;
    fach?: string;
    bemerkungen?: string;
  };
}

export interface Lieferanten {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    firmenname?: string;
    ansprechpartner_vorname?: string;
    ansprechpartner_nachname?: string;
    email?: string;
    telefon?: string;
    strasse?: string;
    hausnummer?: string;
    plz?: string;
    ort?: string;
    webseite?: string;
  };
}

export interface Artikel {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    bezeichnung?: string;
    artikelnummer?: string;
    kategorie?: LookupValue;
    hersteller?: string;
    modell?: string;
    seriennummer?: string;
    bestand?: number;
    mindestbestand?: number;
    einheit?: LookupValue;
    zustand?: LookupValue;
    anschaffungsdatum?: string; // Format: YYYY-MM-DD oder ISO String
    anschaffungspreis?: number;
    naechste_pruefung?: string; // Format: YYYY-MM-DD oder ISO String
    lagerort?: RecordUrl; // applookup -> URL zu 'Lagerorte' Record
    lieferant?: RecordUrl; // applookup -> URL zu 'Lieferanten' Record
    foto?: string;
    bemerkungen?: string;
  };
}

export interface Bestandsbewegungen {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    artikel?: RecordUrl; // applookup -> URL zu 'Artikel' Record
    bewegungsart?: LookupValue;
    zeitpunkt?: string; // Format: YYYY-MM-DD oder ISO String
    menge?: number;
    person_vorname?: string;
    person_nachname?: string;
    verwendungszweck?: string;
    bemerkungen?: string;
  };
}

export const APP_IDS = {
  LAGERORTE: '6ac78903094eaaf4fc6924d1',
  LIEFERANTEN: '6ac78907540d6c63ab70fac8',
  ARTIKEL: '6ac78908a9f5968548ebe982',
  BESTANDSBEWEGUNGEN: '6ac7890901e1cfa08ae14d00',
} as const;


export const LOOKUP_OPTIONS: Record<string, Record<string, {key: string, label: string}[]>> = {
  'artikel': {
    kategorie: [{ key: "handwerkzeug", get label() { return lookupLabel('artikel', 'kategorie', "handwerkzeug") ?? "Handwerkzeug"; } }, { key: "elektrowerkzeug", get label() { return lookupLabel('artikel', 'kategorie', "elektrowerkzeug") ?? "Elektrowerkzeug"; } }, { key: "maschine", get label() { return lookupLabel('artikel', 'kategorie', "maschine") ?? "Maschine"; } }, { key: "messgeraet", get label() { return lookupLabel('artikel', 'kategorie', "messgeraet") ?? "Messgerät"; } }, { key: "verbrauchsmaterial", get label() { return lookupLabel('artikel', 'kategorie', "verbrauchsmaterial") ?? "Verbrauchsmaterial"; } }, { key: "sicherheitsausruestung", get label() { return lookupLabel('artikel', 'kategorie', "sicherheitsausruestung") ?? "Sicherheitsausrüstung"; } }, { key: "sonstiges", get label() { return lookupLabel('artikel', 'kategorie', "sonstiges") ?? "Sonstiges"; } }],
    einheit: [{ key: "stueck", get label() { return lookupLabel('artikel', 'einheit', "stueck") ?? "Stück"; } }, { key: "packung", get label() { return lookupLabel('artikel', 'einheit', "packung") ?? "Packung"; } }, { key: "meter", get label() { return lookupLabel('artikel', 'einheit', "meter") ?? "Meter"; } }, { key: "liter", get label() { return lookupLabel('artikel', 'einheit', "liter") ?? "Liter"; } }, { key: "kilogramm", get label() { return lookupLabel('artikel', 'einheit', "kilogramm") ?? "Kilogramm"; } }, { key: "satz", get label() { return lookupLabel('artikel', 'einheit', "satz") ?? "Satz"; } }],
    zustand: [{ key: "neu", get label() { return lookupLabel('artikel', 'zustand', "neu") ?? "Neu"; } }, { key: "gut", get label() { return lookupLabel('artikel', 'zustand', "gut") ?? "Gut"; } }, { key: "gebraucht", get label() { return lookupLabel('artikel', 'zustand', "gebraucht") ?? "Gebraucht"; } }, { key: "reparaturbeduerftig", get label() { return lookupLabel('artikel', 'zustand', "reparaturbeduerftig") ?? "Reparaturbedürftig"; } }, { key: "defekt", get label() { return lookupLabel('artikel', 'zustand', "defekt") ?? "Defekt"; } }],
  },
  'bestandsbewegungen': {
    bewegungsart: [{ key: "rueckgabe", get label() { return lookupLabel('bestandsbewegungen', 'bewegungsart', "rueckgabe") ?? "Rückgabe"; } }, { key: "wareneingang", get label() { return lookupLabel('bestandsbewegungen', 'bewegungsart', "wareneingang") ?? "Wareneingang"; } }, { key: "korrektur", get label() { return lookupLabel('bestandsbewegungen', 'bewegungsart', "korrektur") ?? "Korrektur"; } }, { key: "aussonderung", get label() { return lookupLabel('bestandsbewegungen', 'bewegungsart', "aussonderung") ?? "Aussonderung"; } }, { key: "entnahme", get label() { return lookupLabel('bestandsbewegungen', 'bewegungsart', "entnahme") ?? "Entnahme"; } }],
  },
};

// Optimistic LookupValue writes: never re-type a label — resolve the schema
// option instead (its label is a locale-aware getter; falls back to the key).
// WRONG: status: { key: 'offen', label: 'Offen' }   (frozen in one language)
// RIGHT: status: lookupOption('<appKey>', 'status', 'offen')
export function lookupOption(app: string, field: string, key: string): LookupValue {
  return LOOKUP_OPTIONS[app]?.[field]?.find(o => o.key === key) ?? { key, label: key };
}

export const FIELD_TYPES: Record<string, Record<string, string>> = {
  'lagerorte': {
    'bezeichnung': 'string/text',
    'raum': 'string/text',
    'regal': 'string/text',
    'fach': 'string/text',
    'bemerkungen': 'string/textarea',
  },
  'lieferanten': {
    'firmenname': 'string/text',
    'ansprechpartner_vorname': 'string/text',
    'ansprechpartner_nachname': 'string/text',
    'email': 'string/email',
    'telefon': 'string/tel',
    'strasse': 'string/text',
    'hausnummer': 'string/text',
    'plz': 'string/text',
    'ort': 'string/text',
    'webseite': 'string/url',
  },
  'artikel': {
    'bezeichnung': 'string/text',
    'artikelnummer': 'string/text',
    'kategorie': 'lookup/select',
    'hersteller': 'string/text',
    'modell': 'string/text',
    'seriennummer': 'string/text',
    'bestand': 'number',
    'mindestbestand': 'number',
    'einheit': 'lookup/select',
    'zustand': 'lookup/radio',
    'anschaffungsdatum': 'date/date',
    'anschaffungspreis': 'number',
    'naechste_pruefung': 'date/date',
    'lagerort': 'applookup/select',
    'lieferant': 'applookup/select',
    'foto': 'file',
    'bemerkungen': 'string/textarea',
  },
  'bestandsbewegungen': {
    'artikel': 'applookup/select',
    'bewegungsart': 'lookup/radio',
    'zeitpunkt': 'date/datetimeminute',
    'menge': 'number',
    'person_vorname': 'string/text',
    'person_nachname': 'string/text',
    'verwendungszweck': 'string/text',
    'bemerkungen': 'string/textarea',
  },
};

export const HUB_TOPOLOGY: Record<string, { field: string; entity: string }[]> = {
};

type StripLookup<T> = {
  [K in keyof T]: T[K] extends LookupValue | undefined ? string | LookupValue | undefined
    : T[K] extends LookupValue[] | undefined ? string[] | LookupValue[] | undefined
    : T[K];
};

// Helper Types for creating new records (lookup fields as plain strings for API)
export type CreateLagerorte = StripLookup<Lagerorte['fields']>;
export type CreateLieferanten = StripLookup<Lieferanten['fields']>;
export type CreateArtikel = StripLookup<Artikel['fields']>;
export type CreateBestandsbewegungen = StripLookup<Bestandsbewegungen['fields']>;