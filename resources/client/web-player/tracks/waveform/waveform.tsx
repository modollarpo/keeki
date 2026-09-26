import {useTrackSeekbar} from '@app/web-player/player-controls/seekbar/use-track-seekbar';
import {useTrackWaveData} from '@app/web-player/tracks/requests/use-track-wave-data';
import {Track} from '@app/web-player/tracks/track';
import {CommentBar} from '@app/web-player/tracks/waveform/comment-bar';
import {drawWaveform} from '@app/web-player/tracks/waveform/draw-waveform';
import {
  WAVE_HEIGHT,
  WAVE_WIDTH,
} from '@app/web-player/tracks/waveform/generate-waveform-data';
import {ColorSchemeContext} from '@common/core/color-scheme-provider';
import {useSlider} from '@ui/forms/slider/use-slider';
import {FormattedDuration} from '@ui/i18n/formatted-duration';
import {getCurrentThemeValue} from '@ui/themes/utils/get-current-theme-value';
import clsx from 'clsx';
import {AnimatePresence} from 'framer-motion';
import {use, useEffect, useRef, useState} from 'react';

const durationClassName =
  'text-[11px] absolute bottom-8 p-0.5 rounded text-white font-semibold z-30 pointer-events-none bg-black/80';

interface WaveformProps {
  track: Track;
  queue?: Track[];
  className?: string;
}
export function Waveform({track, queue, className}: WaveformProps) {
  const ref = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressCanvasRef = useRef<HTMLCanvasElement>(null);
  // when wave is scrolled into view
  const [isInView, setIsInView] = useState(false);
  // after wave is drawn into canvas and fade in animation should start running
  const [isVisible, setIsVisible] = useState(false);
  const {data} = useTrackWaveData(track.id, {enabled: isInView});
  const {} = use(ColorSchemeContext);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.target === ref.current) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {root: document.body},
    );
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (canvasRef.current && data?.waveData && progressCanvasRef.current) {
      drawWaveform(data.waveData, canvasRef.current, '#666');
      drawWaveform(
        data.waveData,
        progressCanvasRef.current,
        getCurrentThemeValue('--be-primary'),
      );
      setIsVisible(true);
    }
  }, [data]);

  const {value, onChange, onChangeEnd, duration, ...sliderProps} =
    useTrackSeekbar(track, queue);
  const {domProps, groupId, thumbIds, trackRef, getThumbPercent} = useSlider({
    ...sliderProps,
    value: [value],
    onChange: ([newValue]: number[]) => onChange(newValue),
    onChangeEnd: () => onChangeEnd(),
  });

  return (
    <AnimatePresence mode="wait">
      <section className="relative max-w-full">
        <div
          id={groupId}
          role="group"
          ref={ref}
          className={clsx(
            'relative isolate h-17.5 cursor-pointer overflow-hidden transition-opacity duration-200 ease-in',
            isVisible ? 'opacity-100' : 'opacity-0',
            className,
          )}
        >
          <output
            className={clsx(durationClassName, 'left-0')}
            htmlFor={thumbIds[0]}
            aria-live="off"
          >
            {value ? <FormattedDuration seconds={value} /> : '0:00'}
          </output>
          <div key="wave" {...domProps} ref={trackRef}>
            <canvas
              ref={canvasRef}
              width={WAVE_WIDTH}
              height={WAVE_HEIGHT + 25}
            />
            <div
              className="absolute top-0 left-0 z-20 w-0 overflow-hidden"
              style={{width: `${getThumbPercent(0) * 100}%`}}
            >
              <canvas
                ref={progressCanvasRef}
                width={WAVE_WIDTH}
                height={WAVE_HEIGHT + 25}
              />
            </div>
          </div>
          <div className={clsx(durationClassName, 'right-0')}>
            <FormattedDuration seconds={duration} />
          </div>
        </div>
        {data?.comments && (
          <CommentBar comments={data.comments} track={track} />
        )}
      </section>
    </AnimatePresence>
  );
}
