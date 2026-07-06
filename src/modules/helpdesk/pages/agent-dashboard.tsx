import { useState } from 'react';
import { useAuthDetails } from '@/auth/AuthContext';
import { useGetTickets, useUpdateTicket } from '../hooks/use-helpdesk';
import { useGetUsersQuery } from '@/modules/iam/hooks/use-iam';
import { Button } from '@/components/ui-kit/button';
import { Paperclip } from 'lucide-react';

export const AgentDashboard = () => {
  const { user } = useAuthDetails();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Fetch all tickets
  const filterObject = statusFilter === 'All' ? {} : { Status: statusFilter };

  const {
    data: ticketsData,
    isLoading: isLoadingTickets,
    error: ticketsError,
  } = useGetTickets({
    pageNo: page,
    pageSize: 10,
    filter: JSON.stringify(filterObject),
  });

  // Fetch all users to list potential assignees
  const { data: usersData, isLoading: isLoadingUsers } = useGetUsersQuery({
    page: 0,
    pageSize: 50,
  });

  const { mutateAsync: updateTicket, isPending: isUpdating } = useUpdateTicket();

  // Extract all agents (users who have 'agent' role, or fallback to all users for easy testing)
  const allUsers = usersData?.data || [];
  const agents = allUsers.filter(
    (u) => u.roles?.includes('agent') || u.memberships?.some((m) => m.roles.includes('agent'))
  );
  const assigneesList = agents.length > 0 ? agents : allUsers;

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    try {
      await updateTicket({
        itemId: ticketId,
        input: { Status: newStatus },
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleAssigneeChange = async (ticketId: string, newAgentId: string) => {
    try {
      await updateTicket({
        itemId: ticketId,
        input: { AssignedAgentId: newAgentId || undefined },
      });
    } catch (e) {
      console.error(e);
    }
  };

  const tickets = ticketsData?.getTickets?.items || [];
  const totalTickets = ticketsData?.getTickets?.totalCount || 0;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 font-sans">
      <div className="border-b pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-high-emphasis">Agent Dashboard</h1>
          <p className="text-sm text-medium-emphasis">
            Logged in as:{' '}
            <strong>
              {user?.firstName} {user?.lastName}
            </strong>{' '}
            (Agent)
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex gap-2">
          {['All', 'Open', 'In Progress', 'Resolved'].map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md border ${
                statusFilter === status
                  ? 'bg-primary border-primary text-white'
                  : 'bg-background hover:bg-muted/50 text-medium-emphasis'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {isLoadingTickets ? (
        <p className="text-sm text-medium-emphasis">Loading support queue...</p>
      ) : ticketsError ? (
        <p className="text-sm text-destructive">
          Error loading support queue: {ticketsError.message}
        </p>
      ) : tickets.length === 0 ? (
        <div className="border border-dashed p-12 rounded-lg text-center text-medium-emphasis bg-background">
          No support tickets found matching this filter.
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden bg-background shadow-sm">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-muted border-b">
                <th className="p-4 font-semibold">Ticket Details</th>
                <th className="p-4 font-semibold">Requester</th>
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 font-semibold">Priority</th>
                <th className="p-4 font-semibold">File</th>
                <th className="p-4 font-semibold">Assigned Agent</th>
                <th className="p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.ItemId} className="border-b hover:bg-muted/50">
                  {/* Details */}
                  <td className="p-4 space-y-1">
                    <div className="font-semibold text-high-emphasis text-base">{ticket.Title}</div>
                    <div className="text-xs text-medium-emphasis max-w-sm">
                      {ticket.Description}
                    </div>
                  </td>

                  {/* Requester ID (simplified or fetched if users matched) */}
                  <td className="p-4">
                    <span className="text-xs font-mono text-medium-emphasis block">
                      {ticket.RequesterId.slice(0, 8)}...
                    </span>
                  </td>

                  {/* Category */}
                  <td className="p-4 text-xs font-medium text-high-emphasis">{ticket.Category}</td>

                  {/* Attachment */}
                  <td className="p-4">
                    {ticket.AttachmentUrl ? (
                      <a
                        href={ticket.AttachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary underline"
                      >
                        <Paperclip className="w-3 h-3" /> View
                      </a>
                    ) : (
                      <span className="text-xs text-medium-emphasis">—</span>
                    )}
                  </td>

                  {/* Priority badge */}
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        ticket.Priority === 'Urgent'
                          ? 'bg-destructive/10 text-destructive'
                          : ticket.Priority === 'High'
                            ? 'bg-warning/10 text-warning-high-emphasis'
                            : ticket.Priority === 'Medium'
                              ? 'bg-primary/10 text-primary'
                              : 'bg-muted-foreground/10 text-medium-emphasis'
                      }`}
                    >
                      {ticket.Priority}
                    </span>
                  </td>

                  {/* Agent Assignee Dropdown */}
                  <td className="p-4">
                    {isLoadingUsers ? (
                      <span className="text-xs text-medium-emphasis">Loading users...</span>
                    ) : (
                      <select
                        className="text-xs border rounded p-1 bg-transparent max-w-[150px]"
                        value={ticket.AssignedAgentId || ''}
                        disabled={isUpdating}
                        onChange={(e) => handleAssigneeChange(ticket.ItemId, e.target.value)}
                      >
                        <option value="">Unassigned</option>
                        {assigneesList.map((u) => (
                          <option key={u.itemId} value={u.itemId}>
                            {u.firstName} {u.lastName || ''}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>

                  {/* Status Action Buttons */}
                  <td className="p-4 space-y-1">
                    <div className="flex gap-1.5">
                      <select
                        className={`text-xs border rounded p-1 font-semibold ${
                          ticket.Status === 'Resolved'
                            ? 'bg-success/15 border-success text-success-high-emphasis'
                            : ticket.Status === 'In Progress'
                              ? 'bg-primary/15 border-primary text-primary'
                              : 'bg-warning/15 border-warning text-warning-high-emphasis'
                        }`}
                        value={ticket.Status}
                        disabled={isUpdating}
                        onChange={(e) => handleStatusChange(ticket.ItemId, e.target.value)}
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Simple Pagination */}
          {totalTickets > 10 && (
            <div className="p-4 border-t flex justify-between items-center bg-muted/20">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-xs text-medium-emphasis">
                Page {page} of {Math.ceil(totalTickets / 10)}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page * 10 >= totalTickets}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
