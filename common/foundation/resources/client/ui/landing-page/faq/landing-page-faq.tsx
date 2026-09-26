import {Accordion} from '@shadcn/accordion/accordion';
import {SectionPresentation} from '@common/ui/landing-page/landing-page-config';
import {SectionHeading} from '@common/ui/landing-page/primitives/section-heading';
import {SectionShell} from '@common/ui/landing-page/primitives/section-shell';
import {Trans} from '@ui/i18n/trans';

export type LandingPageFaqConfig = SectionPresentation & {
  name: 'faq';
  title?: string;
  badge?: string;
  description?: string;
  variant?: 'separated' | 'bordered' | 'default';
  mutedBg?: boolean;
  questions?: {
    question: string;
    answer: string;
  }[];
};

type LandingPageFaqProps = {
  config: LandingPageFaqConfig;
};
export function LandingPageFaq({config}: LandingPageFaqProps) {
  return (
    <SectionShell background={config.background} spacing={config.spacing}>
      <SectionHeading
        badge={config.badge}
        title={config.title}
        description={config.description}
        align={config.align}
      />
      {config.questions?.length ? (
        <Accordion
          variant={config.variant ?? 'default'}
          className="mx-auto mt-16 w-full max-w-4xl sm:mt-20"
        >
          {config.questions.map((item, index) => (
            <Accordion.Item key={item.question} value={`${index}`}>
              <Accordion.Trigger className="p-5 text-base">
                <Trans message={item.question} />
              </Accordion.Trigger>
              <Accordion.Content className="p-5 text-base text-muted-foreground">
                <Trans message={item.answer} />
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion>
      ) : null}
    </SectionShell>
  );
}