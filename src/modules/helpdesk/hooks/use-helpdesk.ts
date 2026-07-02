import { useGlobalQuery, useGlobalMutation } from '@/state/query-client/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { fetchTickets, createTicket, updateTicket } from '../services/helpdesk.service';
import { TicketInsertInput, TicketUpdateInput } from '../types/helpdesk.types';

export const useGetTickets = (
  params: {
    pageNo: number;
    pageSize: number;
    filter?: string;
    sort?: string;
  },
  options?: { enabled?: boolean }
) => {
  return useGlobalQuery({
    queryKey: ['tickets', params],
    queryFn: fetchTickets,
    ...options,
  });
};

export const useCreateTicket = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useGlobalMutation({
    mutationKey: ['createTicket'],
    mutationFn: (input: TicketInsertInput) => createTicket(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast({
        title: 'Success',
        description: 'Ticket created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error?.message || 'Failed to create ticket',
      });
    },
  });
};

export const useUpdateTicket = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useGlobalMutation({
    mutationKey: ['updateTicket'],
    mutationFn: (params: { itemId: string; input: TicketUpdateInput }) => updateTicket(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast({
        title: 'Success',
        description: 'Ticket updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error?.message || 'Failed to update ticket',
      });
    },
  });
};
