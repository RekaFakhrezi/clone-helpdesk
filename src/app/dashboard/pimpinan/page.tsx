import SummaryCards from "@/components/admin/dashboard/SummaryCards";
import TicketTrendChart from "@/components/admin/dashboard/TicketTrendChart";
import TopHelpTopicsPieChart from "@/components/admin/dashboard/TopHelpTopicsPieChart";
import { fetchServer } from "@/lib/apiServer";
import DashboardHeader from "@/components/common/DashboardHeader";

export default async function PimpinanDashboard() {
  let dashboardData: any = {};
  
  try {
    dashboardData = await fetchServer('/admin/dashboard');
  } catch (error: any) {
    if (error?.digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    console.error("Gagal mengambil data dashboard pimpinan:", error);
  }

  return (
    <div className="flex w-full flex-col items-start gap-6 pb-10 animate-in fade-in duration-300">
      {/* Page Header */}
      <DashboardHeader 
        titleKey="dashboard.pimpinan_title"
        defaultTitle="Executive Summary"
        descKey="dashboard.pimpinan_desc"
        defaultDesc="Analytics summary and IT Helpdesk service performance."
      />

      {/* Strip metrik */}
      <SummaryCards data={dashboardData.summary} />

      {/* Main Grid: 2 Columns */}
      <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Left Column (Wider - spans 2 cols on large screens) */}
        <div className="flex w-full flex-col gap-6 lg:col-span-2">
          {/* Ticket Trend Chart */}
          <TicketTrendChart data={dashboardData.ticketTrend} />
        </div>

        {/* Right Column (Narrower - spans 1 col) */}
        <div className="flex w-full flex-col gap-6">
          {/* Top Help Topics */}
          <TopHelpTopicsPieChart data={dashboardData.categories} />
        </div>

      </div>
    </div>
  );
}
