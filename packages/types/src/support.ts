export type SupportTicketStatus = 'open' | 'pending' | 'resolved' | 'closed';

export type SupportTicketPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  createdAt: string;
}

export interface SupportTicketMessage {
  id: string;
  ticketId: string;
  body: string;
  isStaff: boolean;
  createdAt: string;
}

export interface AdminSupportTicketListItem extends SupportTicket {
  customerFirstName: string | null;
  customerEmail: string | null;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
  lastMessageIsStaff: boolean | null;
}

export interface AdminSupportTicketDetail extends AdminSupportTicketListItem {
  messages: SupportTicketMessage[];
}

/** Owner-scoped ticket detail (web account) — includes the message thread. */
export interface CustomerSupportTicketDetail extends SupportTicket {
  messages: SupportTicketMessage[];
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
  /** Partial match on subject, customer email/name, or ticket id. */
  search?: string;
  status?: SupportTicketStatus;
  priority?: SupportTicketPriority;
  /** Admin list: sort by ticket creation or latest message activity. */
  sortBy?: 'createdAt' | 'lastMessageAt';
}

export interface UpdateSupportTicketRequest {
  status?: SupportTicketStatus;
  priority?: SupportTicketPriority;
}

export interface CreateSupportMessageRequest {
  ticketId: string;
  body: string;
}

export interface CreateSupportMessageResponse {
  message: SupportTicketMessage;
  ticketStatus: SupportTicketStatus;
}
