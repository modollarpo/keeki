import {FullAlbum} from '@app/web-player/albums/album';
import {BackstageLayout} from '@app/web-player/backstage/backstage-layout';
import {AlbumUploader} from '@app/web-player/backstage/upload-page/album-uploader';
import {DropTargetMask} from '@app/web-player/backstage/upload-page/drop-tarket-mask';
import {TracksUploader} from '@app/web-player/backstage/upload-page/tracks-uploader';
import {UploadedMediaPreview} from '@app/web-player/backstage/upload-page/uploaded-media-preview';
import {useTrackUploader} from '@app/web-player/backstage/upload-page/use-track-uploader';
import {
  resetMinutesLimitQuery,
  useUserMinutesLimit,
} from '@app/web-player/backstage/upload-page/use-user-minutes-limit';
import {Track} from '@app/web-player/tracks/track';
import {StaticPageTitle} from '@common/seo/static-page-title';
import {DashboardLayout} from '@common/ui/dashboard/dashboard-layout';
import {FileUploadProvider} from '@common/uploads/uploader/file-upload-provider';
import {Button} from '@shadcn/button/button';
import {Field} from '@shadcn/forms/field';
import {Switch} from '@shadcn/forms/switch/switch';
import {LinkStyle} from '@ui/buttons/external-link';
import {Trans} from '@ui/i18n/trans';
import {
  NativeFileDraggable,
  useDroppable,
} from '@ui/interactions/dnd/use-droppable';
import {ComponentPropsWithoutRef, ReactNode, useRef, useState} from 'react';
import {Link} from 'react-router';

type UploadMode = 'album' | 'tracks';

export interface UploaderProps {
  onUploadStart: () => void;
  onCancel: () => void;
  onCreate: (item: Track | FullAlbum) => void;
}

export type UploaderActions = ReturnType<typeof useTrackUploader>;

interface Props {
  backstageLayout?: boolean;
}
export function Component({backstageLayout = false}: Props) {
  return (
    <FileUploadProvider>
      <Content backstageLayout={backstageLayout} />
    </FileUploadProvider>
  );
}

function Content({backstageLayout}: Props) {
  const [uploadMode, setUploadMode] = useState<UploadMode>('tracks');
  const [modeIsLocked, setModeIsLocked] = useState(false);

  const uploaderRef = useRef<UploaderActions>(null);
  const Uploader = uploadMode === 'tracks' ? TracksUploader : AlbumUploader;

  const [createdItems, setCreatedItems] = useState<(FullAlbum | Track)[]>([]);

  const ref = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const {droppableProps} = useDroppable({
    id: 'uploadPageRoot',
    ref,
    types: ['nativeFile'],
    onDragEnter: () => setIsDragOver(true),
    onDragLeave: () => setIsDragOver(false),
    onDrop: async draggable => {
      if (draggable.type === 'nativeFile') {
        const files = await (draggable as NativeFileDraggable).getData();
        const validFiles = uploaderRef.current?.validateUploads(files);
        if (validFiles?.length) {
          uploaderRef.current?.uploadTracks(validFiles);
        }
      }
    },
  });

  const Wrapper = backstageLayout ? BackstageLayout : AdminWrapper;

  return (
    <Wrapper {...droppableProps}>
      {!modeIsLocked && (
        <UploadPanel
          onUpload={() => uploaderRef.current?.openFilePicker()}
          uploadMode={uploadMode}
          onUploadModeChange={setUploadMode}
        />
      )}
      {createdItems.map(item => (
        <UploadedMediaPreview key={item.id} media={item} />
      ))}
      <Uploader
        ref={uploaderRef}
        onUploadStart={() => setModeIsLocked(true)}
        onCreate={item => {
          setCreatedItems(prev => [...prev, item]);
          resetMinutesLimitQuery();
        }}
        onCancel={() => {
          setModeIsLocked(false);
        }}
      />
      <DropTargetMask isVisible={isDragOver} />
    </Wrapper>
  );
}

interface UploadPanelProps {
  onUpload: () => void;
  uploadMode: UploadMode;
  onUploadModeChange: (newMode: UploadMode) => void;
}
function UploadPanel({
  onUpload,
  uploadMode,
  onUploadModeChange,
}: UploadPanelProps) {
  const {data} = useUserMinutesLimit();
  return (
    <div className="pt-10">
      <div className="rounded-card bg-card mx-auto flex max-w-145 flex-col items-center border p-5 md:p-12">
        <h1 className="text-base md:text-[22px] md:font-light">
          <Trans message="Drag and drop your tracks, videos & albums here." />
        </h1>
        <Button className="mt-5 w-min" onClick={() => onUpload()}>
          <Trans message="Or choose files to upload" />
        </Button>
        <div className="mt-5 border-t pt-5">
          <Field.Root>
            <Field.Label>
              <Switch
                checked={uploadMode === 'album'}
                onCheckedChange={checked =>
                  onUploadModeChange(checked ? 'album' : 'tracks')
                }
              />
              <Trans message="Make an album when multiple files are selected" />
            </Field.Label>
          </Field.Root>
        </div>
      </div>
      <div className="text-muted-foreground mt-5 min-h-5 text-center text-sm">
        {data?.minutesLeft != null && (
          <Trans
            message="You have :count minutes left. Try <a>Pro accounts</a> to get more time and access to advanced features."
            values={{
              count: data.minutesLeft,
              a: parts => (
                <Link className={LinkStyle} to="/pricing">
                  {parts}
                </Link>
              ),
            }}
          />
        )}
      </div>
    </div>
  );
}

interface AdminWrapperProps extends ComponentPropsWithoutRef<'div'> {
  children: ReactNode;
}
function AdminWrapper({children, ...domProps}: AdminWrapperProps) {
  return (
    <DashboardLayout.MainSection {...domProps} className="relative">
      <StaticPageTitle>
        <Trans message="Upload" />
      </StaticPageTitle>
      <DashboardLayout.SectionHeader>
        <DashboardLayout.SidebarToggle />
        <DashboardLayout.SectionTitle>
          <h1>
            <Trans message="Upload" />
          </h1>
        </DashboardLayout.SectionTitle>
      </DashboardLayout.SectionHeader>
      <DashboardLayout.SectionContent>
        <DashboardLayout.ContainedContent>
          {children}
        </DashboardLayout.ContainedContent>
      </DashboardLayout.SectionContent>
    </DashboardLayout.MainSection>
  );
}

export function BackstageUploadPage() {
  return <Component backstageLayout />;
}
