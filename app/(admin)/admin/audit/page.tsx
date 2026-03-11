import { createClient } from "@/lib/supabase/server";
import { AuditClientTable } from "@/components/admin/audit-client-table";

export default async function AuditPage() {
  const supabase = await createClient();

  // 1. Securely fetch the logs on the server
  const { data: logs, error } = await supabase
    .from("audit_logs")
    .select("*, users:performed_by(name, email, role)")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Error fetching audit logs:", error);
  }

  // 2. Pass the data to our interactive client table
  return (
    <div className="space-y-6">
      <AuditClientTable logs={logs || []} />
    </div>
  );
}
