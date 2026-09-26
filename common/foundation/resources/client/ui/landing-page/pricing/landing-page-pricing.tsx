import {listProductsOptions} from '@common/admin/subscriptions/products-queries';
import {BillingCycleRadio} from '@common/billing/pricing-table/billing-cycle-radio';
import {UpsellBillingCycle} from '@common/billing/pricing-table/find-best-price';
import {PricingTable} from '@common/billing/pricing-table/pricing-table';
import {SectionPresentation} from '@common/ui/landing-page/landing-page-config';
import {SectionHeading} from '@common/ui/landing-page/primitives/section-heading';
import {SectionShell} from '@common/ui/landing-page/primitives/section-shell';
import {useSuspenseQuery} from '@tanstack/react-query';
import {getBootstrapData} from '@ui/bootstrap-data/bootstrap-data-store';
import {Trans} from '@ui/i18n/trans';
import {useState} from 'react';

export type LandingPagePricingConfig = SectionPresentation & {
  name: 'pricing';
  title?: string;
  description?: string;
};

type Props = {
  config: LandingPagePricingConfig;
};

export function LandingPagePricing({config}: Props) {
  const query = useSuspenseQuery({
    ...listProductsOptions(),
    staleTime: Infinity,
    initialData: () => {
      const products = getBootstrapData().loaders?.landingPage?.products;
      if (products) {
        return products;
      }
    },
  });
  const [selectedCycle, setSelectedCycle] =
    useState<UpsellBillingCycle>('yearly');
  return (
    <SectionShell
      background={config.background}
      spacing={config.spacing}
      className="scroll-mt-24"
      id="pricing-section"
    >
      <SectionHeading
        badge={<Trans message="Pricing" />}
        title={config.title}
        description={config.description}
        align={config.align}
        titleClassName="text-5xl sm:text-6xl"
        className="mb-16"
      />
      <BillingCycleRadio
        products={query.data?.data}
        selectedCycle={selectedCycle}
        onChange={setSelectedCycle}
        className="mb-10 flex justify-center"
      />
      <PricingTable selectedCycle={selectedCycle} products={query.data?.data} />
    </SectionShell>
  );
}