import { graphqlClient } from '@/lib/graphql-client';
import { GET_TICKETS_QUERY } from '../graphql/queries';
import { INSERT_TICKET_MUTATION, UPDATE_TICKET_MUTATION } from '../graphql/mutations';
import { GetTicketsResponse, TicketInsertInput, TicketUpdateInput } from '../types/helpdesk.types';

export const fetchTickets = async (context: {
  queryKey: [string, { pageNo: number; pageSize: number; filter?: string; sort?: string }];
}): Promise<GetTicketsResponse> => {
  const [, { pageNo, pageSize, filter = '{}', sort = '{}' }] = context.queryKey;

  return graphqlClient.query<GetTicketsResponse>({
    query: GET_TICKETS_QUERY,
    variables: {
      input: {
        filter,
        sort,
        pageNo,
        pageSize,
      },
    },
  });
};

export const createTicket = async (input: TicketInsertInput) => {
  return graphqlClient.mutate({
    query: INSERT_TICKET_MUTATION,
    variables: { input },
  });
};

export const updateTicket = async (params: { itemId: string; input: TicketUpdateInput }) => {
  const filter = JSON.stringify({ _id: params.itemId });
  return graphqlClient.mutate({
    query: UPDATE_TICKET_MUTATION,
    variables: {
      filter,
      input: params.input,
    },
  });
};
