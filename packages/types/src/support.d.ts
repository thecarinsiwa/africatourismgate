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
}
export interface AdminSupportTicketDetail extends AdminSupportTicketListItem {
    messages: SupportTicketMessage[];
}
export interface CreateSupportTicketRequest {
    subject: string;
    body: string;
    userId?: string;
}
export interface SupportTicketCreated {
    ticket: SupportTicket;
    initialMessage: SupportTicketMessage;
}
export interface SupportTicketsListQuery {
    page?: number;
    limit?: number;
    status?: SupportTicketStatus;
    priority?: SupportTicketPriority;
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
