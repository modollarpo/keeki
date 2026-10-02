import {ChannelContentProps} from '@app/web-player/channels/channel-content';
import {ChannelContentGridItem} from '@app/web-player/channels/channel-content-grid-item';
import {ChannelHeading} from '@app/web-player/channels/channel-heading';
import {ContentGridItemLayout} from '@app/web-player/channels/content-grid-item-layout';
import {
  ContentCarouselNav,
  useContentCarouselControls,
} from '@app/web-player/playable-item/content-carousel-nav';
import {ContentGrid} from '@app/web-player/playable-item/content-grid';

type Props = ChannelContentProps & {
  layout?: ContentGridItemLayout;
};

export function ChannelContentCarousel(props: Props) {
  const {channel, layout} = props;
  const controls = useContentCarouselControls();

  return (
    <div>
      {/* Heading owns the whole header line: title left, "See all" right. */}
      <ChannelHeading {...props} />

      {/* Arrows flank the rail itself, the way a product carousel does. */}
      <ContentCarouselNav controls={controls}>
        {/* The rail is its own container so the grid keeps laying out against
            the width it actually occupies rather than the full page width. */}
        <div className="@container min-w-0 flex-1">
          <ContentGrid
            layout={layout}
            isCarousel
            contentModel={channel.config.contentModel}
            containerRef={controls.containerRefCallback}
          >
            {channel.content?.data.map(item => (
              <ChannelContentGridItem
                key={`${item.id}-${item.model_type}`}
                layout={layout}
                item={item}
                items={channel.content?.data}
              />
            ))}
          </ContentGrid>
        </div>
      </ContentCarouselNav>
    </div>
  );
}
