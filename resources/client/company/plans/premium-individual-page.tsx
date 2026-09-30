import {DownloadIcon, HeadphonesIcon, WifiOffIcon} from 'lucide-react';
import {
  CompanyFeatureGrid,
  CompanySectionBlock,
  CompanyStats,
} from '../company-page-sections';
import {getPlan} from './plan-data';
import {PlanPageTemplate} from './plan-page-template';

export function Component() {
  const plan = getPlan('premium-individual');

  return (
    <PlanPageTemplate plan={plan}>
      <CompanySectionBlock
        title="What makes it different"
        description="Three things listeners notice in the first week, and keep noticing afterwards."
      >
        <CompanyFeatureGrid
          columns={3}
          features={[
            {
              icon: HeadphonesIcon,
              title: 'The highest quality we have',
              description:
                'Premium plays the best stream the catalogue has for each track, rather than the version that is easiest to deliver.',
            },
            {
              icon: DownloadIcon,
              title: 'Five devices, all at once',
              description:
                'Your phone, your laptop and your speaker can all be signed in and downloading at the same time.',
            },
            {
              icon: WifiOffIcon,
              title: 'Listening that does not need signal',
              description:
                'Download before you travel and it works on a plane, on the tube, or on the worst mobile coverage there is.',
            },
          ]}
        />
      </CompanySectionBlock>

      <CompanySectionBlock background="muted">
        <CompanyStats
          stats={[
            {value: '5', label: 'Devices at the same time'},
            {value: '0', label: 'Advertisements per hour'},
            {value: '1', label: 'Person it is for'},
            {value: 'Any', label: 'Time you want to cancel'},
          ]}
        />
      </CompanySectionBlock>
    </PlanPageTemplate>
  );
}