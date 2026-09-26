import {AlertDialog} from '@shadcn/alert-dialog/alert-dialog';
import {Trans} from '@ui/i18n/trans';
import {useEffect, useRef} from 'react';
import {BlockerFunction, useBlocker} from 'react-router';

interface Props {
  shouldBlock: boolean | (() => boolean);
  allowNavigation?: BlockerFunction;
}
export function BlockerDialog({shouldBlock, allowNavigation}: Props) {
  const shouldBlockRef = useRef(shouldBlock);
  shouldBlockRef.current = shouldBlock;

  const {state, reset, proceed} = useBlocker(args => {
    return (
      (typeof shouldBlockRef.current === 'boolean'
        ? shouldBlockRef.current
        : shouldBlockRef.current()) &&
      // only block navigation if specified path is not within next location
      (!allowNavigation || !allowNavigation(args))
    );
  });

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (
        typeof shouldBlockRef.current === 'boolean'
          ? shouldBlockRef.current
          : shouldBlockRef.current()
      ) {
        e.preventDefault();
        e.returnValue = true;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return (
    <AlertDialog.Root
      open={state === 'blocked'}
      onOpenChange={open => {
        if (state !== 'blocked') return;
        if (!open) {
          reset();
        }
      }}
    >
      <AlertDialog.Portal>
        <AlertDialog.Backdrop />
        <AlertDialog.Content size="sm">
          <AlertDialog.Header>
            <AlertDialog.Title>
              <Trans message="You have unsaved changes" />
            </AlertDialog.Title>
            <AlertDialog.Description>
              <Trans message="Your changes will be lost if you continue. Are you sure you want to discard them?" />
            </AlertDialog.Description>
          </AlertDialog.Header>
          <AlertDialog.Footer>
            <AlertDialog.Cancel>
              <Trans message="Stay here" />
            </AlertDialog.Cancel>
            <AlertDialog.Action
              color="danger"
              onClick={() => {
                if (state === 'blocked') {
                  proceed();
                }
              }}
            >
              <Trans message="Discard changes" />
            </AlertDialog.Action>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
