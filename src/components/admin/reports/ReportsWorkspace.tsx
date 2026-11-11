"use client";

import React, { useState } from "react";
import ReportsHeader from "./ReportsHeader";
import ReportsToolbar from "./ReportsToolbar";
import ReportsTableSection from "./ReportsTableSection";
import { supabase } from "@/lib/supabase";

export default function ReportsWorkspace() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [status, setStatus] = useState("");

  const handleExport = async (config: { fromDate: string; toDate: string; status: string }) => {
    let query = supabase.from('tickets').select('*');
    
    if (config.status) {
      query = query.ilike('status', config.status);
    }
    if (config.fromDate) {
      query = query.gte('created_at', config.fromDate + 'T00:00:00.000Z');
    }
    if (config.toDate) {
      query = query.lte('created_at', config.toDate + 'T23:59:59.999Z');
    }

    const { data, error } = await query;
    if (error) {
      alert("Gagal mengambil data tiket");
      return;
    }

    if (!data || data.length === 0) {
      alert("Tidak ada data tiket yang sesuai dengan filter");
      return;
    }

    const header = ["Ticket Num", "Subject", "Status", "Priority", "Created At"];
    const csvContent = [
      header.join(","),
      ...data.map((t: any) => `"${t.ticket_num || t.ticketNumber || ''}","${(t.subject || '').replace(/"/g, '""')}","${t.status || ''}","${t.priority || ''}","${t.created_at || ''}"`)
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `laporan_tiket_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col items-start gap-6 w-full">
      <ReportsHeader />
      
      <div className="flex flex-col items-start gap-6 w-full">
        <ReportsToolbar 
          fromDate={fromDate}
          setFromDate={setFromDate}
          toDate={toDate}
          setToDate={setToDate}
          status={status}
          setStatus={setStatus}
          onExport={handleExport}
        />
        <ReportsTableSection />
      </div>
    </div>
  );
}