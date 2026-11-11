import React from 'react';
import PriorityTicketList from '@/components/operator/tickets/PriorityTicketList';
import OperatorStatistics from '@/components/admin/tickets/OperatorStatistics';
import { fetchServer } from '@/lib/apiServer';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import DashboardHeader from '@/components/common/DashboardHeader';

import OperatorStatCards from '@/components/operator/OperatorStatCards';

export default async function OperatorDashboard() {
    // Ambil data dashboard dari Express API
    let dashboardData;
    try {
        const response = await fetchServer('/operator/dashboard');
        dashboardData = response.data;
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) {
            throw error;
        }
        console.error("Gagal mengambil data dashboard:", error);
        // Fallback jika API gagal
        dashboardData = {
            tickets: [],
            ticketLogs: [],
            categories: [],
            departments: [],
            counts: { todayCount: 0, verifiedCount: 0, openCount: 0, waitingVerificationCount: 0 }
        };
    }

    const { tickets, ticketLogs, categories, departments, counts } = dashboardData;
    const { todayCount, verifiedCount, waitingVerificationCount, systemResolvedCount } = counts || {};

    return (
        <div className="flex flex-col gap-6 p-6 md:p-10">
            <DashboardHeader 
                titleKey="dashboard.operator_title"
                defaultTitle="Operator Dashboard"
                descKey="dashboard.operator_desc"
                defaultDesc="Summary of ticket activities that need your attention."
            />

            {/* Statistik Penting */}
            <OperatorStatCards
                todayCount={todayCount || 0}
                waitingVerificationCount={waitingVerificationCount || 0}
                systemResolvedCount={systemResolvedCount || 0}
            />

            {/* Komponen Statistik & Grafik */}
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300 fill-mode-both">
                <OperatorStatistics
                    tickets={tickets || []}
                    ticketLogs={ticketLogs || []}
                    categories={categories || []}
                    departments={departments || []}
                />
            </div>

            {/* Komponen Tabel Prioritas */}
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500 fill-mode-both">
                <PriorityTicketList tickets={tickets || []} />
            </div>
        </div>
    );
}
