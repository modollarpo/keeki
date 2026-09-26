import {SiFacebook, SiTumblr, SiX} from '@icons-pack/react-simple-icons';
import {Button, ButtonSize} from '@shadcn/button/button';
import {toast} from '@shadcn/toast/toast';
import {Trans} from '@ui/i18n/trans';
import {
  ShareableNetworks,
  shareLinkSocially,
} from '@ui/utils/urls/share-link-socially';
import {Share2Icon} from 'lucide-react';

interface ShareButtonsProps {
  link: string;
  name?: string;
  image?: string | null;
  size?: ButtonSize;
}
export function ShareMediaButtons({
  link,
  name,
  image,
  size = 'icon-lg',
}: ShareButtonsProps) {
  const share = (network: ShareableNetworks) => {
    shareLinkSocially(network, link, name, image);
  };

  return (
    <div>
      <Button
        variant="ghost"
        size={size}
        onClick={() => share('facebook')}
        className="text-facebook"
      >
        <SiFacebook />
      </Button>
      <Button
        variant="ghost"
        size={size}
        onClick={() => share('twitter')}
        className="text-twitter"
      >
        <SiX />
      </Button>
      <Button
        variant="ghost"
        size={size}
        onClick={() => share('tumblr')}
        className="text-tumblr"
      >
        <SiTumblr />
      </Button>
      {navigator.share && (
        <Button
          variant="ghost"
          size={size}
          onClick={() => {
            try {
              navigator.share({
                title: name,
                url: link,
              });
            } catch (e) {
              if ((e as DOMException).name !== 'AbortError') {
                toast.error(<Trans message="Could not share link" />);
              }
            }
          }}
        >
          <Share2Icon />
        </Button>
      )}
    </div>
  );
}
