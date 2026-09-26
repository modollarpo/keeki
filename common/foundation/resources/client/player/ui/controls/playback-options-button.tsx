import {usePlayerActions} from '@common/player/hooks/use-player-actions';
import {usePlayerStore} from '@common/player/hooks/use-player-store';
import {Button, ButtonColor, ButtonSize} from '@shadcn/button/button';
import {Popover} from '@shadcn/popover/popover';
import {Trans} from '@ui/i18n/trans';
import {cn} from '@ui/utils/cn';
import {AnimatePresence, m} from 'framer-motion';
import {
  CaptionsIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  GaugeIcon,
  LanguagesIcon,
  Settings2Icon,
  SettingsIcon,
} from 'lucide-react';
import {ReactNode, useState} from 'react';

type OptionsPanel = 'rate' | 'quality' | 'captions' | 'options' | 'language';

const Panels = {
  rate: PlaybackRatePanel,
  quality: PlaybackQualityPanel,
  options: OptionsListPanel,
  captions: CaptionsPanel,
  language: LanguagePanel,
};

interface Props {
  color?: ButtonColor;
  size?: ButtonSize;
  className?: string;
}
export function PlaybackOptionsButton({
  color,
  size = 'icon',
  className,
}: Props) {
  return (
    <Popover.Root>
      <Popover.Trigger
        render={
          <Button
            variant="ghost"
            color={color}
            size={size}
            className={className}
          />
        }
      >
        <SettingsIcon />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="top"
          align="end"
          className="dark w-64 gap-0 overflow-hidden p-0"
        >
          <PlaybackOptionsPanel />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function PlaybackOptionsPanel() {
  const [activePanel, setActivePanel] = useState<OptionsPanel>('options');
  const PanelComponent = Panels[activePanel];

  return (
    <AnimatePresence initial={false}>
      <PanelComponent
        key={activePanel}
        activePanel={activePanel}
        onActivePanelChange={setActivePanel}
      />
    </AnimatePresence>
  );
}

interface OptionsPanelProps {
  activePanel: OptionsPanel;
  onActivePanelChange: (panel: OptionsPanel) => void;
}
function OptionsListPanel({onActivePanelChange}: OptionsPanelProps) {
  const activeRate = usePlayerStore(s => s.playbackRate);
  const availableQualities = usePlayerStore(s => s.playbackQualities);
  const activeQuality = usePlayerStore(s => s.playbackQuality);

  const availableTextTracks = usePlayerStore(s => s.textTracks);
  const textTrackId = usePlayerStore(s => s.currentTextTrack);
  const currentTextTrack = availableTextTracks[textTrackId];

  const availableAudioTracks = usePlayerStore(s => s.audioTracks);
  const audioTrackId = usePlayerStore(s => s.currentAudioTrack);
  const currentAudioTrack = availableAudioTracks[audioTrackId];

  return (
    <m.div
      initial={{x: '-100%', opacity: 0}}
      animate={{x: 0, opacity: 1}}
      exit={{x: '100%', opacity: 0}}
      transition={{type: 'tween', duration: 0.14}}
      className="flex flex-col py-1"
    >
      <MenuButton
        icon={<GaugeIcon />}
        value={`${activeRate}x`}
        onClick={() => onActivePanelChange('rate')}
      >
        <Trans message="Speed" />
      </MenuButton>
      <MenuButton
        disabled={!availableQualities.length}
        icon={<Settings2Icon />}
        value={activeQuality ? activeQuality : <Trans message="Auto" />}
        onClick={() => onActivePanelChange('quality')}
      >
        <Trans message="Quality" />
      </MenuButton>
      <MenuButton
        disabled={!availableTextTracks.length}
        icon={<CaptionsIcon />}
        value={
          currentTextTrack ? currentTextTrack.label : <Trans message="None" />
        }
        onClick={() => onActivePanelChange('captions')}
      >
        <Trans message="Subtitles/CC" />
      </MenuButton>
      {availableAudioTracks.length > 1 && (
        <MenuButton
          icon={<LanguagesIcon />}
          value={
            currentAudioTrack ? (
              currentAudioTrack.label
            ) : (
              <Trans message="None" />
            )
          }
          onClick={() => onActivePanelChange('language')}
        >
          <Trans message="Language" />
        </MenuButton>
      )}
    </m.div>
  );
}

function PlaybackRatePanel({
  activePanel,
  onActivePanelChange,
}: OptionsPanelProps) {
  const activeRate = usePlayerStore(s => s.playbackRate);
  const availableRates = usePlayerStore(s => s.playbackRates);
  const player = usePlayerActions();

  return (
    <PanelLayout
      activePanel={activePanel}
      onActivePanelChange={onActivePanelChange}
      title={<Trans message="Playback speed" />}
    >
      {availableRates.map(rate => (
        <SelectableMenuButton
          key={rate}
          selected={activeRate === rate}
          onClick={() => {
            player.setPlaybackRate(rate);
            onActivePanelChange('options');
          }}
        >
          {rate}x
        </SelectableMenuButton>
      ))}
    </PanelLayout>
  );
}

function PlaybackQualityPanel({
  activePanel,
  onActivePanelChange,
}: OptionsPanelProps) {
  const activeQuality = usePlayerStore(s => s.playbackQuality);
  const availableQualities = usePlayerStore(s => s.playbackQualities);
  const player = usePlayerActions();

  return (
    <PanelLayout
      activePanel={activePanel}
      onActivePanelChange={onActivePanelChange}
      title={<Trans message="Playback quality" />}
    >
      {availableQualities.map(quality => (
        <SelectableMenuButton
          key={quality}
          selected={activeQuality === quality}
          className="capitalize"
          onClick={() => {
            player.setPlaybackQuality(quality);
            onActivePanelChange('options');
          }}
        >
          {quality}
        </SelectableMenuButton>
      ))}
    </PanelLayout>
  );
}

function CaptionsPanel({activePanel, onActivePanelChange}: OptionsPanelProps) {
  const currentTextTrack = usePlayerStore(s => s.currentTextTrack);
  const textTracks = usePlayerStore(s => s.textTracks);
  const player = usePlayerActions();

  return (
    <PanelLayout
      activePanel={activePanel}
      onActivePanelChange={onActivePanelChange}
      title={<Trans message="Subtitles/Captions" />}
    >
      <SelectableMenuButton
        selected={currentTextTrack === -1}
        onClick={() => {
          player.setCurrentTextTrack(-1);
          onActivePanelChange('options');
        }}
      >
        <Trans message="Off" />
      </SelectableMenuButton>
      {textTracks.map((track, index) => (
        <SelectableMenuButton
          key={index}
          selected={currentTextTrack === index}
          onClick={() => {
            player.setCurrentTextTrack(index);
            onActivePanelChange('options');
          }}
        >
          {track.label}
        </SelectableMenuButton>
      ))}
    </PanelLayout>
  );
}

function LanguagePanel({activePanel, onActivePanelChange}: OptionsPanelProps) {
  const currentAudioTrack = usePlayerStore(s => s.currentAudioTrack);
  const audioTracks = usePlayerStore(s => s.audioTracks);
  const player = usePlayerActions();

  return (
    <PanelLayout
      activePanel={activePanel}
      onActivePanelChange={onActivePanelChange}
      title={<Trans message="Language" />}
    >
      {audioTracks.map((track, index) => (
        <SelectableMenuButton
          key={index}
          selected={currentAudioTrack === index}
          onClick={() => {
            player.setCurrentAudioTrack(index);
            onActivePanelChange('options');
          }}
        >
          {track.label}
        </SelectableMenuButton>
      ))}
    </PanelLayout>
  );
}

interface PanelLayoutProps extends OptionsPanelProps {
  children: ReactNode;
  title: ReactNode;
}
function PanelLayout({onActivePanelChange, children, title}: PanelLayoutProps) {
  return (
    <m.div
      initial={{x: '100%', opacity: 0}}
      animate={{x: 0, opacity: 1}}
      exit={{x: '-100%', opacity: 0}}
      transition={{type: 'tween', duration: 0.14}}
    >
      <div className="border-b p-1">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => onActivePanelChange('options')}
        >
          <ChevronLeftIcon data-icon="inline-start" />
          {title}
        </Button>
      </div>
      <div className="flex flex-col py-1">{children}</div>
    </m.div>
  );
}

interface MenuButtonProps {
  children: ReactNode;
  icon: ReactNode;
  value?: ReactNode;
  disabled?: boolean;
  onClick: () => void;
}
function MenuButton({
  children,
  icon,
  value,
  disabled,
  onClick,
}: MenuButtonProps) {
  return (
    <Button
      variant="ghost"
      disabled={disabled}
      className="h-auto w-full justify-start rounded-none px-3 py-2 font-normal"
      onClick={onClick}
    >
      {icon}
      {children}
      {value != null && (
        <span className="ml-auto flex items-center gap-0.5 capitalize">
          {value}
          <ChevronRightIcon />
        </span>
      )}
    </Button>
  );
}

interface SelectableMenuButtonProps {
  children: ReactNode;
  selected: boolean;
  className?: string;
  onClick: () => void;
}
function SelectableMenuButton({
  children,
  selected,
  className,
  onClick,
}: SelectableMenuButtonProps) {
  return (
    <Button
      variant="ghost"
      className={cn(
        'h-auto w-full justify-start rounded-none px-3 py-2 font-normal',
        className,
      )}
      onClick={onClick}
    >
      <CheckIcon className={cn(!selected && 'invisible')} />
      {children}
    </Button>
  );
}
