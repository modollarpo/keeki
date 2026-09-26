import {AlbumTracksForm} from '@app/admin/albums-datatable-page/album-form/album-tracks-form';
import {CreateAlbumPayload} from '@app/admin/albums-datatable-page/requests/use-create-album';
import {ExternalIdsFields} from '@app/admin/artist-datatable-page/artist-form/external-ids-fields';
import {UploadType} from '@app/site-config';
import {useArtistPickerSuggestions} from '@app/web-player/artists/artist-picker/use-artist-picker-suggestions';
import {GENRE_MODEL} from '@app/web-player/genres/genre';
import {useNormalizedModels} from '@common/ui/normalized-model/use-normalized-models';
import {ImageSelector} from '@common/uploads/components/image-selector';
import {Avatar} from '@shadcn/avatar/avatar';
import {Combobox} from '@shadcn/forms/combobox/combobox';
import {Field} from '@shadcn/forms/field';
import {HookForm} from '@shadcn/forms/form/hook-form';
import {Input} from '@shadcn/forms/input/input';
import {Select} from '@shadcn/forms/select/select';
import {Textarea} from '@shadcn/forms/textarea/textarea';
import {FormDatePicker} from '@ui/forms/input-field/date/date-picker/date-picker';
import {message} from '@ui/i18n/message';
import {Trans} from '@ui/i18n/trans';
import {useTrans} from '@ui/i18n/use-trans';
import {NormalizedModel} from '@ui/types/normalized-model';
import {useIsMobileMediaQuery} from '@ui/utils/hooks/is-mobile-media-query';
import {Fragment, ReactNode, useState} from 'react';
import {useFormContext, useWatch} from 'react-hook-form';

const TAG_MODEL = 'tag';

const recordTypeItems = [
  {value: 'album', label: 'Album'},
  {value: 'single', label: 'Single'},
  {value: 'ep', label: 'EP'},
  {value: 'live', label: 'Live'},
  {value: 'compilation', label: 'Compilation'},
] as const;
interface AlbumFormProps {
  showExternalIdFields?: boolean;
}
export function AlbumForm({showExternalIdFields}: AlbumFormProps) {
  const isMobile = useIsMobileMediaQuery();
  const form = useFormContext<CreateAlbumPayload>();
  const imageValue = useWatch({control: form.control, name: 'image'}) ?? '';

  return (
    <Fragment>
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
            <FormDatePicker
              name="release_date"
              label={<Trans message="Release date" />}
              granularity="day"
              description={
                <Trans message="Set a future date to schedule release to become public only on that date." />
              }
            />
            <HookForm.Field name="record_type">
              <Field.Label>
                <Trans message="Type" />
              </Field.Label>
              <Select.Root items={recordTypeItems}>
                <Select.Trigger className="w-full">
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  {recordTypeItems.map(item => (
                    <Select.Item key={item.value} value={item.value}>
                      <Trans message={item.label} />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
              <Field.Error />
            </HookForm.Field>
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
            {showExternalIdFields && <ExternalIdsFields inline />}
          </Field.Group>
        </div>
      </div>
      <AlbumTracksForm />
    </Fragment>
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
