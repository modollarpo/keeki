import {Trans} from '@ui/i18n/trans';
import {cloneElement, ReactElement} from 'react';

interface Props {
  image: ReactElement<{size: string; className: string}>;
  name: ReactElement;
  description?: ReactElement;
}
export function BackstageInsightsTitle({image, name, description}: Props) {
  return (
    <div className="flex items-center gap-2.5">
      {cloneElement(image, {
        size: image.props.size ?? 'size-6',
        className: 'rounded',
      })}
      <div>
        <h1 className="overflow-hidden text-base text-ellipsis whitespace-nowrap">
          “{name}“ <Trans message="insights" />
        </h1>
        {description && (
          <div className="text-muted-foreground text-sm">{description}</div>
        )}
      </div>
    </div>
  );
}
