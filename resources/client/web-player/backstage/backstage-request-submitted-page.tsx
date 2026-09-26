import {BackstageLayout} from '@app/web-player/backstage/backstage-layout';
import {useBackstageRequest} from '@app/web-player/backstage/requests/use-backstage-request';
import {LinkButton} from '@shadcn/button/button';
import {Trans} from '@ui/i18n/trans';
import {FullPageLoader} from '@ui/progress/full-page-loader';
import {CheckIcon} from 'lucide-react';

export function Component() {
  const {isLoading} = useBackstageRequest();

  return (
    <BackstageLayout>
      <div className="mx-auto my-10 max-w-147.5">
        {isLoading ? <FullPageLoader className="my-10" /> : <SuccessMessage />}
      </div>
    </BackstageLayout>
  );
}

function SuccessMessage() {
  return (
    <div>
      <div className="flex justify-center">
        <CheckIcon className="size-16" />
      </div>

      <h1 className="mt-6 mb-12 text-center text-5xl font-medium">
        <Trans message="We've got your request" />
      </h1>

      <ul className="mb-15 list-inside list-disc px-5">
        <li className="pb-2.5">
          <Trans message="Our support team will review it and send you an email within 3 days!" />
        </li>
        <li className="pb-2.5">
          <Trans message="Don't submit another request until you hear from us." />
        </li>
        <li>
          <Trans message="If this artist profile is already claimed, ask an admin on your team to invite you." />
        </li>
      </ul>

      <div className="text-center">
        <LinkButton
          to="/"
          color="primary"
          className="min-w-35 rounded-full"
        >
          <Trans message="Got It" />
        </LinkButton>
      </div>
    </div>
  );
}
