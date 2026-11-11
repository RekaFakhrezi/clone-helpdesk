'use client';
import ProfileForm from '@/components/profile/ProfileForm';
import { useLanguage } from '@/context/LanguageContext';

export default function ProfilePage() {
  const { t } = useLanguage();

  return (
    <ProfileForm
      title={t('profile.title')}
      description={t('profile.desc')}
      usernamePlaceholder="Username untuk login"
      authHeading="Authentication"
    />
  );
}
