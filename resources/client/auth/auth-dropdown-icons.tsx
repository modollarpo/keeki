import {HeadphonesIcon, SettingsIcon, UserPenIcon} from 'lucide-react';
import {ReactElement} from 'react';

export const authDropdownIcons: Record<string, ReactElement> = {
  '/admin/reports': <SettingsIcon />,
  '/account-settings': <UserPenIcon />,
  '/': <HeadphonesIcon />,
};
