import CsvImportWizard from "@/components/leads/CsvImportWizard";

export default function ImportPage() {
  return (
    <div className="space-y-2">
      <h1 className="font-serif text-2xl font-semibold tracking-tight text-[#1c1c1c]">Import Land-Sale Records</h1>
      <p className="mb-6 text-sm text-[#1c1c1c]/45">
        Import is dedupe-aware: re-importing the same parcel updates the property record without touching an existing lead&rsquo;s
        pipeline status, notes, or contacts.
      </p>
      <CsvImportWizard />
    </div>
  );
}
