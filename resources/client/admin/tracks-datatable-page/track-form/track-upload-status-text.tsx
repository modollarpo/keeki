import {TrackUploadStatus} from '@app/admin/tracks-datatable-page/track-form/track-upload-progress';
import {FileUpload} from '@common/uploads/uploader/file-upload-store';
import {Trans} from '@ui/i18n/trans';
import {prettyBytes} from '@ui/utils/files/pretty-bytes';
import clsx from 'clsx';
import {ReactElement, useMemo} from 'react';

interface Props {
  fileUpload: FileUpload;
  status: TrackUploadStatus;
  className?: string;
}
export function TrackUploadStatusText({fileUpload, status, className}: Props) {
  const bytesUploaded = fileUpload?.bytesUploaded || 0;
  const totalBytes = useMemo(
    () => prettyBytes(fileUpload.file.size),
    [fileUpload.file.size],
  );
  const uploadedBytes = useMemo(
    () => prettyBytes(bytesUploaded),
    [bytesUploaded],
  );

  let statusMessage: ReactElement;
  if (status === 'completed') {
    statusMessage = <Trans message="Upload complete" />;
  } else if (status === 'aborted') {
    statusMessage = <Trans message="Upload cancelled" />;
  } else if (status === 'failed') {
    statusMessage = <Trans message="Upload failed" />;
  } else if (status === 'processing') {
    statusMessage = <Trans message="Processing upload..." />;
  } else if (status === 'pending') {
    statusMessage = <Trans message="Waiting to start..." />;
  } else {
    statusMessage = (
      <Trans
        message=":bytesUploaded of :totalBytes uploaded"
        values={{
          bytesUploaded: uploadedBytes,
          totalBytes,
        }}
      />
    );
  }

  return (
    <div className={clsx('text-muted-foreground text-xs', className)}>
      {statusMessage}
    </div>
  );
}
