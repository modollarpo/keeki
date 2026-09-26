import {Logo} from '@common/ui/navigation/navbar/logo';
import {Navbar} from '@common/ui/navigation/navbar/navbar';
import {cn} from '@ui/utils/cn';

type SectionNavProps = {
  /**
   * `floating` renders the transparent overlay navbar (logo + menu + auth) used by
   * full-bleed heroes. `inline` renders just the logo, used by split heroes where
   * the hero itself is the header.
   */
  mode: 'floating' | 'inline';
  isDarkMode?: boolean;
  className?: string;
};

export function SectionNav({mode, isDarkMode, className}: SectionNavProps) {
  const color = isDarkMode ? 'light' : 'dark';
  if (mode === 'inline') {
    return <Logo className={cn('h-10', className)} color={color} url="/" />;
  }
  return (
    <Navbar.Root
      className={cn(
        'absolute inset-x-0 top-0 z-50 m-3 min-h-20 bg-transparent',
        className,
      )}
    >
      <Navbar.Logo color={color} url="/" />
      <Navbar.Menu position="landing-page-navbar" />
      <Navbar.Content className="ml-auto">
        <Navbar.AuthContent />
      </Navbar.Content>
    </Navbar.Root>
  );
}