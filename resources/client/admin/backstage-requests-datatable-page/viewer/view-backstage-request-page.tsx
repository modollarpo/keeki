import {BackstageRequestType} from '@app/admin/backstage-requests-datatable-page/backstage-request-type';
import {BackstageRequestViewerHeader} from '@app/admin/backstage-requests-datatable-page/viewer/backstage-request-viewer-header';
import {appQueries} from '@app/app-queries';
import {SmallArtistImage} from '@app/web-player/artists/artist-image/small-artist-image';
import {ArtistLink} from '@app/web-player/artists/artist-link';
import {BackstageRequest} from '@app/web-player/backstage/backstage-request';
import {StaticPageTitle} from '@common/seo/static-page-title';
import {DashboardLayout} from '@common/ui/dashboard/dashboard-layout';
import {useRequiredParams} from '@common/ui/navigation/use-required-params';
import {Avatar} from '@shadcn/avatar/avatar';
import {Button} from '@shadcn/button/button';
import {Dialog} from '@shadcn/dialog/dialog';
import {Item} from '@shadcn/item/item';
import {useSuspenseQuery} from '@tanstack/react-query';
import {Trans} from '@ui/i18n/trans';
import {ImageZoomDialog} from '@ui/overlays/dialog/image-zoom-dialog';
import {prettyBytes} from '@ui/utils/files/pretty-bytes';
import {SiFacebook, SiX} from '@icons-pack/react-simple-icons';
import {FileScanIcon} from 'lucide-react';
import {ReactNode} from 'react';

export function Component() {
  const {requestId} = useRequiredParams(['requestId']);
  const query = useSuspenseQuery(appQueries.backstageRequests.show(requestId));
  const request = query.data.request;

  return (
    <DashboardLayout.MainSection>
      <StaticPageTitle>
        <Trans message="View request" />
      </StaticPageTitle>
      <BackstageRequestViewerHeader request={request} />
      <DashboardLayout.SectionContent>
        <DashboardLayout.ContainedContent>
          <RequestDetails request={request} />
          <VerificationList request={request} />
        </DashboardLayout.ContainedContent>
      </DashboardLayout.SectionContent>
    </DashboardLayout.MainSection>
  );
}

interface RequestDetailsProps {
  request: BackstageRequest;
}
function RequestDetails({request}: RequestDetailsProps) {
  return (
    <div>
      <h2 className="mb-3.5 text-2xl">
        <Trans message="Request details" />
      </h2>
      <div>
        <Detail
          name={<Trans message="Image" />}
          value={
            request.data.image ? (
              <img
                src={request.data.image || request.artist?.image_small}
                className="max-h-25 rounded"
                alt=""
              />
            ) : null
          }
        />
        <Detail
          name={<Trans message="Type" />}
          value={<BackstageRequestType type={request.type} />}
        />
        <Detail
          name={<Trans message="Requester" />}
          value={
            <div className="flex items-center gap-2">
              <Avatar.Root size="sm">
                <Avatar.Image
                  src={request.user.image ?? undefined}
                  alt={request.user.name}
                />
                <Avatar.ColorFallback>{request.user.name}</Avatar.ColorFallback>
              </Avatar.Root>
              {request.user.name}
            </div>
          }
        />
        {request.artist && (
          <Detail
            name={<Trans message="Artist" />}
            value={
              <div className="flex w-max items-center gap-3">
                <SmallArtistImage
                  artist={request.artist}
                  className="shrink-0"
                  size="size-8 rounded-full"
                />
                <ArtistLink artist={request.artist} />
              </div>
            }
          />
        )}
        <Detail
          name={<Trans message="Requested artist name" />}
          value={request.artist_name}
        />
        <Detail
          name={<Trans message="Requested role" />}
          value={
            request.data.role ? (
              <Trans message={request.data.role} />
            ) : undefined
          }
        />
        <Detail name={<Trans message="Name" />} value={request.data.name} />
        <Detail
          name={<Trans message="Company" />}
          value={request.data.company}
        />
      </div>
    </div>
  );
}

interface DetailProps {
  name: ReactNode;
  value: ReactNode;
}
function Detail({name, value}: DetailProps) {
  return (
    <div className="items-center gap-6 border-b py-3 text-sm md:flex md:py-4.5">
      <div className="mb-2 min-w-50 md:mb-0">{name}</div>
      <div>{value}</div>
    </div>
  );
}

function VerificationList({request}: RequestDetailsProps) {
  return (
    <div className="mt-15">
      <h2 className="mb-3.5 text-2xl">
        <Trans message="Attached verification" />
      </h2>
      <Item.Group>
        {request.data.passport_scan_entry && (
          <Item.Root variant="outline" size="sm">
            <Item.Media variant="icon">
              <FileScanIcon />
            </Item.Media>
            <Item.Content>
              <Item.Title>
                <Trans message="Passport scan" />
              </Item.Title>
              <Item.Description>
                {`${request.data.passport_scan_entry.name} (${prettyBytes(
                  request.data.passport_scan_entry.file_size,
                )})`}
              </Item.Description>
            </Item.Content>
            <Item.Actions>
              <ImageZoomDialog image={request.data.passport_scan_entry.url}>
                <Dialog.Trigger
                  render={
                    <Button variant="outline" size="sm" color="primary" />
                  }
                >
                  <Trans message="View" />
                </Dialog.Trigger>
              </ImageZoomDialog>
            </Item.Actions>
          </Item.Root>
        )}
        <SocialServiceVerification request={request} service="twitter" />
        <SocialServiceVerification request={request} service="facebook" />
      </Item.Group>
    </div>
  );
}

interface SocialServiceVerificationProps {
  service: 'twitter' | 'facebook';
  request: BackstageRequest;
}
function SocialServiceVerification({
  service,
  request,
}: SocialServiceVerificationProps) {
  const account = request.user.social_profiles.find(
    s => s.service_name === service,
  );
  if (!account) return null;

  return (
    <Item.Root variant="outline" size="sm">
      <Item.Media variant="icon">
        {service === 'twitter' ? (
          <SiX className="text-twitter" />
        ) : (
          <SiFacebook className="text-facebook" />
        )}
      </Item.Media>
      <Item.Content>
        <Item.Title>
          <span className="capitalize">
            <Trans message=":service account" values={{service}} />
          </span>
        </Item.Title>
        <Item.Description>{account.username}</Item.Description>
      </Item.Content>
      <Item.Actions>
        <Button
          variant="outline"
          color="primary"
          size="xs"
          render={
            <a
              href={
                service === 'twitter'
                  ? `https://twitter.com/${account.username}`
                  : `https://facebook.com/${account.username}`
              }
              target="_blank"
              rel="noreferrer"
            />
          }
        >
          <Trans message="View" />
        </Button>
      </Item.Actions>
    </Item.Root>
  );
}
