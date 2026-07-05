import { useForm } from 'react-hook-form';
import { useAuthDetails } from '@/auth/AuthContext';
import { useGetTickets, useCreateTicket, useUpdateTicket } from '../hooks/use-helpdesk';
import { useFileUpload } from '../hooks/use-file-upload';
import { Button } from '@/components/ui-kit/button';
import { Input } from '@/components/ui-kit/input';
import { Textarea } from '@/components/ui-kit/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui-kit/dialog';
import { Paperclip, Pencil, X } from 'lucide-react';
import { useState, useRef } from 'react';
import { Ticket } from '../types/helpdesk.types';

interface TicketFormValues {
  title: string;
  description: string;
  category: string;
  priority: string;
}

const SELECT_CLASS =
  'flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary';

const CATEGORIES = ['Software', 'Hardware', 'Network', 'Access', 'Other'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

const priorityClass = (p: string) => {
  if (p === 'Urgent') return 'bg-destructive/10 text-destructive';
  if (p === 'High') return 'bg-warning/10 text-warning-high-emphasis';
  if (p === 'Medium') return 'bg-primary/10 text-primary';
  return 'bg-muted-foreground/10 text-medium-emphasis';
};

const statusClass = (s: string) => {
  if (s === 'Resolved') return 'bg-success/10 text-success-high-emphasis';
  if (s === 'In Progress') return 'bg-primary/10 text-primary';
  return 'bg-warning/10 text-warning-high-emphasis';
};

/** Small reusable file picker */
const FilePicker = ({
  value,
  onChange,
  uploadFile,
  isUploading,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  uploadFile: (file: File) => Promise<string | null>;
  isUploading: boolean;
}) => {
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setError(null);
      const url = await uploadFile(file);
      if (url) {
        onChange(url);
      } else {
        setError('Upload failed');
      }
    } catch (err: any) {
      setError(err?.message || 'Upload failed');
    }
    // Reset input so same file can be re-selected
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">Attachment</label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-1.5 text-xs border rounded px-3 py-1.5 hover:bg-muted disabled:opacity-50"
        >
          <Paperclip className="w-3.5 h-3.5" />
          {isUploading ? 'Uploading…' : value ? 'Replace file' : 'Attach file'}
        </button>
        {value && (
          <div className="flex items-center gap-1 text-xs text-primary">
            <a href={value} target="_blank" rel="noopener noreferrer" className="underline truncate max-w-[180px]">
              View attachment
            </a>
            <button type="button" onClick={() => onChange(null)} title="Remove">
              <X className="w-3.5 h-3.5 text-destructive" />
            </button>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <input ref={inputRef} type="file" className="hidden" onChange={handleFile} />
    </div>
  );
};

export const RequesterPortal = () => {
  const { user } = useAuthDetails();
  const [page, setPage] = useState(1);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);

  // Attachment state for create & edit forms
  const [createAttachmentUrl, setCreateAttachmentUrl] = useState<string | null>(null);
  const [editAttachmentUrl, setEditAttachmentUrl] = useState<string | null>(null);

  const { uploadFile, isUploading } = useFileUpload();

  const { data, isLoading, error, refetch } = useGetTickets(
    {
      pageNo: page,
      pageSize: 10,
      filter: JSON.stringify({ RequesterId: user?.itemId || '' }),
    },
    { enabled: !!user?.itemId }
  );

  const { mutateAsync: createTicket, isPending: isCreating } = useCreateTicket();
  const { mutateAsync: updateTicket, isPending: isUpdating } = useUpdateTicket();

  // --- Create form ---
  const createForm = useForm<TicketFormValues>({
    defaultValues: { title: '', description: '', category: 'Software', priority: 'Low' },
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
        AttachmentUrl: createAttachmentUrl || undefined,
      });
      createForm.reset();
      setCreateAttachmentUrl(null);
      refetch();
    } catch (e) {
      console.error(e);
    }
  };

  // --- Edit form ---
  const editForm = useForm<TicketFormValues>({
    defaultValues: { title: '', description: '', category: 'Software', priority: 'Low' },
  });

  const openEdit = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setEditAttachmentUrl(ticket.AttachmentUrl || null);
    editForm.reset({
      title: ticket.Title,
      description: ticket.Description,
      category: ticket.Category || 'Software',
      priority: ticket.Priority || 'Low',
    });
  };

  const onEditSubmit = async (values: TicketFormValues) => {
    if (!editingTicket) return;
    try {
      await updateTicket({
        itemId: editingTicket.ItemId,
        input: {
          Title: values.title,
          Description: values.description,
          Category: values.category,
          Priority: values.priority,
          AttachmentUrl: editAttachmentUrl || undefined,
        },
      });
      setEditingTicket(null);
      refetch();
    } catch (e) {
      console.error(e);
    }
  };

  const tickets = data?.getTickets?.items || [];
  const totalTickets = data?.getTickets?.totalCount || 0;
  const { errors: createErrors } = createForm.formState;
  const { errors: editErrors } = editForm.formState;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 font-sans">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold text-high-emphasis">Helpdesk Portal</h1>
        <p className="text-sm text-medium-emphasis">
          Logged in as: <strong>{user?.firstName} {user?.lastName}</strong> (Requester)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Create form */}
        <div className="lg:col-span-1 border p-6 rounded-lg bg-background shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-high-emphasis">Submit Support Ticket</h2>
          <form onSubmit={createForm.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Title *</label>
              <Input
                placeholder="Brief summary of issue"
                {...createForm.register('title', { required: 'Title is required' })}
              />
              {createErrors.title && (
                <span className="text-xs text-destructive">{createErrors.title.message}</span>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Description *</label>
              <Textarea
                placeholder="Explain the problem in detail"
                rows={4}
                {...createForm.register('description', { required: 'Description is required' })}
              />
              {createErrors.description && (
                <span className="text-xs text-destructive">{createErrors.description.message}</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Category</label>
                <select className={SELECT_CLASS} {...createForm.register('category')}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Priority</label>
                <select className={SELECT_CLASS} {...createForm.register('priority')}>
                  {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <FilePicker
              value={createAttachmentUrl}
              onChange={setCreateAttachmentUrl}
              uploadFile={uploadFile}
              isUploading={isUploading}
            />

            <Button type="submit" className="w-full mt-4" loading={isCreating || isUploading}>
              Submit Ticket
            </Button>
          </form>
        </div>

        {/* Right: Ticket list */}
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
                    <th className="p-3 font-semibold">File</th>
                    <th className="p-3 font-semibold"></th>
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
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${priorityClass(ticket.Priority || '')}`}>
                          {ticket.Priority}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusClass(ticket.Status)}`}>
                          {ticket.Status}
                        </span>
                      </td>
                      <td className="p-3">
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
                      <td className="p-3">
                        {ticket.Status === 'Open' && (
                          <button
                            onClick={() => openEdit(ticket)}
                            className="p-1.5 rounded hover:bg-muted text-primary"
                            title="Edit ticket"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {totalTickets > 10 && (
                <div className="p-3 border-t flex justify-between items-center bg-muted/20">
                  <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                    Previous
                  </Button>
                  <span className="text-xs text-medium-emphasis">
                    Page {page} of {Math.ceil(totalTickets / 10)}
                  </span>
                  <Button variant="outline" size="sm" disabled={page * 10 >= totalTickets} onClick={() => setPage(p => p + 1)}>
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Ticket Dialog */}
      <Dialog open={!!editingTicket} onOpenChange={(open) => !open && setEditingTicket(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Ticket</DialogTitle>
          </DialogHeader>

          <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4 mt-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">Title *</label>
              <Input {...editForm.register('title', { required: 'Title is required' })} />
              {editErrors.title && (
                <span className="text-xs text-destructive">{editErrors.title.message}</span>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Description *</label>
              <Textarea rows={4} {...editForm.register('description', { required: 'Description is required' })} />
              {editErrors.description && (
                <span className="text-xs text-destructive">{editErrors.description.message}</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Category</label>
                <select className={SELECT_CLASS} {...editForm.register('category')}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Priority</label>
                <select className={SELECT_CLASS} {...editForm.register('priority')}>
                  {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <FilePicker
              value={editAttachmentUrl}
              onChange={setEditAttachmentUrl}
              uploadFile={uploadFile}
              isUploading={isUploading}
            />

            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setEditingTicket(null)}>
                Cancel
              </Button>
              <Button type="submit" loading={isUpdating || isUploading}>
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
