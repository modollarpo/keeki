import {Trans} from '@ui/i18n/trans';
import {AlbumIcon} from '@ui/icons/material/Album';
import {IllustratedMessage} from '@ui/images/illustrated-message';

export function NoDiscographyMessage() {
  return (
    <IllustratedMessage
      className="my-20"
      imageHeight="h-auto"
      image={<AlbumIcon size="xl" className="text-muted-foreground" />}
      title={<Trans message="We do not have discography for this artist yet" />}
    />
  );
}
