import {BackstageRequestType} from '@app/admin/backstage-requests-datatable-page/backstage-request-type';
import {SmallArtistImage} from '@app/web-player/artists/artist-image/small-artist-image';
import {ArtistLink} from '@app/web-player/artists/artist-link';
import {BackstageRequest} from '@app/web-player/backstage/backstage-request';
import {Avatar} from '@shadcn/avatar/avatar';
import {Badge} from '@shadcn/badge/badge';
import {LinkButton} from '@shadcn/button/button';
import {checkboxColumnDef} from '@shadcn/table/utils/checkbox-column-def';
import {SortableHeader} from '@shadcn/table/utils/sortable-header';
import {Tooltip} from '@shadcn/tooltip/tooltip';
import {ColumnDef} from '@tanstack/react-table';
import {FormattedDate} from '@ui/i18n/formatted-date';
import {Trans} from '@ui/i18n/trans';
import {EyeIcon} from 'lucide-react';

export const backstageRequestsDatatableColumns: ColumnDef<BackstageRequest>[] =
  [
    checkboxColumnDef<BackstageRequest>(),
    {
      id: 'type',
      accessorKey: 'type',
      enableSorting: true,
      header: ({column}) => (
        <SortableHeader column={column}>
          <Trans message="Type" />
        </SortableHeader>
      ),
      cell: ({row}) => <BackstageRequestType type={row.original.type} />,
    },
    {
      id: 'status',
      accessorKey: 'status',
      enableSorting: true,
      header: ({column}) => (
        <SortableHeader column={column}>
          <Trans message="Status" />
        </SortableHeader>
      ),
      cell: ({row}) => <RequestStatusBadge status={row.original.status} />,
    },
    {
      id: 'user',
      accessorKey: 'user_id',
      enableSorting: true,
      size: 250,
      header: ({column}) => (
        <SortableHeader column={column}>
          <Trans message="User" />
        </SortableHeader>
      ),
      cell: ({row}) => {
        const user = row.original.user;
        if (!user) return null;
        return (
          <div className="flex min-w-0 items-center gap-2">
            <Avatar.Root size="sm" className="size-8.5">
              <Avatar.Image src={user.image ?? undefined} alt={user.name} />
              <Avatar.ColorFallback>{user.name}</Avatar.ColorFallback>
            </Avatar.Root>
            <div className="min-w-0 overflow-hidden">
              <div className="truncate">{user.name}</div>
              {user.email ? (
                <div className="text-muted-foreground truncate text-xs">
                  {user.email}
                </div>
              ) : null}
            </div>
          </div>
        );
      },
    },
    {
      id: 'artist',
      accessorKey: 'artist_id',
      enableSorting: true,
      size: 220,
      header: ({column}) => (
        <SortableHeader column={column}>
          <Trans message="Artist" />
        </SortableHeader>
      ),
      cell: ({row}) => {
        const request = row.original;
        if (!request.artist) return request.artist_name;
        return (
          <div className="flex min-w-0 items-center gap-2">
            <SmallArtistImage
              artist={request.artist}
              className="shrink-0"
              size="size-8 rounded-full"
            />
            <ArtistLink
              artist={request.artist}
              className="truncate"
              onClick={e => e.stopPropagation()}
            />
          </div>
        );
      },
    },
    {
      id: 'created_at',
      accessorKey: 'created_at',
      enableSorting: true,
      header: ({column}) => (
        <SortableHeader column={column}>
          <Trans message="Requested at" />
        </SortableHeader>
      ),
      cell: ({row}) =>
        row.original.created_at ? (
          <time>
            <FormattedDate date={row.original.created_at} />
          </time>
        ) : null,
    },
    {
      id: 'actions',
      size: 1,
      header: () => (
        <span className="hidden">
          <Trans message="Actions" />
        </span>
      ),
      cell: ({row}) => <BackstageRequestActionsButton request={row.original} />,
    },
  ];

export function RequestStatusBadge({
  status,
}: {
  status: BackstageRequest['status'];
}) {
  const variant =
    status === 'approved'
      ? 'positive'
      : status === 'denied'
        ? 'destructive'
        : 'secondary';

  return (
    <Badge variant={variant} className="w-max capitalize">
      <Trans message={status} />
    </Badge>
  );
}

export function BackstageRequestActionsButton({
  request,
}: {
  request: BackstageRequest;
}) {
  return (
    <div className="text-muted-foreground flex justify-end">
      <Tooltip.Root>
        <Tooltip.Trigger
          render={
            <LinkButton
              variant="ghost"
              size="icon-sm"
              to={`${request.id}`}
              onClick={e => e.stopPropagation()}
            />
          }
        >
          <EyeIcon />
        </Tooltip.Trigger>
        <Tooltip.Content>
          <Trans message="View" />
        </Tooltip.Content>
      </Tooltip.Root>
    </div>
  );
}
