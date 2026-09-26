import {PartialAlbum} from '@app/web-player/albums/album';
import {AlbumImage} from '@app/web-player/albums/album-image/album-image';
import {getAlbumLink} from '@app/web-player/albums/album-link';
import {PartialArtist} from '@app/web-player/artists/artist';
import {SmallArtistImage} from '@app/web-player/artists/artist-image/small-artist-image';
import {getArtistLink} from '@app/web-player/artists/artist-link';
import {PartialPlaylist} from '@app/web-player/playlists/playlist';
import {PlaylistImage} from '@app/web-player/playlists/playlist-image';
import {getPlaylistLink} from '@app/web-player/playlists/playlist-link';
import {ShareMediaButtons} from '@app/web-player/sharing/share-media-buttons';
import {Track} from '@app/web-player/tracks/track';
import {TrackImage} from '@app/web-player/tracks/track-image/track-image';
import {getTrackLink} from '@app/web-player/tracks/track-link';
import {useControlledState} from '@react-stately/utils';
import {Dialog} from '@shadcn/dialog/dialog';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@shadcn/forms/input-group/input-group';
import {Textarea} from '@shadcn/forms/textarea/textarea';
import {Tabs} from '@shadcn/tabs/tabs';
import {Trans} from '@ui/i18n/trans';
import {useIsMobileMediaQuery} from '@ui/utils/hooks/is-mobile-media-query';
import useClipboard from '@ui/utils/hooks/use-clipboard';
import {useRef} from 'react';

interface Props {
  item: PartialArtist | PartialAlbum | Track | PartialPlaylist;
  children?: Dialog.TriggerElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}
export function ShareMediaDialog({
  item,
  children,
  open: openProp,
  onOpenChange: onOpenChangeProp,
}: Props) {
  const [open, setOpen] = useControlledState(openProp, false, onOpenChangeProp);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {children}
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Content className="sm:max-w-3xl">
          <Dialog.Header>
            <Dialog.Title>
              <Trans message="Share :name" values={{name: item.name}} />
            </Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            {item.model_type === 'artist' || item.model_type === 'playlist' ? (
              <SharePanel item={item} />
            ) : (
              <Tabs.Root defaultValue="share">
                <Tabs.List>
                  <Tabs.Tab value="share">
                    <Trans message="Share" />
                  </Tabs.Tab>
                  <Tabs.Tab value="embed">
                    <Trans message="Embed" />
                  </Tabs.Tab>
                </Tabs.List>
                <Tabs.Panel value="share" className="pt-5">
                  <SharePanel item={item} />
                </Tabs.Panel>
                <Tabs.Panel value="embed" className="pt-5">
                  <EmbedPanel item={item} />
                </Tabs.Panel>
              </Tabs.Root>
            )}
          </Dialog.Body>
          <Dialog.Footer>
            <Dialog.CloseButton>
              <Trans message="Close" />
            </Dialog.CloseButton>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function EmbedPanel({item}: Pick<Props, 'item'>) {
  const isMobile = useIsMobileMediaQuery();
  const link = `${getLink(item)}/embed`;
  const height = item.model_type === 'track' ? 174 : 384;

  const code = `<iframe width="100%" height="${height}" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" src="${link}"></iframe>`;

  return (
    <div>
      {!isMobile && (
        <iframe
          src={link}
          width="100%"
          height={height}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      )}
      <Textarea
        bindToHookForm={false}
        className="mt-5"
        readOnly
        value={code}
        rows={3}
        onClick={e => {
          e.currentTarget.focus();
          e.currentTarget.select();
        }}
      />
    </div>
  );
}

function SharePanel({item}: Pick<Props, 'item'>) {
  const link = getLink(item);
  const inputRef = useRef<HTMLInputElement>(null);
  const [copied, copyLink] = useClipboard(link, {successDuration: 600});
  return (
    <div className="flex items-center gap-3.5">
      <MediaImage
        item={item}
        size="w-32 h-32"
        className="shrink-0 rounded object-cover max-md:hidden"
      />
      <div className="flex-auto">
        <div className="mb-2 text-xl">{item.name}</div>
        <InputGroup className="mb-2">
          <InputGroupInput
            bindToHookForm={false}
            ref={inputRef}
            readOnly
            value={link}
            onClick={e => {
              e.currentTarget.focus();
              e.currentTarget.select();
            }}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              variant="default"
              onClick={() => {
                inputRef.current?.select();
                copyLink();
              }}
            >
              {copied ? <Trans message="Copied!" /> : <Trans message="Copy" />}
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <ShareMediaButtons
          link={link}
          image={'image' in item ? item.image : (item as any).image_small}
          name={item.name}
        />
      </div>
    </div>
  );
}

interface MediaImageProps {
  item: Props['item'];
  className?: string;
  size?: string;
}
function MediaImage({item, className, size}: MediaImageProps) {
  switch (item.model_type) {
    case 'artist':
      return (
        <SmallArtistImage
          size={size}
          className={className}
          wrapperClassName="max-md:hidden"
          artist={item}
        />
      );
    case 'album':
      return <AlbumImage size={size} className={className} album={item} />;
    case 'track':
      return <TrackImage size={size} className={className} track={item} />;
    case 'playlist':
      return (
        <PlaylistImage size={size} className={className} playlist={item} />
      );
  }
}

function getLink(item: Props['item']) {
  switch (item.model_type) {
    case 'artist':
      return getArtistLink(item, {absolute: true});
    case 'album':
      return getAlbumLink(item, {absolute: true});
    case 'track':
      return getTrackLink(item, {absolute: true});
    case 'playlist':
      return getPlaylistLink(item, {absolute: true});
  }
}
