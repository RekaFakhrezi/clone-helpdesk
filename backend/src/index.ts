import express from 'express';
import { supabase } from './config/supabase';
import authRoutes from './routes/auth.routes';
import ticketRoutes from './routes/ticket.routes';
import metadataRoutes from './routes/metadata.routes';
import operatorRoutes from './routes/operator.routes';
import adminRoutes from './routes/admin.routes';
import webhookRoutes from './routes/webhook.routes';
import reporterRoutes from './routes/reporter.routes';
import simulatorRoutes from './routes/simulator.routes';
import { confirmTicketPublic } from './controllers/ticketController';
const app = express();

app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Middleware CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// Registrasi Routes
app.use('/webhook', webhookRoutes);
app.use('/api/simulator', simulatorRoutes); // Rute untuk simulasi testing
app.use('/api/auth', authRoutes);
app.use('/api/admin/tickets', ticketRoutes);
// Endpoint publik: konfirmasi penyelesaian tiket dari pelapor (tanpa auth)
app.post('/api/tickets/public/:ticketId/confirm', confirmTicketPublic);
app.use('/api/admin/reporters', reporterRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', metadataRoutes);
app.use('/api/operator', operatorRoutes);

app.get('/', (req, res) => {
  res.send('API Helpdesk IT UNDIP Aktif!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server Helpdesk berjalan di http://localhost:${PORT}`);

  // Auto-Resolve Background Job (Check every hour)
  setInterval(async () => {
    try {
      const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from('tickets')
        .select('id')
        .eq('status', 'WAITING CONFIRMATION')
        .lt('updated_at', fortyEightHoursAgo);

      if (!error && data && data.length > 0) {
        for (const ticket of data) {
          await supabase.from('tickets').update({ status: 'RESOLVED' }).eq('id', ticket.id);
          await supabase.from('ticket_messages').insert({
            ticket_id: ticket.id,
            sender_type: 'SYSTEM',
            message: `[AUTO-RESOLVE] Tiket otomatis diselesaikan karena tidak ada konfirmasi pelapor selama 2x24 jam.`
          });
        }
        console.log(`Auto-resolved ${data.length} tickets.`);
      }
    } catch (err) {
      console.error('Error running auto-resolve cron:', err);
    }
  }, 60 * 60 * 1000);
});