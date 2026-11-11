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
        <div className="w-full max-w-[1440px] mx-auto animate-in fade-in duration-300">
            <DashboardHeader 
                titleKey="dashboard.operator_title"
                defaultTitle="Operator Dashboard"
                descKey="dashboard.operator_desc"
                defaultDesc="Summary of ticket activities that need your attention."
            />

            {/* Statistik Penting */}
            <div className="mt-6">
                <OperatorStatCards
                    todayCount={todayCount || 0}
                    waitingVerificationCount={waitingVerificationCount || 0}
                    systemResolvedCount={systemResolvedCount || 0}
                />
            </div>

            {/* Komponen Statistik & Grafik */}
            <div className="mt-6">
                <OperatorStatistics
                    tickets={tickets || []}
                    ticketLogs={ticketLogs || []}
                    categories={categories || []}
                    departments={departments || []}
                />
            </div>

            {/* Komponen Tabel Prioritas */}
            <div className="mt-6">
                <PriorityTicketList tickets={tickets || []} />
            </div>
        </div>
    );
}
