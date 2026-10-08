/**
 * Wareneingang erfassen — 4-Schritt-Wizard.
 * Steps: 1) Artikel auswählen → 2) Gelieferte Menge eingeben → 3) Name und Bemerkung angeben → 4) Wareneingang speichern.
 * Reads: artikel. Writes: bestandsbewegungen (Bewegungsart „Wareneingang“, Zeitpunkt jetzt — vom Flow gesetzt).
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
import { useWareneingangErfassenFlow } from '@/lib/journey/flows/WareneingangErfassen';
import { tx } from '@/i18n';

export default function WareneingangErfassenPage() {
  const [step, setStep] = useState(1);
  const flow = useWareneingangErfassenFlow({
    steps: { artikel: 1, menge: 2, person_vorname: 3, person_nachname: 3, verwendungszweck: 3, bemerkungen: 3 },
    items: {
      artikel: (a, ctx) => {
        const bestand = fieldNumber(a, 'bestand');
        const einheit = fieldLookup(a, 'einheit')?.label ?? '';
        return {
          id: a.id,
          title: fieldText(a, 'bezeichnung'),
          subtitle: [fieldText(a, 'artikelnummer'), ctx.ref('lieferant')].filter(Boolean).join(' · '),
          stats: bestand != null ? [{ label: tx('Bestand'), value: `${bestand} ${einheit}`.trim() }] : undefined,
        };
      },
    },
  });

  const form = flow.forms.bestandsbewegungen;
  const artikelId = form.get('artikel') as string | undefined;
  const artikel = artikelId ? flow.picks.artikel.recordOf(artikelId) : undefined;
  const bestand = artikel ? fieldNumber(artikel, 'bestand') : null;
  const einheit = artikel ? fieldLookup(artikel, 'einheit')?.label ?? '' : '';
  const menge = Number(form.get('menge'));
  const neuerBestand = bestand != null && Number.isFinite(menge) && menge > 0 ? bestand + menge : null;

  return (
    <IntentWizardShell
      title={tx('Wareneingang erfassen')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Eine Lieferung ist angekommen — buche die gelieferte Menge ein.'),
        needs: [tx('Den gelieferten Artikel'), tx('Die gelieferte Menge'), tx('Deinen Namen')],
      }}
    >
      <WizardStep label={tx('Artikel auswählen')} description={tx('Welcher Artikel wurde geliefert?')}>
        <EntitySelectStep
          {...flow.picks.artikel.select}
          {...flow.pick('artikel')}
          searchPlaceholder={tx('Bezeichnung oder Artikelnummer …')}
        />
      </WizardStep>

      <WizardStep label={tx('Gelieferte Menge')} description={tx('Wie viel ist angekommen?')} needs={['artikel']}>
        <div className="space-y-4">
          {artikel && (
            <div className="rounded-2xl bg-secondary p-4 text-sm">
              <p className="font-medium">{fieldText(artikel, 'bezeichnung')}</p>
              {bestand != null && (
                <p className="text-muted-foreground">
                  {tx`Aktueller Bestand: ${bestand} ${einheit}`}
                </p>
              )}
            </div>
          )}
          <Bound form={form} name="menge" />
          {neuerBestand != null && (
            <p className="text-sm text-muted-foreground">
              {tx`Nach dem Wareneingang: ${neuerBestand} ${einheit}`}
            </p>
          )}
          <StepNav
            onBack={() => setStep(1)}
            onNext={() => form.validate(['menge'])}
            nextStepLabel={tx('Name und Bemerkung')}
          />
        </div>
      </WizardStep>

      <WizardStep label={tx('Name und Bemerkung')} description={tx('Wer hat die Lieferung angenommen?')}>
        <div className="space-y-4">
          <Bound form={form} name="person_vorname" />
          <Bound form={form} name="person_nachname" />
          <Bound form={form} name="verwendungszweck" />
          <Bound form={form} name="bemerkungen" rows={3} />
          <StepNav
            onBack={() => setStep(2)}
            onNext={() => flow.validateStep(3)}
            nextStepLabel={tx('Prüfen')}
          />
        </div>
      </WizardStep>

      <WizardStep label={tx('Wareneingang speichern')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            whatHappensNext={tx('Die Lieferung wird als Wareneingang mit dem aktuellen Zeitpunkt gebucht.')}
          />
        )}
      </WizardStep>

      {flow.submit.result && (
        <SuccessStep
          result={flow.submit.result}
          forms={flow.formList}
          submit={flow.submit}
          next={[
            { label: tx('Entnahme erfassen'), href: '#/intents/entnahme-erfassen' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
        />
      )}
    </IntentWizardShell>
  );
}
