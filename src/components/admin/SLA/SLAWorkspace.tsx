"use client";

import React, { useState, useEffect } from "react";
import SLAHeader from "./SLAHeader";
import SLAToolbar from "./SLAToolbar";
import SLATableSection from "./SLATableSection";
import Toast, { useToast } from "@/components/ui/Toast";
import { supabase } from "@/lib/supabase";

export interface SLAItem {
  id: string;
  priority: "KRITIS" | "TINGGI" | "SEDANG" | "RENDAH";
  badgeBg: string;
  badgeTextColor: string;
  responseTime: number; // dalam menit
  resolutionTime: number; // dalam menit
}

const INITIAL_SLA_DATA: SLAItem[] = [
  {
    id: "kritis",
    priority: "KRITIS",
    badgeBg: "bg-[rgba(179,33,27,.08)]",
    badgeTextColor: "text-[var(--danger)]",
    responseTime: 30,
    resolutionTime: 240,
  },
  {
    id: "tinggi",
    priority: "TINGGI",
    badgeBg: "bg-[rgba(178,107,0,.08)]",
    badgeTextColor: "text-[var(--warn)]",
    responseTime: 60,
    resolutionTime: 480,
  },
  {
    id: "sedang",
    priority: "SEDANG",
    badgeBg: "bg-[rgba(0,45,114,.06)]",
    badgeTextColor: "text-[var(--accent)]",
    responseTime: 120,
    resolutionTime: 1440,
  },
  {
    id: "rendah",
    priority: "RENDAH",
    badgeBg: "bg-[rgba(15,123,79,.08)]",
    badgeTextColor: "text-[var(--ok)]",
    responseTime: 240,
    resolutionTime: 2880,
  },
];

export default function SLAWorkspace() {
  const [slaData, setSlaData] = useState<SLAItem[]>([]);
  
  // Toast state
  const { toast, showToast } = useToast();

  useEffect(() => {
    fetchSlas();
  }, []);

  const fetchSlas = async () => {
    const { data } = await supabase.from('sla_configs').select('*').order('response_target_hours', { ascending: true });
    if (data && data.length > 0) {
      const formatted: SLAItem[] = data.map(d => {
        // Find matching priority from INITIAL_SLA_DATA for badges
        const initial = INITIAL_SLA_DATA.find(i => i.priority === d.priority);
        return {
          id: String(d.id),
          priority: d.priority as any,
          badgeBg: initial?.badgeBg || 'bg-[var(--canvas)]',
          badgeTextColor: initial?.badgeTextColor || 'text-[var(--fg-dim)]',
          responseTime: (d.response_target_hours || 0) * 60,
          resolutionTime: (d.resolution_target_hours || 0) * 60,
        };
      });
      setSlaData(formatted);
    } else {
      // Fallback if table is empty (user didn't run the INSERT sql)
      setSlaData(INITIAL_SLA_DATA);
    }
  };

  const handleUpdateSLA = async (updatedItem: SLAItem) => {
    // We update by priority instead of string id
    try {
      // Round to nearest hour
      const responseHours = Math.max(1, Math.round(updatedItem.responseTime / 60));
      const resolutionHours = Math.max(1, Math.round(updatedItem.resolutionTime / 60));

      const { fetchClient } = await import('@/lib/apiClient');
      const res = await fetchClient('/admin/sla', {
        method: 'PUT',
        body: JSON.stringify({
          priority: updatedItem.priority,
          response_target_hours: responseHours,
          resolution_target_hours: resolutionHours,
        })
      });
      if (!res.id && res.error) throw new Error(res.error);
      
      // 2. Update state lokal
      setSlaData((prev) => prev.map((item) => (item.priority === updatedItem.priority ? updatedItem : item)));
      showToast(`SLA untuk prioritas ${updatedItem.priority} berhasil disimpan!`, 'success');
      fetchSlas();
    } catch (err: any) {
      console.error(err);
      showToast(`Gagal menyimpan SLA: ${err.message}`, 'error');
    }
  };

  return (
    <div className="flex flex-col items-start gap-6 w-full relative">
      <SLAHeader />

      <div className="flex flex-col items-start rounded-[4px] border border-[var(--rule)] bg-[var(--surface)] w-full overflow-hidden relative">
        <SLATableSection slaData={slaData} onUpdateSLA={handleUpdateSLA} />
      </div>
      
      {/* Toast Notification */}
      <Toast toast={toast} />
    </div>
  );
}