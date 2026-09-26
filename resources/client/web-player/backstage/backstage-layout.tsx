import {Footer} from '@common/ui/footer/footer';
import {Navbar} from '@common/ui/navigation/navbar/navbar';
import {ComponentPropsWithoutRef, ReactNode} from 'react';

interface Props extends ComponentPropsWithoutRef<'div'> {
  children: ReactNode;
}
export function BackstageLayout({children, ...domProps}: Props) {
  return (
    <div className="flex h-screen flex-col" {...domProps}>
      <Navbar.Root className="shrink-0 border-b">
        <Navbar.Logo />
        <Navbar.Content className="ml-auto">
          <Navbar.AuthContent />
        </Navbar.Content>
      </Navbar.Root>
      <div className="relative flex-auto overflow-y-auto bg-cover">
        <div className="mx-auto flex min-h-full max-w-6xl flex-col p-3.5 md:p-6">
          <div className="flex-auto">{children}</div>
          <Footer />
        </div>
      </div>
    </div>
  );
}
