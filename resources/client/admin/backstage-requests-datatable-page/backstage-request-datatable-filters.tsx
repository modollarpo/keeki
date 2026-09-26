import {User} from '@app/gen/schemas/user';
import {
  listUsersOptions,
  retrieveUserOptions,
} from '@common/admin/users/users-queries';
import {BackendFilter} from '@common/datatable/filters/backend-filter';
import {
  DateRangeFilterItem,
  DateRangeFilterItemProps,
  DateRangeFilterPopoverContent,
  DateRangeFilterPopoverContentProps,
} from '@common/datatable/filters/panels/date-range-filter';
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
import {Trans} from '@ui/i18n/trans';

export const BackstageRequestDatatableFilters: BackendFilter[] = [
  {
    key: 'type',
    label: <Trans message="Type" />,
    valueType: 'string',
    item: (props: SelectFilterItemProps) => <SelectFilterItem {...props} />,
    popoverContent: (props: SelectFilterPopoverContentProps) => (
      <SelectFilterPopoverContent
        {...props}
        placeholder={<Trans message="Select type" />}
        items={[
          {
            label: <Trans message="Become artist" />,
            value: 'become-artist',
          },
          {
            label: <Trans message="Verify artist" />,
            value: 'verify-artist',
          },
          {
            label: <Trans message="Claim artist" />,
            value: 'claim-artist',
          },
        ]}
      />
    ),
  },
  {
    key: 'status',
    label: <Trans message="Status" />,
    valueType: 'string',
    item: (props: SelectFilterItemProps) => <SelectFilterItem {...props} />,
    popoverContent: (props: SelectFilterPopoverContentProps) => (
      <SelectFilterPopoverContent
        {...props}
        placeholder={<Trans message="Select status" />}
        items={[
          {label: <Trans message="Pending" />, value: 'pending'},
          {label: <Trans message="Approved" />, value: 'approved'},
          {label: <Trans message="Denied" />, value: 'denied'},
        ]}
      />
    ),
  },
  {
    key: 'user_id',
    label: <Trans message="Requester" />,
    valueType: 'string',
    item: (props: SelectModelFilterItemProps) => (
      <ModelSelectFilterItem
        {...props}
        retrieveOptions={({id}) => retrieveUserOptions(id)}
        modelToLabel={(user: User) => user.name}
        modelToImage={(user: User) => (
          <Avatar.Root size="xs">
            <Avatar.Image src={user.image ?? undefined} />
            <Avatar.ColorFallback>{user.name}</Avatar.ColorFallback>
          </Avatar.Root>
        )}
      />
    ),
    popoverContent: (props: SelectModelFilterPopoverContentProps) => (
      <ModelSelectFilterPopoverContent
        {...props}
        placeholder={<Trans message="Select requester" />}
        listOptions={({query}) => listUsersOptions({query})}
        retrieveOptions={({id}) => retrieveUserOptions(id)}
        modelToLabel={(user: User) => user.name}
        modelToImage={(user: User) => (
          <Avatar.Root size="sm">
            <Avatar.Image src={user.image ?? undefined} />
            <Avatar.ColorFallback>{user.name}</Avatar.ColorFallback>
          </Avatar.Root>
        )}
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
];
