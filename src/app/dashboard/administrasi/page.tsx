import SummaryCards from "@/components/admin/dashboard/SummaryCards";
import TicketTrendChart from "@/components/admin/dashboard/TicketTrendChart";
import RecentTicketActivityTable from "@/components/admin/dashboard/RecentTicketActivityTable";
import TopHelpTopicsPieChart from "@/components/admin/dashboard/TopHelpTopicsPieChart";
import { fetchServer } from "@/lib/apiServer";
import DashboardHeader from "@/components/common/DashboardHeader";

export default async function AdministrasiDashboard() {
  let dashboardData: any = {};
  
  try {
    dashboardData = await fetchServer('/admin/dashboard');
  } catch (error: any) {
    if (error?.digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    console.error("Gagal mengambil data dashboard administrasi:", error);
    // Kita bisa mengatur state error atau menampilkan toast, tapi untuk SSR kita lewati sementara
  }

  return (
    <div className="flex flex-col gap-5 w-full max-w-[1440px] mx-auto pb-6">
      {/* Page Header */}
      <DashboardHeader 
        titleKey="dashboard.overview_title"
        defaultTitle="Dashboard Overview"
        descKey="dashboard.welcome_admin"
        defaultDesc="Welcome back, Administrator. Here's what's happening today."
      />

      {/* Row 1: Summary Cards */}
      <div className="w-full">
        <SummaryCards data={dashboardData.summary} />
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        
        {/* Left Column (Wider - spans 2 cols on large screens) */}
        <div className="lg:col-span-2 flex flex-col gap-6 w-full">
          {/* Ticket Trend Chart */}
          <TicketTrendChart data={dashboardData.ticketTrend} />
        </div>

        {/* Right Column (Narrower - spans 1 col) */}
        <div className="flex flex-col gap-6 w-full">
          {/* Top Help Topics (Moved to top of right column) */}
          <TopHelpTopicsPieChart data={dashboardData.categories} />
        </div>

      </div>

      {/* Full Width Tables Below Grid */}
      <div className="flex flex-col gap-6 w-full">
        
        {/* Recent Ticket Activity */}
        <RecentTicketActivityTable data={dashboardData.recentLogs} />
      </div>
    </div>
  );
}