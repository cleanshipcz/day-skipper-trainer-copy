import { AlertTriangle, Radio, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ANNEX_IV_ADDITIONAL_LOCATION_SIGNALS, ANNEX_IV_DISTRESS_SIGNALS, ANNEX_IV_SOURCE_REVIEW } from "./annexIVDistressSignalsData";

const groups = ["Visual / pyrotechnic", "Sound / text", "Radio / beacon"] as const;

export const AnnexIVDistressSignals = () => (
  <section id="rule-37" tabIndex={-1} className="scroll-mt-28 space-y-6 focus:outline-none">
    <Card className="border-red-500/50 bg-red-500/10">
      <CardHeader><CardTitle className="flex items-center gap-2"><ShieldAlert className="text-red-500" /> Rule 37 scope and prohibition</CardTitle></CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p><strong>Rule 37:</strong> when a vessel is in distress and requires assistance, she shall use or exhibit the Annex IV signals. Annex IV says the signals below, used <strong>together or separately</strong>, indicate distress and need of assistance.</p>
        <p><strong>Prohibited:</strong> do not use or exhibit an Annex IV signal for another purpose, and do not use another signal that could be confused with one. These are distress signals—not demonstrations, routine attention signals, or permission to operate unfamiliar equipment.</p>
      </CardContent>
    </Card>

    {groups.map((group) => (
      <div key={group} className="space-y-3">
        <h3 className="text-xl font-bold">{group}</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {ANNEX_IV_DISTRESS_SIGNALS.filter((signal) => signal.medium === group).map((signal) => (
            <Card key={signal.id} data-signal-id={signal.id}>
              <CardHeader className="pb-2"><CardTitle className="flex items-start gap-2 text-base">{group === "Radio / beacon" ? <Radio className="mt-0.5 h-4 w-4 shrink-0 text-red-500" /> : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />}{signal.title}</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p><strong>Recognise:</strong> {signal.recognition}</p>
                {signal.equivalent && <p><strong>Exact form:</strong> {signal.equivalent}</p>}
                {signal.boundary && <p className="text-muted-foreground"><strong>Training boundary:</strong> {signal.boundary}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    ))}

    <Card>
      <CardHeader><CardTitle>Additional location aids mentioned by Annex IV</CardTitle></CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p>Annex IV draws attention to these aids; it lists them separately from paragraph 1’s distress signals:</p>
        <ul className="list-disc space-y-1 pl-5">{ANNEX_IV_ADDITIONAL_LOCATION_SIGNALS.map((signal) => <li key={signal}>{signal}</li>)}</ul>
      </CardContent>
    </Card>

    <Card>
      <CardHeader><CardTitle>If you receive or observe distress</CardTitle></CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p>Treat it as real. Keep a safe navigational watch; record the signal, time, position and available details; alert the master/skipper and the appropriate coastguard or rescue co-ordination centre; maintain the relevant radio watch; acknowledge or relay as required by current radio procedure; and prepare to assist without creating another casualty.</p>
        <p>Rule 37 identifies the signal—it is not the complete response procedure. The master’s duty to assist is governed by SOLAS chapter V regulation 33 and applicable law, with co-ordination and on-scene actions taught in the current IAMSAR Manual. Follow rescue-coordinator instructions and current national/GMDSS training.</p>
      </CardContent>
    </Card>

    <aside className="rounded-md border p-4 text-sm">
      <strong>Reviewed scope and sources:</strong> educational recognition summary checked on {ANNEX_IV_SOURCE_REVIEW.reviewedOn} against the <a className="underline" href={ANNEX_IV_SOURCE_REVIEW.ruleUrl}>{ANNEX_IV_SOURCE_REVIEW.ruleVersion}</a>, the USCG <a className="underline" href={ANNEX_IV_SOURCE_REVIEW.annexUrl}>Annex IV transcription</a>, and the IMO <a className="underline" href={ANNEX_IV_SOURCE_REVIEW.imoUrl}>COLREG Convention overview</a>. For operation or response, use current manufacturer instructions, flag-state/national rules, GMDSS training and the current IAMSAR Manual.
    </aside>
  </section>
);
