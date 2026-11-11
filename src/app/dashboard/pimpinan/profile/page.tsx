'use client';
import ProfileForm from '@/components/profile/ProfileForm';
import { useLanguage } from '@/context/LanguageContext';

export default function PimpinanProfilePage() {
  const { t } = useLanguage();

  return (
    <ProfileForm
      title={t('profile.pimpinan_title')}
      description={t('profile.pimpinan_desc')}
      badge={t('profile.executive_badge')}
      variant="executive"
    />
  );
}
