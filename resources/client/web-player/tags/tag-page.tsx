import {PlayerPageSuspense} from '@app/web-player/layout/player-page-suspsense';
import {Tabs} from '@shadcn/tabs/tabs';
import {Trans} from '@ui/i18n/trans';
import {FullPageLoader} from '@ui/progress/full-page-loader';
import {Suspense} from 'react';
import {Outlet, useMatch, useParams} from 'react-router';

export function Component() {
  return (
    <PlayerPageSuspense>
      <TagPage />
    </PlayerPageSuspense>
  );
}

function TagPage() {
  const params = useParams();
  const tagName = params.tagName!;

  const match = useMatch('/tag/:tagName/:tabName');
  const tabName = match?.params.tabName || 'tracks';

  return (
    <div>
      <h1 className="mb-10 text-3xl">
        {tabName === 'albums' ? (
          <Trans
            message="Most popular albums for #:tag"
            values={{tag: tagName}}
          />
        ) : (
          <Trans
            message="Most popular tracks for #:tag"
            values={{tag: tagName}}
          />
        )}
      </h1>
      <Tabs.Root value={tabName}>
        <div className="border-b">
          <Tabs.List variant="line">
            <Tabs.LinkTab value="tracks" to={`/tag/${tagName}/tracks`}>
              <Trans message="Tracks" />
            </Tabs.LinkTab>
            <Tabs.LinkTab value="albums" to={`/tag/${tagName}/albums`}>
              <Trans message="Albums" />
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
            <Outlet />
          </Suspense>
        </div>
      </Tabs.Root>
    </div>
  );
}
