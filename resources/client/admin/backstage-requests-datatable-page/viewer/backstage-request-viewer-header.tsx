import {useDeleteBackstageRequest} from '@app/admin/backstage-requests-datatable-page/requests/use-delete-backstage-request';
import {ApproveBackstageRequestDialog} from '@app/admin/backstage-requests-datatable-page/viewer/approve-backstage-request-dialog';
import {DenyBackstageRequestDialog} from '@app/admin/backstage-requests-datatable-page/viewer/deny-backstage-request-dialog';
import {BackstageRequest} from '@app/web-player/backstage/backstage-request';
import {DashboardLayout} from '@common/ui/dashboard/dashboard-layout';
import {AlertDialog} from '@shadcn/alert-dialog/alert-dialog';
import {Breadcrumb} from '@shadcn/breadcrumb/breadcrumb';
import {Button} from '@shadcn/button/button';
import {Dialog} from '@shadcn/dialog/dialog';
import {Trans} from '@ui/i18n/trans';
import {ClipboardCheckIcon} from 'lucide-react';
import {Fragment, useState} from 'react';

interface Props {
  request: BackstageRequest;
}
export function BackstageRequestViewerHeader({request}: Props) {
  return (
    <DashboardLayout.SectionHeader>
      <DashboardLayout.SidebarToggle />
      <Breadcrumb.Root className="text-xl">
        <Breadcrumb.Item>
          <Breadcrumb.Link to="/admin/backstage-requests">
            <Trans message="Backstage requests" />
          </Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Separator />
        <Breadcrumb.Item>
          <Breadcrumb.Page>
            <Trans message="View" />
          </Breadcrumb.Page>
        </Breadcrumb.Item>
      </Breadcrumb.Root>
      <Fragment>
        {request.status === 'pending' && (
          <Fragment>
            <ApproveBackstageRequestDialog request={request}>
              <Dialog.Trigger
                render={<Button variant="default" color="primary" />}
              >
                <Trans message="Approve" />
              </Dialog.Trigger>
            </ApproveBackstageRequestDialog>
            <DenyBackstageRequestDialog request={request}>
              <Dialog.Trigger render={<Button variant="outline" />}>
                <Trans message="Deny" />
              </Dialog.Trigger>
            </DenyBackstageRequestDialog>
          </Fragment>
        )}
        <DeleteButton request={request} />
      </Fragment>
    </DashboardLayout.SectionHeader>
  );
}

function DeleteButton({request}: Props) {
  const [open, setOpen] = useState(false);
  const deleteRequest = useDeleteBackstageRequest();

  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <AlertDialog.Trigger
        render={
          <Button variant="outline" disabled={deleteRequest.isPending} />
        }
      >
        <Trans message="Delete" />
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop />
        <AlertDialog.Content size="sm">
          <AlertDialog.Header>
            <AlertDialog.Media>
              <ClipboardCheckIcon />
            </AlertDialog.Media>
            <AlertDialog.Title>
              <Trans message="Delete request" />
            </AlertDialog.Title>
            <AlertDialog.Description>
              <Trans message="Are you sure you want to delete this request?" />
            </AlertDialog.Description>
          </AlertDialog.Header>
          <AlertDialog.Footer>
            <AlertDialog.Cancel disabled={deleteRequest.isPending}>
              <Trans message="Cancel" />
            </AlertDialog.Cancel>
            <AlertDialog.Action
              color="danger"
              disabled={deleteRequest.isPending}
              onClick={() => {
                deleteRequest.mutate(
                  {requestId: request.id},
                  {onSuccess: () => setOpen(false)},
                );
              }}
            >
              <Trans message="Delete" />
            </AlertDialog.Action>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
