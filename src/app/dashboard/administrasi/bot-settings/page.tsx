import BotSettingsWorkspace from '@/components/admin/bot-settings/BotSettingsWorkspace';

export const metadata = {
  title: 'Manajemen Template Bot - Admin Helpdesk IT',
};

export default function BotSettingsPage() {
  return (
    <div className="w-full max-w-[1440px] mx-auto">
      <div className="animate-in fade-in duration-300 w-full h-full">
        <BotSettingsWorkspace />
      </div>
    </div>
  );
}
