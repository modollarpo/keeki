import {ListNormalizedModels200DataItem} from '@app/gen/schemas/list-normalized-models200-data-item';
import {GENRE_MODEL} from '@app/web-player/genres/genre';
import {ChannelContentConfig} from '@common/admin/channels/channel-editor/channel-content-config';
import {ChannelRestrictionField} from '@common/admin/channels/channel-editor/controls/channel-restriction-field';
import {UpdateChannelPayload} from '@common/admin/channels/requests/use-update-channel';
import {apiClient} from '@common/http/query-client';
import {ModelSelect} from '@shadcn/forms/combobox/model-select';
import {Field} from '@shadcn/forms/field';
import {HookForm} from '@shadcn/forms/form/hook-form';
import {keepPreviousData, queryOptions} from '@tanstack/react-query';
import {message} from '@ui/i18n/message';
import {Trans} from '@ui/i18n/trans';
import {useTrans} from '@ui/i18n/use-trans';
import {useFormContext} from 'react-hook-form';

const URL_PARAM_ID = 'urlParam';

type RestrictionModel = {
  id: number | string;
  name: string;
};

interface Props {
  className?: string;
  config: ChannelContentConfig;
}
export function AppChannelRestrictionField({className, config}: Props) {
  const {watch} = useFormContext<UpdateChannelPayload>();
  const contentType = watch('config.contentType');

  if (contentType !== 'listAll') return null;

  return (
    <ChannelRestrictionField config={config} className={className}>
      <RestrictionModelField config={config} />
    </ChannelRestrictionField>
  );
}

interface RestrictionModelFieldProps {
  config: ChannelContentConfig;
}
function RestrictionModelField({config}: RestrictionModelFieldProps) {
  const {trans} = useTrans();
  const {watch} = useFormContext<UpdateChannelPayload>();

  const selectedRestriction = watch(
    'config.restriction',
  ) as keyof typeof config.restrictions;

  if (!selectedRestriction) return null;

  const restrictionLabel = config.restrictions[selectedRestriction].label;
  const urlParamItem: RestrictionModel = {
    id: URL_PARAM_ID,
    name: trans(message('Dynamic (from url)')),
  };

  return (
    <HookForm.Field
      name="config.restrictionModelId"
      className="w-full flex-auto"
    >
      <Field.Label>
        <Trans
          message=":restriction name"
          values={{restriction: trans(restrictionLabel)}}
        />
      </Field.Label>
      <ModelSelect
        placeholder={<Trans message="Select an item" />}
        listOptions={({query}) =>
          queryOptions({
            queryKey: [selectedRestriction, 'normalized-models', {query}],
            placeholderData: keepPreviousData,
            queryFn: async () => {
              if (selectedRestriction !== GENRE_MODEL) {
                return {data: [urlParamItem]};
              }
              const response = await apiClient.get<{
                data: ListNormalizedModels200DataItem[];
              }>(`normalized-models/${selectedRestriction}`, {
                params: {query: query || undefined},
              });
              return {
                data: [urlParamItem, ...(response.data.data ?? [])],
              };
            },
          })
        }
        retrieveOptions={({id}) =>
          queryOptions({
            queryKey: [selectedRestriction, 'normalized-models', id],
            queryFn: async () => {
              if (`${id}` === URL_PARAM_ID) {
                return {data: urlParamItem};
              }
              const response = await apiClient.get<{
                data: ListNormalizedModels200DataItem;
              }>(`normalized-models/${selectedRestriction}/${id}`);
              return response.data;
            },
          })
        }
        modelToLabel={(model: RestrictionModel) => model.name}
      />
      <Field.Error />
    </HookForm.Field>
  );
}
