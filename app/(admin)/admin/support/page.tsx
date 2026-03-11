import { createClient } from "@/lib/supabase/server";
import { TicketList } from "@/components/admin/ticket-list";
import { Clock, CheckCircle2, XCircle } from "lucide-react";

export default async function SupportPage() {
  const supabase = await createClient();

  const { data: tickets } = await supabase
    .from("support_tickets")
    .select("*")
    .order("created_at", { ascending: false });

  const allTickets = tickets || [];

  const formatted = allTickets.map((t) => ({
    id: t.id,
    title: t.subject,
    description: t.message,
    contact_email: t.email,
    status: t.status,
    created_at: t.created_at,
    created_by: null,
  }));

  const stats = {
    open: allTickets.filter((t) => t.status === "open").length,
    resolved: allTickets.filter((t) => t.status === "resolved").length,
    ignored: allTickets.filter(
      (t) => t.status === "closed" || t.status === "ignored",
    ).length,
  };

  const pendingTickets = formatted.filter((t) => t.status === "open");

  return (
    <div className="space-y-6">
      <TicketList tickets={pendingTickets as any} />
    </div>
  );
}
