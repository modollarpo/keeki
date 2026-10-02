import {CompanyPageSeoItem} from '@app/admin/company-pages-queries';
import {Button} from '@shadcn/button/button';
import {Dropdown} from '@shadcn/dropdown/dropdown';
import {Item} from '@shadcn/item/item';
import {Trans} from '@ui/i18n/trans';
import {useSettings} from '@ui/settings/use-settings';
import {EllipsisIcon, EyeIcon, NewspaperIcon, SearchIcon} from 'lucide-react';
import {Link} from 'react-router';

/**
 * A public page whose body is a React component rather than a database record.
 *
 * The marketing, plan and legal pages are routes registered in
 * resources/client/company/company-routes.tsx with their copy in
 * CompanyPageSeo, so there is no custom_pages row to edit. What an admin can
 * change is the title and description the server writes into the page, which is
 * what search engines and link previews read, so that is what the Edit action
 * opens.
 */
export function StaticCustomPageCard({page}: {page: CompanyPageSeoItem}) {
  const {base_url} = useSettings();

  return (
    <Item.Root variant="outline">
      <Item.Media align="center" className="size-9.5 rounded-full border">
        <NewspaperIcon className="size-4" />
      </Item.Media>
      <Item.Content>
        <Item.Title>
          <a
            className="hover:underline"
            target="_blank"
            href={`${base_url}${page.path}`}
          >
            {page.label}
          </a>
        </Item.Title>
        <Item.Description>
          {page.group} ·{' '}
          {page.is_overridden ? (
            <span className="text-primary">
              <Trans message="Customised" />
            </span>
          ) : (
            <Trans message="Managed in code" />
          )}
        </Item.Description>
      </Item.Content>
      <Item.Actions>
        <Dropdown.Root>
          <Dropdown.Trigger render={<Button variant="ghost" size="icon" />}>
            <EllipsisIcon />
          </Dropdown.Trigger>
          <Dropdown.Content align="end">
            <Dropdown.LinkItem
              render={
                <Link
                  to={`company/${page.path.replace(/^\//, '')}`}
                  relative="path"
                />
              }
            >
              <SearchIcon />
              <Trans message="Edit SEO" />
            </Dropdown.LinkItem>
            <Dropdown.LinkItem href={`${base_url}${page.path}`} target="_blank">
              <EyeIcon />
              <Trans message="Preview" />
            </Dropdown.LinkItem>
          </Dropdown.Content>
        </Dropdown.Root>
      </Item.Actions>
    </Item.Root>
  );
}
