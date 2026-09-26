import {Navbar} from '@common/ui/navigation/navbar/navbar';

export function MobileNavbar() {
  return (
    <Navbar.Root className="h-14 border-b px-3 py-2">
      <div className="flex h-full items-center">
        <Navbar.Logo color="auto" />
      </div>
      <Navbar.Content className="ml-auto">
        <Navbar.AuthContent />
      </Navbar.Content>
    </Navbar.Root>
  );
}
