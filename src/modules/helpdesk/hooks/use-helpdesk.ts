import { useGlobalQuery, useGlobalMutation } from '@/state/query-client/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { fetchTickets, createTicket, updateTicket } from '../services/helpdesk.service';
import {
  GetTicketsResponse,
  TicketInsertInput,
  TicketQueryParams,
  UpdateTicketParams,
} from '../types/helpdesk.types';

export const useGetTickets = (
  params: TicketQueryParams,
  options?: { enabled?: boolean }
) => {
  const { toast } = useToast();
  const { t } = useTranslation();

  return useGlobalQuery<
    GetTicketsResponse,
    Error,
    GetTicketsResponse,
    ['tickets', TicketQueryParams]
  >({
    queryKey: ['tickets', params],
    queryFn: async ({ queryKey }) => {
      try {
        return await fetchTickets({ queryKey });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'COULD_NOT_RETRIEVE_TICKETS';
        console.error('Error in useGetTickets queryFn:', error);
        toast({
          variant: 'destructive',
          title: t('SOMETHING_WENT_WRONG'),
          description: errorMessage,
        });
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: (attempt) => Math.min(attempt * 1000, 3000),
    onError: (error: Error) => {
      console.error('Error in useGetTickets:', error);
    },
    ...options,
  });
};

export const useCreateTicket = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { handleError } = useErrorHandler();

  return useGlobalMutation({
    mutationFn: (input: TicketInsertInput) => createTicket(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === 'tickets',
      });
      queryClient.refetchQueries({
        predicate: (query) => query.queryKey[0] === 'tickets',
        type: 'active',
      });
      toast({
        variant: 'success',
        title: t('SUCCESS'),
        description: t('TICKET_CREATED_SUCCESSFULLY'),
      });
    },
    onError: (error) => {
      handleError(error, { variant: 'destructive' });
    },
  });
};

export const useUpdateTicket = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { handleError } = useErrorHandler();

  return useGlobalMutation({
    mutationFn: (params: UpdateTicketParams) => updateTicket(params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === 'tickets',
      });
      toast({
        variant: 'success',
        title: t('SUCCESS'),
        description: t('TICKET_UPDATED_SUCCESSFULLY'),
      });
    },
    onError: (error) => {
      handleError(error, { variant: 'destructive' });
    },
  });
};
