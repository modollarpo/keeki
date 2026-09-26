import {AdminDocsUrls} from '@app/admin/admin-config';
import {AdminSettings} from '@common/admin/settings/admin-settings';
import {SettingsErrorGroup} from '@common/admin/settings/layout/settings-error-group';
import {AdminSettingsLayout} from '@common/admin/settings/layout/settings-layout';
import {DocsLink} from '@common/admin/settings/layout/settings-links';
import {SettingsPanel} from '@common/admin/settings/layout/settings-panel';
import {useAdminSettings} from '@common/admin/settings/use-admin-settings';
import {Field} from '@shadcn/forms/field';
import {HookForm} from '@shadcn/forms/form/hook-form';
import {Input} from '@shadcn/forms/input/input';
import {Switch} from '@shadcn/forms/switch/switch';
import {Textarea} from '@shadcn/forms/textarea/textarea';
import {Trans} from '@ui/i18n/trans';
import {useForm, useWatch} from 'react-hook-form';

export function Component() {
  const {data} = useAdminSettings();
  const form = useForm<AdminSettings>({
    defaultValues: {
      client: {
        billing: {
          enable: data.client.billing?.enable ?? false,
          paypal_test_mode: data.client.billing?.paypal_test_mode ?? false,
          paypal: {
            enable: data.client.billing?.paypal?.enable ?? false,
          },
          stripe: {
            enable: data.client.billing?.stripe?.enable ?? false,
          },
          invoice: {
            address: data.client.billing?.invoice?.address ?? '',
            notes: data.client.billing?.invoice?.notes ?? '',
          },
        },
      },
      server: {
        paypal_client_id: data.server?.paypal_client_id ?? '',
        paypal_secret: data.server?.paypal_secret ?? '',
        paypal_webhook_id: data.server?.paypal_webhook_id ?? '',
        stripe_key: data.server?.stripe_key ?? '',
        stripe_secret: data.server?.stripe_secret ?? '',
        stripe_webhook_secret: data.server?.stripe_webhook_secret ?? '',
      },
    },
  });

  return (
    <AdminSettingsLayout form={form} title={<Trans message="Subscriptions" />}>
      <div className="flex flex-col gap-6">
        <GeneralSection />
        <PaypalSection />
        <StripeSection />
        <InvoiceAddressSection />
        <InvoiceNotesSection />
      </div>
    </AdminSettingsLayout>
  );
}

function GeneralSection() {
  return (
    <SettingsPanel
      title={<Trans message="Subscriptions" />}
      description={
        <Trans message="Enable or disable subscription functionality across the site." />
      }
      link={
        AdminDocsUrls.pages.subscriptions ? (
          <DocsLink link={AdminDocsUrls.pages.subscriptions}></DocsLink>
        ) : null
      }
    >
      <HookForm.Field name="client.billing.enable">
        <Field.Label>
          <Switch />
          <Trans message="Enable subscriptions" />
        </Field.Label>
      </HookForm.Field>
    </SettingsPanel>
  );
}

function PaypalSection() {
  const paypalIsEnabled = useWatch<AdminSettings>({
    name: 'client.billing.paypal.enable',
  });
  return (
    <SettingsPanel
      title={<Trans message="PayPal Gateway" />}
      description={
        <Trans message="Configure PayPal payment gateway integration." />
      }
      link={
        <DocsLink link="https://support.vebto.com/hc/articles/147/configuring-paypal">
          <Trans message="How to set up PayPal" />
        </DocsLink>
      }
    >
      <Field.Group>
        <HookForm.Field name="client.billing.paypal.enable">
          <Field.Label>
            <Switch />
            <Trans message="Enable PayPal" />
          </Field.Label>
        </HookForm.Field>
        {!!paypalIsEnabled && (
          <SettingsErrorGroup
            name="paypal_group"
            separatorTop={false}
            separatorBottom={false}
          >
            {isInvalid => (
              <Field.Group>
                <HookForm.Field
                  invalid={isInvalid}
                  name="server.paypal_client_id"
                >
                  <Field.Label>
                    <Trans message="PayPal Client ID" />
                  </Field.Label>
                  <Input required />
                  <Field.Error />
                </HookForm.Field>
                <HookForm.Field invalid={isInvalid} name="server.paypal_secret">
                  <Field.Label>
                    <Trans message="PayPal Secret" />
                  </Field.Label>
                  <Input required />
                  <Field.Error />
                </HookForm.Field>
                <HookForm.Field
                  invalid={isInvalid}
                  name="server.paypal_webhook_id"
                >
                  <Field.Label>
                    <Trans message="PayPal Webhook ID" />
                  </Field.Label>
                  <Input required />
                  <Field.Error />
                </HookForm.Field>
                <HookForm.Field
                  invalid={isInvalid}
                  name="client.billing.paypal_test_mode"
                >
                  <Field.Label>
                    <Switch />
                    <Trans message="PayPal test mode" />
                  </Field.Label>
                </HookForm.Field>
              </Field.Group>
            )}
          </SettingsErrorGroup>
        )}
      </Field.Group>
    </SettingsPanel>
  );
}

function StripeSection() {
  const stripeEnabled = useWatch<AdminSettings>({
    name: 'client.billing.stripe.enable',
  });
  return (
    <SettingsPanel
      title={<Trans message="Stripe Gateway" />}
      description={
        <Trans message="Configure Stripe payment gateway integration." />
      }
      link={
        <DocsLink link="https://support.vebto.com/hc/articles/148/configuring-stripe">
          <Trans message="How to set up Stripe" />
        </DocsLink>
      }
    >
      <Field.Group>
        <HookForm.Field name="client.billing.stripe.enable">
          <Field.Label>
            <Switch />
            <Trans message="Enable Stripe" />
          </Field.Label>
        </HookForm.Field>
        {!!stripeEnabled && (
          <SettingsErrorGroup
            name="stripe_group"
            separatorTop={false}
            separatorBottom={false}
          >
            {isInvalid => (
              <Field.Group>
                <HookForm.Field invalid={isInvalid} name="server.stripe_key">
                  <Field.Label>
                    <Trans message="Stripe publishable key" />
                  </Field.Label>
                  <Input required />
                  <Field.Error />
                </HookForm.Field>
                <HookForm.Field invalid={isInvalid} name="server.stripe_secret">
                  <Field.Label>
                    <Trans message="Stripe secret key" />
                  </Field.Label>
                  <Input required />
                  <Field.Error />
                </HookForm.Field>
                <HookForm.Field
                  invalid={isInvalid}
                  name="server.stripe_webhook_secret"
                >
                  <Field.Label>
                    <Trans message="Stripe webhook signing secret" />
                  </Field.Label>
                  <Input />
                  <Field.Error />
                </HookForm.Field>
              </Field.Group>
            )}
          </SettingsErrorGroup>
        )}
      </Field.Group>
    </SettingsPanel>
  );
}

function InvoiceAddressSection() {
  return (
    <SettingsPanel
      title={<Trans message="Invoice Address" />}
      description={
        <Trans message="Set the address that will appear on customer invoices." />
      }
    >
      <HookForm.Field name="client.billing.invoice.address">
        <Field.Label>
          <Trans message="Address" />
        </Field.Label>
        <Textarea rows={2} />
        <Field.Error />
      </HookForm.Field>
    </SettingsPanel>
  );
}

function InvoiceNotesSection() {
  return (
    <SettingsPanel
      title={<Trans message="Invoice Notes" />}
      description={
        <Trans message="Default notes to show under the notes section of customer invoices." />
      }
    >
      <HookForm.Field name="client.billing.invoice.notes">
        <Field.Label>
          <Trans message="Notes" />
        </Field.Label>
        <Textarea rows={2} />
        <Field.Error />
      </HookForm.Field>
    </SettingsPanel>
  );
}
