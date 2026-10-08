/**
 * Artikel aussondern — 3-Schritt-Wizard.
 * Steps: 1) Artikel auswählen → 2) Menge und Grund angeben → 3) Aussonderung prüfen & speichern.
 * Reads: artikel (Bezeichnung, Bestand, Zustand). Writes: bestandsbewegungen (Bewegungsart „Aussonderung“, Zeitpunkt vom Hook gesetzt).
 * Composes: IntentWizardShell, EntitySelectStep, Bound, BudgetTracker, StepNav, SummaryStep, SuccessStep.
 */
import { useState } from 'react';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { Bound } from '@/components/blocks/Bound';
import { BudgetTracker } from '@/components/blocks/BudgetTracker';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { fieldText, fieldNumber, fieldLookup } from '@/lib/journey';
import { useArtikelAussondernFlow } from '@/lib/journey/flows/ArtikelAussondern';
import { tx } from '@/i18n';

export default function ArtikelAussondernPage() {
  const [step, setStep] = useState(1);
  const flow = useArtikelAussondernFlow({
    steps: { artikel: 1, menge: 2, person_vorname: 2, person_nachname: 2, verwendungszweck: 2 },
    items: {
      artikel: r => ({
        id: r.id,
        title: fieldText(r, 'bezeichnung'),
        subtitle: [fieldLookup(r, 'zustand')?.label, tx`Bestand: ${fieldNumber(r, 'bestand') ?? 0}`].filter(Boolean).join(' · '),
      }),
    },
  });

  const form = flow.forms.bestandsbewegungen;
  const artikelId = form.get('artikel') as string | undefined;
  const artikel = artikelId ? flow.picks.artikel.recordOf(artikelId) : undefined;
  const bestand = artikel ? fieldNumber(artikel, 'bestand') ?? 0 : null;
  const mengeRaw = form.get('menge');
  const menge = mengeRaw === undefined || mengeRaw === null || mengeRaw === '' ? 0 : Number(mengeRaw);
  const tooMuch = bestand !== null && menge > bestand;
  const overshootMessage = tx('Nicht genug Bestand für diese Menge vorhanden.');

  return (
    <IntentWizardShell
      title={tx('Artikel aussondern')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Einen defekten oder nicht mehr nutzbaren Artikel aussondern und den Bestand reduzieren.'),
        needs: [tx('Der betroffene Artikel'), tx('Die auszusondernde Menge'), tx('Dein Name')],
      }}
    >
      <WizardStep label={tx('Artikel')} description={tx('Welcher Artikel wird ausgesondert?')}>
        <EntitySelectStep
          {...flow.picks.artikel.select}
          {...flow.pick('artikel')}
          searchPlaceholder={tx('Artikelbezeichnung suchen …')}
        />
      </WizardStep>
      <WizardStep label={tx('Menge und Grund')} description={tx('Wie viel wird ausgesondert und wofür?')} needs={['artikel']}>
        <div className="space-y-4">
          {artikel && bestand !== null && (
            <div className="space-y-2">
              <p className="text-sm font-medium">{fieldText(artikel, 'bezeichnung')}</p>
              <BudgetTracker
                format="count"
                budget={bestand}
                booked={Math.min(menge, bestand)}
                label={tx('Auszusondern vom Bestand')}
                unit={tx('Stück')}
                texts={{ booked: tx('Aussondern'), remaining: tx('Bleibt im Bestand') }}
              />
              {tooMuch && <p className="text-xs text-destructive">{overshootMessage}</p>}
            </div>
          )}
          <Bound form={form} name="menge" />
          <Bound form={form} name="person_vorname" />
          <Bound form={form} name="person_nachname" />
          <Bound form={form} name="verwendungszweck" hint={tx('z. B. defekt, verschlissen, nicht reparierbar')} />
          <StepNav
            onBack={() => setStep(1)}
            onNext={() => {
              const ok = flow.validateStep(2);
              if (ok && tooMuch) return overshootMessage;
              return ok;
            }}
            nextStepLabel={tx('Prüfen')}
          />
        </div>
      </WizardStep>
      <WizardStep label={tx('Prüfen')} description={tx('Alles richtig? Dann Aussonderung speichern.')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            whatHappensNext={tx('Die Aussonderung wird als Bestandsbewegung gebucht und der Bestand des Artikels sinkt.')}
          />
        )}
      </WizardStep>
      {flow.submit.result && (
        <SuccessStep
          result={flow.submit.result}
          forms={flow.formList}
          submit={flow.submit}
          title={tx('Aussonderung gespeichert')}
          next={[
            { label: tx('Entnahme erfassen'), href: '#/intents/entnahme-erfassen' },
            { label: tx('Rückgabe erfassen'), href: '#/intents/rueckgabe-erfassen' },
            { label: tx('Wareneingang erfassen'), href: '#/intents/wareneingang-erfassen' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
        />
      )}
    </IntentWizardShell>
  );
}
