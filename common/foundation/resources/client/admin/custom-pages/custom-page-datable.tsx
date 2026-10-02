import {AdminDocsUrls} from '@app/admin/admin-config';
import {listCompanyPageSeoOptions} from '@app/admin/company-pages-queries';
import {CustomPageCard} from '@common/admin/custom-pages/custom-page-card';
import {StaticCustomPageCard} from '@common/admin/custom-pages/static-custom-page-card';
import {listCustomPagesOptions} from '@common/admin/custom-pages/custom-pages-queries';
import {DocsLink} from '@common/admin/settings/layout/settings-links';
import {StaticPageTitle} from '@common/seo/static-page-title';
import {DashboardLayout} from '@common/ui/dashboard/dashboard-layout';
import {LinkButton} from '@shadcn/button/button';
import {Empty} from '@shadcn/empty/empty';
import {TableSearchInput} from '@shadcn/table/utils/table-search-input';
import {useTableQueryState} from '@shadcn/table/utils/use-table-query-state';
import {useSuspenseQuery} from '@tanstack/react-query';
import {Trans} from '@ui/i18n/trans';
import {useFilter} from '@ui/i18n/use-filter';
import {NewspaperIcon, PlusIcon} from 'lucide-react';
import {useMemo} from 'react';

export function Component() {
  const {isFiltering, searchParams} = useTableQueryState();
  const filter = useFilter({
    sensitivity: 'base',
  });
  const query = useSuspenseQuery(listCustomPagesOptions());
  const items = query.data.data;

  const filteredItems = useMemo(() => {
    if (!searchParams.query) {
      return items ?? [];
    }
    return (items ?? []).filter(item =>
      filter.contains(item.title ?? '', searchParams.query as string),
    );
  }, [items, searchParams.query, filter]);

  // The marketing, plan and legal pages are React routes, not custom_pages
  // rows, so the list endpoint never returns them. Without this the admin would
  // claim the site has three pages when it actually serves thirty. The SEO
  // endpoint is what knows about them, and it also reports which ones an admin
  // has already customised.
  const seoQuery = useSuspenseQuery(listCompanyPageSeoOptions());

  const filteredStaticPages = useMemo(() => {
    const staticPages = seoQuery.data;

    if (!searchParams.query) {
      return staticPages;
    }
    return staticPages.filter(page =>
      filter.contains(
        `${page.label} ${page.path}`,
        searchParams.query as string,
      ),
    );
  }, [seoQuery.data, searchParams.query, filter]);

  return (
    <DashboardLayout.MainSection>
      <StaticPageTitle>
        <Trans message="Custom pages" />
      </StaticPageTitle>
      <DashboardLayout.SectionHeader>
        <DashboardLayout.SidebarToggle />
        <DashboardLayout.SectionTitle>
          <h1>
            <Trans message="Custom pages" />
          </h1>
        </DashboardLayout.SectionTitle>
        {AdminDocsUrls.pages.customPages ? (
          <DocsLink variant="button" link={AdminDocsUrls.pages.customPages} />
        ) : null}
        <NewCustomPageButton />
      </DashboardLayout.SectionHeader>
      <DashboardLayout.SectionContent>
        <DashboardLayout.SectionContentHeader>
          <TableSearchInput className="mr-auto" debounce={false} />
        </DashboardLayout.SectionContentHeader>
        <DashboardLayout.SectionScrollContainer className="flex flex-col gap-4">
          {filteredItems.map(page => (
            <CustomPageCard key={page.id} page={page} />
          ))}

          {filteredStaticPages.length > 0 && (
            <>
              <h2 className="text-muted-foreground mt-4 text-sm font-medium">
                <Trans message="Public pages" />
              </h2>
              {filteredStaticPages.map(page => (
                <StaticCustomPageCard key={page.path} page={page} />
              ))}
            </>
          )}

          {filteredItems.length === 0 && filteredStaticPages.length === 0 && (
            <CustomPagesEmptyState isFiltering={isFiltering} />
          )}
        </DashboardLayout.SectionScrollContainer>
      </DashboardLayout.SectionContent>
    </DashboardLayout.MainSection>
  );
}

function NewCustomPageButton() {
  return (
    <LinkButton variant="default" color="primary" to="new">
      <PlusIcon />
      <Trans message="New page" />
    </LinkButton>
  );
}

function CustomPagesEmptyState({isFiltering}: {isFiltering: boolean}) {
  return (
    <Empty.Root>
      <Empty.Header>
        <Empty.Media variant="icon">
          <NewspaperIcon />
        </Empty.Media>
        <Empty.Title>
          {isFiltering ? (
            <Trans message="No matching pages" />
          ) : (
            <Trans message="No pages have been created yet" />
          )}
        </Empty.Title>
        <Empty.Description>
          {isFiltering ? (
            <Trans message="Try another search query." />
          ) : (
            <Trans message="Get started by adding your first custom page." />
          )}
        </Empty.Description>
      </Empty.Header>
      {!isFiltering && (
        <Empty.Content>
          <NewCustomPageButton />
        </Empty.Content>
      )}
    </Empty.Root>
  );
}
