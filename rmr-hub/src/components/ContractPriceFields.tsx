"use client";
// Price section of the new-contract form. Only the fields for the chosen payment plan are shown;
// fields that aren't shown aren't sent, and the server falls back to its defaults (care fee 0).
import { useState } from "react";

type Model = "one_off" | "monthly";
type After = "per_job" | "care";

function Radio({ name, value, checked, onChange, children }: { name: string; value: string; checked: boolean; onChange: () => void; children: React.ReactNode }) {
  return (
    <label className="flex min-h-11 items-center gap-2 font-semibold">
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="size-5 accent-blue" /> {children}
    </label>
  );
}

export function ContractPriceFields() {
  const [model, setModel] = useState<Model>("one_off");
  const [after, setAfter] = useState<After>("per_job");
  const buying = model === "one_off";
  const careOffered = !buying || after === "care";

  return (
    <fieldset className="card grid gap-3 sm:grid-cols-2">
      <legend className="sr-only">Price</legend>
      <h2 className="text-xl font-extrabold sm:col-span-2">Price</h2>
      <div className="flex flex-col gap-2 sm:col-span-2" role="radiogroup" aria-label="Payment plan">
        <Radio name="model" value="one_off" checked={buying} onChange={() => setModel("one_off")}>
          Buy it (paid in stages, theirs at launch)
        </Radio>
        <Radio name="model" value="monthly" checked={!buying} onChange={() => setModel("monthly")}>
          Start fee + monthly (care included, theirs at the end)
        </Radio>
      </div>

      <label className="field">
        {buying ? "Price £" : "Start fee £"}
        <input name="price" required inputMode="decimal" className="input" placeholder={buying ? "3000" : "1000"} />
      </label>

      {buying ? (
        <>
          <label className="field">
            Paid in
            <select name="stages" defaultValue="3" className="input">
              <option value="3">3 payments: start, first working version, launch</option>
              <option value="2">2 payments: start, launch</option>
              <option value="1">1 payment before work starts</option>
            </select>
          </label>
          <label className="field">
            Free fixes after launch (days)
            <input name="warrantyDays" type="number" min="0" defaultValue="30" className="input" />
          </label>

          <div className="flex flex-col gap-1 sm:col-span-2" role="radiogroup" aria-label="After the free fixes">
            <p className="font-extrabold">After the free fixes</p>
            <Radio name="after" value="per_job" checked={after === "per_job"} onChange={() => setAfter("per_job")}>
              No monthly fee: charge fixes per job
            </Radio>
            <Radio name="after" value="care" checked={after === "care"} onChange={() => setAfter("care")}>
              Offer a monthly care plan
            </Radio>
          </div>
        </>
      ) : (
        <>
          <label className="field">
            Monthly fee £ (care included)
            <input name="monthly" required inputMode="decimal" className="input" placeholder="155" />
          </label>
          <label className="field">
            Monthly payments until it&apos;s theirs
            <input name="termMonths" type="number" min="1" defaultValue="24" className="input" />
          </label>
          <label className="field">
            Minimum months
            <input name="minimumMonths" type="number" min="1" defaultValue="12" className="input" />
          </label>
          <label className="field">
            Early buy-out £ per month left
            <input name="buyoutPerMonth" inputMode="decimal" className="input" placeholder="105" />
          </label>
        </>
      )}

      {careOffered && (
        <label className="field">
          {buying ? "Care plan £/month" : "Care plan £/month after it's theirs (optional)"}
          <input name="careMonthly" inputMode="decimal" defaultValue="50" className="input" />
        </label>
      )}
      <label className="field">
        {careOffered ? "Small fix without care £" : "Small fix £ (up to 2 hours)"}
        <input name="smallFix" inputMode="decimal" defaultValue="150" className="input" />
      </label>
      <label className="field">
        {careOffered ? "Bigger change without care £" : "Bigger change £ (up to half a day)"}
        <input name="biggerChange" inputMode="decimal" defaultValue="300" className="input" />
      </label>
      {!careOffered && <p className="text-sm text-grey sm:col-span-2">Anything bigger is quoted before you start.</p>}
    </fieldset>
  );
}
