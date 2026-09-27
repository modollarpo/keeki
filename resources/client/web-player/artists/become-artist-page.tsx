import {Button} from '@shadcn/button/button';
import {Link} from 'react-router';
import {Trans} from '@ui/i18n/trans';
import {useAuth} from '@common/auth/use-auth';
import {useSuspenseQuery} from '@tanstack/react-query';
import {appQueries} from '@app/app-queries';
import {useNavigate} from '@common/ui/navigation/use-navigate';
import {ArrowForwardIcon} from '@ui/library/icons/material/ArrowForward';
import {HeadphonesIcon} from '@ui/library/icons/material/Headphones';
import {CloudUploadIcon} from '@ui/library/icons/material/CloudUpload';
import {MonetizationOnIcon} from '@ui/library/icons/material/MonetizationOn';
import {TrendingUpIcon} from '@ui/library/icons/material/TrendingUp';
import {PublicIcon} from '@ui/library/icons/material/Public';
import {useEffect} from 'react';
import type {ReactNode} from 'react';
import {SmallArtistImage} from '@app/web-player/artists/small-artist-image';
import {ArtistLink} from '@app/web-player/artists/artist-link';
import {TrackLink} from '@app/web-player/tracks/track-link';
import {AlbumImage} from '@app/web-player/albums/album-image';
import {AlbumLink} from '@app/web-player/albums/album-link';

export function BecomeArtistPage() {
  const {isLoggedIn, user} = useAuth();
  const navigate = useNavigate();

  const {data: spotlightData} = useSuspenseQuery(
    appQueries.landingPageData.get(),
  );

  const spotlightChannel = spotlightData?.channels?.find(
    c => c.slug === 'spotlight',
  );

  useEffect(() => {
    if (isLoggedIn && user?.roles?.some(r => r.name === 'Artists')) {
      navigate('/backstage');
    }
  }, [isLoggedIn, user, navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              <Trans message="Fresh Keekii" />
            </h1>
            <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
              <Trans message="Join the next generation of independent artists. Upload your music, reach listeners worldwide, and grow your career — all for free." />
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
<Button
                color="primary"
                size="lg"
                asChild
              >
                <Link to={isLoggedIn ? '/backstage' : '/register'}>
                  <Trans message="Start uploading" />
                  <ArrowForwardIcon className="ml-2 size-4" />
                </Link>
              </Button>
<Button
                color="primary"
                size="lg"
                asChild
              >
                <Link to="/">
                  <Trans message="Explore music" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              <Trans message="Why artists choose Keekii" />
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              <Trans message="Everything you need to share your music with the world." />
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <BenefitCard
              icon={<CloudUploadIcon className="size-8" />}
              title="Free uploads"
              description="Upload unlimited tracks and albums at no cost. No hidden fees, no subscriptions required."
            />
            <BenefitCard
              icon={<PublicIcon className="size-8" />}
              title="Global reach"
              description="Your music is available to listeners worldwide. We promote fresh talent across all genres."
            />
            <BenefitCard
              icon={<MonetizationOnIcon className="size-8" />}
              title="Earn revenue"
              description="Monetize your music through our platform. Keep more of what you earn."
            />
            <BenefitCard
              icon={<TrendingUpIcon className="size-8" />}
              title="Analytics & insights"
              description="Track your growth with detailed analytics. Understand your audience and optimize your reach."
            />
            <BenefitCard
              icon={<HeadphonesIcon className="size-8" />}
              title="High-quality audio"
              description="Support for high-quality audio formats. Your music sounds the way you intended."
            />
            <BenefitCard
              icon={<ArrowForwardIcon className="size-8" />}
              title="Fast approval"
              description="Get your music live quickly. Our streamlined review process means faster time to market."
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted/50 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              <Trans message="How it works" />
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              <Trans message="Get started in three simple steps." />
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            <StepCard
              step={1}
              title="Create your account"
              description="Sign up for free and set up your artist profile. Add your bio, photo, and social links."
            />
            <StepCard
              step={2}
              title="Upload your music"
              description="Upload your tracks and albums. Add artwork, lyrics, and metadata to make your music stand out."
            />
            <StepCard
              step={3}
              title="Share & grow"
              description="Share your music with the world. Build your fanbase and track your growth with our analytics."
            />
          </div>
        </div>
      </section>

      {/* Spotlight section */}
      {spotlightChannel?.content?.data?.length ? (
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                <Trans message="Spotlight Artists" />
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                <Trans message="Discover artists featured by our editorial team" />
              </p>
            </div>
            <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {spotlightChannel.content.data.slice(0, 5).map((item: any) => (
                <div
                  key={item.id}
                  className="group flex flex-col items-center text-center"
                >
                  {item.model_type === 'artist' ? (
                    <>
                      <SmallArtistImage
                        artist={item}
                        className="size-24 rounded-full"
                      />
                      <ArtistLink
                        artist={item}
                        className="mt-3 text-sm font-medium group-hover:underline"
                      />
                    </>
                  ) : item.model_type === 'album' ? (
                    <>
                      <AlbumImage
                        album={item}
                        className="size-24 rounded-lg"
                      />
                      <AlbumLink
                        album={item}
                        className="mt-3 text-sm font-medium group-hover:underline"
                      />
                    </>
                  ) : (
                    <>
                      <div className="flex size-24 items-center justify-center rounded-lg bg-muted">
                        <HeadphonesIcon className="size-8 text-muted-foreground" />
                      </div>
                      <TrackLink
                        track={item}
                        className="mt-3 text-sm font-medium group-hover:underline"
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* CTA */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-primary px-6 py-16 text-center sm:px-12">
            <div className="relative">
              <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
                <Trans message="Ready to share your music?" />
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-foreground/80">
                <Trans message="Join thousands of independent artists already sharing their music on Keekii. Start for free today." />
              </p>
              <div className="mt-8">
<Button
                color="primary"
                size="lg"
                asChild
              >
                  <Link to={isLoggedIn ? '/backstage' : '/register'}>
                    <Trans message="Get started free" />
                    <ArrowForwardIcon className="ml-2 size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function BenefitCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function StepCard({
  step,
  title,
  description,
}: {
  step: number;
  title: string;
  description: string;
}) {
  return (
    <div className="relative rounded-xl border bg-card p-6">
      <div className="flex size-10 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
        {step}
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
