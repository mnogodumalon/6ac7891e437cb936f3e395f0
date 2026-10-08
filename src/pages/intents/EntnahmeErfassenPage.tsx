/**
 * Entnahme erfassen — 4-Schritt-Wizard.
 * Steps: 1) Artikel auswählen → 2) Menge eingeben (mit Bestandsprüfung) → 3) Name und Verwendungszweck → 4) Prüfen & speichern.
 * Reads: artikel. Writes: bestandsbewegungen (Entnahme, Zeitpunkt und Art setzt der Ablauf selbst).
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
import { useEntnahmeErfassenFlow } from '@/lib/journey/flows/EntnahmeErfassen';
import { tx } from '@/i18n';

export default function EntnahmeErfassenPage() {
  const [step, setStep] = useState(1);
  const flow = useEntnahmeErfassenFlow({
    steps: { artikel: 1, menge: 2, person_vorname: 3, person_nachname: 3, verwendungszweck: 3, bemerkungen: 3 },
    items: {
      artikel: r => {
        const bestand = fieldNumber(r, 'bestand');
        const einheit = fieldLookup(r, 'einheit')?.label ?? '';
        return {
          id: r.id,
          title: fieldText(r, 'bezeichnung'),
          subtitle: fieldText(r, 'artikelnummer'),
          stats: [{ label: tx('Bestand'), value: `${bestand ?? 0} ${einheit}`.trim() }],
        };
      },
    },
  });

  const form = flow.forms.bestandsbewegungen;
  const artikelId = form.get('artikel') as string | null | undefined;
  const artikel = artikelId ? flow.picks.artikel.recordOf(artikelId) : undefined;
  const bestand = artikel ? fieldNumber(artikel, 'bestand') ?? 0 : null;
  const einheit = artikel ? fieldLookup(artikel, 'einheit')?.label ?? '' : '';
  const mengeRaw = form.get('menge');
  const menge = mengeRaw === undefined || mengeRaw === null || mengeRaw === '' ? null : Number(mengeRaw);
  const tooMuch = bestand !== null && menge !== null && !Number.isNaN(menge) && menge > bestand;
  const stockMessage = tx('Nicht genug Bestand für diese Menge vorhanden.');

  const stockCheck = () => {
    if (bestand !== null && menge !== null && menge > bestand) return stockMessage;
    return true;
  };

  return (
    <IntentWizardShell
      title={tx('Entnahme erfassen')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{ description: tx('Einen Artikel aus dem Lager entnehmen und die Bewegung festhalten.'), needs: [tx('Artikel'), tx('Menge'), tx('Name der entnehmenden Person')] }}
    >
      <WizardStep label={tx('Artikel')} description={tx('Welchen Artikel entnimmst du?')}>
        <EntitySelectStep {...flow.picks.artikel.select} {...flow.pick('artikel')} searchPlaceholder={tx('Bezeichnung oder Artikelnummer …')} />
      </WizardStep>
      <WizardStep label={tx('Menge')} description={tx('Wie viel wird entnommen?')} needs={['artikel']}>
        <div className="space-y-4">
          {bestand !== null && (
            <BudgetTracker
              format="count"
              unit={einheit || tx('Stück')}
              budget={bestand}
              booked={menge !== null && !Number.isNaN(menge) ? menge : 0}
              label={tx('Entnahme vom Bestand')}
              texts={{ booked: tx('Entnahme'), of: tx('von'), remaining: tx('Bleibt im Lager'), over: tx('Mehr als im Bestand!'), none: tx('Kein Bestand vorhanden') }}
            />
          )}
          <Bound form={form} name="menge" hint={bestand !== null ? tx`Verfügbar: ${bestand} ${einheit}` : undefined} />
          {tooMuch && <p className="text-sm text-destructive">{stockMessage}</p>}
          <StepNav
            onBack={() => setStep(1)}
            onNext={() => (form.validate(['menge']) ? stockCheck() : false)}
            nextStepLabel={tx('Name und Zweck')}
          />
        </div>
      </WizardStep>
      <WizardStep label={tx('Person')} description={tx('Wer entnimmt und wofür?')}>
        <div className="space-y-4">
          <Bound form={form} name="person_vorname" />
          <Bound form={form} name="person_nachname" />
          <Bound form={form} name="verwendungszweck" />
          <Bound form={form} name="bemerkungen" />
          <StepNav
            onBack={() => setStep(2)}
            onNext={() => (flow.validateStep(3) ? stockCheck() : false)}
            nextStepLabel={tx('Prüfen')}
          />
        </div>
      </WizardStep>
      <WizardStep label={tx('Prüfen')} description={tx('Bestand prüfen und die Entnahme speichern.')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            items={[{ key: 'bewegungsart', label: tx('Art der Bewegung'), value: tx('Entnahme') }]}
            whatHappensNext={tx('Die Entnahme wird als Bestandsbewegung gespeichert und der Bestand wird danach nachgeführt.')}
          >
            {tooMuch && <p className="text-sm text-destructive">{stockMessage}</p>}
          </SummaryStep>
        )}
      </WizardStep>
      {flow.submit.result && (
        <SuccessStep
          result={flow.submit.result}
          forms={flow.formList}
          submit={flow.submit}
          next={[
            { label: tx('Rückgabe erfassen'), href: '#/intents/rueckgabe-erfassen' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
        />
      )}
    </IntentWizardShell>
  );
}
