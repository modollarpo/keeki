import {Channel} from '@common/channels/channel';
import {Badge} from '@shadcn/badge/badge';
import {LinkButton} from '@shadcn/button/button';
import {checkboxColumnDef} from '@shadcn/table/utils/checkbox-column-def';
import {SortableHeader} from '@shadcn/table/utils/sortable-header';
import {Tooltip} from '@shadcn/tooltip/tooltip';
import {ColumnDef} from '@tanstack/react-table';
import {FormattedDate} from '@ui/i18n/formatted-date';
import {Trans} from '@ui/i18n/trans';
import {useSettings} from '@ui/settings/use-settings';
import {HouseIcon, PencilIcon} from 'lucide-react';

export const channelsDatatableColumns: ColumnDef<Channel>[] = [
  checkboxColumnDef<Channel>(),
  {
    id: 'name',
    accessorKey: 'name',
    enableSorting: true,
    size: 280,
    header: ({column}) => (
      <SortableHeader column={column}>
        <Trans message="Name" />
      </SortableHeader>
    ),
    cell: ({row}) => {
      const channel = row.original;
      return (
        <div className="min-w-0">
          <div className="truncate font-medium">
            <ChannelName channel={channel} />
          </div>
          {channel.config.adminDescription ? (
            <p className="text-muted-foreground max-w-170 text-xs whitespace-normal">
              {channel.config.adminDescription}
            </p>
          ) : null}
        </div>
      );
    },
  },
  {
    id: 'content',
    enableSorting: false,
    header: () => <Trans message="Content" />,
    cell: ({row}) => <ContentType channel={row.original} />,
  },
  {
    id: 'content_type',
    enableSorting: false,
    header: () => <Trans message="Content type" />,
    cell: ({row}) => (
      <span className="capitalize">
        {row.original.config.contentModel ? (
          <Trans message={row.original.config.contentModel} />
        ) : null}
      </span>
    ),
  },
  {
    id: 'internal',
    accessorKey: 'internal',
    enableSorting: true,
    size: 1,
    header: () => (
      <span className="hidden">
        <Trans message="Internal" />
      </span>
    ),
    cell: ({row}) => <InternalColumn channel={row.original} />,
  },
  {
    id: 'updated_at',
    accessorKey: 'updated_at',
    enableSorting: true,
    size: 1,
    header: ({column}) => (
      <SortableHeader column={column}>
        <Trans message="Last updated" />
      </SortableHeader>
    ),
    cell: ({row}) =>
      row.original.updated_at ? (
        <time>
          <FormattedDate date={row.original.updated_at} />
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
    cell: ({row}) => <ChannelActionsButton channel={row.original} />,
  },
];

export function ChannelActionsButton({channel}: {channel: Channel}) {
  return (
    <div className="text-muted-foreground flex justify-end">
      <Tooltip.Root>
        <Tooltip.Trigger
          render={
            <LinkButton
              variant="ghost"
              size="icon"
              to={`${channel.id}/edit`}
              onClick={e => e.stopPropagation()}
            />
          }
        >
          <PencilIcon />
        </Tooltip.Trigger>
        <Tooltip.Content>
          <Trans message="Edit" />
        </Tooltip.Content>
      </Tooltip.Root>
    </div>
  );
}

function ContentType({channel}: {channel: Channel}) {
  switch (channel.config.contentType) {
    case 'listAll':
      return <Trans message="List all" />;
    case 'manual':
      return <Trans message="Managed manually" />;
    case 'autoUpdate':
      return <Trans message="Updated automatically" />;
  }
}

function ChannelName({channel}: {channel: Channel}) {
  // link will not work without specific genre name in channel url
  if (
    channel.config.restriction &&
    channel.config.restrictionModelId === 'urlParam'
  ) {
    return channel.name;
  }
  return (
    <a
      className="outline-hidden hover:underline focus-visible:underline"
      href={`channel/${channel.slug}`}
      target="_blank"
      rel="noreferrer"
      onClick={e => e.stopPropagation()}
    >
      {channel.name}
    </a>
  );
}

function InternalColumn({channel}: {channel: Channel}) {
  const {homepage} = useSettings();
  const isHomepage =
    homepage?.type === 'channels' && `${homepage.value}` === `${channel.id}`;

  return (
    <div className="flex items-center gap-1.5">
      {channel.internal ? (
        <Tooltip.Root>
          <Tooltip.Trigger
            render={
              <Badge variant="secondary" className="cursor-default">
                <Trans message="Internal" />
              </Badge>
            }
          />
          <Tooltip.Content>
            <Trans message="This channel is required for some site functionality to work properly and can't be deleted." />
          </Tooltip.Content>
        </Tooltip.Root>
      ) : null}
      {isHomepage ? (
        <HouseIcon className="text-muted-foreground size-4" />
      ) : null}
    </div>
  );
}
