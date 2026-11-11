import { supabase } from '../config/supabase';
import { sendMessage } from './wasender';
import { nextTicketNumber } from './ticketQueries';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

// =========================================================
// BOT SETTINGS dibaca sekali saat server start, BUKAN setiap
// pesan masuk. Ini mencegah fs.readFileSync memblokir event loop.
// =========================================================
const BOT_SETTINGS: Record<string, string> = (() => {
  try {
    return JSON.parse(fs.readFileSync(path.join(__dirname, '../bot_settings.json'), 'utf8'));
  } catch (e) {
    console.error('Error reading bot settings:', e);
    return {};
  }
})();

// Kata yang mengonfirmasi tiket berstatus WAITING CONFIRMATION.
const CONFIRM_WORDS = [
  'selesai', 'ok', 'oke', 'sudah', 'thanks', 'terima kasih', 'terimakasih',
  'makasih', 'mksh', 'thx', 'tq', 'trims', 'matursuwun', 'mantap', 'ya', 'siap', 'sudah selesai', 'beres', 'aman'
];

// Ungkapan terima kasih/salam umum di menu utama.
const PLEASANTRIES = ['terima kasih', 'terimakasih', 'makasih', 'trims', 'thanks', 'thx', 'tq', 'matursuwun', 'sama-sama', 'samasama'];

function getTriggerWord(): string {
  return BOT_SETTINGS.trigger_word || 'HaloDesk';
}

// Helper: jam & hari dalam zona waktu WIB (Asia/Jakarta)
const WIB_FORMAT = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Jakarta',
  weekday: 'short',
  hour: '2-digit',
  hourCycle: 'h23',
});
const WIB_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getWIBTime(): { hour: number; day: number } {
  const { hour, weekday } = Object.fromEntries(
    WIB_FORMAT.formatToParts(new Date()).map(p => [p.type, p.value])
  );
  return { hour: parseInt(hour, 10), day: Math.max(0, WIB_DAYS.indexOf(weekday)) };
}

function getGreeting(): string {
  const { hour } = getWIBTime();
  if (hour >= 4 && hour < 10) return 'Pagi ☀️';
  if (hour >= 10 && hour < 15) return 'Siang 🌞';
  if (hour >= 15 && hour < 18) return 'Sore 🌥️';
  return 'Malam 🌙';
}

function isWorkingHours(): boolean {
  const { hour, day } = getWIBTime();
  // Senin (1) - Jumat (5), 08:00 - 16:00
  return day >= 1 && day <= 5 && hour >= 8 && hour < 16;
}

interface WASession {
  phone: string;
  step: string;
  data: {
    category_id?: number;
    current_parent_id?: number | null;
    current_parent_name?: string | null;
    category_path?: string;
    subject_description?: string;
    reporter_name?: string;
    nim_nip?: string;
    unit?: string;
    user_info?: string;
    attachment_url?: string;
  } | null;
  updated_at?: string;
}

/** Simpan langkah & data sesi WhatsApp pelapor. */
async function setSession(sender: string, step: string, data: unknown) {
  await supabase
    .from('wa_sessions')
    .update({ step, data, updated_at: new Date().toISOString() })
    .eq('phone', sender);
}

export async function handleIncomingMessage(sender: string, messageText: string, mediaUrl?: string, mediaKey?: string, mediaType?: string, msgData?: any) {
  const cleanInput = messageText.trim();

  // 0. Jalankan dua query awal secara PARALEL (bukan serial) untuk mengurangi latensi
  const [{ data: reporter }, { data: waitingTickets }] = await Promise.all([
    supabase
      .from('reporters')
      .select('status, name, nim_nip, unit, reporter_type')
      .eq('phone', sender)
      .single(),
    supabase
      .from('tickets')
      .select('*')
      .eq('phone', sender)
      .eq('status', 'WAITING CONFIRMATION')
  ]);

  if (reporter?.status === 'Terblokir') {
    return sendMessage(sender, "⚠️ Maaf, nomor Anda saat ini diblokir dari sistem IT Helpdesk karena pelanggaran ketentuan layanan.");
  }

  // 0.5. Cek Tiket Menunggu Konfirmasi (Auto-Confirm)
  if (waitingTickets && waitingTickets.length > 0) {
    const isConfirmWord = CONFIRM_WORDS.some(w => cleanInput.toLowerCase().includes(w));
    if (isConfirmWord) {
      const ticketToConfirm = waitingTickets[0];
      await supabase.from('tickets').update({ status: 'RESOLVED', updated_at: new Date().toISOString() }).eq('id', ticketToConfirm.id);
      await supabase.from('ticket_logs').insert({ ticket_id: ticketToConfirm.id, action: 'RESOLVED_TICKET' });

      await supabase.from('wa_sessions').upsert({
        phone: sender,
        step: 'WAITING_RATING',
        data: { ticket_id: ticketToConfirm.id },
        updated_at: new Date().toISOString()
      });

      return sendMessage(sender, `✅ Terima kasih atas konfirmasinya. Tiket *${ticketToConfirm.ticket_num || ticketToConfirm.id}* telah ditutup secara otomatis.\n\nBantu kami meningkatkan layanan dengan memberikan *RATING (1-5)* beserta ulasan Anda dalam 1 pesan.\n\nContoh balasan:\n_5 Pelayanan sangat cepat dan teknisi ramah_`);
    }
  }

  // 1. GLOBAL TRIGGER: ${getTriggerWord()} / MENU / BATAL
  if ([getTriggerWord().toLowerCase(), 'batal', 'menu'].includes(cleanInput.toLowerCase())) {
    await supabase.from('wa_sessions').upsert({
      phone: sender,
      step: 'MAIN_MENU',
      data: {},
      updated_at: new Date().toISOString()
    });
    const { data: reporter } = await supabase.from('reporters').select('name').eq('phone', sender).single();
    if (cleanInput.toLowerCase() === 'batal') {
      return sendMessage(sender, `❌ Sesi dibatalkan. Ketik *${getTriggerWord()}* jika ingin memulai lagi.`);
    }
    return showMainMenu(sender);
  }

  // 1.5. GLOBAL TRIGGER: KEMBALI (0)
  if (cleanInput === '0') {
    // Kita cek jika user mengetik 0, dan session ada
    let { data: currSession } = await supabase.from('wa_sessions').select('*').eq('phone', sender).single<WASession>();
    if (currSession) {
      if (currSession.step === 'SELECT_CATEGORY') {
        // Mundur ke kategori sebelumnya atau MAIN_MENU
        if (currSession.data && currSession.data.current_parent_id) {
          const { data: parentCat } = await supabase.from('categories').select('parent_id').eq('id', currSession.data.current_parent_id).single();
          if (parentCat && parentCat.parent_id) {
             const { data: grandParent } = await supabase.from('categories').select('id, name').eq('id', parentCat.parent_id).single();
             if (grandParent) {
                 currSession.data.current_parent_id = grandParent.id;
                 currSession.data.current_parent_name = grandParent.name;
                 await setSession(sender, 'SELECT_CATEGORY', currSession.data);
                 return showDynamicCategoryMenu(sender, grandParent.id, grandParent.name, currSession.data);
             }
          }
          currSession.data.current_parent_id = null;
          currSession.data.current_parent_name = null;
          await setSession(sender, 'SELECT_CATEGORY', currSession.data);
          return showDynamicCategoryMenu(sender, null, null, currSession.data);
        } else {
          await setSession(sender, 'MAIN_MENU', {});
          return showMainMenu(sender);
        }
      } else if (currSession.step === 'INPUT_TICKET_DETAIL' || currSession.step === 'ASK_ATTACHMENT') {
        // Kembali ke kategori
        await setSession(sender, 'SELECT_CATEGORY', currSession.data);
        return showDynamicCategoryMenu(sender, currSession.data?.current_parent_id || null, currSession.data?.current_parent_name || null, currSession.data);
      } else {
        // Default: kembali ke main menu
        await setSession(sender, 'MAIN_MENU', {});
        return showMainMenu(sender);
      }
    }
  }

  // 2. Ambil Session User dari Supabase
  let { data: session } = await supabase
    .from('wa_sessions')
    .select('*')
    .eq('phone', sender)
    .single<WASession>();

  // 3. Jika User Baru & BELUM ketik "${getTriggerWord()}"
  if (!session) {
    const greetingMsg = BOT_SETTINGS.greeting_message || 'Selamat datang di IT Helpdesk.';
    const greetingName = reporter?.name ? `, Kak ${reporter.name}` : '';
    const greeting = getGreeting();
    return sendMessage(sender, `👋 Selamat ${greeting}${greetingName}! ${greetingMsg}\n\nSilakan ketik *${getTriggerWord()}* untuk memulai layanan.`);
  }

  const currentData = session.data || {};

  // 4. State Machine Alur
  switch (session.step) {
    case 'MAIN_MENU':
      await handleMainMenu(sender, cleanInput);
      break;

    case 'SELECT_CATEGORY':
      await handleDynamicCategorySelect(sender, cleanInput, currentData.current_parent_id || null, currentData.current_parent_name || null, currentData);
      break;

    case 'INPUT_TICKET_DETAIL':
      await handleInputTicketDetail(sender, cleanInput, currentData);
      break;

    case 'ASK_ATTACHMENT':
      await handleAskAttachment(sender, cleanInput, currentData, mediaUrl, mediaKey, mediaType, msgData);
      break;

    case 'ASK_REUSE_INFO':
      await handleAskReuseInfo(sender, cleanInput, currentData);
      break;

    case 'INPUT_USER_INFO':
      await handleInputUserInfo(sender, cleanInput, currentData);
      break;

    case 'CONFIRM_TICKET':
      await handleConfirmTicket(sender, cleanInput, currentData);
      break;

    case 'CHECK_TICKET_STATUS':
      await handleCheckTicketStatus(sender, cleanInput);
      break;

    case 'CONFIRM_RESOLUTION':
      await handleConfirmResolution(sender, cleanInput, currentData);
      break;

    case 'WAITING_RATING':
      await handleWaitingRating(sender, cleanInput, currentData);
      break;

    default:
      await sendMessage(sender, BOT_SETTINGS.fallback_message || `Ketik *${getTriggerWord()}* untuk kembali ke menu utama.`);
      break;
  }
}

// ==========================================
// STEP 1: GREETINGS & MENU UTAMA
// ==========================================
async function showMainMenu(sender: string) {
  const { data: reporter } = await supabase.from('reporters').select('name').eq('phone', sender).single();
  const greetingName = reporter?.name ? ` ${reporter.name}` : '';
  const greetingMsg = BOT_SETTINGS.greeting_message || 'Selamat datang di IT Helpdesk.';
  
  // 1. Ambil menu utama yang aktif dari database
  const { data: menus } = await supabase
    .from('bot_menus')
    .select('*')
    .is('parent_id', null)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  let text = `*Selamat ${getGreeting()}${greetingName}!* ${greetingMsg}\n\n`;
  text += `Silakan pilih menu layanan di bawah ini:\n`;

  if (menus && menus.length > 0) {
    menus.forEach((menu: any, index: number) => {
      text += `${index + 1}. ${menu.title}\n`;
    });
  } else {
    // Fallback jika kosong
    text += `1. 📝 Buat Tiket Pengaduan\n`;
    text += `2. 🔍 Cek Status Tiket\n`;
  }
  
  text += `\n_Balas angka pilihan Anda (Contoh: 1)_`;

  await sendMessage(sender, text);
}

async function handleMainMenu(sender: string, input: string) {
  // 1. Ambil menu utama yang aktif dari database
  const { data: menus } = await supabase
    .from('bot_menus')
    .select('*')
    .is('parent_id', null)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  const selectedIndex = parseInt(input) - 1;
  const useFallback = !menus || menus.length === 0;

  if (!useFallback) {
    if (isNaN(selectedIndex) || !menus[selectedIndex]) {
      // Cek apakah input adalah ungkapan terima kasih atau salam umum
      if (PLEASANTRIES.some(p => input.toLowerCase().includes(p))) {
        return sendMessage(sender, `Sama-sama! Senang bisa membantu Anda. 🙏\n\nKetik *${getTriggerWord()}* jika Anda membutuhkan bantuan lain.`);
      }

      // Smart Keyword Search (Fallback jika bukan angka)
      const { data: kbArticles } = await supabase
        .from('knowledge_base')
        .select('title, slug')
        .ilike('title', `%${input}%`)
        .limit(3);

      if (kbArticles && kbArticles.length > 0) {
        let text = `🔍 Kami menemukan beberapa panduan yang mungkin relevan dengan "${input}":\n\n`;
        kbArticles.forEach((article, idx) => {
          text += `${idx + 1}. *${article.title}*\n`;
          text += `🔗 ${process.env.FRONTEND_URL || 'https://helpdesk-it-jet.vercel.app'}/knowledgebase/article/${article.slug}\n\n`;
        });
        text += `_Ketik *${getTriggerWord()}* untuk melihat menu layanan lainnya._`;
        return sendMessage(sender, text);
      }

      return sendMessage(sender, `❌ Pilihan tidak valid atau artikel tidak ditemukan. Balas dengan angka yang sesuai dari menu. Ketik *${getTriggerWord()}* untuk reset.`);
    }
    
    const selectedMenu = menus[selectedIndex];

    if (selectedMenu.action_type === 'CREATE_TICKET') {
      // 1. Anti-Spam Check: Max 2 active tickets
      const { data: activeTickets } = await supabase
        .from('tickets')
        .select('id')
        .eq('phone', sender)
        .in('status', ['WAITING VERIFICATION', 'OPEN', 'IN PROGRESS', 'NEW', 'ESCALATED']);
        
      if (activeTickets && activeTickets.length >= 2) {
          return sendMessage(sender, "⚠️ *Batas Tiket Tercapai*\n\nMaaf, Anda saat ini memiliki laporan yang sedang diproses. Sistem membatasi maksimal 2 laporan aktif secara bersamaan untuk mencegah spam.\n\nMohon tunggu hingga tiket sebelumnya diselesaikan, atau gunakan menu *Cek Status Tiket*.");
      }

      await setSession(sender, 'SELECT_CATEGORY', {});
      return showDynamicCategoryMenu(sender, null, null, {});
    } else if (selectedMenu.action_type === 'CHECK_STATUS') {
      await setSession(sender, 'CHECK_TICKET_STATUS', {});
      return sendTicketStatusMenu(sender);
    } else if (selectedMenu.action_type === 'TEXT_REPLY') {
      // Langsung balas teks, dan tetapkan step tetap di MAIN_MENU (atau bisa reset ke ${getTriggerWord()})
      await sendMessage(sender, selectedMenu.content || "Tidak ada isi konten.");
      return;
    } else {
      return sendMessage(sender, "Aksi tidak dikenal.");
    }
  } else {
    // Fallback manual lama
    if (input === '1') {
      // 1. Anti-Spam Check: Max 2 active tickets
      const { data: activeTickets } = await supabase
        .from('tickets')
        .select('id')
        .eq('phone', sender)
        .in('status', ['WAITING VERIFICATION', 'OPEN', 'IN PROGRESS', 'NEW', 'ESCALATED']);
        
      if (activeTickets && activeTickets.length >= 2) {
          return sendMessage(sender, "⚠️ *Batas Tiket Tercapai*\n\nMaaf, Anda saat ini memiliki laporan yang sedang diproses. Sistem membatasi maksimal 2 laporan aktif secara bersamaan untuk mencegah spam.\n\nMohon tunggu hingga tiket sebelumnya diselesaikan, atau balas *2* untuk *Cek Status Tiket*.");
      }

      await setSession(sender, 'SELECT_CATEGORY', {});
      return showDynamicCategoryMenu(sender, null, null, {});
    } else if (input === '2') {
      await setSession(sender, 'CHECK_TICKET_STATUS', {});
      return sendTicketStatusMenu(sender);
    } else {
      return sendMessage(sender, `❌ Pilihan tidak valid. Balas angka *1* (Buat Tiket) atau *2* (Cek Status). Ketik *${getTriggerWord()}* untuk reset.`);
    }
  }
}

// ==========================================
// KATEGORI (DINAMIS N-LEVEL)
// ==========================================
async function showDynamicCategoryMenu(sender: string, parentId: number | null, parentName: string | null, currentData: any) {
  let query = supabase.from('categories').select('id, name, bot_content, default_priority').eq('is_active', true).order('sort_order', { ascending: true }).order('name', { ascending: true });

  if (parentId === null) {
    query = query.is('parent_id', null);
  } else {
    query = query.eq('parent_id', parentId);
  }

  const { data: categories, error } = await query;

  if (error || !categories || categories.length === 0) {
    // If no categories found, directly ask for details using current parent
    await setSession(sender, 'INPUT_TICKET_DETAIL', { ...currentData, category_id: parentId, category_path: currentData.category_path || parentName || 'Umum' });

    return promptTicketDetail(sender);
  }

  // Ada anak, tampilkan sebagai menu
  let text = parentName ? `📂 *Sub-Kategori - ${parentName}:*\n\n` : `📋 *PILIH KATEGORI LAYANAN*\n\n`;
  categories.forEach((cat: any, index: number) => {
    text += `${index + 1}. ${cat.name}\n`;
  });
  text += `${categories.length + 1}. 📝 Lainnya (Buat Tiket)\n`;
  text += `\n_Balas angka pilihan Anda_\n_Ketik *0* untuk kembali ke menu awal atau *${getTriggerWord()}* untuk reset._`;

  await sendMessage(sender, text);
}

async function handleDynamicCategorySelect(sender: string, input: string, parentId: number | null, parentName: string | null, currentData: any) {
  let query = supabase.from('categories').select('id, name, bot_content, default_priority').eq('is_active', true).order('sort_order', { ascending: true }).order('name', { ascending: true });

  if (parentId === null) {
    query = query.is('parent_id', null);
  } else {
    query = query.eq('parent_id', parentId);
  }

  const { data: categories } = await query;

  const selectedIndex = parseInt(input) - 1;
  
  if (categories && selectedIndex === categories.length) {
    // Chose "Lainnya"
    const newData = { ...currentData, category_id: parentId, category_path: currentData.category_path || parentName || 'Umum', default_priority: currentData.default_priority || 'MEDIUM' };
    await setSession(sender, 'INPUT_TICKET_DETAIL', newData);
    
    return promptTicketDetail(sender);
  }

  if (!categories || isNaN(selectedIndex) || !categories[selectedIndex]) {
    return sendMessage(sender, "❌ Pilihan tidak valid. Silakan jawab dengan nomor angka yang ada.\n_Ketik *0* untuk kembali._");
  }

  const selectedCat = categories[selectedIndex];
  const newPath = currentData.category_path ? `${currentData.category_path} > ${selectedCat.name}` : selectedCat.name;
  
  // Cek apakah ada child
  const { data: children } = await supabase.from('categories').select('id').eq('parent_id', selectedCat.id).eq('is_active', true);
  
  if (children && children.length > 0) {
    // Ada subkategori
    const newData = { ...currentData, current_parent_id: selectedCat.id, current_parent_name: selectedCat.name, category_path: newPath, default_priority: selectedCat.default_priority || currentData.default_priority };
    await setSession(sender, 'SELECT_CATEGORY', newData);

    await showDynamicCategoryMenu(sender, selectedCat.id, selectedCat.name, newData);
  } else {
    // Leaf node
    const newData = { ...currentData, category_id: selectedCat.id, category_path: newPath, default_priority: selectedCat.default_priority || currentData.default_priority };
    
    const { data: kbData } = await supabase.from('knowledge_base').select('slug').eq('category_id', selectedCat.id).single();
    
    if (kbData && kbData.slug) {
      // Ada tutorial di knowledge_base
      await setSession(sender, 'CONFIRM_RESOLUTION', newData);
      
      let text = `*Panduan untuk: ${selectedCat.name}*\n\n`;
      text += `Untuk melihat langkah-langkah penyelesaiannya, silakan kunjungi halaman Basis Pengetahuan kami pada tautan berikut:\n`;
      text += `🔗 ${process.env.FRONTEND_URL || 'https://helpdesk-it-jet.vercel.app'}/knowledgebase/article/${kbData.slug}\n\n`;
      text += `Apakah panduan di atas berhasil menyelesaikan kendala Anda?\n`;
      text += `1. ✅ Ya, kendala teratasi\n`;
      text += `2. ❌ Tidak, saya ingin membuat tiket ke Teknisi\n\n`;
      
      if (BOT_SETTINGS.fallback_message) {
         text += `_Ketik *0* untuk kembali, atau *${getTriggerWord()}* untuk ke menu utama._`;
      } else {
         text += `_Ketik *0* untuk kembali, atau *Batal* untuk mengakhiri._`;
      }
      
      await sendMessage(sender, text);
    } else {
      // Tidak ada tutorial, langsung buat tiket
      await setSession(sender, 'INPUT_TICKET_DETAIL', newData);
      
      await promptTicketDetail(sender);
    }
  }
}

async function handleConfirmResolution(sender: string, input: string, currentData: any) {
  if (input === '1') {
    // Masalah teratasi, buat tiket dengan status RESOLVED_BY_SYSTEM
    let ticketNumber = '#000001';
    try {
      ticketNumber = await nextTicketNumber();
    } catch (e) {
      console.error("Gagal mendapatkan tiket terakhir:", e);
      ticketNumber = `#${Date.now().toString().slice(-6)}`; // Fallback
    }
    
    const { data: reporter } = await supabase.from('reporters').select('*').eq('phone', sender).single();
    
    const reporterName = reporter?.name || sender;

    await supabase.from('reporters').upsert({
      phone: sender,
      name: reporterName,
      nim_nip: reporter?.nim_nip || '-',
      unit: reporter?.unit || '-',
      reporter_type: reporter?.reporter_type || 'Umum',
      status: 'Aktif'
    }, { onConflict: 'phone' });
    
    const ticketData = {
      ticket_num: ticketNumber,
      phone: sender,
      category_id: currentData.category_id || null,
      subject: `[Self-Resolved] ${currentData.category_path || 'Umum'}`,
      description: 'Masalah berhasil diselesaikan sendiri oleh pelapor melalui panduan Bot WA.',
      reporter_name: reporterName,
      reporter_type: reporter?.reporter_type || 'Umum',
      nim_nip: reporter?.nim_nip || '-',
      unit: reporter?.unit || '-',
      priority: currentData.default_priority || 'MEDIUM',
      status: 'RESOLVED_BY_SYSTEM'
    };

    const { error } = await supabase.from('tickets').insert([ticketData]);
    
    await supabase.from('wa_sessions').delete().eq('phone', sender);
    
    if (error) {
      console.error("Error creating auto-resolved ticket:", error);
      return sendMessage(sender, "Terjadi kesalahan saat memproses data. Silakan coba lagi nanti.");
    }
    
    return sendMessage(sender, `🎉 Syukurlah masalah Anda sudah teratasi!\nSistem telah mencatat interaksi ini dengan nomor referensi: *${ticketNumber}*.\n\nKetik *${getTriggerWord()}* jika Anda butuh bantuan lainnya.`);
  } else if (input === '2') {
    // Belum teratasi, eskalasi ke pimpinan/buat tiket escalated
    await setSession(sender, 'INPUT_TICKET_DETAIL', { ...currentData, is_escalated: true });
    
    return promptTicketDetail(sender);
  } else {
    return sendMessage(sender, "❌ Pilihan tidak valid. Balas angka *1* (Ya) atau *2* (Tidak).\n_Ketik *0* untuk kembali._");
  }
}

// ==========================================
// STEP SETELAH TIER: DETAIL KENDALA -> DATA DIRI -> KONFIRMASI
// ==========================================
async function promptTicketDetail(sender: string) {
  let text = `✏️ *SUBJEK & DESKRIPSI KENDALA*\n\n`;
  text += `Silakan isi subjek dan detail kendala dengan format berikut:\n`;
  text += `- Baris pertama: Subjek Tiket\n`;
  text += `- Baris kedua dst: Detail Kendala\n\n`;
  text += `*Contoh:*\n`;
  text += `Gagal Login SSO\n`;
  text += `Halo, saya tidak bisa login ke SSO meskipun password sudah benar...\n\n`;
  text += `_Ketik *0* untuk kembali_`;

  await sendMessage(sender, text);
}

async function handleInputTicketDetail(sender: string, input: string, currentData: any) {
  const lines = input.split('\n');
  const subjectInput = lines[0].trim();
  const descriptionInput = lines.length > 1 ? lines.slice(1).join('\n').trim() : '-';

  const updatedData = {
    ...currentData,
    subject_input: subjectInput,
    subject_description: descriptionInput
  };

  await setSession(sender, 'ASK_ATTACHMENT', updatedData);

  let text = `📎 *LAMPIRAN / SCREENSHOT*\n\n`;
  text += `Apakah Anda memiliki bukti terkait kendala ini?\n`;
  text += `Silakan kirimkan *foto/screenshot* atau *dokumen PDF* sekarang.\n\n`;
  text += `_Jika tidak ada, balas dengan kata *Tidak*_\n`;
  text += `_Ketik *Batal* untuk mengakhiri._`;

  await sendMessage(sender, text);
}

async function promptUserInfo(sender: string) {
  let text = `👤 *INPUT DATA DIRI*\n\n`;
  text += `Silakan masukkan Data Diri Anda.\n`;
  text += `*Format:* Nama - NIP/NIM - Unit Kerja/Fakultas\n\n`;
  text += `_Contoh: Budi - 19901234 - Bagian Keuangan_\n`;
  text += `_Ketik *Batal* untuk mengakhiri._`;

  await sendMessage(sender, text);
}

async function handleAskAttachment(sender: string, input: string, currentData: any, mediaUrl?: string, mediaKey?: string, mediaType?: string, msgData?: any) {
  let updatedData = { ...currentData };

  if (mediaUrl && mediaKey) {
    try {
      // 1. Decrypt media via WASender API
      // URL dari payload WhatsApp bersifat encrypted, tidak bisa di-download langsung.
      // Kita harus minta WASender untuk decrypt dan memberikan publicUrl yang bisa di-download.
      console.log(`Mendekripsi media via WASender (type: ${mediaType || 'image'})...`);
      const decryptResponse = await axios.post(
        `${process.env.WASENDER_BASE_URL || 'https://www.wasenderapi.com/api'}/decrypt-media`,
        {
          data: {
            messages: msgData,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.WASENDER_BEARER_TOKEN}`,
          },
          timeout: 30000,
        }
      );

      const decryptedUrl: string = decryptResponse.data?.publicUrl || decryptResponse.data?.url;
      if (!decryptedUrl) {
        throw new Error(`WASender decrypt-media tidak mengembalikan URL. Response: ${JSON.stringify(decryptResponse.data)}`);
      }
      console.log(`✅ Media berhasil didekripsi, mengunduh dari: ${decryptedUrl}`);

      // 2. Download file binary dari URL hasil decrypt
      const downloadResponse = await axios.get(decryptedUrl, { responseType: 'arraybuffer', timeout: 30000 });
      const buffer = downloadResponse.data;
      // WhatsApp mengirim file terenkripsi dengan content-type generic (octet-stream),
      // jadi tipe asli diambil dari mimetype lampiran; default image/jpeg.
      const headerType = (downloadResponse.headers['content-type'] as string) || '';
      const contentType: string =
        headerType && headerType !== 'application/octet-stream' && /^(image|application|video)\//.test(headerType)
          ? headerType
          : msgData?.message?.documentMessage?.mimetype || 'image/jpeg';

      // Tentukan ekstensi file dari content-type
      const mimeToExt: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/gif': 'gif',
        'image/webp': 'webp',
        'application/pdf': 'pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
        'video/mp4': 'mp4',
      };
      const ext = mimeToExt[contentType] || contentType.split('/')[1]?.split(';')[0] || 'bin';
      console.log(`Tipe file terdeteksi: ${contentType} (.${ext})`);

      // 3. Upload ke Supabase Storage (bucket: ticket-attachments)
      // Struktur folder: {nomor_wa}/{timestamp}.{ext}
      const fileName = `${sender}/${Date.now()}.${ext}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('ticket-attachments')
        .upload(fileName, buffer, {
          contentType,
          upsert: false
        });

      if (uploadError) {
        console.error('Gagal upload ke Supabase Storage:', uploadError);
        throw uploadError;
      }

      // 4. Dapatkan Public URL Supabase
      const { data: publicUrlData } = supabase.storage
        .from('ticket-attachments')
        .getPublicUrl(fileName);

      // ✅ Simpan URL Supabase (permanen) ke session data
      updatedData.attachment_url = publicUrlData.publicUrl;
      console.log(`✅ Media berhasil disimpan ke Supabase: ${publicUrlData.publicUrl}`);
    } catch (error) {
      console.error('Error saat memproses attachment:', error);
      return sendMessage(sender, `⚠️ Maaf, terjadi kesalahan saat menyimpan lampiran Anda. Silakan coba kirim ulang gambar/PDF, atau ketik *Batal* untuk mengakhiri.`);
    }
  } else {
    const inputLower = input.toLowerCase().trim();

    // Jika teks juga kosong (terjadi saat WASender kirim media tanpa caption)
    // Tidak ada yang bisa diproses, tunggu input berikutnya
    if (!inputLower) {
      return;
    }

    // Jika bukan kata penolakan, tetap lanjutkan (anggap tidak ada lampiran)
  }

  const { data: reporter } = await supabase
    .from('reporters')
    .select('name, nim_nip, unit')
    .eq('phone', sender)
    .single();

  if (reporter && reporter.name) {
    await setSession(sender, 'ASK_REUSE_INFO', updatedData);

    let text = `Kami menemukan data Anda sebelumnya:\n`;
    text += `Nama: ${reporter.name}\n`;
    text += `NIP/NIM: ${reporter.nim_nip}\n`;
    text += `Unit: ${reporter.unit}\n\n`;
    text += `Apakah Anda ingin menggunakan data diri ini untuk tiket Anda?\n`;
    text += `1. ✅ Ya, gunakan data ini\n`;
    text += `2. 🔄 Tidak, isi data baru\n\n`;
    text += `_Balas angka 1 atau 2_\n_Ketik *Batal* untuk mengakhiri._`;

    await sendMessage(sender, text);
  } else {
    await setSession(sender, 'INPUT_USER_INFO', updatedData);

    await promptUserInfo(sender);
  }
}

async function handleAskReuseInfo(sender: string, input: string, currentData: any) {
  if (input === '1') {
    const { data: reporter } = await supabase
      .from('reporters')
      .select('name, nim_nip, unit, reporter_type')
      .eq('phone', sender)
      .single();

    if (reporter) {
      const updatedData = {
        ...currentData,
        user_info: `${reporter.name} - ${reporter.nim_nip} - ${reporter.unit}`,
        reporter_name: reporter.name,
        nim_nip: reporter.nim_nip,
        unit: reporter.unit,
        reporter_type: reporter.reporter_type
      };

      await setSession(sender, 'CONFIRM_TICKET', updatedData);

      await showConfirmTicketSummary(sender, updatedData);
    }
  } else if (input === '2') {
    await setSession(sender, 'INPUT_USER_INFO', currentData);

    await promptUserInfo(sender);
  } else {
    await sendMessage(sender, "❌ Pilihan tidak valid. Balas dengan angka *1* (Ya) atau *2* (Tidak).");
  }
}

async function showConfirmTicketSummary(sender: string, updatedData: any) {
  let summaryText = `📑 *KONFIRMASI TIKET PENGADUAN*\n`;
  summaryText += `-----------------------------------\n`;
  summaryText += `• *Kategori:* ${updatedData.category_path || '-'}\n`;
  summaryText += `• *Subjek:* ${updatedData.subject_input || '-'}\n`;
  summaryText += `• *Kendala:* ${updatedData.subject_description || '-'}\n`;
  summaryText += `• *Nama Pelapor:* ${updatedData.reporter_name}\n`;
  summaryText += `• *Tipe Pelapor:* ${updatedData.reporter_type}\n`;
  summaryText += `• *NIM/NIP:* ${updatedData.nim_nip}\n`;
  summaryText += `• *Unit/Fakultas:* ${updatedData.unit}\n`;
  if (updatedData.attachment_url) {
    summaryText += `• *Lampiran:* Ada (Tersimpan)\n`;
  }
  summaryText += `-----------------------------------\n\n`;
  summaryText += `Apakah data tiket di atas sudah benar?\n`;
  summaryText += `1. ✅ Ya, Kirim Tiket\n`;
  summaryText += `2. ❌ Batal Kirim\n\n`;
  summaryText += `_Balas dengan angka 1 atau 2_\n_Ketik *0* untuk mengulang input data diri._`;

  await sendMessage(sender, summaryText);
}

async function handleInputUserInfo(sender: string, input: string, currentData: any) {
  // 1. Parsing input user (Format: Nama - NIM/NIP - Unit)
  const parts = input.split('-').map(p => p.trim());
  const reporter_name = parts[0] || input;
  const nim_nip = parts[1] || '-';
  const unit = parts[2] || '-';

  // 2. Deteksi otomatis reporter_type dari NIM/NIP
  let reporter_type = 'Umum';
  const cleanId = nim_nip.replace(/\s+/g, ''); // bersihkan spasi

  // Contoh logika: NIM biasanya 14 digit, NIP 18 digit
  if (/^\d{14}$/.test(cleanId) || cleanId.toLowerCase().includes('mhs')) {
    reporter_type = 'Mahasiswa';
  } else if (/^\d{18}$/.test(cleanId) || cleanId.toLowerCase().includes('nip')) {
    reporter_type = 'Dosen / Tendik';
  } else if (cleanId !== '-' && cleanId !== '0') {
    // Jika mengisi angka/identitas tapi panjangnya beda, default ke Mahasiswa/Umum sesuai kebutuhan
    reporter_type = 'Umum';
  }

  const updatedData = {
    ...currentData,
    user_info: input,
    reporter_name,
    nim_nip,
    unit,
    reporter_type // Simpan tipe hasil deteksi
  };

  await setSession(sender, 'CONFIRM_TICKET', updatedData);

  await showConfirmTicketSummary(sender, updatedData);
}

async function handleConfirmTicket(sender: string, input: string, currentData: any) {
  if (input === '1') {
    let ticketNumber = '#000001';
    try {
      ticketNumber = await nextTicketNumber();
    } catch (e) {
      console.error("Gagal mendapatkan tiket terakhir:", e);
      ticketNumber = `#${Date.now().toString().slice(-6)}`; // Fallback
    }

    // Insert ke tabel 'tickets' dengan reporter_type dinamis
    const { data: result, error } = await supabase.from('tickets').insert([{
      ticket_num: ticketNumber,
      phone: sender,
      category_id: currentData.category_id,
      subject: currentData.subject_input || 'Laporan Pengaduan IT',
      description: currentData.subject_description,
      reporter_name: currentData.reporter_name,
      reporter_type: currentData.reporter_type || 'Umum', // <-- Dinamis sesuai hasil parsing
      nim_nip: currentData.nim_nip,
      unit: currentData.unit,
      priority: currentData.default_priority || 'MEDIUM',
      status: currentData.is_escalated ? 'ESCALATED' : 'WAITING VERIFICATION',
      attachment: currentData.attachment_url || null
    }]).select('id').single();

    if (error) {
      console.error("❌ ERROR INSERT TICKET:", error);
      await sendMessage(sender, "⚠️ Mohon maaf, terjadi kesalahan sistem saat membuat tiket. Silakan coba beberapa saat lagi.");
    } else {
      const ticketId = result.id;

      // Upsert data pelapor
      await supabase.from('reporters').upsert({
        phone: sender,
        name: currentData.reporter_name,
        nim_nip: currentData.nim_nip,
        unit: currentData.unit,
        reporter_type: currentData.reporter_type || 'Umum',
        status: 'Aktif'
      }, { onConflict: 'phone' });

      await setSession(sender, 'MAIN_MENU', {});

      let successText = `🎉 *TIKET BERHASIL DIBUAT!*\n\n`;
      successText += `• *Nomor Tiket:* *${ticketNumber}*\n`;
      successText += `• *Tipe Pelapor:* ${currentData.reporter_type}\n`;
      successText += `• *Status:* WAITING VERIFICATION\n\n`;
      successText += `Tiket Anda telah masuk ke dalam antrean operator untuk diverifikasi. Mohon menunggu update status selanjutnya via WhatsApp. Terima kasih! 🙏`;

      if (!isWorkingHours()) {
        successText += `\n\n⚠️ *Informasi:* Laporan Anda kami terima di luar jam kerja operasional. Tim kami akan memverifikasi tiket Anda pada jam kerja berikutnya.`;
      }

      await sendMessage(sender, successText);
    }

  } else if (input === '2') {
    await setSession(sender, 'MAIN_MENU', {});

    await sendMessage(sender, `❌ Pembuatan tiket dibatalkan. Ketik *${getTriggerWord()}* jika ingin memulai lagi.`);
  } else {
    await sendMessage(sender, "❌ Pilihan tidak valid. Balas dengan angka *1* (Kirim) atau *2* (Batal).");
  }
}

// FITUR CEK STATUS TIKET
// ==========================================
async function sendTicketStatusMenu(sender: string) {
  const { data: recentTickets } = await supabase
    .from('tickets')
    .select('ticket_num, subject, status, created_at')
    .eq('phone', sender)
    .order('created_at', { ascending: false })
    .limit(3);

  let text = `🔍 *CEK STATUS TIKET*\n\n`;

  if (recentTickets && recentTickets.length > 0) {
    text += `Daftar tiket terbaru Anda:\n\n`;
    recentTickets.forEach(t => {
      text += `*${t.ticket_num || '-'}*\n`;
      text += `Subjek: ${t.subject}\n`;
      text += `Status: *${t.status}*\n\n`;
    });
  }

  text += `Silakan ketikkan *Nomor Tiket* Anda (Contoh: #000001) untuk melihat detail yang lebih lengkap.`;
  return sendMessage(sender, text);
}

async function handleCheckTicketStatus(sender: string, inputNumber: string) {
  const formattedTicketNum = inputNumber.toUpperCase().trim();

  const { data: ticket, error } = await supabase
    .from('tickets')
    .select('ticket_num, status, subject, description, created_at')
    .eq('ticket_num', formattedTicketNum)
    .single();

  if (error || !ticket) {
    return sendMessage(
      sender,
      `❌ Nomor tiket *${formattedTicketNum}* tidak ditemukan.\n\n` +
      `Silakan periksa kembali nomor tiket Anda atau ketik *${getTriggerWord()}* untuk kembali ke menu utama.`
    );
  }

  const createdDate = new Date(ticket.created_at).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  let text = `🔍 *DETAIL STATUS TIKET*\n`;
  text += `-----------------------------------\n`;
  text += `• *Nomor Tiket:* ${ticket.ticket_num}\n`;
  text += `• *Status Saat Ini:* *${ticket.status}*\n`;
  text += `• *Topik Kendala:* ${ticket.subject || '-'}\n`;
  text += `• *Deskripsi:* ${ticket.description || '-'}\n`;
  text += `• *Tanggal Dibuat:* ${createdDate}\n`;
  text += `-----------------------------------\n\n`;
  text += `Ketik *${getTriggerWord()}* untuk kembali ke menu utama.`;

  await setSession(sender, 'MAIN_MENU', {});

  await sendMessage(sender, text);
}

// ==========================================
// RATING & FEEDBACK
// ==========================================
async function handleWaitingRating(sender: string, input: string, currentData: any) {
  const ticketId = currentData.ticket_id;
  if (!ticketId) {
    await setSession(sender, 'MAIN_MENU', {});
    return sendMessage(sender, `⚠️ Sesi penilaian tidak valid. Ketik *${getTriggerWord()}* untuk kembali ke menu utama.`);
  }

  // Coba parse rating (digit pertama yang ditemukan)
  const ratingMatch = input.match(/[1-5]/);
  const rating = ratingMatch ? parseInt(ratingMatch[0]) : null;

  if (!rating) {
    return sendMessage(sender, "⚠️ Format tidak valid. Silakan berikan rating berupa angka 1 sampai 5. Contoh: *5 Pelayanan sangat baik*");
  }

  // Teks ulasan adalah sisa dari string setelah menghapus angka rating
  let feedback = input.replace(/[1-5]/, '').trim();
  if (!feedback) {
    feedback = '-'; // Opsional jika kosong
  }

  // Simpan ke DB
  await supabase.from('tickets').update({
    rating: rating,
    feedback: feedback,
    updated_at: new Date().toISOString()
  }).eq('id', ticketId);

  // Reset sesi
  await setSession(sender, 'MAIN_MENU', {});

  await sendMessage(sender, `⭐ *Terima Kasih!*\n\nPenilaian Anda (Rating: ${rating}/5) dan ulasan telah kami simpan. Masukan Anda sangat berarti bagi peningkatan layanan IT Helpdesk kami.\n\nKetik *${getTriggerWord()}* jika Anda membutuhkan bantuan lain.`);
}