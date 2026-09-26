import {
  CreateAlbumPayload,
  CreateAlbumPayloadTrack,
} from '@app/admin/albums-datatable-page/requests/use-create-album';
import {CreateTrackPayload} from '@app/admin/tracks-datatable-page/requests/use-create-track';
import {
  hydrateAlbumForm,
  mergeTrackFormValues,
} from '@app/admin/tracks-datatable-page/requests/use-extract-track-file-metadata';
import {UpdateTrackPayload} from '@app/admin/tracks-datatable-page/requests/use-update-track';
import {CreateTrackDialog} from '@app/admin/tracks-datatable-page/track-form/create-track-dialog';
import {TrackUploadStatusText} from '@app/admin/tracks-datatable-page/track-form/track-upload-status-text';
import {UpdateTrackDialog} from '@app/admin/tracks-datatable-page/track-form/update-track-dialog';
import {useTrackUpload} from '@app/web-player/backstage/upload-page/use-track-upload';
import {useTrackUploader} from '@app/web-player/backstage/upload-page/use-track-uploader';
import {useFileUploadStore} from '@common/uploads/uploader/file-upload-provider';
import {AlertDialog} from '@shadcn/alert-dialog/alert-dialog';
import {Button} from '@shadcn/button/button';
import {Dialog} from '@shadcn/dialog/dialog';
import {Empty} from '@shadcn/empty/empty';
import {Spinner} from '@shadcn/spinner/spinner';
import {Trans} from '@ui/i18n/trans';
import {DragPreview} from '@ui/interactions/dnd/drag-preview';
import {useSortable} from '@ui/interactions/dnd/sortable/use-sortable';
import {DragPreviewRenderer} from '@ui/interactions/dnd/use-draggable';
import {
  GripHorizontalIcon,
  MusicIcon,
  PencilIcon,
  PlusIcon,
  UploadIcon,
  XIcon,
} from 'lucide-react';
import React, {useRef, useState} from 'react';
import {useFieldArray, useFormContext} from 'react-hook-form';

export function AlbumTracksForm() {
  const form = useFormContext<CreateAlbumPayload>();
  const {watch, setValue, getValues} = form;
  const {fields, remove, prepend, move} = useFieldArray({
    name: 'tracks',
  });

  const updateTrack = (
    uploadId: string,
    newValues: Partial<CreateTrackPayload>,
  ) => {
    const index = getValues('tracks')?.findIndex(f => f.uploadId === uploadId);
    if (index != null) {
      setValue(
        `tracks.${index}`,
        mergeTrackFormValues(newValues, getValues(`tracks.${index}`)),
        {shouldDirty: true},
      );
    }
  };

  const {openFilePicker} = useTrackUploader({
    onUploadStart: data =>
      prepend(
        // newly uploaded track should inherit album artists, genres and tags
        mergeTrackFormValues(data, {
          artists: form.getValues('artists'),
          genres: form.getValues('genres'),
          tags: form.getValues('tags'),
        }),
      ),
    onMetadataChange: (file, newData) => {
      hydrateAlbumForm(form, newData);
      updateTrack(file.id, newData);
    },
  });

  const tracks = watch('tracks') || [];

  return (
    <div>
      <div className="flex items-center gap-3">
        <h2 className="my-6 text-xl font-semibold">
          <Trans message="Tracks" />
        </h2>
        <Button
          variant="outline"
          color="primary"
          size="sm"
          className="ml-auto"
          type="button"
          onClick={() => openFilePicker()}
        >
          <UploadIcon />
          <Trans message="Upload tracks" />
        </Button>
        <CreateTrackDialog
          hideAlbumField
          defaultValues={{
            artists: watch('artists'),
            tags: watch('tags'),
            genres: watch('genres'),
          }}
          onCreate={newTrack => prepend(newTrack)}
        >
          <Dialog.Trigger
            render={
              <Button
                variant="outline"
                color="primary"
                size="icon"
                type="button"
                aria-label="Create track"
              />
            }
          >
            <PlusIcon />
          </Dialog.Trigger>
        </CreateTrackDialog>
      </div>
      {fields.map((field, index) => {
        const track = tracks[index];
        return (
          <TrackItem
            key={field.id}
            track={track}
            onRemove={() => remove(index)}
            onSort={(oldIndex, newIndex) => move(oldIndex, newIndex)}
            tracks={tracks}
            onUpdate={newValues => {
              updateTrack(track.uploadId, newValues);
            }}
          />
        );
      })}

      {!fields.length ? (
        <Empty.Root className="mt-10">
          <Empty.Header>
            <Empty.Media variant="icon">
              <MusicIcon />
            </Empty.Media>
            <Empty.Title>
              <Trans message="This album does not have any tracks yet" />
            </Empty.Title>
            <Empty.Description>
              <Trans message="Upload tracks or create one to get started." />
            </Empty.Description>
          </Empty.Header>
        </Empty.Root>
      ) : null}
    </div>
  );
}

interface TrackItemProps {
  track: CreateAlbumPayloadTrack;
  tracks: CreateAlbumPayloadTrack[];
  onRemove: () => void;
  onUpdate: (updatedTrack: UpdateTrackPayload | CreateTrackPayload) => void;
  onSort: (oldIndex: number, newIndex: number) => void;
}
function TrackItem({
  track,
  tracks,
  onRemove,
  onUpdate,
  onSort,
}: TrackItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const previewRef = useRef<DragPreviewRenderer>(null);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);

  const abortUpload = useFileUploadStore(s => s.abortUpload);
  const activeUpload = useFileUploadStore(s => {
    return track.uploadId ? s.fileUploads.get(track.uploadId) : null;
  });
  const {isUploading, status} = useTrackUpload(track.uploadId);

  const {sortableProps} = useSortable({
    disabled: isUploading,
    ref,
    item: track,
    items: tracks,
    type: 'albumFormTrack',
    preview: previewRef,
    strategy: 'line',
    onSortEnd: (oldIndex, newIndex) => {
      onSort(oldIndex, newIndex);
    },
  });

  return (
    <div
      className="border-t border-b border-t-transparent py-1"
      ref={ref}
      {...sortableProps}
    >
      <div className="flex items-center text-sm">
        <Button
          variant="ghost"
          size="icon-sm"
          className="mr-3.5 shrink-0"
          disabled={isUploading}
          type="button"
        >
          <GripHorizontalIcon />
        </Button>
        <div className="flex-auto overflow-hidden text-ellipsis whitespace-nowrap">
          {track.name}
        </div>
        {activeUpload && (
          <div className="mr-2.5 flex items-center gap-2.5">
            <TrackUploadStatusText fileUpload={activeUpload} status={status} />
            {isUploading && <Spinner className="size-4" />}
          </div>
        )}
        <UpdateTrackDialog
          track={track}
          hideAlbumField
          onUpdate={updatedTrack => onUpdate(updatedTrack)}
        >
          <Dialog.Trigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground ml-auto shrink-0"
                disabled={isUploading}
                type="button"
                aria-label="Edit track"
              />
            }
          >
            <PencilIcon />
          </Dialog.Trigger>
        </UpdateTrackDialog>
        <AlertDialog.Root
          open={removeDialogOpen}
          onOpenChange={setRemoveDialogOpen}
        >
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground shrink-0"
            type="button"
            aria-label="Remove track"
            onClick={() => setRemoveDialogOpen(true)}
          >
            <XIcon />
          </Button>
          <AlertDialog.Portal>
            <AlertDialog.Backdrop />
            <AlertDialog.Content size="sm">
              <AlertDialog.Header>
                <AlertDialog.Media>
                  <MusicIcon />
                </AlertDialog.Media>
                <AlertDialog.Title>
                  <Trans message="Remove track" />
                </AlertDialog.Title>
                <AlertDialog.Description>
                  <Trans message="Are you sure you want to remove this track from the album?" />
                </AlertDialog.Description>
              </AlertDialog.Header>
              <AlertDialog.Footer>
                <AlertDialog.Cancel>
                  <Trans message="Cancel" />
                </AlertDialog.Cancel>
                <AlertDialog.Action
                  color="danger"
                  onClick={() => {
                    if (track.uploadId) {
                      abortUpload(track.uploadId);
                    }
                    onRemove();
                    setRemoveDialogOpen(false);
                  }}
                >
                  <Trans message="Remove" />
                </AlertDialog.Action>
              </AlertDialog.Footer>
            </AlertDialog.Content>
          </AlertDialog.Portal>
        </AlertDialog.Root>
      </div>
      <RowDragPreview track={track} ref={previewRef} />
    </div>
  );
}

interface DragPreviewProps {
  track: CreateTrackPayload;
}
const RowDragPreview = React.forwardRef<DragPreviewRenderer, DragPreviewProps>(
  ({track}, ref) => {
    let content = track.name;
    if (track.artists?.length) {
      content += `- ${track.artists?.[0].name}`;
    }
    return (
      <DragPreview ref={ref}>
        {() => (
          <div className="bg-secondary rounded p-2 text-sm shadow-sm">
            {content}
          </div>
        )}
      </DragPreview>
    );
  },
);
