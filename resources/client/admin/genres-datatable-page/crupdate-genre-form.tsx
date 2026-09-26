import {CreateGenrePayload} from '@app/admin/genres-datatable-page/requests/use-create-genre';
import {UploadType} from '@app/site-config';
import {ImageSelector} from '@common/uploads/components/image-selector';
import {FileUploadProvider} from '@common/uploads/uploader/file-upload-provider';
import {Field} from '@shadcn/forms/field';
import {HookForm} from '@shadcn/forms/form/hook-form';
import {Input} from '@shadcn/forms/input/input';
import {Trans} from '@ui/i18n/trans';
import {useFormContext, useWatch} from 'react-hook-form';

export function CrupdateGenreForm() {
  const form = useFormContext<CreateGenrePayload>();
  const imageValue = useWatch({control: form.control, name: 'image'}) ?? '';

  return (
    <Field.Group>
      <FileUploadProvider>
        <Field.Root name="image">
          <Field.Label>
            <Trans message="Image" />
          </Field.Label>
          <ImageSelector.Input
            uploadType={UploadType.artwork}
            value={imageValue}
            onChange={value => {
              form.setValue('image', value, {
                shouldDirty: true,
              });
            }}
          />
          <Field.Error />
        </Field.Root>
      </FileUploadProvider>
      <HookForm.Field name="name">
        <Field.Label>
          <Trans message="Name" />
        </Field.Label>
        <Input required autoFocus />
        <Field.Description>
          <Trans message="Unique genre identifier." />
        </Field.Description>
        <Field.Error />
      </HookForm.Field>
      <HookForm.Field name="display_name">
        <Field.Label>
          <Trans message="Display name" />
        </Field.Label>
        <Input />
        <Field.Description>
          <Trans message="User friendly genre name." />
        </Field.Description>
        <Field.Error />
      </HookForm.Field>
    </Field.Group>
  );
}
