"use client";

import { useState } from "react";
import Papa from "papaparse";
import { importRows, type ImportResult, type ImportRow } from "@/app/leads/import/actions";

const SYSTEM_FIELDS: { key: keyof ImportRow; label: string; required?: boolean }[] = [
  { key: "owner_name", label: "Owner name", required: true },
  { key: "address", label: "Address", required: true },
  { key: "city", label: "City" },
  { key: "county", label: "County" },
  { key: "parcel_id", label: "Parcel ID" },
  { key: "mailing_address", label: "Mailing address" },
  { key: "sale_date", label: "Sale date" },
  { key: "sale_price", label: "Sale price" },
  { key: "acreage", label: "Acreage" },
  { key: "property_type_raw", label: "Property type" },
  { key: "zoning", label: "Zoning" },
  { key: "structure_raw", label: "Existing structure" },
  { key: "permits_raw", label: "Permits" },
  { key: "latitude", label: "Latitude" },
  { key: "longitude", label: "Longitude" },
];

function guessMapping(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  for (const field of SYSTEM_FIELDS) {
    const target = normalize(field.label);
    const match = headers.find((h) => normalize(h) === target || normalize(h).includes(normalize(field.key)));
    if (match) mapping[field.key] = match;
  }
  return mapping;
}

function buildRows(data: Record<string, string>[], mapping: Record<string, string>): ImportRow[] {
  const num = (v: string | undefined) => {
    if (!v) return null;
    const n = Number(v.replace(/[^0-9.-]/g, ""));
    return Number.isFinite(n) && v.trim() !== "" ? n : null;
  };
  const str = (v: string | undefined) => (v && v.trim() !== "" ? v.trim() : null);

  return data
    .map((row) => ({
      parcel_id: str(row[mapping.parcel_id]),
      address: str(row[mapping.address]) ?? "",
      city: str(row[mapping.city]),
      county: str(row[mapping.county]),
      owner_name: str(row[mapping.owner_name]) ?? "",
      mailing_address: str(row[mapping.mailing_address]),
      sale_date: str(row[mapping.sale_date]),
      sale_price: num(row[mapping.sale_price]),
      acreage: num(row[mapping.acreage]),
      property_type_raw: str(row[mapping.property_type_raw]),
      zoning: str(row[mapping.zoning]),
      structure_raw: str(row[mapping.structure_raw]),
      permits_raw: str(row[mapping.permits_raw]),
      latitude: num(row[mapping.latitude]),
      longitude: num(row[mapping.longitude]),
    }))
    .filter((r) => r.address && r.owner_name);
}

export default function CsvImportWizard() {
  const [step, setStep] = useState<"upload" | "map" | "done">("upload");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFile(file: File) {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const cols = results.meta.fields ?? [];
        setHeaders(cols);
        setRawRows(results.data);
        setMapping(guessMapping(cols));
        setStep("map");
      },
      error: (err) => setError(err.message),
    });
  }

  async function handleImport() {
    setImporting(true);
    setError(null);
    try {
      const rows = buildRows(rawRows, mapping);
      const res = await importRows(rows);
      setResult(res);
      setStep("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed.");
    } finally {
      setImporting(false);
    }
  }

  if (step === "upload") {
    return (
      <div className="rounded-2xl border border-dashed border-[#1c1c1c]/20 bg-white p-10 text-center">
        <p className="mb-4 text-sm text-[#1c1c1c]/60">
          Upload a CSV of land-sale records exported from your property-data software.
        </p>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          className="mx-auto text-sm"
        />
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  if (step === "map") {
    const preview = buildRows(rawRows, mapping).slice(0, 5);
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-[#1c1c1c]/10 bg-white p-6">
          <h2 className="mb-1 font-serif text-lg font-semibold text-[#1c1c1c]">Map Columns</h2>
          <p className="mb-4 text-xs text-[#1c1c1c]/40">{rawRows.length} rows found. Match each system field to a column from your file.</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SYSTEM_FIELDS.map((field) => (
              <div key={field.key}>
                <label className="mb-1 block text-xs text-[#1c1c1c]/45">
                  {field.label}
                  {field.required && <span className="text-red-500"> *</span>}
                </label>
                <select
                  value={mapping[field.key] ?? ""}
                  onChange={(e) => setMapping((m) => ({ ...m, [field.key]: e.target.value }))}
                  className="w-full rounded border border-[#1c1c1c]/15 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-[#B08D57]"
                >
                  <option value="">— Not mapped —</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[#1c1c1c]/10 bg-white p-6">
          <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-[#1c1c1c]/40">Preview (first 5 rows)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-[#1c1c1c]/40">
                  <th className="pr-4 pb-2">Owner</th>
                  <th className="pr-4 pb-2">Address</th>
                  <th className="pr-4 pb-2">City</th>
                  <th className="pr-4 pb-2">Sale date</th>
                  <th className="pr-4 pb-2">Acreage</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((r, i) => (
                  <tr key={i} className="border-t border-[#1c1c1c]/5">
                    <td className="py-1.5 pr-4">{r.owner_name || "—"}</td>
                    <td className="py-1.5 pr-4">{r.address || "—"}</td>
                    <td className="py-1.5 pr-4">{r.city || "—"}</td>
                    <td className="py-1.5 pr-4">{r.sale_date || "—"}</td>
                    <td className="py-1.5 pr-4">{r.acreage ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center gap-3">
          <button
            onClick={handleImport}
            disabled={importing || !mapping.owner_name || !mapping.address}
            className="rounded-full bg-[#1c1c1c] px-5 py-2 text-sm font-medium text-white hover:bg-[#1c1c1c]/85 disabled:opacity-40"
          >
            {importing ? "Importing…" : `Import ${rawRows.length} Records`}
          </button>
          <button onClick={() => setStep("upload")} className="text-sm text-[#1c1c1c]/40 hover:underline">
            Start over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#1c1c1c]/10 bg-white p-8 text-center">
      <h2 className="mb-3 font-serif text-lg font-semibold text-[#1c1c1c]">Import complete</h2>
      <div className="mb-4 space-y-1 text-sm text-[#1c1c1c]/70">
        <p>{result?.propertiesUpserted} properties saved</p>
        <p>{result?.leadsCreated} new leads created and scored</p>
        {result && result.leadsSkippedExisting > 0 && <p>{result.leadsSkippedExisting} properties already had a lead — left untouched</p>}
        {result?.errors.map((e, i) => (
          <p key={i} className="text-red-600">{e}</p>
        ))}
      </div>
      <a href="/leads" className="rounded-full bg-[#1c1c1c] px-5 py-2 text-sm font-medium text-white hover:bg-[#1c1c1c]/85">
        View Leads
      </a>
    </div>
  );
}
