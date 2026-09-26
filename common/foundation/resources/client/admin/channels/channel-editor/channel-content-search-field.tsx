import {UpdateChannelPayload} from '@common/admin/channels/requests/use-update-channel';
import {useAddableContent} from '@common/admin/channels/requests/use-addable-content';
import {Combobox} from '@shadcn/forms/combobox/combobox';
import {InputGroupAddon} from '@shadcn/forms/input-group/input-group';
import {message} from '@ui/i18n/message';
import {Trans} from '@ui/i18n/trans';
import {useTrans} from '@ui/i18n/use-trans';
import {NormalizedModel} from '@ui/types/normalized-model';
import {SearchIcon} from 'lucide-react';
import {useState} from 'react';
import {useFormContext} from 'react-hook-form';

export interface ChannelContentSearchFieldProps {
  onResultSelected?: (result: NormalizedModel) => void;
  imgRenderer?: (result: NormalizedModel) => React.ReactNode;
}
export function ChannelContentSearchField({
  onResultSelected,
  imgRenderer,
}: ChannelContentSearchFieldProps) {
  const {watch} = useFormContext<UpdateChannelPayload>();
  const contentModel = watch('config.contentModel');
  const {trans} = useTrans();
  const [query, setQuery] = useState('');
  const {isFetching, data} = useAddableContent({
    query,
    modelType: contentModel,
    limit: 20,
  });
  const results = data?.results ?? [];

  return (
    <Combobox.Root
      items={results}
      bindToHookForm={false}
      filter={null}
      inputValue={query}
      onInputValueChange={setQuery}
      value={null}
      onValueChange={(result: NormalizedModel | null) => {
        if (result) {
          onResultSelected?.(result);
          setQuery('');
        }
      }}
      itemToStringLabel={(item: NormalizedModel) => item.name}
      itemToStringValue={(item: NormalizedModel) => `${item.id}`}
      isItemEqualToValue={(a: NormalizedModel, b: NormalizedModel) =>
        a.id === b.id
      }
    >
      <Combobox.Input
        placeholder={trans(message('Search for content to add...'))}
        isLoading={isFetching}
        showTrigger={false}
      >
        <InputGroupAddon>
          <SearchIcon className="text-muted-foreground size-4" />
        </InputGroupAddon>
      </Combobox.Input>
      <Combobox.Content className="max-h-167.5">
        <Combobox.Empty>
          <Trans message="No results found." />
        </Combobox.Empty>
        <Combobox.List>
          {(result: NormalizedModel) => (
            <Combobox.Item key={result.id} value={result}>
              {imgRenderer?.(result)}
              <div className="min-w-0 flex-auto">
                <div className="truncate">{result.name}</div>
                {result.description ? (
                  <div className="text-muted-foreground truncate text-xs">
                    {result.description}
                  </div>
                ) : null}
              </div>
            </Combobox.Item>
          )}
        </Combobox.List>
      </Combobox.Content>
    </Combobox.Root>
  );
}
