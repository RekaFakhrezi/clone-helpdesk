import React from 'react';
import OperatorTicketWorkspace from '@/components/operator/tickets/OperatorTicketWorkspace';
import { calculateIsOverdue } from '@/lib/utils/sla';
import { fetchServer } from '@/lib/apiServer';

export default async function OperatorTicketsPage() {
    let apiData;
    try {
        const res = await fetchServer('/operator/tickets/all');
        apiData = res.data;
    } catch (err) {
        console.error("Error fetching all tickets:", err);
        apiData = {
            tickets: [],
            slaConfigs: [],
            departments: [],
            categories: [],
            technicians: []
        };
    }

    const { tickets, slaConfigs, departments, categories: rawCategories, technicians } = apiData;

    // Format kategori dengan hierarki Departemen / Kategori / Subkategori (jika ada)
    const formattedCategories = (rawCategories || []).map((cat: any) => {
        const dept = (departments || []).find((d: any) => d.id === cat.dept_id);
        const deptName = dept ? dept.name : '';
        
        const breadcrumb = [];
        let current = cat;
        while (current) {
            breadcrumb.unshift(current.name);
            current = (rawCategories || []).find((c: any) => c.id === current.parent_id);
        }
        
        if (deptName) {
            breadcrumb.unshift(deptName);
        }
        
        return {
            ...cat,
            name: breadcrumb.join(' / '),
        };
    }).sort((a: any, b: any) => a.name.localeCompare(b.name));

    // Inject is_overdue
    const processedTickets = (tickets || []).map((t: any) => ({
        ...t,
        is_overdue: calculateIsOverdue(t, slaConfigs || [])
    }));

    // Kategori utama untuk filter pencarian (tampilkan semua kategori)
    const mainCategories = formattedCategories;

    return (
        <div className="w-full max-w-[1440px] mx-auto animate-in fade-in duration-300">
            <OperatorTicketWorkspace 
                tickets={processedTickets} 
                departments={departments || []}
                categories={formattedCategories}
                mainCategories={mainCategories}
                technicians={technicians || []}
            />
        </div>
    );
}
