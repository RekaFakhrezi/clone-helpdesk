import { supabaseAdmin } from '../config/supabase';
import { nextTicketNumber } from '../services/ticketQueries';

async function seed() {
  console.log('Seeding tickets...');

  // Ambil data referensi
  const { data: departments } = await supabaseAdmin.from('departments').select('id');
  const { data: categories } = await supabaseAdmin.from('categories').select('id');
  
  if (!departments || departments.length === 0 || !categories || categories.length === 0) {
      console.log('Pastikan ada data di tabel departments dan categories dulu!');
      return;
  }

  // Dapatkan max ticket_num saat ini agar tidak bentrok
  let maxNum = Number((await nextTicketNumber()).slice(1)) - 1;

  const subjects = [
      "WiFi tidak bisa terhubung di rektorat",
      "Lupa password akun SSO",
      "AC ruangan rapat mati total",
      "Komputer laboratorium blue screen",
      "Koneksi internet sangat lambat",
      "Layar proyektor berkedip",
      "Tinta printer habis",
      "Website pendaftaran error 500",
      "Email kampus tidak bisa mengirim pesan",
      "Aplikasi SIM akademik tidak bisa dibuka",
      "Kabel LAN putus",
      "Permintaan instalasi software design",
      "Keyboard di lab rusak",
      "Lupa PIN akses portal",
      "Permohonan domain baru"
  ];

  const statuses = ['NEW', 'WAITING VERIFICATION', 'RESOLVED', 'CLOSED', 'Ditolak'];
  const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

  const TOTAL_TICKETS = 80;

  for (let i = 0; i < TOTAL_TICKETS; i++) {
      maxNum++;
      const ticketNum = `#${maxNum.toString().padStart(6, '0')}`;
      
      // Random date in the last 30 days
      const daysAgo = Math.floor(Math.random() * 30);
      const hoursAgo = Math.floor(Math.random() * 24);
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      date.setHours(date.getHours() - hoursAgo);

      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const priority = priorities[Math.floor(Math.random() * priorities.length)];
      
      // Random department/category (or sometimes null to test robust handling)
      const hasDept = Math.random() > 0.1;
      const deptId = hasDept ? departments[Math.floor(Math.random() * departments.length)].id : null;
      
      const hasCat = Math.random() > 0.1;
      const catId = hasCat ? categories[Math.floor(Math.random() * categories.length)].id : null;

      const subject = subjects[Math.floor(Math.random() * subjects.length)];

      const { data: newTicket, error: insertError } = await supabaseAdmin.from('tickets').insert({
          ticket_num: ticketNum,
          phone: `6281${Math.floor(Math.random() * 10000000)}`,
          subject: subject,
          reporter_name: `Pelapor ${i+1}`,
          reporter_type: 'student',
          unit: 'Fakultas Teknik',
          status: status,
          priority: priority,
          dept_id: deptId,
          category_id: catId,
          created_at: date.toISOString(),
          updated_at: date.toISOString(),
          description: "Ini adalah deskripsi dummy untuk tiket yang di-generate otomatis."
      }).select().single();

      if (insertError) {
          console.error(`Gagal insert tiket ${ticketNum}:`, insertError);
          continue;
      }

      // Jika statusnya bukan NEW, tambahkan log agar terdeteksi di grafik
      if (status !== 'NEW' && newTicket) {
          let action = 'CHANGE_STATUS';
          if (status === 'Ditolak') action = 'REJECT_TICKET';
          
          // Log timestamp sedikit lebih baru dari created_at
          const logDate = new Date(date);
          logDate.setHours(logDate.getHours() + 1);

          await supabaseAdmin.from('ticket_logs').insert({
              ticket_id: newTicket.id,
              action: action,
              created_at: logDate.toISOString()
          });
      }
      
      if (i % 10 === 0) console.log(`Inserted ${i} tickets...`);
  }

  console.log('Seeding selesai! Generate 80 tiket dummy.');
}

seed().catch(console.error);
