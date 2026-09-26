import {mergeTrackFormValues} from '@app/admin/tracks-datatable-page/requests/use-extract-track-file-metadata';
import {CreateTrackPayload} from '@app/admin/tracks-datatable-page/requests/use-create-track';
import {TrackUploadProgress} from '@app/admin/tracks-datatable-page/track-form/track-upload-progress';
import {useTrackUpload} from '@app/web-player/backstage/upload-page/use-track-upload';
import {useTrackUploader} from '@app/web-player/backstage/upload-page/use-track-uploader';
import {useFileUploadStore} from '@common/uploads/uploader/file-upload-provider';
import {Button} from '@shadcn/button/button';
import {Trans} from '@ui/i18n/trans';
import {UploadIcon} from 'lucide-react';
import {useState} from 'react';
import {useFormContext} from 'react-hook-form';

export function TrackFormUploadButton() {
  const [uploadId, setUploadId] = useState<string>();
  const {setValue, watch, getValues} = useFormContext<CreateTrackPayload>();
  const {openFilePicker} = useTrackUploader({
    onUploadStart: ({uploadId}) => setUploadId(uploadId),
    onMetadataChange: (file, newData) => {
      const mergedValues = mergeTrackFormValues(newData, getValues());
      Object.entries(mergedValues).forEach(([key, value]) =>
        setValue(key as keyof CreateTrackPayload, value, {shouldDirty: true}),
      );
    },
  });
  const {status, isUploading, activeUpload} = useTrackUpload(uploadId);
  const abortUpload = useFileUploadStore(s => s.abortUpload);
  const clearInactive = useFileUploadStore(s => s.clearInactive);
  return (
    <div>
      <Button
        className="w-full"
        color="primary"
        type="button"
        disabled={isUploading}
        onClick={() => openFilePicker()}
      >
        <UploadIcon data-icon="inline-start" />
        {watch('src') ? (
          <Trans message="Replace file" />
        ) : (
          <Trans message="Upload file" />
        )}
      </Button>
      {activeUpload && (
        <TrackUploadProgress
          fileUpload={activeUpload}
          status={status}
          className="mt-6"
          onAbort={uploadId => {
            abortUpload(uploadId);
            clearInactive();
          }}
        />
      )}
    </div>
  );
}
