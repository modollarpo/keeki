import {RemoteFavicon} from '@common/ui/other/remote-favicon';
import {Button} from '@shadcn/button/button';
import {Tooltip} from '@shadcn/tooltip/tooltip';
import {ProfileLink} from '../user-profile';

interface ProfileLinksProps {
  links?: ProfileLink[];
}
export function ProfileLinks({links}: ProfileLinksProps) {
  if (!links?.length) return null;
  return (
    <div className="flex items-center">
      {links.map(link => (
        <Tooltip.Root key={link.url}>
          <Tooltip.Trigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                nativeButton={false}
                render={<a href={link.url} target="_blank" rel="noreferrer" />}
              />
            }
          >
            <RemoteFavicon url={link.url} alt={link.title} />
          </Tooltip.Trigger>
          <Tooltip.Content>{link.title}</Tooltip.Content>
        </Tooltip.Root>
      ))}
    </div>
  );
}
