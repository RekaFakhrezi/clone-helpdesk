import SharedTicketDetail from '@/components/shared/tickets/SharedTicketDetail';
import { unwrapParams } from '@/app/dashboard/unwrapParams';

export default async function DashboardTicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await unwrapParams(params);
  return (
    <div className="px-4 py-6 lg:px-10 lg:py-8">
      <SharedTicketDetail ticketId={id} />
    </div>
  );
}
