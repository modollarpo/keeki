import {ProfileLinksForm} from '@app/admin/artist-datatable-page/artist-form/profile-links-form';
import {FileEntry} from '@app/gen/schemas/file-entry';
import {UploadType} from '@app/site-config';
import {FullUserProfile} from '@app/web-player/users/user-profile';
import {
  UpdateProfilePayload,
  useUpdateUserProfile,
} from '@app/web-player/users/user-profile/use-update-user-profile';
import {ImageSelector} from '@common/uploads/components/image-selector';
import {FileUploadProvider} from '@common/uploads/uploader/file-upload-provider';
import {Button} from '@shadcn/button/button';
import {Dialog} from '@shadcn/dialog/dialog';
import {Combobox} from '@shadcn/forms/combobox/combobox';
import {Field, FieldSet} from '@shadcn/forms/field';
import {HookForm} from '@shadcn/forms/form/hook-form';
import {Input} from '@shadcn/forms/input/input';
import {Textarea} from '@shadcn/forms/textarea/textarea';
import {message} from '@ui/i18n/message';
import {Trans} from '@ui/i18n/trans';
import {useTrans} from '@ui/i18n/use-trans';
import {useIsMobileMediaQuery} from '@ui/utils/hooks/is-mobile-media-query';
import {getCountryList} from '@ui/utils/intl/countries';
import {useMemo, useState} from 'react';
import {useForm, useWatch} from 'react-hook-form';

type EditProfileDialogProps = {
  user: FullUserProfile;
  children: Dialog.TriggerElement;
};

export function EditProfileDialog({user, children}: EditProfileDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {children}
      <Dialog.Portal>
        <Dialog.Backdrop />
        <EditProfileDialogContent
          user={user}
          onClose={() => setOpen(false)}
        />
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function EditProfileDialogContent({
  user,
  onClose,
}: {
  user: FullUserProfile;
  onClose: () => void;
}) {
  const isMobile = useIsMobileMediaQuery();
  const form = useForm<UpdateProfilePayload>({
    defaultValues: {
      user: {
        username: user.username ?? '',
        image: user.image,
      },
      profile: {
        city: user.profile.city ?? '',
        country: user.profile.country ?? '',
        description: user.profile.description ?? '',
      },
      links: user.links,
    },
  });
  const updateProfile = useUpdateUserProfile(form);
  const imageValue = useWatch({control: form.control, name: 'user.image'}) ?? '';

  const handleImageChange = (value: string, entry?: FileEntry) => {
    form.setValue('user.image', value || null, {shouldDirty: true});
    form.setValue('user.image_entry_id', entry?.id ?? null, {
      shouldDirty: true,
    });
  };

  return (
    <HookForm.Root
      form={form}
      onSubmit={values =>
        updateProfile.mutate(values, {onSuccess: () => onClose()})
      }
    >
      <Dialog.Content className="sm:max-w-3xl">
        <Dialog.Header>
          <Dialog.Title>
            <Trans message="Edit your profile" />
          </Dialog.Title>
        </Dialog.Header>
        <Dialog.Body>
          <FileUploadProvider>
            <Field.Group>
              <div className="flex flex-col items-start gap-7.5 md:flex-row">
                <Field.Root name="user.image" className="w-full md:w-50">
                  <Field.Label>
                    <Trans message="Avatar" />
                  </Field.Label>
                  {isMobile ? (
                    <ImageSelector.Input
                      uploadType={UploadType.avatars}
                      value={imageValue}
                      onChange={handleImageChange}
                    />
                  ) : (
                    <ImageSelector.Square
                      uploadType={UploadType.avatars}
                      value={imageValue}
                      onChange={handleImageChange}
                      className="aspect-square size-full w-50"
                      placeholderVariant="icon"
                    />
                  )}
                  <Field.Error />
                </Field.Root>
                <Field.Group className="flex-auto">
                  <HookForm.Field name="user.username">
                    <Field.Label>
                      <Trans message="Username" />
                    </Field.Label>
                    <Input />
                    <Field.Error />
                  </HookForm.Field>
                  <div className="flex flex-col gap-5 sm:flex-row">
                    <HookForm.Field name="profile.city" className="flex-1">
                      <Field.Label>
                        <Trans message="City" />
                      </Field.Label>
                      <Input />
                      <Field.Error />
                    </HookForm.Field>
                    <HookForm.Field name="profile.country" className="flex-1">
                      <Field.Label>
                        <Trans message="Country" />
                      </Field.Label>
                      <CountryCombobox />
                      <Field.Error />
                    </HookForm.Field>
                  </div>
                  <HookForm.Field name="profile.description">
                    <Field.Label>
                      <Trans message="Description" />
                    </Field.Label>
                    <Textarea rows={4} />
                    <Field.Error />
                  </HookForm.Field>
                </Field.Group>
              </div>
              <FieldSet.Root>
                <FieldSet.Legend>
                  <Trans message="Your links" />
                </FieldSet.Legend>
                <ProfileLinksForm />
              </FieldSet.Root>
            </Field.Group>
          </FileUploadProvider>
        </Dialog.Body>
        <Dialog.Footer>
          <Dialog.CloseButton disabled={updateProfile.isPending}>
            <Trans message="Cancel" />
          </Dialog.CloseButton>
          <Button type="submit" disabled={updateProfile.isPending}>
            <Trans message="Save" />
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </HookForm.Root>
  );
}

function CountryCombobox() {
  const {trans} = useTrans();
  const items = useMemo(
    () =>
      getCountryList().map(country => ({
        label: country.name,
        value: country.name,
      })),
    [],
  );

  return (
    <Combobox.Root items={items}>
      <Combobox.ButtonTrigger
        placeholder={<Trans message="Select country" />}
      />
      <Combobox.Content>
        <Combobox.InsetInput
          placeholder={trans(message('Search countries'))}
        />
        <Combobox.Empty>
          <Trans message="No countries found." />
        </Combobox.Empty>
        <Combobox.List>
          {(item: Combobox.GenericItem) => (
            <Combobox.Item key={item.value} value={item.value}>
              {item.label}
            </Combobox.Item>
          )}
        </Combobox.List>
      </Combobox.Content>
    </Combobox.Root>
  );
}
