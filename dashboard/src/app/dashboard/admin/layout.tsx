import AdminNav from "@/components/admin/AdminNav";

// Dark panel is deliberate -- this section is internal ops, not part of the
// light-themed investor dashboard shell. AdminNav applies to every
// /dashboard/admin/* route from this one file; individual pages keep their
// own inline admin-role redirect (RLS's is_admin() is the real gate) --
// unchanged, out of scope here. Now reachable via the header "SLADE" link
// in dashboard/layout.tsx (admin-only) instead of direct-URL-only.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-[#0b0e14] p-6 text-[#e5e7eb]">
      <AdminNav />
      <div className="lg:pl-56">{children}</div>
    </div>
  );
}
