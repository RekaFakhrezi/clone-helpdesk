'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import StaffHeader from "./StaffHeader";
import AgentModal from "./AgentModal";
import DeptModal from "./DeptModal";
import Toast, { useToast } from '@/components/ui/Toast';
import { useLanguage } from '@/context/LanguageContext';

type StaffTab = "Agents" | "Departments";

const TH_CLASS = "px-4 py-2.5 text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)]";

export default function StaffWorkspace() {
  const { t } = useLanguage();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<StaffTab>("Agents");
  const [agents, setAgents] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<any>(null);

  // Toast state
  const { toast, showToast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    const { data: deptData } = await supabase.from('departments').select('*').order('name');
    const { data: staffData } = await supabase.from('staff_profiles').select('*, dept:departments(name)').in('role', ['teknisi', 'operator', 'admin', 'agent', 'pimpinan']).order('name');
    
    if (deptData) setDepartments(deptData);
    if (staffData) setAgents(staffData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="flex flex-col items-start gap-6 w-full relative">
      <Toast toast={toast} />
      <StaffHeader />
      
      {/* Toolbar - Now ABOVE the tabs */}
      <div className="flex flex-col md:flex-row w-full justify-between items-center gap-4">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeTab === 'Agents' ? t('staff.search_agents') : t('staff.search_departments')} 
              className="pl-9 pr-4 py-2 text-[12.5px] border border-[var(--rule-strong)] rounded-[4px] bg-transparent text-[var(--fg)] placeholder:text-[var(--fg-faint)] focus:outline-none focus:border-[var(--accent)] w-full transition-colors" 
            />
            <svg className="w-4 h-4 absolute left-3 top-2.5 text-[var(--fg-faint)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
        </div>
        {(activeTab === 'Agents' || activeTab === 'Departments') && (
          <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={() => {
                if (activeTab === 'Agents') {
                  setIsAgentModalOpen(true);
                } else if (activeTab === 'Departments') {
                  setSelectedDept(null);
                  setIsDeptModalOpen(true);
                }
              }}
              title={activeTab === 'Agents' ? t('staff.add_staff') : t('staff.add_department')} 
              className="flex h-9 px-3 items-center gap-1.5 rounded-[4px] bg-[var(--accent)] text-white text-[12px] font-medium transition-colors hover:bg-[var(--accent-hover)]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
              {activeTab === 'Agents' ? t('staff.add_staff') : t('staff.add_department')}
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col items-start rounded-[4px] border border-[var(--rule)] bg-[var(--surface)] w-full overflow-hidden relative">
        {/* Tabs */}
        <div className="flex items-center border-b border-[var(--rule)] w-full px-4">
          <button
            onClick={() => setActiveTab('Agents')}
            className={`cursor-pointer whitespace-nowrap px-3 py-2.5 -mb-px border-b text-[12.5px] transition-colors ${activeTab === 'Agents' ? 'border-[var(--accent)] text-[var(--fg)] font-medium' : 'border-transparent text-[var(--fg-dim)] hover:text-[var(--fg)]'}`}
          >
            {t('staff.agents')}
          </button>
          <button
            onClick={() => setActiveTab('Departments')}
            className={`cursor-pointer whitespace-nowrap px-3 py-2.5 -mb-px border-b text-[12.5px] transition-colors ${activeTab === 'Departments' ? 'border-[var(--accent)] text-[var(--fg)] font-medium' : 'border-transparent text-[var(--fg-dim)] hover:text-[var(--fg)]'}`}
          >
            {t('staff.departments')}
          </button>
        </div>

        {/* Content Area */}
        <div className="flex flex-col w-full relative">
          {loading ? (
            <div className="py-12 text-center text-[12.5px] text-[var(--fg-dim)]">{t('staff.loading')}</div>
          ) : (
            <div className="w-full overflow-x-auto">
              {activeTab === "Agents" && (
                <table className="w-full text-left border-collapse">
                  <thead className="border-b border-[var(--rule)]">
                    <tr>
                      <th className={TH_CLASS}>{t('staff.name')}</th>
                      <th className={TH_CLASS}>{t('staff.email')}</th>
                      <th className={TH_CLASS}>{t('staff.role')}</th>
                      <th className={TH_CLASS}>{t('staff.department')}</th>
                      <th className={`${TH_CLASS} w-24`}>{t('staff.action')}</th>
                    </tr>
                  </thead>
                <tbody>
                  {agents
                    .filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.email.toLowerCase().includes(searchQuery.toLowerCase()) || (a.dept?.name || '').toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((agent) => (
                    <tr key={agent.id} className="border-b border-[var(--rule)] transition-colors hover:bg-[var(--canvas)]">
                      <td className="px-4 py-3 text-[12.5px] font-medium text-[var(--fg)]">
                        <Link href={`/dashboard/administrasi/staff/${agent.id}`} className="hover:text-[var(--accent)]">
                          {agent.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[var(--fg-dim)]">{agent.email}</td>
                      <td className="px-4 py-3 text-[12px] text-[var(--fg-dim)] uppercase">{agent.role}</td>
                      <td className="px-4 py-3 text-[12px] text-[var(--fg-dim)]">{agent.dept?.name || '-'}</td>
                      <td className="px-4 py-3 text-center">
                        <button 
                          onClick={() => {
                            router.push(`/dashboard/administrasi/staff/${agent.id}?edit=true`);
                          }}
                          className="p-1.5 inline-flex items-center justify-center rounded-[4px] text-[var(--accent)] transition-colors hover:bg-[var(--canvas)]" 
                          title={t('staff.edit')}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {agents.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.email.toLowerCase().includes(searchQuery.toLowerCase()) || (a.dept?.name || '').toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-[12.5px] text-[var(--fg-dim)]">{t('staff.empty_agents')}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            {activeTab === "Departments" && (
              <table className="w-full text-left border-collapse">
                <thead className="border-b border-[var(--rule)]">
                  <tr>
                    <th className={`${TH_CLASS} w-16`}>ID</th>
                    <th className={TH_CLASS}>{t('staff.department')}</th>
                    <th className={`${TH_CLASS} w-24`}>{t('staff.action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {departments
                    .filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((dept) => (
                    <tr key={dept.id} className="border-b border-[var(--rule)] transition-colors hover:bg-[var(--canvas)]">
                      <td className="px-4 py-3 text-[12px] tabular-nums text-[var(--fg-dim)]">{dept.id}</td>
                      <td className="px-4 py-3 text-[12.5px] font-medium text-[var(--fg)]">{dept.name}</td>
                      <td className="px-4 py-3">
                        <button 
                          onClick={() => {
                            setSelectedDept(dept);
                            setIsDeptModalOpen(true);
                          }}
                          className="text-[12px] font-medium text-[var(--accent)] hover:underline"
                        >
                          {t('staff.edit')}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {departments.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-10 text-center text-[12.5px] text-[var(--fg-dim)]">{t('staff.empty_departments')}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            </div>
        )}
        </div>
      </div>

      {/* Modals */}
      <AgentModal 
        isOpen={isAgentModalOpen} 
        onClose={() => setIsAgentModalOpen(false)} 
        onSuccess={() => { setIsAgentModalOpen(false); fetchData(); }} 
        showToast={showToast}
        departments={departments} 
      />
      <DeptModal 
        isOpen={isDeptModalOpen} 
        onClose={() => setIsDeptModalOpen(false)} 
        onSuccess={() => { setIsDeptModalOpen(false); fetchData(); }} 
        showToast={showToast}
        dept={selectedDept} 
      />
    </div>
  );
}
