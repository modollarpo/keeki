import {Navbar} from '@common/ui/navigation/navbar/navbar';
import {SearchAutocomplete} from '@app/web-player/search/search-autocomplete';

export function MobileNavbar() {
  return (
    <Navbar.Root className="h-14 border-b px-2 py-2 gap-2">
      <div className="flex h-full items-center">
        <Navbar.Logo color="auto" />
      </div>
      <SearchAutocomplete className="flex-auto max-w-[200px]" />
      <Navbar.Content className="ml-auto flex-shrink-0">
        <Navbar.AuthContent />
      </Navbar.Content>
    </Navbar.Root>
  );
}
