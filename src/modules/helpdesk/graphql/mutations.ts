export const INSERT_TICKET_MUTATION = `
  mutation InsertTicket($input: TicketInsertInput!) {
    insertTicket(input: $input) {
      itemId
      totalImpactedData
      acknowledged
    }
  }
`;

export const UPDATE_TICKET_MUTATION = `
  mutation UpdateTicket($filter: String!, $input: TicketUpdateInput!) {
    updateTicket(filter: $filter, input: $input) {
      itemId
      totalImpactedData
      acknowledged
    }
  }
`;
