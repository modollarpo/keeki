import {Empty} from '@shadcn/empty/empty';
import {Trans} from '@ui/i18n/trans';
import {ReactElement} from 'react';

interface MediaPageNoResultsMessage {
  description: ReactElement;
  searchQuery?: string;
  className?: string;
}
export function MediaPageNoResultsMessage({
  description,
  searchQuery,
  className,
}: MediaPageNoResultsMessage) {
  if (searchQuery) {
    return (
      <Empty className={className}>
        <Empty.Header>
          <Empty.Title>
            <Trans message="No results found" />
          </Empty.Title>
          <Empty.Description>
            <Trans message="Try another search query or different filters" />
          </Empty.Description>
        </Empty.Header>
      </Empty>
    );
  }
  return (
    <Empty className={className}>
      <Empty.Header>
        <Empty.Title>
          <Trans message="Nothing to display" />
        </Empty.Title>
        <Empty.Description>{description}</Empty.Description>
      </Empty.Header>
    </Empty>
  );
}
