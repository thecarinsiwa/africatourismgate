export type SupportTicketStatus = 'open' | 'pending' | 'resolved' | 'closed';

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  status: SupportTicketStatus;
  createdAt: string;
}

export interface SupportTicketMessage {
  id: string;
  ticketId: string;
  body: string;
  isStaff: boolean;
  createdAt: string;
}

export interface CreateSupportTicketRequest {
  subject: string;
  body: string;
  /** Staff only — defaults to the authenticated user when omitted. */
  userId?: string;
}

export interface SupportTicketCreated {
  ticket: SupportTicket;
  initialMessage: SupportTicketMessage;
}

export interface SupportTicketsListQuery {
  page?: number;
  limit?: number;
}
