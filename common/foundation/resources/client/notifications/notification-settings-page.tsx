import {ListNotificationSubscriptions200SubscriptionsItem} from '@app/gen/schemas/list-notification-subscriptions200-subscriptions-item';
import {
  listNotificationSubscriptionsOptions,
  updateNotificationSubscriptionsOptions,
} from '@common/notifications/notifications-queries';
import {Button} from '@shadcn/button/button';
import {Checkbox} from '@shadcn/forms/checkbox/checkbox';
import {toast} from '@shadcn/toast/toast';
import {useMutation, useSuspenseQuery} from '@tanstack/react-query';
import {Trans} from '@ui/i18n/trans';
import {Fragment, useState} from 'react';
import {Navbar} from '../ui/navigation/navbar/navbar';

type Selection = Record<string, ChannelSelection>;

// {email: true, mobile: true, browser: false}
type ChannelSelection = Record<string, boolean>;

// The backend can narrow the channels offered for an individual notification
// (a comment reply is in-app only, for example). The generated schema predates
// that field, so it is widened here rather than hand-editing generated code.
type SubscriptionWithChannels = {
  name: string;
  notif_id: string;
  channels?: string[];
};

export function Component() {
  return (
    <div className="bg-muted min-h-screen">
      <Navbar.Root className="bg-background sticky top-0 z-10 border-b">
        <Navbar.Logo />
        <Navbar.Menu position="notifications-page" />
        <Navbar.Content className="ml-auto">
          <Navbar.AuthContent />
        </Navbar.Content>
      </Navbar.Root>

      <div className="mx-auto my-5 max-w-6xl px-2.5 md:my-10 md:px-5">
        <div className="rounded-card bg-background border px-5 pt-5 pb-7.5 shadow-xs">
          <NotificationSettings />
        </div>
      </div>
    </div>
  );
}

export function NotificationSettings() {
  const updateSettings = useMutation(updateNotificationSubscriptionsOptions());
  const {data} = useSuspenseQuery(listNotificationSubscriptionsOptions());
  const [selection, setSelection] = useState<Selection>(() => {
    const initialSelection: Selection = {};

    data.subscriptions.forEach(group => {
      group.subscriptions.forEach(rawSubscription => {
        const subscription = rawSubscription as SubscriptionWithChannels;
        // Default a subscription to every channel it can actually be delivered
        // over. Defaulting to "nothing selected" would mean that a user who
        // simply pressed save had opted out of all notifications.
        const defaults: ChannelSelection = {};
        (subscription.channels ?? data.available_channels).forEach(
          (channel: string) => {
            defaults[channel] = true;
          },
        );

        const backendValue = data.user_selections.find(
          s => s.notif_id === subscription.notif_id,
        );
        initialSelection[subscription.notif_id] = backendValue?.channels
          ? {...defaults, ...backendValue.channels}
          : defaults;
      });
    });

    return initialSelection;
  });

  return (
    <Fragment>
      {data.subscriptions.map(group => (
        <div key={group.group_name} className="mb-2.5 text-sm">
          <GroupRow
            key={group.group_name}
            group={group}
            allChannels={data?.available_channels}
            selection={selection}
            setSelection={setSelection}
          />
          {group.subscriptions.map(subscription => (
            <SubscriptionRow
              key={subscription.notif_id}
              subscription={subscription}
              selection={selection}
              setSelection={setSelection}
              allChannels={data?.available_channels}
            />
          ))}
        </div>
      ))}
      <Button
        className="mt-5 ml-2.5"
        disabled={updateSettings.isPending}
        onClick={() => {
          updateSettings.mutate(
            {
              selections: Object.entries(selection).map(
                ([notifId, channels]) => {
                  return {notif_id: notifId, channels};
                },
              ),
            },
            {
              onSuccess: () => {
                toast.success(<Trans message="Updated preferences" />);
              },
            },
          );
        }}
      >
        <Trans message="Update preferences" />
      </Button>
    </Fragment>
  );
}

interface GroupRowProps {
  group: ListNotificationSubscriptions200SubscriptionsItem;
  allChannels: string[];
  selection: Selection;
  setSelection: (value: Selection) => void;
}
function GroupRow({
  group,
  allChannels,
  selection,
  setSelection,
}: GroupRowProps) {
  const toggleAll = (
    notifIds: string[],
    channelName: string,
    value: boolean,
  ) => {
    const nextState = Object.entries(selection).reduce<Selection>(
      (newSelection, [notifId, channels]) => {
        // Leave subscriptions that cannot use this channel untouched, so we do
        // not persist a preference that can never take effect.
        newSelection[notifId] = notifIds.includes(notifId)
          ? {...channels, [channelName]: value}
          : channels;
        return newSelection;
      },
      {},
    );
    setSelection(nextState);
  };

  const checkboxes = (
    <div className="ml-auto flex items-center gap-10 max-md:hidden">
      {allChannels.map(channelName => {
        // Only subscriptions that can be delivered over this channel take part
        // in the group checkbox. Including the others would leave it stuck
        // indeterminate, because they never hold a value for this channel.
        const participating = group.subscriptions
          .map(s => s.notif_id)
          .filter(notifId => selection[notifId]?.[channelName] !== undefined);
        const values = participating.map(
          notifId => selection[notifId][channelName],
        );
        const allSelected = values.length > 0 && values.every(Boolean);
        const someSelected = !allSelected && values.some(Boolean);
        return (
          <label
            key={channelName}
            className="flex flex-col items-center gap-3 capitalize"
          >
            <Trans message={channelName} />
            <Checkbox
              bindToHookForm={false}
              disabled={participating.length === 0}
              indeterminate={someSelected}
              checked={allSelected}
              onCheckedChange={async () => {
                const newValue = !allSelected;
                if (channelName === 'browser') {
                  const granted = await requestBrowserPermission();
                  toggleAll(
                    participating,
                    channelName,
                    !granted ? false : newValue,
                  );
                } else {
                  toggleAll(participating, channelName, newValue);
                }
              }}
              aria-label={channelName}
            />
          </label>
        );
      })}
    </div>
  );

  return (
    <div className="flex items-center border-b p-2.5">
      <div className="font-semibold">
        <Trans message={group.group_name} />
      </div>
      {checkboxes}
    </div>
  );
}

interface SubscriptionRowProps {
  subscription: SubscriptionWithChannels;
  allChannels: string[];
  selection: Selection;
  setSelection: (value: Selection) => void;
}
function SubscriptionRow({
  subscription,
  selection,
  setSelection,
  allChannels,
}: SubscriptionRowProps) {
  const notifId = subscription.notif_id;
  // A notification can only be delivered over some of the available channels
  // (a comment reply is in-app only, for example). Fall back to every channel
  // when the backend does not narrow the list.
  const channels = subscription.channels ?? allChannels;

  const toggleChannel = (channelName: string, value: boolean) => {
    setSelection({
      ...selection,
      [notifId]: {
        ...selection[notifId],
        [channelName]: value,
      },
    });
  };

  return (
    <div className="items-center border-b py-2.5 pr-2.5 pl-2 md:flex md:pl-5">
      <div className="pb-3.5 font-semibold md:pb-0 md:font-normal">
        <Trans message={subscription.name} />
      </div>
      <div className="ml-auto flex items-center gap-10">
        {channels.map(channelName => (
          <label
            key={channelName}
            className="flex flex-col items-center gap-1 capitalize"
          >
            <Checkbox
              bindToHookForm={false}
              checked={selection[notifId]?.[channelName] ?? false}
              onCheckedChange={async () => {
                const newValue = !selection[notifId]?.[channelName];
                if (channelName === 'browser') {
                  const granted = await requestBrowserPermission();
                  toggleChannel(channelName, !granted ? false : newValue);
                } else {
                  toggleChannel(channelName, newValue);
                }
              }}
              aria-label={channelName}
            />
            <span className="block md:invisible md:h-0">
              <Trans message={channelName} />
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

function requestBrowserPermission(): Promise<boolean> {
  if (Notification.permission === 'granted') {
    return Promise.resolve(true);
  }
  if (Notification.permission === 'denied') {
    toast.error(
      <Trans message="Notifications blocked. Please enable them for this site from browser settings." />,
    );
    return Promise.resolve(false);
  }
  return Notification.requestPermission().then(permission => {
    return permission === 'granted';
  });
}
