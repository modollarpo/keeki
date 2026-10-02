import {
  CompanyPageSeoItem,
  listCompanyPageSeoOptions,
  resetCompanyPageSeoOptions,
  saveCompanyPageSeoOptions,
} from '@app/admin/company-pages-queries';
import {showHttpErrorToast} from '@common/http/errors/show-http-error-toast';
import {StaticPageTitle} from '@common/seo/static-page-title';
import {useNavigate} from '@common/ui/navigation/use-navigate';
import {Breadcrumb} from '@shadcn/breadcrumb/breadcrumb';
import {Button} from '@shadcn/button/button';
import {Field} from '@shadcn/forms/field';
import {HookForm} from '@shadcn/forms/form/hook-form';
import {Input} from '@shadcn/forms/input/input';
import {Textarea} from '@shadcn/forms/textarea/textarea';
import {toast} from '@shadcn/toast/toast';
import {useMutation, useQuery} from '@tanstack/react-query';
import {Trans} from '@ui/i18n/trans';
import {useEffect} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import {useParams} from 'react-router';

type FormValues = {
  title: string;
  description: string;
};

/**
 * Editor for the SEO title and description of a code-managed public page.
 *
 * These pages render as React components, so there is no body to edit here. What
 * an admin can change is the title and description Blade writes into the served
 * HTML, which is what search engines and link previews read. The shipped copy
 * is shown underneath as the fallback this form reverts to when cleared.
 */
export function Component() {
  const navigate = useNavigate();
  const params = useParams();
  // The route is a wildcard because page paths contain slashes of their own,
  // eg /plans/premium-family.
  const path = '/' + (params['*'] ?? '').replace(/^\/+|\/+$/g, '');

  const query = useQuery(listCompanyPageSeoOptions());
  const page: CompanyPageSeoItem | undefined = query.data?.find(
    item => item.path === path,
  );

  const save = useMutation(saveCompanyPageSeoOptions());
  const reset = useMutation(resetCompanyPageSeoOptions());

  const form = useForm<FormValues>({values: {title: '', description: ''}});

  useEffect(() => {
    if (page) {
      form.reset({title: page.title, description: page.description});
    }
  }, [form, page]);

  const handleSave = () => {
    save.mutate(
      {path, ...form.getValues()},
      {
        onSuccess: () => {
          toast.success(<Trans message="SEO settings saved" />);
          navigate('../', {relative: 'path'});
        },
        onError: error => showHttpErrorToast(error),
      },
    );
  };

  const handleReset = () => {
    reset.mutate(path, {
      onSuccess: () => {
        toast.success(<Trans message="Reverted to the original copy" />);
        navigate('../', {relative: 'path'});
      },
      onError: error => showHttpErrorToast(error),
    });
  };

  const breadCrumb = (
    <Breadcrumb.Root className="text-xl">
      <Breadcrumb.Item>
        <Breadcrumb.Link to=".." relative="path">
          <Trans message="Custom pages" />
        </Breadcrumb.Link>
      </Breadcrumb.Item>
      <Breadcrumb.Separator />
      <Breadcrumb.Page>
        <Trans message="SEO" /> {page?.label ?? path}
      </Breadcrumb.Page>
    </Breadcrumb.Root>
  );

  return (
    <FormProvider {...form}>
      <StaticPageTitle>
        <Trans message="Page SEO" />
      </StaticPageTitle>

      <div className="max-w-3xl">
        <h2 className="mb-4 text-xl">{breadCrumb}</h2>
        <p className="text-muted mb-6 text-sm">
          <Trans message="This page's content is built in code and can't be edited here. You can change how it appears in search results and link previews." />
        </p>

        <div className="flex flex-col gap-5">
          <HookForm.Field name="title">
            <Field.Label>
              <Trans message="Title" />
            </Field.Label>
            <Input required />
            <Field.Error />
          </HookForm.Field>

          <HookForm.Field name="description">
            <Field.Label>
              <Trans message="Description" />
            </Field.Label>
            <Textarea rows={4} />
            <Field.Error />
          </HookForm.Field>
        </div>

        {page && (
          <div className="mt-8 rounded border border-dashed p-4 text-sm">
            <div className="mb-2 font-medium">
              <Trans message="Original copy" />
            </div>
            <div className="mb-3">
              <span className="text-muted">
                <Trans message="Title" />:{' '}
              </span>
              {page.default_title}
            </div>
            <div>
              <span className="text-muted">
                <Trans message="Description" />:{' '}
              </span>
              {page.default_description}
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center gap-3">
          <Button
            color="primary"
            size="sm"
            disabled={save.isPending}
            onClick={() => handleSave()}
          >
            <Trans message="Save" />
          </Button>

          {page?.is_overridden && (
            <Button
              size="sm"
              disabled={reset.isPending}
              onClick={() => handleReset()}
            >
              <Trans message="Revert to original" />
            </Button>
          )}

          <Button size="sm" variant="outline" onClick={() => navigate('../')}>
            <Trans message="Cancel" />
          </Button>
        </div>
      </div>
    </FormProvider>
  );
}
