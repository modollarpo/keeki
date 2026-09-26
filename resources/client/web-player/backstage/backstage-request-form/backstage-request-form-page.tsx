import {ListNormalizedModels200DataItem} from '@app/gen/schemas/list-normalized-models200-data-item';
import {UploadType} from '@app/site-config';
import {BackstageLayout} from '@app/web-player/backstage/backstage-layout';
import {BackstageFormAttachments} from '@app/web-player/backstage/backstage-request-form/backstage-form-attachments';
import {BackstageRoleSelect} from '@app/web-player/backstage/backstage-request-form/backstage-role-select';
import {useBackstageRequestForm} from '@app/web-player/backstage/backstage-request-form/use-backstage-request-form';
import {
  CreateBackstageRequestPayload,
  useCreateBackstageRequest,
} from '@app/web-player/backstage/requests/use-create-backstage-request';
import {apiClient} from '@common/http/query-client';
import {useNavigate} from '@common/ui/navigation/use-navigate';
import {ImageSelector} from '@common/uploads/components/image-selector';
import {FileUploadProvider} from '@common/uploads/uploader/file-upload-provider';
import {Avatar} from '@shadcn/avatar/avatar';
import {Button, LinkButton} from '@shadcn/button/button';
import {ModelSelect} from '@shadcn/forms/combobox/model-select';
import {Field} from '@shadcn/forms/field';
import {HookForm} from '@shadcn/forms/form/hook-form';
import {Input} from '@shadcn/forms/input/input';
import {queryOptions} from '@tanstack/react-query';
import {Trans} from '@ui/i18n/trans';
import {useWatch} from 'react-hook-form';
import {useLocation} from 'react-router';

export function Component() {
  const {pathname} = useLocation();
  const requestType = pathname
    .split('/')
    .pop() as CreateBackstageRequestPayload['type'];
  return (
    <BackstageLayout>
      <div className="mx-auto my-10 max-w-195">
        <h1 className="text-center text-3xl font-medium md:text-5xl">
          <Trans message="Tell us about yourself" />
        </h1>
        <ClaimForm requestType={requestType} />
      </div>
    </BackstageLayout>
  );
}

interface ClaimFormProps {
  requestType: CreateBackstageRequestPayload['type'];
}
function ClaimForm({requestType}: ClaimFormProps) {
  const navigate = useNavigate();
  const form = useBackstageRequestForm(requestType);
  const submitRequest = useCreateBackstageRequest(form);
  const imageValue = useWatch({control: form.control, name: 'image'}) ?? '';

  return (
    <FileUploadProvider>
      <HookForm.Root
        form={form}
        onSubmit={values => {
          submitRequest.mutate(values, {
            onSuccess: response => {
              navigate(
                `/backstage/requests/${response.request.id}/request-submitted`,
                {replace: true},
              );
            },
          });
        }}
      >
        <ImageSelector.Avatar
          uploadType={UploadType.artwork}
          value={imageValue}
          onChange={value => {
            form.setValue('image', value || null, {shouldDirty: true});
          }}
          className="mx-auto my-7.5 size-40"
          disabled={requestType === 'become-artist'}
        />
        <Field.Group>
          {requestType !== 'become-artist' && (
            <HookForm.Field
              name="artist_id"
              disabled={requestType === 'verify-artist'}
            >
              <Field.Label>
                <Trans message="Select artist" />
              </Field.Label>
              <ModelSelect
                placeholder={<Trans message="Select artist" />}
                listOptions={({query}) =>
                  queryOptions({
                    queryKey: [
                      'artist',
                      'search-suggestions',
                      {query, listAll: true, excludeSelf: true},
                    ],
                    queryFn: async () => {
                      const {data} = await apiClient.get<{
                        results: ListNormalizedModels200DataItem[];
                      }>('search/suggestions/artist', {
                        params: {
                          query,
                          listAll: 'true',
                          excludeSelf: 'true',
                        },
                      });
                      return {data: data.results ?? []};
                    },
                  })
                }
                retrieveOptions={({id}) =>
                  queryOptions({
                    queryKey: ['artist', 'search-suggestions', id],
                    queryFn: async () => {
                      const {data} = await apiClient.get<{
                        model: ListNormalizedModels200DataItem;
                      }>(`search/suggestions/artist/${id}`);
                      return {data: data.model};
                    },
                  })
                }
                modelToLabel={(artist: ListNormalizedModels200DataItem) =>
                  artist.name
                }
                modelToImage={(artist: ListNormalizedModels200DataItem) => (
                  <Avatar.Root size="sm">
                    <Avatar.Image src={artist.image ?? undefined} alt="" />
                    <Avatar.ColorFallback>{artist.name}</Avatar.ColorFallback>
                  </Avatar.Root>
                )}
              />
              <Field.Error />
            </HookForm.Field>
          )}
          {requestType === 'become-artist' && (
            <HookForm.Field name="artist_name">
              <Field.Label>
                <Trans message="Your artist name" />
              </Field.Label>
              <Input required />
              <Field.Error />
            </HookForm.Field>
          )}
          <HookForm.Field name="name">
            <Field.Label>
              <Trans message="Your name" />
            </Field.Label>
            <Input required />
            <Field.Error />
          </HookForm.Field>
          {requestType === 'claim-artist' && <BackstageRoleSelect />}
          <HookForm.Field name="company">
            <Field.Label>
              <Trans message="Company (optional)" />
            </Field.Label>
            <Input />
            <Field.Error />
          </HookForm.Field>
        </Field.Group>
        <BackstageFormAttachments />
        <div className="flex justify-between gap-6 border-t pt-8.5">
          <LinkButton
            variant="outline"
            color="white"
            to=".."
            relative="path"
            className="min-w-35 rounded-full"
          >
            <Trans message="Go back" />
          </LinkButton>
          <Button
            type="submit"
            color="primary"
            className="min-w-35 rounded-full"
            disabled={submitRequest.isPending}
          >
            <Trans message="Submit request" />
          </Button>
        </div>
      </HookForm.Root>
    </FileUploadProvider>
  );
}
