export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type TicketStatus = 'Open' | 'New' | 'Waiting' | 'In Progress' | 'Resolved' | 'Closed';

export interface TicketMessage {
  id: string;
  sender: string;
  avatar?: string;
  role: 'user' | 'admin';
  content: string;
  timestamp: string;
  attachments?: string[];
  type: 'reply' | 'internal_note';
}

export interface TicketTimelineEvent {
  id: string;
  event: string;
  actor: string;
  timestamp: string;
  details?: string;
}

export interface Ticket {
  id: string;
  subject: string;
  requester: string;
  email: string;
  department: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo: string | null;
  createdDate: string;
  updatedDate: string;
  dueDate: string;
  sla: string;
  source: string;
  helpTopic: string;
  conversations: TicketMessage[];
  timeline: TicketTimelineEvent[];
  isDeleted?: boolean;
}

export const DUMMY_TICKETS: Ticket[] = [];

export const getTicketStats = (tickets: Ticket[]) => {
  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'Open' || t.status === 'In Progress' || t.status === 'Waiting').length,
    inProgress: tickets.filter(t => t.status === 'In Progress').length,
    waiting: tickets.filter(t => t.status === 'Waiting').length,
    resolved: tickets.filter(t => t.status === 'Resolved').length,
    closed: tickets.filter(t => t.status === 'Closed').length,
  };
  return stats;
};
