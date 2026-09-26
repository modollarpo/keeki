import {ExternalIdsFields} from '@app/admin/artist-datatable-page/artist-form/external-ids-fields';
import {CreateTrackPayload} from '@app/admin/tracks-datatable-page/requests/use-create-track';
import {TrackFormUploadButton} from '@app/admin/tracks-datatable-page/track-form/track-form-upload-button';
import {ListNormalizedModels200DataItem} from '@app/gen/schemas/list-normalized-models200-data-item';
import {UploadType} from '@app/site-config';
import {useArtistPickerSuggestions} from '@app/web-player/artists/artist-picker/use-artist-picker-suggestions';
import {GENRE_MODEL} from '@app/web-player/genres/genre';
import {apiClient} from '@common/http/query-client';
import {useNormalizedModels} from '@common/ui/normalized-model/use-normalized-models';
import {ImageSelector} from '@common/uploads/components/image-selector';
import {Avatar} from '@shadcn/avatar/avatar';
import {Combobox} from '@shadcn/forms/combobox/combobox';
import {ModelSelect} from '@shadcn/forms/combobox/model-select';
import {Field} from '@shadcn/forms/field';
import {HookForm} from '@shadcn/forms/form/hook-form';
import {Input} from '@shadcn/forms/input/input';
import {Textarea} from '@shadcn/forms/textarea/textarea';
import {queryOptions} from '@tanstack/react-query';
import {FormattedDuration} from '@ui/i18n/formatted-duration';
import {message} from '@ui/i18n/message';
import {Trans} from '@ui/i18n/trans';
import {useTrans} from '@ui/i18n/use-trans';
import {NormalizedModel} from '@ui/types/normalized-model';
import {useIsMobileMediaQuery} from '@ui/utils/hooks/is-mobile-media-query';
import {Fragment, ReactNode, useState} from 'react';
import {useFormContext, useWatch} from 'react-hook-form';

const TAG_MODEL = 'tag';

interface TrackFormProps {
  showExternalIdFields?: boolean;
  showAlbumField?: boolean;
  uploadButton?: ReactNode;
}
export function TrackForm({
  showExternalIdFields,
  showAlbumField = true,
  uploadButton,
}: TrackFormProps) {
  const isMobile = useIsMobileMediaQuery();
  const form = useFormContext<CreateTrackPayload>();
  const imageValue = useWatch({control: form.control, name: 'image'}) ?? '';

  return (
    <div className="gap-6 md:flex">
      <div className="shrink-0">
        <Field.Root name="image" className="w-full md:w-56">
          {isMobile ? (
            <Fragment>
              <Field.Label>
                <Trans message="Image" />
              </Field.Label>
              <ImageSelector.Input
                uploadType={UploadType.artwork}
                value={imageValue}
                onChange={value => {
                  form.setValue('image', value || null, {
                    shouldDirty: true,
                  });
                }}
              />
            </Fragment>
          ) : (
            <ImageSelector.Square
              uploadType={UploadType.artwork}
              value={imageValue}
              onChange={value => {
                form.setValue('image', value || null, {
                  shouldDirty: true,
                });
              }}
              className="aspect-square size-full w-56"
              placeholderVariant="icon"
            />
          )}
          <Field.Error />
        </Field.Root>
        <div className="mt-6">
          {uploadButton ? uploadButton : <TrackFormUploadButton />}
        </div>
      </div>
      <div className="mt-6 flex-auto md:mt-0">
        <Field.Group>
          <HookForm.Field name="name">
            <Field.Label>
              <Trans message="Name" />
            </Field.Label>
            <Input required autoFocus />
            <Field.Error />
          </HookForm.Field>
          {showAlbumField && <AlbumSelect />}
          <ArtistCombobox />
          <GenreCombobox />
          <TagCombobox />
          <HookForm.Field name="description">
            <Field.Label>
              <Trans message="Description" />
            </Field.Label>
            <Textarea rows={5} />
            <Field.Error />
          </HookForm.Field>
          <DurationField />
          {showExternalIdFields && <SourceField />}
          {showExternalIdFields && <ExternalIdsFields inline />}
        </Field.Group>
      </div>
    </div>
  );
}

function AlbumSelect() {
  return (
    <HookForm.Field name="album_id">
      <Field.Label>
        <Trans message="Album" />
      </Field.Label>
      <ModelSelect
        placeholder={<Trans message="Select album" />}
        listOptions={({query}) =>
          queryOptions({
            queryKey: ['album', 'search-suggestions', {query}],
            queryFn: async () => {
              const {data} = await apiClient.get<{
                results: ListNormalizedModels200DataItem[];
              }>('search/suggestions/album', {params: {query}});
              return {data: data.results ?? []};
            },
          })
        }
        retrieveOptions={({id}) =>
          queryOptions({
            queryKey: ['album', 'search-suggestions', id],
            queryFn: async () => {
              const {data} = await apiClient.get<{
                model: ListNormalizedModels200DataItem;
              }>(`search/suggestions/album/${id}`);
              return {data: data.model};
            },
          })
        }
        modelToLabel={(album: ListNormalizedModels200DataItem) => album.name}
        modelToImage={(album: ListNormalizedModels200DataItem) => (
          <Avatar.Root size="sm">
            <Avatar.Image src={album.image ?? undefined} alt="" />
            <Avatar.ColorFallback>{album.name}</Avatar.ColorFallback>
          </Avatar.Root>
        )}
      />
      <Field.Error />
    </HookForm.Field>
  );
}

function ArtistCombobox() {
  const {trans} = useTrans();
  const [query, setQuery] = useState('');
  const {data, isLoading} = useArtistPickerSuggestions({query});
  const items = data?.results ?? [];

  return (
    <HookForm.Field name="artists">
      <Field.Label>
        <Trans message="Artists" />
      </Field.Label>
      <Combobox.Root
        items={items}
        multiple
        filter={null}
        inputValue={query}
        onInputValueChange={setQuery}
        itemToStringLabel={(item: NormalizedModel) => item.name}
        isItemEqualToValue={(a: NormalizedModel, b: NormalizedModel) =>
          String(a.id) === String(b.id)
        }
      >
        <Combobox.Chips>
          <Combobox.Value>
            {(value: NormalizedModel[] = []) => (
              <>
                {value.map(artist => (
                  <Combobox.Chip key={artist.id}>{artist.name}</Combobox.Chip>
                ))}
                <Combobox.ChipsInput
                  placeholder={trans(message('+Add artist'))}
                />
              </>
            )}
          </Combobox.Value>
        </Combobox.Chips>
        <Combobox.Content>
          {isLoading ? (
            <div className="text-muted-foreground p-3 text-sm">
              <Trans message="Loading..." />
            </div>
          ) : (
            <>
              <Combobox.Empty>
                <Trans message="No artists found." />
              </Combobox.Empty>
              <Combobox.List>
                {(artist: NormalizedModel) => (
                  <Combobox.Item key={artist.id} value={artist}>
                    <Avatar.Root size="sm">
                      <Avatar.Image src={artist.image} alt="" />
                      <Avatar.ColorFallback>{artist.name}</Avatar.ColorFallback>
                    </Avatar.Root>
                    {artist.name}
                  </Combobox.Item>
                )}
              </Combobox.List>
            </>
          )}
        </Combobox.Content>
      </Combobox.Root>
      <Field.Error />
    </HookForm.Field>
  );
}

function GenreCombobox() {
  return (
    <NormalizedModelCombobox
      name="genres"
      model={GENRE_MODEL}
      label={<Trans message="Genres" />}
      placeholder={message('+Add genre')}
      emptyMessage={<Trans message="No genres found." />}
      allowCustomValue
    />
  );
}

function TagCombobox() {
  return (
    <NormalizedModelCombobox
      name="tags"
      model={TAG_MODEL}
      label={<Trans message="Tags" />}
      placeholder={message('+Add tag')}
      emptyMessage={<Trans message="No tags found." />}
      allowCustomValue
    />
  );
}

interface NormalizedModelComboboxProps {
  name: 'genres' | 'tags';
  model: string;
  label: ReactNode;
  placeholder: ReturnType<typeof message>;
  emptyMessage: ReactNode;
  allowCustomValue?: boolean;
}
function NormalizedModelCombobox({
  name,
  model,
  label,
  placeholder,
  emptyMessage,
  allowCustomValue,
}: NormalizedModelComboboxProps) {
  const {trans} = useTrans();
  const [query, setQuery] = useState('');
  const {data} = useNormalizedModels(`normalized-models/${model}`, {
    query,
  });
  const selected = (useWatch({name}) as NormalizedModel[] | undefined) ?? [];
  const suggestions = data?.data ?? [];
  const trimmedQuery = query.trim();
  const canCreateCustom =
    !!allowCustomValue &&
    !!trimmedQuery &&
    ![...suggestions, ...selected].some(
      item => item.name.toLowerCase() === trimmedQuery.toLowerCase(),
    );
  const items = canCreateCustom
    ? [
        ...suggestions,
        {
          id: trimmedQuery,
          name: trimmedQuery,
          model_type: model,
        } satisfies NormalizedModel,
      ]
    : suggestions;

  return (
    <HookForm.Field name={name}>
      <Field.Label>{label}</Field.Label>
      <Combobox.Root
        items={items}
        multiple
        filter={null}
        inputValue={query}
        onInputValueChange={setQuery}
        itemToStringLabel={(item: NormalizedModel) => item.name}
        isItemEqualToValue={(a: NormalizedModel, b: NormalizedModel) =>
          String(a.id) === String(b.id)
        }
      >
        <Combobox.Chips>
          <Combobox.Value>
            {(value: NormalizedModel[] = []) => (
              <>
                {value.map(item => (
                  <Combobox.Chip key={item.id}>{item.name}</Combobox.Chip>
                ))}
                <Combobox.ChipsInput placeholder={trans(placeholder)} />
              </>
            )}
          </Combobox.Value>
        </Combobox.Chips>
        <Combobox.Content>
          <Combobox.Empty>{emptyMessage}</Combobox.Empty>
          <Combobox.List>
            {(item: NormalizedModel) => (
              <Combobox.Item key={item.id} value={item}>
                {item.name}
              </Combobox.Item>
            )}
          </Combobox.List>
        </Combobox.Content>
      </Combobox.Root>
      <Field.Error />
    </HookForm.Field>
  );
}

function SourceField() {
  return (
    <HookForm.Field name="src">
      <Field.Label>
        <Trans message="Playback source" />
      </Field.Label>
      <Input minLength={1} maxLength={230} />
      <Field.Description>
        <Trans message="Supports audio, video, hls/dash stream and youtube video url. If left empty, best matching youtube video will be found automatically." />
      </Field.Description>
      <Field.Error />
    </HookForm.Field>
  );
}

function DurationField() {
  const duration = useWatch({name: 'duration'});
  return (
    <HookForm.Field name="duration">
      <Field.Label>
        <Trans message="Duration (in milliseconds)" />
      </Field.Label>
      <Input required type="number" min={1} max={86400000} />
      <Field.Description>
        <Trans
          message="Will appear on the site as: :preview"
          values={{preview: <FormattedDuration ms={duration} />}}
        />
      </Field.Description>
      <Field.Error />
    </HookForm.Field>
  );
}
