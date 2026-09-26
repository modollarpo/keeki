import {SortDescriptor} from '@common/ui/tables/types/sort-descriptor';
import {Button} from '@shadcn/button/button';
import {Dropdown} from '@shadcn/dropdown/dropdown';
import {MessageDescriptor} from '@ui/i18n/message-descriptor';
import {Trans} from '@ui/i18n/trans';
import {useIsMobileMediaQuery} from '@ui/utils/hooks/is-mobile-media-query';
import {ArrowUpDownIcon, ChevronDownIcon} from 'lucide-react';

interface Props {
  items: Record<string, MessageDescriptor>;
  sortDescriptor: Partial<SortDescriptor> | null;
  setSortDescriptor: (sort: Partial<SortDescriptor>) => void;
}
export function LibraryPageSortDropdown({
  items,
  sortDescriptor,
  setSortDescriptor,
}: Props) {
  const isMobile = useIsMobileMediaQuery();
  const selectedValue = sortDescriptor
    ? `${sortDescriptor.orderBy}:${sortDescriptor.orderDir}`
    : '';

  return (
    <Dropdown.Root>
      <Dropdown.Trigger
        render={
          isMobile ? (
            <Button variant="ghost" size="icon" />
          ) : (
            <Button variant="outline" className="shrink-0" />
          )
        }
      >
        {isMobile ? (
          <ArrowUpDownIcon />
        ) : (
          <>
            <Trans {...items[selectedValue]} />
            <ChevronDownIcon data-icon="inline-end" />
          </>
        )}
      </Dropdown.Trigger>
      <Dropdown.Content align="end">
        <Dropdown.RadioGroup
          value={selectedValue}
          onValueChange={newValue => {
            const [orderBy, orderDir] = newValue.split(':');
            setSortDescriptor({
              orderBy,
              orderDir: orderDir as SortDescriptor['orderDir'],
            });
          }}
        >
          {Object.entries(items).map(([value, label]) => (
            <Dropdown.RadioItem key={value} value={value}>
              <Trans {...label} />
            </Dropdown.RadioItem>
          ))}
        </Dropdown.RadioGroup>
      </Dropdown.Content>
    </Dropdown.Root>
  );
}
