import {NormalizedModel} from '@ui/types/normalized-model';
import {cn} from '@ui/utils/cn';
import {ImageIcon} from 'lucide-react';

interface Props {
  item: NormalizedModel;
}
export function ChannelContentItemImage({item}: Props) {
  const imageClassName = cn(
    'aspect-square w-11.5 rounded object-cover',
    !item.image ? 'flex items-center justify-center' : 'block',
  );

  return item.image ? (
    <img className={imageClassName} src={item.image} alt="" />
  ) : (
    <span className={imageClassName}>
      <ImageIcon className="text-muted-foreground max-w-[60%] size-6" />
    </span>
  );
}
