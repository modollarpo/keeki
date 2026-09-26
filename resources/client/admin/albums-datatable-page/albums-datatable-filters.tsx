import {
  listNormalizedModels,
  retrieveNormalizedModel,
} from '@app/gen/normalized-models';
import {ListNormalizedModels200DataItem} from '@app/gen/schemas/list-normalized-models200-data-item';
import {ARTIST_MODEL} from '@app/web-player/artists/artist';
import {SmallArtistImage} from '@app/web-player/artists/artist-image/small-artist-image';
import {
  ALL_NUMBER_OPERATORS,
  BackendFilter,
  FilterOperator,
} from '@common/datatable/filters/backend-filter';
import {
  DateRangeFilterItem,
  DateRangeFilterItemProps,
  DateRangeFilterPopoverContent,
  DateRangeFilterPopoverContentProps,
} from '@common/datatable/filters/panels/date-range-filter';
import {
  InputFilterItem,
  InputFilterItemProps,
  InputFilterPopoverContent,
  InputFilterPopoverContentProps,
} from '@common/datatable/filters/panels/input-filter';
import {
  ModelSelectFilterItem,
  ModelSelectFilterPopoverContent,
  SelectModelFilterItemProps,
  SelectModelFilterPopoverContentProps,
} from '@common/datatable/filters/panels/model-select-filter';
import {
  SelectFilterItem,
  SelectFilterItemProps,
  SelectFilterPopoverContent,
  SelectFilterPopoverContentProps,
} from '@common/datatable/filters/panels/select-filter';
import {Avatar} from '@shadcn/avatar/avatar';
import {queryOptions} from '@tanstack/react-query';
import {Trans} from '@ui/i18n/trans';

export const AlbumsDatatableFilters: BackendFilter[] = [
  {
    key: 'image',
    label: <Trans message="Artwork" />,
    valueType: 'string',
    item: (props: SelectFilterItemProps) => <SelectFilterItem {...props} />,
    popoverContent: (props: SelectFilterPopoverContentProps) => (
      <SelectFilterPopoverContent
        {...props}
        placeholder={<Trans message="Select artwork status" />}
        items={[
          {label: <Trans message="Has artwork" />, value: '*'},
          {label: <Trans message="Does not have artwork" />, value: 'null'},
        ]}
      />
    ),
  },
  {
    key: 'plays',
    label: <Trans message="Plays count" />,
    valueType: 'string',
    item: (props: InputFilterItemProps) => <InputFilterItem {...props} />,
    popoverContent: (props: InputFilterPopoverContentProps) => (
      <InputFilterPopoverContent
        {...props}
        inputType="number"
        operators={ALL_NUMBER_OPERATORS}
        defaultValue={{value: '100', operator: FilterOperator.gte}}
      />
    ),
  },
  {
    key: 'created_at',
    label: <Trans message="Date created" />,
    valueType: 'dateRange',
    item: (props: DateRangeFilterItemProps) => (
      <DateRangeFilterItem {...props} />
    ),
    popoverContent: (props: DateRangeFilterPopoverContentProps) => (
      <DateRangeFilterPopoverContent {...props} />
    ),
  },
  {
    key: 'updated_at',
    label: <Trans message="Last updated" />,
    valueType: 'dateRange',
    item: (props: DateRangeFilterItemProps) => (
      <DateRangeFilterItem {...props} />
    ),
    popoverContent: (props: DateRangeFilterPopoverContentProps) => (
      <DateRangeFilterPopoverContent {...props} />
    ),
  },
  {
    key: 'artists',
    label: <Trans message="Artist" />,
    valueType: 'string',
    item: (props: SelectModelFilterItemProps) => (
      <ModelSelectFilterItem
        {...props}
        retrieveOptions={({id}) =>
          queryOptions({
            queryKey: [ARTIST_MODEL, 'normalized-models', `${id}`],
            queryFn: () => retrieveNormalizedModel(ARTIST_MODEL, id),
          })
        }
        modelToLabel={(artist: ListNormalizedModels200DataItem) => artist.name}
        modelToImage={(artist: ListNormalizedModels200DataItem) => (
          <Avatar.Root size="xs">
            <Avatar.Image src={artist.image ?? undefined} />
            <Avatar.ColorFallback>{artist.name}</Avatar.ColorFallback>
          </Avatar.Root>
        )}
      />
    ),
    popoverContent: (props: SelectModelFilterPopoverContentProps) => (
      <ModelSelectFilterPopoverContent
        {...props}
        placeholder={<Trans message="Select artist" />}
        defaultValue={{value: '', operator: FilterOperator.has}}
        listOptions={({query}) =>
          queryOptions({
            queryKey: [ARTIST_MODEL, 'normalized-models', {query}],
            queryFn: () => listNormalizedModels(ARTIST_MODEL, {query}),
          })
        }
        retrieveOptions={({id}) =>
          queryOptions({
            queryKey: [ARTIST_MODEL, 'normalized-models', `${id}`],
            queryFn: () => retrieveNormalizedModel(ARTIST_MODEL, id),
          })
        }
        modelToLabel={(artist: ListNormalizedModels200DataItem) => artist.name}
        modelToImage={(artist: ListNormalizedModels200DataItem) => (
          <SmallArtistImage
            artist={artist}
            className="shrink-0"
            size="size-6.5 rounded-full"
          />
        )}
      />
    ),
  },
];
