import type { Artikel, Bestandsbewegungen } from './app';

export type EnrichedArtikel = Artikel & {
  lagerortName: string;
  lieferantName: string;
};

export type EnrichedBestandsbewegungen = Bestandsbewegungen & {
  artikelName: string;
};
