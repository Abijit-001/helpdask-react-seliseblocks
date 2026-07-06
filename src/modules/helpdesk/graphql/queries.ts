export const GET_TICKETS_QUERY = `
  query GetTickets($input: DynamicQueryInput) {
    getTickets(input: $input) {
      hasNextPage
      hasPreviousPage
      totalCount
      totalPages
      pageSize
      pageNo
      items {
        ItemId
        Title
        Description
        Category
        Status
        Priority
        AttachmentUrl
        RequesterId
        AssignedAgentId
        CreatedDate
        CreatedBy
        LastUpdatedDate
      }
    }
  }
`;
