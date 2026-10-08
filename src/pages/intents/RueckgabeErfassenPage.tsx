/**
 * Rückgabe erfassen — 4-Schritt-Wizard.
 * Steps: 1) Artikel auswählen → 2) Menge eingeben → 3) Name angeben → 4) Rückgabe speichern.
 * Reads: artikel (Bestand, Einheit, Lagerort als Kontext). Writes: bestandsbewegungen (Art „Rückgabe“, Zeitpunkt jetzt — vom Hook gesetzt).
 * Composes: IntentWizardShell, EntitySelectStep, Bound, StepNav, SummaryStep, SuccessStep.
 */
import { useState } from 'react';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { Bound } from '@/components/blocks/Bound';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { fieldText, fieldNumber, fieldLookup } from '@/lib/journey';
import { useRueckgabeErfassenFlow } from '@/lib/journey/flows/RueckgabeErfassen';
import { tx } from '@/i18n';

export default function RueckgabeErfassenPage() {
  const [step, setStep] = useState(1);
  const flow = useRueckgabeErfassenFlow({
    steps: { artikel: 1, menge: 2, person_vorname: 3, person_nachname: 3, verwendungszweck: 3, bemerkungen: 3 },
    items: {
      artikel: r => {
        const bestand = fieldNumber(r, 'bestand');
        const einheit = fieldLookup(r, 'einheit')?.label ?? '';
        return {
          id: r.id,
          title: fieldText(r, 'bezeichnung'),
          subtitle: fieldText(r, 'artikelnummer'),
          stats: bestand == null ? undefined : [{ label: tx('Bestand'), value: `${bestand} ${einheit}`.trim() }],
        };
      },
    },
  });

  const form = flow.forms.bestandsbewegungen;
  const artikelId = form.get('artikel') as string | null | undefined;
  const artikel = artikelId ? flow.picks.artikel.recordOf(artikelId) : undefined;
  const bestand = artikel ? fieldNumber(artikel, 'bestand') : null;
  const einheit = artikel ? fieldLookup(artikel, 'einheit')?.label ?? '' : '';
  const menge = Number(form.get('menge'));
  const mengeOk = Number.isFinite(menge) && menge > 0;

  return (
    <IntentWizardShell
      title={tx('Rückgabe erfassen')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Bring einen Artikel zurück ins Lager und erhöhe den Bestand.'),
        needs: [tx('Den zurückgebrachten Artikel'), tx('Die Menge'), tx('Deinen Namen')],
      }}
    >
      <WizardStep label={tx('Artikel')} heading={tx('Artikel auswählen')} description={tx('Welcher Artikel kommt zurück ins Lager?')}>
        <EntitySelectStep
          {...flow.picks.artikel.select}
          {...flow.pick('artikel')}
          searchPlaceholder={tx('Bezeichnung oder Artikelnummer …')}
        />
      </WizardStep>

      <WizardStep label={tx('Menge')} heading={tx('Menge eingeben')} description={tx('Wie viele Einheiten bringst du zurück?')} needs={['artikel']}>
        <div className="space-y-4">
          {artikel && (
            <div className="rounded-xl border bg-secondary/40 p-3 text-sm">
              <p className="font-medium">{fieldText(artikel, 'bezeichnung')}</p>
              {bestand != null && (
                <p className="text-muted-foreground">
                  {tx`Aktueller Bestand: ${bestand} ${einheit}`}
                  {mengeOk && <> → {tx`danach ${bestand + menge} ${einheit}`}</>}
                </p>
              )}
            </div>
          )}
          <Bound form={form} name="menge" />
          <StepNav onBack={() => setStep(1)} onNext={() => form.validate(['menge'])} nextStepLabel={tx('Name angeben')} />
        </div>
      </WizardStep>

      <WizardStep label={tx('Name')} heading={tx('Name angeben')} description={tx('Wer bringt den Artikel zurück?')}>
        <div className="space-y-4">
          <Bound form={form} name="person_vorname" />
          <Bound form={form} name="person_nachname" />
          <Bound form={form} name="verwendungszweck" />
          <Bound form={form} name="bemerkungen" rows={3} />
          <StepNav
            onBack={() => setStep(2)}
            onNext={() => form.validate(['person_vorname', 'person_nachname', 'verwendungszweck', 'bemerkungen'])}
            nextStepLabel={tx('Prüfen')}
          />
        </div>
      </WizardStep>

      <WizardStep label={tx('Speichern')} heading={tx('Rückgabe speichern')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            items={[{ key: 'bewegungsart', label: tx('Art der Bewegung'), value: tx('Rückgabe') }]}
            whatHappensNext={tx('Die Rückgabe wird als Bestandsbewegung gespeichert und der Bestand des Artikels steigt.')}
          />
        )}
      </WizardStep>

      {flow.submit.result && (
        <SuccessStep
          result={flow.submit.result}
          forms={flow.formList}
          submit={flow.submit}
          whatHappensNext={tx('Der Bestand des Artikels wird nachgeführt.')}
          next={[
            { label: tx('Entnahme erfassen'), href: '#/intents/entnahme-erfassen' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
        />
      )}
    </IntentWizardShell>
  );
}
