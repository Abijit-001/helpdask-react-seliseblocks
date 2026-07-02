import { useForm } from 'react-hook-form';
import { useAuthDetails } from '@/auth/AuthContext';
import { useGetTickets, useCreateTicket } from '../hooks/use-helpdesk';
import { Button } from '@/components/ui-kit/button';
import { Input } from '@/components/ui-kit/input';
import { Textarea } from '@/components/ui-kit/textarea';
import { useState } from 'react';

interface TicketFormValues {
  title: string;
  description: string;
  category: string;
  priority: string;
}

export const RequesterPortal = () => {
  const { user } = useAuthDetails();
  const [page, setPage] = useState(1);


  // Fetch only this user's tickets
  const { data, isLoading, error, refetch } = useGetTickets(
    {
      pageNo: page,
      pageSize: 10,
      filter: JSON.stringify({
        RequesterId: user?.itemId || '',
      }),
    },
    { enabled: !!user?.itemId }
  );


  const { mutateAsync: createTicket, isPending: isCreating } = useCreateTicket();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TicketFormValues>({
    defaultValues: {
      title: '',
      description: '',
      category: 'Software',
      priority: 'Low',
    },
  });

  const onSubmit = async (values: TicketFormValues) => {
    if (!user?.itemId) return;

    try {
      await createTicket({
        Title: values.title,
        Description: values.description,
        Category: values.category,
        Priority: values.priority,
        Status: 'Open',
        RequesterId: user.itemId,
      });
      reset(); // Reset form on success
      refetch(); // Reload list
    } catch (e) {
      console.error(e);
    }
  };

  const tickets = data?.getTickets?.items || [];
  const totalTickets = data?.getTickets?.totalCount || 0;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 font-sans">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold text-high-emphasis">Helpdesk Portal</h1>
        <p className="text-sm text-medium-emphasis">
          Logged in as: <strong>{user?.firstName} {user?.lastName}</strong> (Requester) | ID: <code>{user?.itemId || 'undefined'}</code>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Submit Form */}
        <div className="lg:col-span-1 border p-6 rounded-lg bg-background shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-high-emphasis">Submit Support Ticket</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Title *</label>
              <Input
                placeholder="Brief summary of issue"
                {...register('title', { required: 'Title is required' })}
              />
              {errors.title && (
                <span className="text-xs text-destructive">{errors.title.message}</span>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Description *</label>
              <Textarea
                placeholder="Explain the problem in detail"
                rows={4}
                {...register('description', { required: 'Description is required' })}
              />
              {errors.description && (
                <span className="text-xs text-destructive">{errors.description.message}</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Category</label>
                <select
                  className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  {...register('category')}
                >
                  <option value="Software">Software</option>
                  <option value="Hardware">Hardware</option>
                  <option value="Network">Network</option>
                  <option value="Access">Access / IAM</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Priority</label>
                <select
                  className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  {...register('priority')}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
            </div>

            <Button type="submit" className="w-full mt-4" loading={isCreating}>
              Submit Ticket
            </Button>
          </form>
        </div>

        {/* Right Side: Tickets List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-high-emphasis">My Support Tickets</h2>

          {isLoading ? (
            <p className="text-sm text-medium-emphasis">Loading your tickets...</p>
          ) : error ? (
            <p className="text-sm text-destructive">Error loading tickets: {error.message}</p>
          ) : tickets.length === 0 ? (
            <div className="border border-dashed p-10 rounded-lg text-center text-medium-emphasis">
              You haven&apos;t submitted any support tickets yet.
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden bg-background">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-muted border-b">
                    <th className="p-3 font-semibold">Title</th>
                    <th className="p-3 font-semibold">Category</th>
                    <th className="p-3 font-semibold">Priority</th>
                    <th className="p-3 font-semibold">Status</th>
                    <th className="p-3 font-semibold">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <tr key={ticket.ItemId} className="border-b hover:bg-muted/50">
                      <td className="p-3">
                        <div className="font-medium text-high-emphasis">{ticket.Title}</div>
                        <div className="text-xs text-medium-emphasis mt-0.5 max-w-md truncate">
                          {ticket.Description}
                        </div>
                      </td>
                      <td className="p-3">{ticket.Category}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          ticket.Priority === 'Urgent' ? 'bg-destructive/10 text-destructive' :
                          ticket.Priority === 'High' ? 'bg-warning/10 text-warning-high-emphasis' :
                          ticket.Priority === 'Medium' ? 'bg-primary/10 text-primary' :
                          'bg-muted-foreground/10 text-medium-emphasis'
                        }`}>
                          {ticket.Priority}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          ticket.Status === 'Resolved' ? 'bg-success/10 text-success-high-emphasis' :
                          ticket.Status === 'In Progress' ? 'bg-primary/10 text-primary' :
                          'bg-warning/10 text-warning-high-emphasis'
                        }`}>
                          {ticket.Status}
                        </span>
                      </td>
                      <td className="p-3 text-xs text-medium-emphasis">
                        {ticket.CreatedDate ? new Date(ticket.CreatedDate).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Simple Pagination */}
              {totalTickets > 10 && (
                <div className="p-3 border-t flex justify-between items-center bg-muted/20">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
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
                    onClick={() => setPage(p => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
