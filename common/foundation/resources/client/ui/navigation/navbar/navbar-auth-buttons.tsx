import {useNavigate} from '@common/ui/navigation/use-navigate';
import {Button, ButtonColor, LinkButton} from '@shadcn/button/button';
import {Item} from '@ui/forms/listbox/item';
import {Trans} from '@ui/i18n/trans';
import {Menu, MenuTrigger} from '@ui/menu/menu-trigger';
import {useSettings} from '@ui/settings/use-settings';
import {UserRoundIcon} from 'lucide-react';
import {Fragment} from 'react';

interface NavbarAuthButtonsProps {
  primaryButtonColor?: ButtonColor;
}
export function NavbarAuthButtons({
  primaryButtonColor,
}: NavbarAuthButtonsProps) {
  return (
    <Fragment>
      <MobileButtons />
      <DesktopButtons primaryButtonColor={primaryButtonColor} />
    </Fragment>
  );
}

interface DesktopButtonsProps {
  primaryButtonColor: ButtonColor;
}
function DesktopButtons({primaryButtonColor}: DesktopButtonsProps) {
  const {registration} = useSettings();
  return (
    // Switches at `lg` (1024px) to match the web player's layout breakpoint
    // (`useIsTabletMediaQuery` -> `(max-width: 1024px)`). These used to switch
    // at `md` (768px) while the mobile navbar kept rendering up to 1024px,
    // which left signed-out visitors on tablet widths with no account control
    // at all: the mobile trigger was already `md:hidden` and the desktop
    // buttons were `max-md:hidden`.
    <div className="text-sm max-lg:hidden">
      {!registration?.disable && (
        <LinkButton to="/register" variant="ghost" className="mr-2.5">
          <Trans message="Register" />
        </LinkButton>
      )}
      <LinkButton
        to="/login"
        variant="default"
        color={primaryButtonColor ?? 'primary'}
      >
        <Trans message="Login" />
      </LinkButton>
    </div>
  );
}

function MobileButtons() {
  const {registration} = useSettings();
  const navigate = useNavigate();
  return (
    <MenuTrigger>
      {/* Sized to match the surrounding header controls: 40px box with a 20px
          glyph. It used to be 48px/28px, which made the account control read as
          oversized next to a 40px search pill.

          Visibility is `lg:hidden`, not `md:hidden`, so the trigger survives the
          whole range in which the mobile navbar is the one being rendered. */}
      <Button
        variant="ghost"
        size="icon"
        type="button"
        className="lg:hidden !size-10 text-foreground"
      >
        <UserRoundIcon className="!size-5" />
      </Button>
      <Menu>
        <Item value="login" onSelected={() => navigate('/login')}>
          <Trans message="Login" />
        </Item>
        {!registration?.disable && (
          <Item value="register" onSelected={() => navigate('/register')}>
            <Trans message="Register" />
          </Item>
        )}
      </Menu>
    </MenuTrigger>
  );
}
