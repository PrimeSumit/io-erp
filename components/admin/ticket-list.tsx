"use client";

import { Mail, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { updateTicketStatus } from "@/app/(admin)/actions"; 

interface Ticket {
  id: string;
  title: string;
  description: string;
  contact_email: string;
  status: string;
  created_at: string;
}

export function TicketList({ tickets }: { tickets: Ticket[] }) {
  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
        <Mail className="h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-500 font-medium">
          No pending support requests.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
              User
            </th>
            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
              Issue
            </th>
            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
              Received
            </th>
            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {tickets.map((ticket) => (
            <tr
              key={ticket.id}
              className="hover:bg-gray-50 transition-colors group"
            >
              <td className="px-6 py-4">
                <a
                  href={`mailto:${ticket.contact_email}`}
                  className="text-sm font-semibold text-[#7e4b7c] hover:underline flex items-center gap-1"
                >
                  {ticket.contact_email} <ExternalLink className="h-3 w-3" />
                </a>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm font-bold text-gray-900">
                  {ticket.title}
                </div>
                <div className="text-xs text-gray-500 line-clamp-1">
                  {ticket.description}
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {format(new Date(ticket.created_at), "MMM d, yyyy")}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                  {/* RESOLVE BUTTON FORM */}
                  <form
                    action={async (formData) => {
                      await updateTicketStatus(formData);
                    }}
                  >
                    <input type="hidden" name="ticketId" value={ticket.id} />
                    <input type="hidden" name="status" value="resolved" />
                    <button
                      type="submit"
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-transform active:scale-90"
                    >
                      <CheckCircle className="h-5 w-5" />
                    </button>
                  </form>

                  {/* REJECT BUTTON FORM */}
                  <form
                    action={async (formData) => {
                      await updateTicketStatus(formData);
                    }}
                  >
                    <input type="hidden" name="ticketId" value={ticket.id} />
                    <input type="hidden" name="status" value="ignored" />
                    <button
                      type="submit"
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-transform active:scale-90"
                    >
                      <XCircle className="h-5 w-5" />
                    </button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
