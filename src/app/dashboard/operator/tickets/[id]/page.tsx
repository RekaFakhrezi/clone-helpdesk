import SharedTicketDetail from '@/components/shared/tickets/SharedTicketDetail';
import { unwrapParams } from '@/app/dashboard/unwrapParams';

export default async function OperatorTicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await unwrapParams(params);
  return <SharedTicketDetail ticketId={id} />;
}
