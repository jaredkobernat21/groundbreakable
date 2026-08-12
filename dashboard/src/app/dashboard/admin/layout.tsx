// Admin tooling isn't part of the new light-themed investor dashboard (it's
// unlinked from the header nav) -- keep it on its original dark panel so its
// existing text-white/border-white/10 styling stays legible under the
// dashboard shell's new offwhite background.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl bg-[#0b0e14] p-6 text-[#e5e7eb]">{children}</div>;
}
