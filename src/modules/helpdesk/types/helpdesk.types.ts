export interface Ticket {
  ItemId: string;
  Title: string;
  Description: string;
  Category?: string;
  Status: string;
  Priority?: string;
  AttachmentUrl?: string;
  RequesterId: string;
  AssignedAgentId?: string;
  CreatedDate?: string;
  CreatedBy?: string;
  LastUpdatedDate?: string;
}

export interface GetTicketsResponse {
  getTickets: {
    items: Ticket[];
    totalCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    pageSize: number;
    pageNo: number;
  };
}

export interface TicketInsertInput {
  Title: string;
  Description: string;
  Category?: string;
  Status: string;
  Priority?: string;
  AttachmentUrl?: string;
  RequesterId: string;
  AssignedAgentId?: string;
}

export interface TicketUpdateInput {
  Title?: string;
  Description?: string;
  Category?: string;
  Status?: string;
  Priority?: string;
  AttachmentUrl?: string;
  RequesterId?: string;
  AssignedAgentId?: string;
}
