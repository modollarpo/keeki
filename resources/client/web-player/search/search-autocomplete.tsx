import {appQueries} from '@app/app-queries';
import {ALBUM_MODEL} from '@app/web-player/albums/album';
import {AlbumContextDialog} from '@app/web-player/albums/album-context-dialog';
import {AlbumImage} from '@app/web-player/albums/album-image/album-image';
import {getAlbumLink} from '@app/web-player/albums/album-link';
import {ARTIST_MODEL} from '@app/web-player/artists/artist';
import {ArtistContextDialog} from '@app/web-player/artists/artist-context-dialog';
import {SmallArtistImage} from '@app/web-player/artists/artist-image/small-artist-image';
import {getArtistLink} from '@app/web-player/artists/artist-link';
import {ArtistLinks} from '@app/web-player/artists/artist-links';
import {PlayableModel} from '@app/web-player/playable-item/playable-model';
import {PlaybackToggleButton} from '@app/web-player/playable-item/playback-toggle-button';
import {PLAYLIST_MODEL} from '@app/web-player/playlists/playlist';
import {PlaylistContextDialog} from '@app/web-player/playlists/playlist-context-dialog';
import {PlaylistOwnerName} from '@app/web-player/playlists/playlist-grid-item';
import {PlaylistImage} from '@app/web-player/playlists/playlist-image';
import {getPlaylistLink} from '@app/web-player/playlists/playlist-link';
import {queueGroupId} from '@app/web-player/queue-group-id';
import {SearchResponse} from '@app/web-player/search/search-response';
import {TrackContextDialog} from '@app/web-player/tracks/context-dialog/track-context-dialog';
import {TRACK_MODEL} from '@app/web-player/tracks/track';
import {TrackImage} from '@app/web-player/tracks/track-image/track-image';
import {getTrackLink} from '@app/web-player/tracks/track-link';
import {UserImage} from '@app/web-player/users/user-image';
import {getUserProfileLink} from '@app/web-player/users/user-profile-link';
import {usePlayerStore} from '@common/player/hooks/use-player-store';
import {useNavigate} from '@common/ui/navigation/use-navigate';
import {ContextMenu} from '@shadcn/context-menu/context-menu';
import {Combobox} from '@shadcn/forms/combobox/combobox';
import {
  InputGroupAddon,
  InputGroupButton,
} from '@shadcn/forms/input-group/input-group';
import {Item} from '@shadcn/item/item';
import {keepPreviousData, useQuery} from '@tanstack/react-query';
import {message} from '@ui/i18n/message';
import {Trans} from '@ui/i18n/trans';
import {useTrans} from '@ui/i18n/use-trans';
import {USER_MODEL} from '@ui/types/user';
import {cn} from '@ui/utils/cn';
import {SearchIcon} from 'lucide-react';
import {cloneElement, ReactElement, ReactNode, useMemo, useState} from 'react';
import {useLocation, useParams} from 'react-router';

type SearchResultItem = NonNullable<
  SearchResponse['results'][keyof SearchResponse['results']]
>['data'][number];

type SearchResultGroup = {
  value: string;
  items: SearchResultItem[];
};

interface SearchAutocompleteProps {
  className?: string;
}
export function SearchAutocomplete({className}: SearchAutocompleteProps) {
  const {searchQuery} = useParams();
  const {trans} = useTrans();
  const navigate = useNavigate();
  const {pathname} = useLocation();
  const isOnSearchPage = pathname.startsWith('/search/');
  const [query, setQuery] = useState(searchQuery || '');
  const [isOpen, setIsOpen] = useState(false);
  const {isFetching, data} = useQuery({
    ...appQueries.search.results('search', query),
    enabled: !!query && !isOnSearchPage,
    placeholderData: keepPreviousData,
  });

  const groups = useMemo<SearchResultGroup[]>(() => {
    return Object.entries(data?.results || {}).flatMap(
      ([groupName, results]) =>
        results?.data?.length ? [{value: groupName, items: results.data}] : [],
    );
  }, [data]);

  const handleResultSelected = (result: SearchResultItem) => {
    setQuery('');
    setIsOpen(false);
    switch (result.model_type) {
      case ARTIST_MODEL:
        navigate(getArtistLink(result));
        break;
      case ALBUM_MODEL:
        navigate(getAlbumLink(result));
        break;
      case TRACK_MODEL:
        navigate(getTrackLink(result));
        break;
      case USER_MODEL:
        navigate(getUserProfileLink(result));
        break;
      case PLAYLIST_MODEL:
        navigate(getPlaylistLink(result));
        break;
    }
  };

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        const encodedQuery = encodeURIComponent(query.trim());
        if (encodedQuery) {
          setIsOpen(false);
          navigate(`/search/${encodedQuery}`);
        }
      }}
      className={cn('flex flex-auto', className)}
    >
      <div className="w-full max-w-180 flex-auto">
        <Combobox.Root
          items={groups}
          filter={null}
          bindToHookForm={false}
          inputValue={query}
          onInputValueChange={nextQuery => {
            setQuery(nextQuery);
            if (nextQuery && !isOnSearchPage) {
              setIsOpen(true);
            } else {
              setIsOpen(false);
            }
          }}
          open={isOpen}
          onOpenChange={open => {
            if (open && (!query || isOnSearchPage)) {
              return;
            }
            setIsOpen(open);
          }}
          value={null}
          onValueChange={result => {
            if (result) {
              handleResultSelected(result);
            }
          }}
          itemToStringLabel={(item: SearchResultItem) => item.name}
          itemToStringValue={(item: SearchResultItem) =>
            `${item.model_type}-${item.id}`
          }
          isItemEqualToValue={(a, b) =>
            a.model_type === b.model_type && a.id === b.id
          }
        >
          <Combobox.Input
            className="rounded-button bg-background dark:bg-muted/80 h-11.5 w-full shadow-xs"
            placeholder={trans(
              message('Search songs, artists, albums, playlists'),
            )}
            showTrigger={false}
            isLoading={isFetching}
          >
            <InputGroupAddon>
              <InputGroupButton
                type="submit"
                size="icon-sm"
                variant="ghost"
                color="default"
                aria-label={trans(message('Search'))}
              >
                <SearchIcon />
              </InputGroupButton>
            </InputGroupAddon>
          </Combobox.Input>
          <Combobox.Content sideOffset={12} className="max-h-167.5">
            {!isFetching && (
              <Combobox.Empty>
                <Trans message="No results found." />
              </Combobox.Empty>
            )}
            <Combobox.List>
              {(group: SearchResultGroup, index) => (
                <Combobox.Group key={group.value} items={group.items}>
                  <Combobox.GroupLabel>
                    <Trans message={group.value} />
                  </Combobox.GroupLabel>
                  <Combobox.Collection>
                    {(result: SearchResultItem) => {
                      switch (result.model_type) {
                        case ARTIST_MODEL:
                          return (
                            <SearchResultItemRow
                              key={`${result.model_type}-${result.id}`}
                              result={result}
                              mediaClassName="rounded-full"
                              media={
                                <PlayableImage model={result}>
                                  <SmallArtistImage artist={result} />
                                </PlayableImage>
                              }
                              title={
                                <ContextMenuTitle
                                  menu={
                                    <ArtistContextDialog
                                      artist={result}
                                      type="contextMenu"
                                    />
                                  }
                                >
                                  {result.name}
                                </ContextMenuTitle>
                              }
                              description={<Trans message="Artist" />}
                              onSelect={handleResultSelected}
                            />
                          );
                        case ALBUM_MODEL:
                          return (
                            <SearchResultItemRow
                              key={`${result.model_type}-${result.id}`}
                              result={result}
                              media={
                                <PlayableImage model={result}>
                                  <AlbumImage album={result} />
                                </PlayableImage>
                              }
                              title={
                                <ContextMenuTitle
                                  menu={
                                    <AlbumContextDialog
                                      album={result}
                                      type="contextMenu"
                                    />
                                  }
                                >
                                  {result.name}
                                </ContextMenuTitle>
                              }
                              description={
                                <ArtistLinks artists={result.artists} />
                              }
                              onSelect={handleResultSelected}
                            />
                          );
                        case TRACK_MODEL:
                          return (
                            <SearchResultItemRow
                              key={`${result.model_type}-${result.id}`}
                              result={result}
                              media={
                                <PlayableImage model={result}>
                                  <TrackImage track={result} />
                                </PlayableImage>
                              }
                              title={
                                <ContextMenuTitle
                                  menu={
                                    <TrackContextDialog
                                      tracks={[result]}
                                      type="contextMenu"
                                    />
                                  }
                                >
                                  {result.name}
                                </ContextMenuTitle>
                              }
                              description={
                                <ArtistLinks artists={result.artists} />
                              }
                              onSelect={handleResultSelected}
                            />
                          );
                        case USER_MODEL:
                          return (
                            <SearchResultItemRow
                              key={`${result.model_type}-${result.id}`}
                              result={result}
                              mediaClassName="rounded-full"
                              media={
                                <UserImage
                                  className="h-full w-full"
                                  user={result}
                                />
                              }
                              title={result.name}
                              description={
                                result.followers_count ? (
                                  <Trans
                                    message=":count followers"
                                    values={{count: result.followers_count}}
                                  />
                                ) : null
                              }
                              onSelect={handleResultSelected}
                            />
                          );
                        case PLAYLIST_MODEL:
                          return (
                            <SearchResultItemRow
                              key={`${result.model_type}-${result.id}`}
                              result={result}
                              media={
                                <PlayableImage model={result}>
                                  <PlaylistImage playlist={result} />
                                </PlayableImage>
                              }
                              title={
                                <ContextMenuTitle
                                  menu={
                                    <PlaylistContextDialog
                                      playlist={result}
                                      type="contextMenu"
                                    />
                                  }
                                >
                                  {result.name}
                                </ContextMenuTitle>
                              }
                              description={
                                <PlaylistOwnerName playlist={result} />
                              }
                              onSelect={handleResultSelected}
                            />
                          );
                        default:
                          return null;
                      }
                    }}
                  </Combobox.Collection>
                  {index < groups.length - 1 && <Combobox.Separator />}
                </Combobox.Group>
              )}
            </Combobox.List>
          </Combobox.Content>
        </Combobox.Root>
      </div>
    </form>
  );
}

interface SearchResultItemRowProps {
  result: SearchResultItem;
  media: ReactNode;
  mediaClassName?: string;
  title: ReactNode;
  description?: ReactNode;
  onSelect: (result: SearchResultItem) => void;
}
function SearchResultItemRow({
  result,
  media,
  mediaClassName,
  title,
  description,
  onSelect,
}: SearchResultItemRowProps) {
  return (
    <Combobox.Item
      value={result}
      className="[&>span:last-child]:hidden"
      onClick={e => {
        e.preventBaseUIHandler();
        onSelect(result);
      }}
    >
      <Item>
        <Item.Media
          variant="image"
          className={cn('relative size-12', mediaClassName)}
        >
          {media}
        </Item.Media>
        <Item.Content className="gap-0.5">
          <Item.Title>{title}</Item.Title>
          {description ? (
            <Item.Description>{description}</Item.Description>
          ) : null}
        </Item.Content>
      </Item>
    </Combobox.Item>
  );
}

interface ContextMenuTitleProps {
  children: ReactNode;
  menu: ReactNode;
}
function ContextMenuTitle({children, menu}: ContextMenuTitleProps) {
  return (
    <ContextMenu>
      <ContextMenu.Trigger>
        <span>{children}</span>
      </ContextMenu.Trigger>
      {menu}
    </ContextMenu>
  );
}

interface PlayableImageProps {
  children: ReactElement<{size: string; className?: string}>;
  model: PlayableModel;
  className?: string;
}
function PlayableImage({children, model, className}: PlayableImageProps) {
  const queueId = queueGroupId(model);
  const isPlaying = usePlayerStore(
    s => s.isPlaying && s.originalQueue[0]?.groupId === queueId,
  );

  return (
    <div
      className={cn(className, 'relative size-full overflow-hidden')}
      onClick={e => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {cloneElement(children, {
        size: 'size-full',
      })}
      <div
        className={cn(
          'absolute inset-0 m-auto items-center justify-center bg-black/60',
          isPlaying
            ? 'flex'
            : 'hidden group-hover/dropdown-menu-item:flex group-data-highlighted/dropdown-menu-item:flex',
        )}
      >
        <PlaybackToggleButton
          buttonType="icon"
          equalizerColor="white"
          track={model.model_type === TRACK_MODEL ? model : undefined}
          queueId={queueId}
          className="size-8 border-white bg-white text-black hover:border-white hover:bg-white hover:text-black"
        />
      </div>
    </div>
  );
}
