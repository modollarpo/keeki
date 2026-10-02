import {CompanySiteLinkWithGroup} from '@app/company/company-site-map';
import {Button} from '@shadcn/button/button';
import {Dropdown} from '@shadcn/dropdown/dropdown';
import {Item} from '@shadcn/item/item';
import {Trans} from '@ui/i18n/trans';
import {EllipsisIcon, EyeIcon, NewspaperIcon} from 'lucide-react';
import {useSettings} from '@ui/settings/use-settings';

/**
 * A public page whose body is a React component rather than a database record.
 *
 * The marketing, plan and legal pages are routes registered in
 * resources/client/company/company-routes.tsx with their copy in
 * company-siteMap, so there is no custom_pages row for them and no admin form
 * that could edit one. They are listed here so that every page the site serves
 * is visible from one place, with only a preview action - offering Edit or
 * Delete would promise something the page cannot do.
 */
export function StaticCustomPageCard({page}: {page: CompanySiteLinkWithGroup}) {
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
            href={`${base_url}${page.to}`}
          >
            {page.label}
          </a>
        </Item.Title>
        <Item.Description>
          {page.group} · <Trans message="Managed in code" />
        </Item.Description>
      </Item.Content>
      <Item.Actions>
        <Dropdown.Root>
          <Dropdown.Trigger render={<Button variant="ghost" size="icon" />}>
            <EllipsisIcon />
          </Dropdown.Trigger>
          <Dropdown.Content align="end">
            <Dropdown.LinkItem
              href={`${base_url}${page.to}`}
              target="_blank"
            >
              <EyeIcon />
              <Trans message="Preview" />
            </Dropdown.LinkItem>
          </Dropdown.Content>
        </Dropdown.Root>
      </Item.Actions>
    </Item.Root>
  );
}