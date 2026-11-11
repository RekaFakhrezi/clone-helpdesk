import { Request, Response } from 'express';
import { supabase, supabaseAdmin } from '../config/supabase';

export const getAdminDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayIso = today.toISOString();

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayIso = yesterday.toISOString();

    const nowIso = new Date().toISOString();

    // 1. Fetch Today's Tickets
    const { count: ticketsToday, error: errToday } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayIso);

    // Fetch Yesterday's Tickets for comparison
    const { count: ticketsYesterday, error: errYest } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', yesterdayIso)
      .lt('created_at', todayIso);

    let growth = 0;
    if (ticketsYesterday && ticketsYesterday > 0) {
      growth = ((ticketsToday || 0) - ticketsYesterday) / ticketsYesterday * 100;
    } else if ((ticketsToday || 0) > 0) {
      growth = 100;
    }

    // 2 & 3. Open Tickets & Overdue SLA will be computed from allTickets later

    let totalSolvedBySystem = 0;

    // 5. Recent Ticket Activity - fetch latest 5 logs AND latest 5 tickets
    const { data: recentLogsData } = await supabase
      .from('ticket_logs')
      .select('*, tickets(ticket_num)')
      .order('created_at', { ascending: false })
      .limit(5);

    const { data: recentTicketsData } = await supabase
      .from('tickets')
      .select('id, ticket_num, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    const { data: allTickets } = await supabase
      .from('tickets')
      .select('category_id, dept_id, status, sla_due');

    const { data: categories } = await supabase.from('categories').select('id, name');
    const { data: departments } = await supabase.from('departments').select('id, name');

    let categoryStats: any[] = [];
    let deptStats: any[] = [];
    let slaStats = { within: 0, near: 0, overdue: 0 };
    let totalOpen = 0;
    let totalOverdue = 0;

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

    if (allTickets && categories && departments) {
      const catCount = allTickets.reduce((acc: any, t) => {
        acc[t.category_id] = (acc[t.category_id] || 0) + 1;
        return acc;
      }, {});

      categoryStats = categories.map((c: any, index: number) => ({
        name: c.name,
        value: catCount[c.id] || 0,
        fill: c.color || colors[index % colors.length]
      })).filter(c => c.value > 0).sort((a, b) => b.value - a.value).slice(0, 5);

      const deptData: any = {};
      departments.forEach(d => {
        deptData[d.id] = { name: d.name, total: 0, open: 0, closed: 0, overdue: 0 };
      });

      allTickets.forEach(t => {
        const stat = (t.status || '').toUpperCase();
        if (stat === 'RESOLVED_BY_SYSTEM') {
          totalSolvedBySystem++;
        }

        const isOpen = !['RESOLVED', 'CLOSED', 'DONE', 'RESOLVED_BY_SYSTEM'].includes(stat);
        const isClosed = !isOpen;

        if (isOpen) totalOpen++;

        if (deptData[t.dept_id]) {
          const d = deptData[t.dept_id];
          d.total++;
          if (isOpen) d.open++;
          if (isClosed) d.closed++;
          if (t.sla_due && new Date(t.sla_due) < new Date() && isOpen) d.overdue++;
        }

        if (isOpen) {
          if (t.sla_due) {
            const due = new Date(t.sla_due).getTime();
            const now = new Date().getTime();
            const diffHours = (due - now) / (1000 * 60 * 60);

            if (diffHours < 0) {
              slaStats.overdue++;
              totalOverdue++;
            }
            else if (diffHours < 24) slaStats.near++;
            else slaStats.within++;
          }
        }
      });

      deptStats = Object.values(deptData).filter((d: any) => d.total > 0).sort((a: any, b: any) => b.total - a.total);
    }

    const trendData: { name: string; value: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      trendData.push({ name: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }), value: 0 });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const { data: trendTickets } = await supabase
      .from('tickets')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo.toISOString());

    if (trendTickets) {
      trendTickets.forEach(t => {
        const dateStr = new Date(t.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        const item = trendData.find(x => x.name === dateStr);
        if (item) item.value++;
      });
    }

    // Process Recent Logs
    let combinedLogs: any[] = [];
    if (recentLogsData) {
      combinedLogs = [...combinedLogs, ...recentLogsData.map((l: any) => ({
        id: l.id,
        ticketNum: l.tickets?.ticket_num || 'Unknown',
        type: 'log',
        action: l.action,
        message: l.notes || l.action,
        created_at: l.created_at
      }))];
    }
    if (recentTicketsData) {
      combinedLogs = [...combinedLogs, ...recentTicketsData.map((t: any) => ({
        id: `t_${t.id}`,
        ticketNum: t.ticket_num || 'Unknown',
        type: 'ticket',
        action: 'TICKET_CREATED',
        message: t.status === 'RESOLVED_BY_SYSTEM' ? 'Ticket auto-resolved by system' : 'New ticket created',
        created_at: t.created_at
      }))];
    }

    // Sort descending by time and take top 5
    combinedLogs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    combinedLogs = combinedLogs.slice(0, 5);

    res.json({
      summary: {
        today: ticketsToday || 0,
        growth: growth.toFixed(1),
        open: totalOpen,
        overdue: totalOverdue,
        failedMessages: totalSolvedBySystem
      },
      recentLogs: combinedLogs.map(l => {
        let status = 'Update';
        let iconColor = 'bg-slate-100 text-slate-600';
        if (l.action === 'TICKET_CREATED') {
          status = 'New Ticket';
          iconColor = 'bg-blue-100 text-blue-600';
        } else if (l.action === 'STATUS_CHANGED') {
          status = 'Status Change';
          iconColor = 'bg-amber-100 text-amber-600';
        } else if (l.action === 'RESOLVED' || l.action === 'CLOSED') {
          status = 'Closed';
          iconColor = 'bg-emerald-100 text-emerald-600';
        }

        return {
          id: l.id,
          ticketNum: l.ticketNum,
          status,
          iconColor,
          message: l.message,
          time: new Date(l.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        };
      }),
      categories: categoryStats,
      departments: deptStats,
      slaHealth: [
        { name: 'Within SLA', value: slaStats.within, fill: '#34D399' },
        { name: 'Near Deadline', value: slaStats.near, fill: '#FBBF24' },
        { name: 'Overdue', value: slaStats.overdue, fill: '#EF4444' },
      ],
      ticketTrend: trendData
    });
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    res.status(500).json({ error: 'Terjadi kesalahan internal server' });
  }
};


export const createStaff = async (req: Request, res: Response) => {
  try {
    const { password, ...payload } = req.body;

    if (!payload.email) {
      return res.status(400).json({ success: false, message: 'Email wajib diisi' });
    }
    if (!payload.name) {
      return res.status(400).json({ success: false, message: 'Nama wajib diisi' });
    }

    // Check if email already exists (maybeSingle avoids error when no row found)
    const { data: existing } = await supabaseAdmin.from('staff_profiles').select('id').eq('email', payload.email).maybeSingle();
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email sudah terdaftar. Gunakan email lain.' });
    }

    // Create Supabase Auth user (required for login capability)
    const userPassword = password || 'Password123!';
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: payload.email,
      password: userPassword,
      email_confirm: true, // auto-confirm so user can login immediately
    });

    if (authError) {
      console.error('Auth user creation failed:', authError);
      return res.status(400).json({ success: false, message: authError.message });
    }

    const userId = authData.user.id;
    payload.id = userId;

    // Insert staff profile linked to auth user
    const { data, error } = await supabaseAdmin.from('staff_profiles').insert([payload]).select().single();
    if (error) {
      // Rollback: delete auth user if profile insert fails
      await supabaseAdmin.auth.admin.deleteUser(userId);
      console.error('Staff profile insert failed:', error);
      throw error;
    }

    res.status(201).json({ success: true, data });
  } catch (error: any) {
    console.error('createStaff error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateStaff = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const { data, error } = await supabaseAdmin.from('staff_profiles').update(payload).eq('id', id).select().single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createDepartment = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const { data, error } = await supabaseAdmin.from('departments').insert([payload]).select().single();
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateDepartment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const { data, error } = await supabaseAdmin.from('departments').update(payload).eq('id', id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateSLA = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const { data: existing } = await supabaseAdmin.from('sla_configs').select('id').eq('priority', payload.priority).maybeSingle();
    let result, error;
    if (existing) {
      const res = await supabaseAdmin.from('sla_configs').update({
        response_target_hours: payload.response_target_hours,
        resolution_target_hours: payload.resolution_target_hours,
      }).eq('id', existing.id).select().single();
      result = res.data;
      error = res.error;
    } else {
      const res = await supabaseAdmin.from('sla_configs').insert([payload]).select().single();
      result = res.data;
      error = res.error;
    }
    if (error) throw error;
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
