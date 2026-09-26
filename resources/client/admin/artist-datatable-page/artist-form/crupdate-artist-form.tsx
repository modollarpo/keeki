import {ArtistAlbumsTable} from '@app/admin/artist-datatable-page/artist-form/artist-albums-table';
import {ExternalIdsFields} from '@app/admin/artist-datatable-page/artist-form/external-ids-fields';
import {ProfileLinksForm} from '@app/admin/artist-datatable-page/artist-form/profile-links-form';
import {CreateArtistPayload} from '@app/admin/artist-datatable-page/requests/use-create-artist';
import {UploadType} from '@app/site-config';
import {FullAlbum} from '@app/web-player/albums/album';
import {GENRE_MODEL} from '@app/web-player/genres/genre';
import {useNormalizedModels} from '@common/ui/normalized-model/use-normalized-models';
import {ImageSelector} from '@common/uploads/components/image-selector';
import {FileUploadProvider} from '@common/uploads/uploader/file-upload-provider';
import {Button} from '@shadcn/button/button';
import {Combobox} from '@shadcn/forms/combobox/combobox';
import {Field} from '@shadcn/forms/field';
import {HookForm} from '@shadcn/forms/form/hook-form';
import {Input} from '@shadcn/forms/input/input';
import {Switch} from '@shadcn/forms/switch/switch';
import {Textarea} from '@shadcn/forms/textarea/textarea';
import {Tabs} from '@shadcn/tabs/tabs';
import {message} from '@ui/i18n/message';
import {Trans} from '@ui/i18n/trans';
import {useTrans} from '@ui/i18n/use-trans';
import {NormalizedModel} from '@ui/types/normalized-model';
import {useIsMobileMediaQuery} from '@ui/utils/hooks/is-mobile-media-query';
import {PlusIcon} from 'lucide-react';
import {Fragment, useState} from 'react';
import {useFieldArray, useFormContext, useWatch} from 'react-hook-form';

interface Props {
  albums?: FullAlbum[];
  showExternalFields?: boolean;
}
export function CrupdateArtistForm({albums, showExternalFields}: Props) {
  const isMobile = useIsMobileMediaQuery();
  const form = useFormContext<CreateArtistPayload>();
  const imageValue =
    useWatch({control: form.control, name: 'image_small'}) ?? '';

  return (
    <FileUploadProvider>
      <div className="gap-6 md:flex">
        <div className="shrink-0">
          <Field.Root name="image_small" className="w-full md:w-56">
            {isMobile ? (
              <Fragment>
                <Field.Label>
                  <Trans message="Image" />
                </Field.Label>
                <ImageSelector.Input
                  uploadType={UploadType.artwork}
                  value={imageValue}
                  onChange={value => {
                    form.setValue('image_small', value || undefined, {
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
                  form.setValue('image_small', value || undefined, {
                    shouldDirty: true,
                  });
                }}
                className="aspect-square size-full w-56"
                placeholderVariant="icon"
              />
            )}
            <Field.Error />
          </Field.Root>
          {showExternalFields && (
            <Field.Group className="mt-3.5">
              <HookForm.Field name="verified">
                <Field.Label>
                  <Switch />
                  <Trans message="Verified" />
                </Field.Label>
                <Field.Error />
              </HookForm.Field>
              <HookForm.Field name="disabled">
                <Field.Label>
                  <Switch />
                  <Trans message="Hidden" />
                </Field.Label>
                <Field.Error />
              </HookForm.Field>
            </Field.Group>
          )}
        </div>
        <div className="mt-6 flex-auto md:mt-0">
          <Tabs.Root defaultValue="details">
            <Tabs.List variant="line">
              <Tabs.Tab value="details">
                <Trans message="Details" />
              </Tabs.Tab>
              <Tabs.Tab value="links">
                <Trans message="Links" />
              </Tabs.Tab>
              <Tabs.Tab value="biography">
                <Trans message="Biography" />
              </Tabs.Tab>
              <Tabs.Tab value="images">
                <Trans message="Images" />
              </Tabs.Tab>
              {showExternalFields && (
                <Tabs.Tab value="external-ids">
                  <Trans message="External IDs" />
                </Tabs.Tab>
              )}
            </Tabs.List>
            <Tabs.Panel value="details" className="pt-5">
              <DetailsPanel showExternalFields={showExternalFields} />
            </Tabs.Panel>
            <Tabs.Panel value="links" className="pt-5">
              <ProfileLinksForm />
            </Tabs.Panel>
            <Tabs.Panel value="biography" className="pt-5">
              <BiographyPanel />
            </Tabs.Panel>
            <Tabs.Panel value="images" className="pt-5">
              <ImagesPanel />
            </Tabs.Panel>
            {showExternalFields && (
              <Tabs.Panel value="external-ids" className="pt-5">
                <ExternalIdsFields />
              </Tabs.Panel>
            )}
          </Tabs.Root>
        </div>
      </div>
      <ArtistAlbumsTable albums={albums} />
    </FileUploadProvider>
  );
}

interface DetailsPanelProps {
  showExternalFields?: boolean;
}
function DetailsPanel({showExternalFields}: DetailsPanelProps) {
  return (
    <Field.Group>
      <HookForm.Field name="name" disabled={!showExternalFields}>
        <Field.Label>
          <Trans message="Name" />
        </Field.Label>
        <Input required autoFocus />
        <Field.Error />
      </HookForm.Field>
      <GenreCombobox />
    </Field.Group>
  );
}

function GenreCombobox() {
  const {trans} = useTrans();
  const [query, setQuery] = useState('');
  const {data} = useNormalizedModels(`normalized-models/${GENRE_MODEL}`, {
    query,
  });
  const selectedGenres =
    (useWatch({name: 'genres'}) as NormalizedModel[] | undefined) ?? [];
  const suggestions = data?.data ?? [];
  const trimmedQuery = query.trim();
  const canCreateCustom =
    !!trimmedQuery &&
    ![...suggestions, ...selectedGenres].some(
      genre => genre.name.toLowerCase() === trimmedQuery.toLowerCase(),
    );
  const items = canCreateCustom
    ? [
        ...suggestions,
        {
          id: trimmedQuery,
          name: trimmedQuery,
          model_type: GENRE_MODEL,
        } satisfies NormalizedModel,
      ]
    : suggestions;

  return (
    <HookForm.Field name="genres">
      <Field.Label>
        <Trans message="Genres" />
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
                {value.map(genre => (
                  <Combobox.Chip key={genre.id}>{genre.name}</Combobox.Chip>
                ))}
                <Combobox.ChipsInput
                  placeholder={trans(message('+Add genre'))}
                />
              </>
            )}
          </Combobox.Value>
        </Combobox.Chips>
        <Combobox.Content>
          <Combobox.Empty>
            <Trans message="No genres found." />
          </Combobox.Empty>
          <Combobox.List>
            {(genre: NormalizedModel) => (
              <Combobox.Item key={genre.id} value={genre}>
                {genre.name}
              </Combobox.Item>
            )}
          </Combobox.List>
        </Combobox.Content>
      </Combobox.Root>
      <Field.Error />
    </HookForm.Field>
  );
}

function BiographyPanel() {
  return (
    <Field.Group>
      <HookForm.Field name="profile.country">
        <Field.Label>
          <Trans message="Country" />
        </Field.Label>
        <Input />
        <Field.Error />
      </HookForm.Field>
      <HookForm.Field name="profile.city">
        <Field.Label>
          <Trans message="City" />
        </Field.Label>
        <Input />
        <Field.Error />
      </HookForm.Field>
      <HookForm.Field name="profile.description">
        <Field.Label>
          <Trans message="Description" />
        </Field.Label>
        <Textarea rows={5} />
        <Field.Error />
      </HookForm.Field>
    </Field.Group>
  );
}

function ImagesPanel() {
  const form = useFormContext<CreateArtistPayload>();
  const {fields, append, remove} = useFieldArray<CreateArtistPayload>({
    name: 'profile_images',
  });
  const profileImages =
    useWatch({control: form.control, name: 'profile_images'}) ?? [];

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-3">
        {fields.map((field, index) => {
          const value = profileImages[index]?.url ?? '';
          return (
            <ImageSelector.Square
              key={field.id}
              uploadType={UploadType.artwork}
              value={value}
              onChange={nextValue => {
                if (!nextValue) {
                  remove(index);
                  return;
                }
                form.setValue(`profile_images.${index}.url`, nextValue, {
                  shouldDirty: true,
                });
              }}
              className="size-40"
              placeholderVariant="icon"
            />
          );
        })}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        color="primary"
        onClick={() => {
          append({url: ''});
        }}
      >
        <PlusIcon />
        <Trans message="Add another image" />
      </Button>
    </div>
  );
}
