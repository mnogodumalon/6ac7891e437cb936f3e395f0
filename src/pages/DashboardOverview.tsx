import { useMemo, useState } from 'react';
import { format, parseISO, differenceInCalendarDays } from 'date-fns';
import { IconPlus, IconSearch, IconTruckDelivery, IconAlertTriangle, IconClockExclamation, IconTool } from '@tabler/icons-react';
import type { DashboardData } from '@/hooks/useDashboardData';
import { useEntityCrud } from '@/components/EntityCrud';
import type { EnrichedArtikel } from '@/types/enriched';
import { formatDate, lookupKey } from '@/lib/formatters';
import { useClock, gruss, namen } from '@/lib/polish';
import { tx, dateFnsLocale } from '@/i18n';
import { DashboardGrid } from '@/components/DashboardGrid';
import { StatStrip, StatStripItem } from '@/components/StatCard';
import { WorkList } from '@/components/WorkList';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Filter = 'all' | 'unter' | 'pruefung' | 'defekt';

export default function DashboardOverview({ data }: { data: DashboardData }) {
  const { bestandsbewegungen } = data;
  const crud = useEntityCrud(data);
  const enrichedArtikel = crud.enriched.artikel;
  const clock = useClock();
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  const today = format(clock, 'yyyy-MM-dd');

  const isUnter = (a: EnrichedArtikel) =>
    a.fields.mindestbestand != null && (a.fields.bestand ?? 0) < a.fields.mindestbestand;
  const daysToCheck = (a: EnrichedArtikel): number | null =>
    a.fields.naechste_pruefung
      ? differenceInCalendarDays(parseISO(a.fields.naechste_pruefung.slice(0, 10)), parseISO(today))
      : null;
  const isPruefung = (a: EnrichedArtikel) => {
    const d = daysToCheck(a);
    return d != null && d <= 30;
  };
  const isDefekt = (a: EnrichedArtikel) => {
    const z = lookupKey(a.fields.zustand);
    return z === 'defekt' || z === 'reparaturbeduerftig';
  };

  const unter = useMemo(() => enrichedArtikel.filter(isUnter), [enrichedArtikel]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const pruefungen = useMemo(
    () => enrichedArtikel.filter(isPruefung).sort((a, b) => (daysToCheck(a) ?? 0) - (daysToCheck(b) ?? 0)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [enrichedArtikel, today],
  );
  const defekte = useMemo(() => enrichedArtikel.filter(isDefekt), [enrichedArtikel]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return enrichedArtikel
      .filter(a => (filter === 'unter' ? isUnter(a) : filter === 'pruefung' ? isPruefung(a) : filter === 'defekt' ? isDefekt(a) : true))
      .filter(a => !q || [a.fields.bezeichnung, a.fields.artikelnummer, a.lagerortName, a.lieferantName, a.fields.hersteller]
        .some(v => (v ?? '').toLowerCase().includes(q)))
      .sort((a, b) => Number(isUnter(b)) - Number(isUnter(a)) || (a.fields.bezeichnung ?? '').localeCompare(b.fields.bezeichnung ?? ''));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enrichedArtikel, filter, query, today]);

  const recent = useMemo(
    () => [...bestandsbewegungen]
      .sort((a, b) => (b.fields.zeitpunkt ?? b.createdat).localeCompare(a.fields.zeitpunkt ?? a.createdat))
      .slice(0, 5),
    [bestandsbewegungen],
  );
  const artikelName = (url?: string) => {
    const id = url?.match(/([a-f0-9]{24})$/i)?.[1];
    return enrichedArtikel.find(a => a.record_id === id)?.fields.bezeichnung ?? '—';
  };

  const wareneingang = (a: EnrichedArtikel) =>
    crud.bestandsbewegungen.openCreate({ artikel: a.record_id, bewegungsart: 'wareneingang', zeitpunkt: format(clock, "yyyy-MM-dd'T'HH:mm") });

  const toggle = (f: Filter) => setFilter(cur => (cur === f ? 'all' : f));

  const contextLine = (() => {
    if (enrichedArtikel.length === 0) return tx('Richte dein Lager ein — lege den ersten Artikel an.');
    if (unter.length > 0) {
      const n = namen(unter.map(a => a.fields.bezeichnung ?? ''), 3);
      return pruefungen.length > 0
        ? tx`Nachbestellen: ${n} — und ${pruefungen[0].fields.bezeichnung ?? ''} braucht bald eine Prüfung.`
        : tx`Nachbestellen: ${n} liegt unter dem Mindestbestand.`;
    }
    if (pruefungen.length > 0) return tx`Bestand ist in Ordnung — als Nächstes wird ${pruefungen[0].fields.bezeichnung ?? ''} geprüft.`;
    if (defekte.length > 0) return tx`Alles vorrätig — ${namen(defekte.map(a => a.fields.bezeichnung ?? ''), 3)} wartet auf Reparatur.`;
    return tx('Alles vorrätig, nichts fällig. Gute Werkstatt-Ordnung!');
  })();

  const checkLabel = (a: EnrichedArtikel) => {
    const d = daysToCheck(a);
    if (d == null) return null;
    if (d < 0) return { text: tx`${-d} Tage überfällig`, cls: 'font-medium text-destructive' };
    if (d === 0) return { text: tx('heute fällig'), cls: 'font-medium text-destructive' };
    if (d <= 30) return { text: tx`in ${d} Tagen`, cls: 'font-medium text-amber-600' };
    return { text: formatDate(a.fields.naechste_pruefung), cls: 'text-muted-foreground' };
  };

  const StockBar = ({ a }: { a: EnrichedArtikel }) => {
    const b = a.fields.bestand ?? 0;
    const m = a.fields.mindestbestand;
    const low = isUnter(a);
    const pct = m ? Math.min(100, Math.round((b / (m * 2)) * 100)) : 100;
    return (
      <div className="min-w-0">
        <div className="flex items-baseline gap-1 text-sm">
          <span className={low ? 'font-semibold text-destructive' : 'font-semibold'}>{b}</span>
          <span className="text-muted-foreground">/ {m ?? '—'} {a.fields.einheit?.label ?? ''}</span>
        </div>
        {m != null && (
          <div className="mt-1 h-1.5 w-full max-w-[140px] overflow-hidden rounded-full bg-muted">
            <div className={`h-full rounded-full ${low ? 'bg-destructive' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }} />
          </div>
        )}
      </div>
    );
  };

  const ZustandWord = ({ a }: { a: EnrichedArtikel }) => {
    const bad = isDefekt(a);
    return <span className={bad ? 'font-medium text-destructive' : 'text-muted-foreground'}>{a.fields.zustand?.label ?? '—'}</span>;
  };

  const table = (
    <div className="overflow-hidden rounded-[27px] bg-card shadow-sm">
      <div className="flex flex-wrap items-center gap-3 p-4">
        <div className="relative min-w-0 flex-1 basis-56">
          <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={e => setQuery(e.target.value)} placeholder={tx('Artikel, Lagerort, Lieferant suchen …')} className="pl-9" />
        </div>
        {crud.artikel.canWrite && (
          <Button onClick={() => crud.artikel.openCreate({})} className="shrink-0">
            <IconPlus size={16} className="mr-1 shrink-0" />{tx('Neuer Artikel')}
          </Button>
        )}
      </div>

      {rows.length === 0 ? (
        <p className="px-4 pb-6 text-sm text-muted-foreground">{tx('Keine Artikel für diese Auswahl.')}</p>
      ) : (
        <>
          <div className="divide-y md:hidden">
            {rows.map(a => {
              const c = checkLabel(a);
              return (
                <div key={a.record_id} className="flex items-center gap-3 px-4 py-3">
                  <button type="button" className="min-w-0 flex-1 text-left" onClick={() => crud.artikel.openDetail(a)}>
                    <div className="truncate font-medium">{a.fields.bezeichnung}</div>
                    <div className="truncate text-xs text-muted-foreground">{a.lagerortName || '—'}</div>
                    <div className="mt-1"><StockBar a={a} /></div>
                    <div className="mt-1 text-xs"><ZustandWord a={a} />{c && <span className={c.cls}> · {c.text}</span>}</div>
                  </button>
                  {isUnter(a) && crud.bestandsbewegungen.canWrite && (
                    <Button size="sm" variant="outline" onClick={() => wareneingang(a)} className="shrink-0">
                      <IconTruckDelivery size={16} className="shrink-0" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y text-left text-xs text-muted-foreground">
                  <th className="px-4 py-2 font-medium">{tx('Artikel')}</th>
                  <th className="px-4 py-2 font-medium">{tx('Lagerort')}</th>
                  <th className="px-4 py-2 font-medium">{tx('Bestand / Mindestbestand')}</th>
                  <th className="px-4 py-2 font-medium">{tx('Zustand')}</th>
                  <th className="px-4 py-2 font-medium">{tx('Nächste Prüfung')}</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody>
                {rows.map(a => {
                  const c = checkLabel(a);
                  return (
                    <tr key={a.record_id} className="cursor-pointer border-b last:border-0 hover:bg-muted/50" onClick={() => crud.artikel.openDetail(a)}>
                      <td className="max-w-[240px] px-4 py-3">
                        <div className="truncate font-medium">{a.fields.bezeichnung}</div>
                        <div className="truncate text-xs text-muted-foreground">{[a.fields.kategorie?.label, a.fields.artikelnummer].filter(Boolean).join(' · ')}</div>
                      </td>
                      <td className="max-w-[180px] truncate px-4 py-3">{a.lagerortName || '—'}</td>
                      <td className="px-4 py-3"><StockBar a={a} /></td>
                      <td className="px-4 py-3"><ZustandWord a={a} /></td>
                      <td className="px-4 py-3">{c ? <span className={c.cls}>{c.text}</span> : <span className="text-muted-foreground">—</span>}</td>
                      <td className="px-4 py-3 text-right">
                        {isUnter(a) && crud.bestandsbewegungen.canWrite && (
                          <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); wareneingang(a); }}>
                            <IconTruckDelivery size={16} className="mr-1 shrink-0" />{tx('Wareneingang')}
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{gruss(clock)}</h1>
        <p className="text-sm text-muted-foreground">{contextLine}</p>
      </div>

      <DashboardGrid
        variant="wide"
        kpis={
          <StatStrip>
            <StatStripItem
              title={tx('Unter Mindestbestand')}
              value={unter.length}
              icon={<IconAlertTriangle size={18} className="text-muted-foreground" />}
              tone={unter.length > 0 ? 'destructive' : 'default'}
              onClick={() => toggle('unter')}
              active={filter === 'unter'}
            />
            <StatStripItem
              title={tx('Prüfung in 30 Tagen')}
              value={pruefungen.length}
              icon={<IconClockExclamation size={18} className="text-muted-foreground" />}
              tone={pruefungen.length > 0 ? 'warning' : 'default'}
              onClick={() => toggle('pruefung')}
              active={filter === 'pruefung'}
            />
            <StatStripItem
              title={tx('Defekt / Reparatur')}
              value={defekte.length}
              icon={<IconTool size={18} className="text-muted-foreground" />}
              tone={defekte.length > 0 ? 'warning' : 'default'}
              onClick={() => toggle('defekt')}
              active={filter === 'defekt'}
            />
          </StatStrip>
        }
        primary={table}
        aside={
          <>
            <WorkList
              title={tx('Prüfungen & Wartungen')}
              items={pruefungen.map(a => {
                const c = checkLabel(a);
                return {
                  id: a.record_id,
                  title: a.fields.bezeichnung ?? '—',
                  secondLine: <>{c && <span className={c.cls}>{c.text}</span>}<span className="text-muted-foreground"> · {a.lagerortName || '—'}</span></>,
                  action: crud.artikel.canWrite ? { label: tx('Termin setzen'), onClick: () => crud.artikel.openEdit(a) } : undefined,
                };
              })}
              onItemClick={id => { const a = enrichedArtikel.find(x => x.record_id === id); if (a) crud.artikel.openDetail(a); }}
              empty={{ text: tx('Keine Prüfung in den nächsten 30 Tagen fällig.') }}
            />
            <WorkList
              title={tx('Letzte Bestandsbewegungen')}
              items={recent.map(b => ({
                id: b.record_id,
                title: artikelName(b.fields.artikel),
                secondLine: (
                  <>
                    <span className="font-medium">{b.fields.bewegungsart?.label ?? '—'}</span>
                    <span className="text-muted-foreground"> · {b.fields.menge ?? 0} · {[b.fields.person_vorname, b.fields.person_nachname].filter(Boolean).join(' ') || '—'} · {b.fields.zeitpunkt ? format(parseISO(b.fields.zeitpunkt), 'dd.MM. HH:mm', { locale: dateFnsLocale() }) : ''}</span>
                  </>
                ),
              }))}
              onItemClick={id => { const b = bestandsbewegungen.find(x => x.record_id === id); if (b) crud.bestandsbewegungen.openDetail(b); }}
              empty={{ text: tx('Noch keine Bewegungen erfasst.') }}
            />
          </>
        }
      />
      {crud.surfaces}
    </div>
  );
}
