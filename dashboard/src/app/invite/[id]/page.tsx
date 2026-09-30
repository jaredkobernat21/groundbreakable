import { getValidInvitation } from "../inviteFlow";
import InviteCard from "./InviteCard";

// Public, unauthenticated page (deliberately outside middleware's protected
// matcher) -- a developer opens this straight from the link Jared sends
// them, with no account and no session yet. The invitation lookup itself
// only ever happens through the service-role client in inviteFlow.ts, never
// through an RLS-gated client query, so there's nothing here an anonymous
// visitor could use to enumerate other invitations.
export default async function InvitePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { form_error?: string };
}) {
  const check = await getValidInvitation(params.id);

  if (!check.ok) {
    const message =
      check.reason === "used"
        ? "This invitation has already been used."
        : check.reason === "expired"
          ? "This invitation has expired. Ask your Groundbreakable contact to send a new one."
          : "This invitation link isn't valid.";

    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f2ee] px-4">
        <div className="w-full max-w-sm rounded-2xl border border-[#1c1c1c]/10 bg-white p-8 text-center shadow-sm">
          <div className="mb-6 flex items-center justify-center gap-2">
            <img src="/groundbreakable-icon.png" alt="" className="h-7 w-7" />
            <span className="text-sm font-semibold tracking-tight text-[#1c1c1c]">Groundbreakable</span>
          </div>
          <p className="text-sm text-[#1c1c1c]/60">{message}</p>
        </div>
      </main>
    );
  }

  return (
    <InviteCard
      invitationId={check.invitation.id}
      firstName={check.invitation.first_name}
      email={check.invitation.email}
      formError={searchParams.form_error}
    />
  );
}
