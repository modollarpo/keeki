import {User} from '@app/gen/schemas/user';
import {useAuth} from '@common/auth/use-auth';
import {UrlBackedTabConfig} from '@common/http/use-url-backed-tabs';
import {Tabs} from '@shadcn/tabs/tabs';
import {message} from '@ui/i18n/message';
import {Trans} from '@ui/i18n/trans';
import {useSettings} from '@ui/settings/use-settings';
import {useMemo} from 'react';
import {Outlet, useLocation} from 'react-router';

export const updateUserPageTabs: UrlBackedTabConfig[] = [
  {uri: 'details', label: message('Details')},
  {uri: 'permissions', label: message('Roles & permissions')},
  {uri: 'security', label: message('Security')},
  {uri: 'date', label: message('Date & time')},
  {uri: 'api', label: message('API')},
];

interface Props {
  tabs: UrlBackedTabConfig[];
  user: User;
}
export function UpdateUserPageTabs({user, tabs}: Props) {
  const {user: authUser, hasPermission} = useAuth();
  const {api} = useSettings();
  const apiEnabled = api?.integrated && hasPermission('api.access');
  const filteredTabs = useMemo(() => {
    return tabs.filter(tab => {
      if (tab.uri === 'api' && !apiEnabled) {
        return false;
      }
      if (tab.uri === 'security' && user.id !== authUser?.id) {
        return false;
      }
      return true;
    });
  }, [user.id, authUser?.id, apiEnabled, tabs]);

  const {pathname} = useLocation();
  const selectedTab =
    filteredTabs.find(tab => pathname.endsWith(`/${tab.uri}`))?.uri ??
    filteredTabs[0]?.uri;

  return (
    <div className="mx-auto w-full max-w-6xl px-6">
      <Tabs.Root value={selectedTab}>
        <div className="mb-6 border-b">
          <Tabs.List variant="line">
            {filteredTabs.map(tab => (
              <Tabs.LinkTab key={tab.uri} value={tab.uri} to={tab.uri}>
                <Trans {...tab.label} />
              </Tabs.LinkTab>
            ))}
          </Tabs.List>
        </div>
        <Outlet context={user} />
      </Tabs.Root>
    </div>
  );
}
