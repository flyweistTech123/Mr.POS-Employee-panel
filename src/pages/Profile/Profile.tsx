import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next'; // ✅ Added i18n
import ProfileDesktop from './ProfileDesktop';
import { ProfileMobile } from './ProfileMobile';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useWalkthroughStore } from '@/store/walkthroughStore';
import { useNavigate } from 'react-router-dom';
import { useGetProfileQuery } from '@/redux/api/settingsApi';
import Loader from '@/components/Loader';

const Profile: React.FC = () => {
  const { t } = useTranslation(); // ✅ Added i18n hook

  const isMobile = useMediaQuery('(max-width: 1023px)');
  const { settingsHighlight, setSettingsHighlight } = useWalkthroughStore();
  const navigate = useNavigate();
  
  // Fetch the data from the API
  const { data: profileResponse, isLoading, isError } = useGetProfileQuery();

  // Handle walkthrough transition
  useEffect(() => {
    if (settingsHighlight === 'profile') {
      const timer = setTimeout(() => {
        setSettingsHighlight('notifications-reset');
        navigate('/settings');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [settingsHighlight, setSettingsHighlight, navigate]);

  const forceSecurityTab = settingsHighlight === 'security';
  const forceWorkTab = settingsHighlight === 'work';

  if (isLoading) {
    return <Loader />;
  }

  if (isError || !profileResponse?.data) {
    return (
      <div className="p-8 text-red-500 text-center font-semibold">
        {t('Failed to load user profile. Please try again.')}
      </div>
    );
  }

  const rawUser = profileResponse.data;

  // 👇 MAPPING ALL FIELDS
  const mappedUser = {
    _id: rawUser._id,
    Name: rawUser.full_name || `${rawUser.first_name} ${rawUser.last_name}`,
    Employee_id: rawUser.employee_id_code || rawUser.employee_login_code,
    email: rawUser.email,
    phone: rawUser.phone,
    user_image: rawUser.profile_image?.includes('example.com') 
      ? `https://ui-avatars.com/api/?name=${encodeURIComponent(rawUser.full_name || 'User')}&background=random` 
      : rawUser.profile_image,
    OnboardingDate: new Date(rawUser.onboarding_date).toLocaleDateString('en-GB', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    }), // Returns DD/MM/YYYY to match screenshot
    yearsWithus: rawUser.experience_years || 0,

    // Add missing fields for the UI
    shift_timings: rawUser.shift_timings || t('N/A'),
    total_leave_days: rawUser.total_leave_days || 0,
    leave_left_days: rawUser.leave_left_days || 0,

    // Map flat strings to the nested objects the UI expects
    Role_id: {
      Role_id: 1,
      role_name: rawUser.role || t('Employee'),
    },
    Responsibility_id: {
      Responsibility_id: 1,
      Responsibility_name: rawUser.responsibility || t('N/A'),
    },
  };

  return (
    <div 
      className={
        settingsHighlight === 'profile'
          ? 'profile-highlight'
          : settingsHighlight === 'security'
          ? 'security-highlight'
          : settingsHighlight === 'work'
          ? 'work-highlight'
          : ''
      }
    >
      {isMobile ? (
        <ProfileMobile 
          forceSecurityTab={forceSecurityTab} 
          forceWorkTab={forceWorkTab}
          user={mappedUser as any}
        />
      ) : (
        <ProfileDesktop 
          forceSecurityTab={forceSecurityTab} 
          forceWorkTab={forceWorkTab}
          user={mappedUser as any}
        />
      )}
    </div>
  );
};

export default Profile;