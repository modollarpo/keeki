import {UpdateChannelPayload} from '@common/admin/channels/requests/use-update-channel';
import {SlugEditor} from '@common/ui/other/slug-editor';
import {Field} from '@shadcn/forms/field';
import {HookForm} from '@shadcn/forms/form/hook-form';
import {Input} from '@shadcn/forms/input/input';
import {message} from '@ui/i18n/message';
import {Trans} from '@ui/i18n/trans';
import {useTrans} from '@ui/i18n/use-trans';
import {cn} from '@ui/utils/cn';
import {useFormContext} from 'react-hook-form';

interface Props {
  className?: string;
  autoFocus?: boolean;
}
export function ChannelNameField({className, autoFocus}: Props) {
  return (
    <div>
      <HookForm.Field name="name" className={cn('mb-2.5', className)}>
        <Field.Label>
          <Trans message="Title" />
        </Field.Label>
        <Input required autoFocus={autoFocus} />
        <Field.Error />
      </HookForm.Field>
      <FormSlugField />
    </div>
  );
}

function FormSlugField() {
  const {watch, setValue} = useFormContext<UpdateChannelPayload>();
  const value = watch('slug');
  const name = watch('name');
  const disableSlugEditing = watch('config.lockSlug');
  const restriction = watch('config.restriction');
  const restrictionId = watch('config.restrictionModelId');
  const {trans} = useTrans();
  return (
    <SlugEditor
      hideButton={disableSlugEditing}
      placeholder={name}
      suffix={
        restriction && restrictionId === 'urlParam'
          ? trans(message(':restriction_name', {values: {restriction}}))
          : undefined
      }
      className="text-sm"
      pattern="[A-Za-z0-9_-]+"
      minLength={3}
      maxLength={20}
      value={value}
      onChange={newSlug => {
        setValue('slug', newSlug);
      }}
    />
  );
}
