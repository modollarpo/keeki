import {UploadType} from '@app/site-config';
import {CreatePlaylistPayload} from '@app/web-player/playlists/requests/use-create-playlist';
import {ImageSelector} from '@common/uploads/components/image-selector';
import {FileUploadProvider} from '@common/uploads/uploader/file-upload-provider';
import {Field} from '@shadcn/forms/field';
import {HookForm} from '@shadcn/forms/form/hook-form';
import {Input} from '@shadcn/forms/input/input';
import {Switch} from '@shadcn/forms/switch/switch';
import {Textarea} from '@shadcn/forms/textarea/textarea';
import {message} from '@ui/i18n/message';
import {Trans} from '@ui/i18n/trans';
import {useTrans} from '@ui/i18n/use-trans';
import {useFormContext, useWatch} from 'react-hook-form';

export function CrupdatePlaylistFields() {
  const {trans} = useTrans();
  const form = useFormContext<CreatePlaylistPayload>();
  const imageValue = useWatch({control: form.control, name: 'image'}) ?? '';

  return (
    <Field.Group>
      <div className="flex flex-col gap-7 md:flex-row">
        <FileUploadProvider>
          <Field.Root name="image" className="size-35 shrink-0">
            <ImageSelector.Square
              uploadType={UploadType.artwork}
              value={imageValue}
              onChange={value => {
                form.setValue('image', value || null, {shouldDirty: true});
              }}
              className="size-40"
              placeholderVariant="icon"
            />
            <Field.Error />
          </Field.Root>
        </FileUploadProvider>
        <Field.Group>
          <HookForm.Field name="name">
            <Field.Label>
              <Trans message="Name" />
            </Field.Label>
            <Input autoFocus />
            <Field.Error />
          </HookForm.Field>
          <HookForm.Field name="collaborative">
            <Field.Label>
              <Switch />
              <Trans message="Collaborative" />
            </Field.Label>
            <Field.Description>
              <Trans message="Invite other users to add tracks." />
            </Field.Description>
            <Field.Error />
          </HookForm.Field>
          <HookForm.Field name="public">
            <Field.Label>
              <Switch />
              <Trans message="Public" />
            </Field.Label>
            <Field.Description>
              <Trans message="Everyone can see public playlists." />
            </Field.Description>
            <Field.Error />
          </HookForm.Field>
        </Field.Group>
      </div>
      <HookForm.Field name="description">
        <Field.Label>
          <Trans message="Description" />
        </Field.Label>
        <Textarea
          rows={4}
          placeholder={trans(
            message('Give your playlist a catchy description.'),
          )}
        />
        <Field.Error />
      </HookForm.Field>
    </Field.Group>
  );
}
