import {PartialUserProfile} from '@app/web-player/users/user-profile';
import {message} from '@ui/i18n/message';
import {Trans} from '@ui/i18n/trans';
import {useTrans} from '@ui/i18n/use-trans';
import {PersonIcon} from '@ui/icons/material/Person';
import {StarIcon} from '@ui/icons/material/Star';
import clsx from 'clsx';

interface Props {
  user: PartialUserProfile;
  className?: string;
  size?: string;
  showProBadge?: boolean;
}
export function UserImage({user, className, size, showProBadge}: Props) {
  const {trans} = useTrans();
  const showBadge = showProBadge && user.is_pro;

  const imgClassName = clsx(
    className,
    size,
    'object-cover bg-foreground/5 h-full w-full',
    !user.image ? 'flex items-center justify-center' : 'block',
  );

  return (
    <div
      className={clsx(
        'relative isolate shrink-0 overflow-hidden',
        size,
        className,
      )}
    >
      {user.image ? (
        <img
          className={imgClassName}
          draggable={false}
          src={user.image}
          alt={trans(message('Avatar for :name', {values: {name: user.name}}))}
        />
      ) : (
        <span className={clsx(imgClassName, 'overflow-hidden')}>
          <PersonIcon className="text-border max-w-[60%]" size="text-9xl" />
        </span>
      )}
      {showBadge && (
        <div
          className="absolute right-0 bottom-3 left-0 mx-auto flex w-max max-w-full items-center gap-1.5 rounded-full bg-black/60 px-2 py-1 text-sm text-white"
          color="positive"
        >
          <div className="bg-primary rounded-full p-px">
            <StarIcon className="text-white" size="sm" />
          </div>
          <Trans message="PRO user" />
        </div>
      )}
    </div>
  );
}
