import {usePlayerActions} from '@common/player/hooks/use-player-actions';
import {usePlayerStore} from '@common/player/hooks/use-player-store';
import {Button} from '@shadcn/button/button';
import {Input} from '@shadcn/forms/input/input';
import {PageMetaTags} from '@common/http/page-meta-tags';
import {apiClient} from '@common/http/query-client';
import {Trans} from '@ui/i18n/trans';
import {useTrans} from '@ui/i18n/use-trans';
import {message} from '@ui/i18n/message';
import {RadioIcon, PlayIcon, PauseIcon, Loader2Icon} from 'lucide-react';
import {useQuery} from '@tanstack/react-query';
import {useState} from 'react';
import debounce from 'just-debounce-it';

interface Station {
  id: string;
  title: string;
  artist: string;
  image?: string;
  url: string;
  provider: 'htmlAudio';
}

export function Component() {
  const [searchQuery, setSearchQuery] = useState('');
  const {trans} = useTrans();
  const player = usePlayerActions();
  const cuedMedia = usePlayerStore(s => s.cuedMedia);
  const isPlaying = usePlayerStore(s => s.isPlaying);

  const {data, isLoading} = useQuery({
    queryKey: ['radio-stations', searchQuery],
    queryFn: async () => {
      const res = await apiClient.get<{data: Station[]}>('radio/stations', {
        params: {q: searchQuery || undefined},
      });
      return res.data.data;
    },
  });

  const debouncedSearch = debounce((q: string) => setSearchQuery(q), 300);

  const handlePlayStation = async (station: Station, index: number) => {
    if (!data) return;
    const mediaItems = data.map(s => ({
      id: s.id,
      groupId: 'radio-stations',
      provider: 'htmlAudio' as const,
      src: s.url,
      meta: {
        id: s.id,
        name: s.title,
        duration: 0,
        image: s.image,
        artists: [{name: s.artist}],
      },
    }));

    await player.overrideQueueAndPlay(mediaItems, index);
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <PageMetaTags title="Live Radio" description="Stream over 30,000+ live radio stations worldwide for free." />
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <RadioIcon className="w-8 h-8 text-primary animate-pulse" />
            <Trans message="Live Radio Stations" />
          </h1>
          <p className="text-muted-foreground mt-1">
            <Trans message="Explore 30,000+ live global radio broadcasts instantly." />
          </p>
        </div>
        <div className="w-full md:w-72">
          <Input
            bindToHookForm={false}
            placeholder={trans(message('Search stations or countries...'))}
            onChange={e => debouncedSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2Icon className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {data?.map((station, index) => {
            const isCurrent = cuedMedia?.id === station.id;
            const currentPlaying = isCurrent && isPlaying;

            return (
              <div
                key={station.id}
                onClick={() => handlePlayStation(station, index)}
                className={`group relative flex items-center gap-4 p-4 rounded-xl border bg-card hover:bg-accent/50 cursor-pointer transition-all ${
                  isCurrent ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                }`}
              >
                <div className="w-14 h-14 rounded-lg bg-secondary flex items-center justify-center shrink-0 overflow-hidden relative shadow-inner">
                  {station.image ? (
                    <img src={station.image} alt={station.title} className="w-full h-full object-cover" onError={(e) => {(e.target as HTMLElement).style.display = 'none';}} />
                  ) : (
                    <RadioIcon className="w-6 h-6 text-muted-foreground" />
                  )}
                  <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                    currentPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}>
                    {currentPlaying ? (
                      <PauseIcon className="w-6 h-6 text-white fill-white" />
                    ) : (
                      <PlayIcon className="w-6 h-6 text-white fill-white" />
                    )}
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold truncate text-sm">{station.title}</h3>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{station.artist}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
