import {AntennaIcon} from '@app/web-player/channels/antenna-icon';
import {getRadioLink} from '@app/web-player/radio/get-radio-link';
import {useShouldShowRadioButton} from '@app/web-player/tracks/context-dialog/use-should-show-radio-button';
import {Channel} from '@common/channels/channel';
import {LinkButton} from '@shadcn/button/button';
import {Tooltip} from '@shadcn/tooltip/tooltip';
import {Trans} from '@ui/i18n/trans';
import clsx from 'clsx';
import {ChevronRightIcon} from 'lucide-react';
import {Link, useParams} from 'react-router';

interface ChannelHeadingProps {
  channel: Channel;
  margin?: string;
  isNested?: boolean;
}
export function ChannelHeading({
  channel,
  isNested,
  margin = isNested ? 'mb-4 md:mb-5' : 'mb-5 md:mb-10',
}: ChannelHeadingProps) {
  const shouldShowRadio = useShouldShowRadioButton();
  if (channel.config.hideTitle) {
    return null;
  }
  if (!isNested) {
    if (shouldShowRadio && channel.restriction?.model_type === 'genre') {
      return (
        <div
          className={clsx('flex items-center justify-between gap-6', margin)}
        >
          <h1 className="flex-auto text-3xl">
            <Trans message={channel.name} />
          </h1>
          <Tooltip.Root>
            <Tooltip.Trigger
              render={
                <LinkButton
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  to={getRadioLink(channel.restriction)}
                />
              }
            >
              <AntennaIcon />
            </Tooltip.Trigger>
            <Tooltip.Content>
              <Trans message="Genre radio" />
            </Tooltip.Content>
          </Tooltip.Root>
        </div>
      );
    }
    return (
      <h1 className={clsx('text-3xl', margin)}>
        <Trans message={channel.name} />
      </h1>
    );
  }

  return (
    <div className={clsx('flex items-center gap-1 text-xl', margin)}>
      <NestedChannelLink channel={channel} />
      <ChevronRightIcon className="mt-1" />
    </div>
  );
}

interface ChannelLinkProps {
  channel: Channel;
}
function NestedChannelLink({channel}: ChannelLinkProps) {
  const {restriction: genreName} = useParams();
  return (
    <Link
      className="outline-hidden hover:underline focus-visible:underline"
      to={
        channel.config.restriction === 'genre' && genreName
          ? `/${channel.slug}/${genreName}`
          : `/${channel.slug}`
      }
    >
      <Trans message={channel.name} />
    </Link>
  );
}
