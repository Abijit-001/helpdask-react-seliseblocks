

export enum TicketStatus {
  OPEN = 'Open',
  IN_PROGRESS = 'In Progress',
  RESOLVED = 'Resolved',
  CLOSED = 'Closed',
}

export enum TicketPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  URGENT = 'Urgent',
}

export enum TicketCategory {
  SOFTWARE = 'Software',
  HARDWARE = 'Hardware',
  NETWORK = 'Network',
  ACCESS = 'Access',
  OTHER = 'Other',
}


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
    totalPages: number;
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


export interface InsertTicketResponse {
  insertTicket: {
    itemId: string;
    totalImpactedData: number;
    acknowledged: boolean;
  };
}

export interface UpdateTicketResponse {
  updateTicket: {
    itemId: string;
    totalImpactedData: number;
    acknowledged: boolean;
  };
}

export interface TicketQueryParams {
  pageNo: number;
  pageSize: number;
  filter?: string;
  sort?: string;
}

export interface UpdateTicketParams {
  itemId: string;
  input: TicketUpdateInput;
}
