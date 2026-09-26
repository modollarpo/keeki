import {appQueries} from '@app/app-queries';
import {PlayerPageHeaderGradient} from '@app/web-player/layout/player-page-header-gradient';
import {PlayerPageSuspense} from '@app/web-player/layout/player-page-suspsense';
import {ProfileHeader} from '@app/web-player/users/user-profile/profile-header';
import {PageMetaTags} from '@common/http/page-meta-tags';
import {useRequiredParams} from '@common/ui/navigation/use-required-params';
import {Tabs} from '@shadcn/tabs/tabs';
import {useSuspenseQuery} from '@tanstack/react-query';
import {Trans} from '@ui/i18n/trans';
import {FullPageLoader} from '@ui/progress/full-page-loader';
import {useSettings} from '@ui/settings/use-settings';
import {Suspense, useCallback} from 'react';
import {Outlet, useMatch} from 'react-router';

export function Component() {
  return (
    <PlayerPageSuspense>
      <UserProfilePage />
    </PlayerPageSuspense>
  );
}

function UserProfilePage() {
  const {userId} = useRequiredParams(['userId']);
  const {player} = useSettings();

  const query = useSuspenseQuery(appQueries.userProfile(userId).details);
  const user = query.data.user;

  const match = useMatch('/user/:userId/:userName/:tabName');
  const selectedTab = match?.params.tabName || 'tracks';

  const tabLink = useCallback(
    (tabName: string) => {
      return `/user/${user.id}/${user.name}/${tabName}`;
    },
    [user],
  );

  return (
    <>
      <PageMetaTags query={query} />
      {user.image && <PlayerPageHeaderGradient image={user.image} />}
      <div className="relative">
        <ProfileHeader user={user} tabLink={tabLink} />
        <Tabs.Root className="mt-12" value={selectedTab}>
          <div className="border-b">
            <Tabs.List variant="line">
              <Tabs.LinkTab value="tracks" to={tabLink('tracks')}>
                <Trans message="Liked tracks" />
              </Tabs.LinkTab>
              <Tabs.LinkTab value="playlists" to={tabLink('playlists')}>
                <Trans message="Public playlists" />
              </Tabs.LinkTab>
              {player?.enable_repost && (
                <Tabs.LinkTab value="reposts" to={tabLink('reposts')}>
                  <Trans message="Reposts" />
                </Tabs.LinkTab>
              )}
              <Tabs.LinkTab value="albums" to={tabLink('albums')}>
                <Trans message="Liked albums" />
              </Tabs.LinkTab>
              <Tabs.LinkTab value="artists" to={tabLink('artists')}>
                <Trans message="Liked artists" />
              </Tabs.LinkTab>
              <Tabs.LinkTab value="followers" to={tabLink('followers')}>
                <Trans message="Followers" />
              </Tabs.LinkTab>
              <Tabs.LinkTab value="following" to={tabLink('following')}>
                <Trans message="Following" />
              </Tabs.LinkTab>
            </Tabs.List>
          </div>
          <div className="mt-6">
            <Suspense
              fallback={
                <div className="flex min-h-31 items-center justify-center">
                  <FullPageLoader />
                </div>
              }
            >
              <Outlet context={user} />
            </Suspense>
          </div>
        </Tabs.Root>
      </div>
    </>
  );
}
