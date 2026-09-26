import {Field} from '@shadcn/forms/field';
import {HookForm} from '@shadcn/forms/form/hook-form';
import {Input} from '@shadcn/forms/input/input';
import {Textarea} from '@shadcn/forms/textarea/textarea';
import {Tabs} from '@shadcn/tabs/tabs';
import {Trans} from '@ui/i18n/trans';
import {Fragment, ReactNode} from 'react';

interface Props {
  children: ReactNode;
}
export function ChannelEditorTabs({children}: Props) {
  return (
    <Tabs.Root defaultValue="details">
      <Tabs.List>
        <Tabs.Tab value="details">
          <Trans message="Details" />
        </Tabs.Tab>
        <Tabs.Tab value="seo">
          <Trans message="SEO" />
        </Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="details" className="pt-5">
        {children}
      </Tabs.Panel>
      <Tabs.Panel value="seo" className="pt-5">
        <SeoFields />
      </Tabs.Panel>
    </Tabs.Root>
  );
}

function SeoFields() {
  return (
    <Fragment>
      <HookForm.Field name="config.seoTitle" className="mb-6">
        <Field.Label>
          <Trans message="SEO title" />
        </Field.Label>
        <Input />
        <Field.Error />
      </HookForm.Field>
      <HookForm.Field name="config.seoDescription">
        <Field.Label>
          <Trans message="SEO description" />
        </Field.Label>
        <Textarea rows={6} />
        <Field.Error />
      </HookForm.Field>
    </Fragment>
  );
}
