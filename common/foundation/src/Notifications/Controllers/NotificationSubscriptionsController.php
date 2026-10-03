<?php

namespace Common\Notifications\Controllers;

use Common\API\ExcludeRoutesFromPublicDocs;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\File;

/**
 * @tags Notifications
 */
#[ExcludeRoutesFromPublicDocs]
class NotificationSubscriptionsController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth']);
    }

    /**
     * List notification subscriptions.
     *
     * @operationId listNotificationSubscriptions
     */
    public function index()
    {
        $user = Auth::user();

        $response = $this->getConfig();

        // filter out notifications user does not have permission for
        $response['subscriptions'] = collect($response['subscriptions'])
            ->map(function ($group) use ($user) {
                $group['subscriptions'] = collect($group['subscriptions'])
                    ->filter(function ($subscription) use ($user) {
                        if (!isset($subscription['permissions'])) {
                            return true;
                        }
                        $hasPermissions = collect(
                            $subscription['permissions'] ?? [],
                        )->every(
                            fn($permission) => $user->hasPermission(
                                $permission,
                            ),
                        );
                        $userTypeMatches =
                            !isset($subscription['user_type']) ||
                            $user->type === 'admin' ||
                            $user->type === $subscription['user_type'];
                        return $hasPermissions && $userTypeMatches;
                    })
                    ->values()
                    ->toArray();
                return $group;
            })
            ->filter(fn($group) => count($group['subscriptions']))
            ->values()
            ->toArray();

        $subs = $user->notificationSubscriptions;
        $response['user_selections'] = $subs;

        /**
         * @var array{
         *     available_channels: array<int, string>,
         *     subscriptions: array<int, array{
         *         group_name: string,
         *         subscriptions: array<int, array{
         *             name: string,
         *             notif_id: string,
         *             permissions?: array<int, string>,
         *             user_type?: string,
         *             channels?: array<int, string>
         *         }>
         *     }>,
         *     user_selections: array<int, array{
         *         id?: int,
         *         name: string,
         *         notif_id: string,
         *         permissions?: array<int, string>,
         *         channels: array<string, bool>
         *     }>
         * } $response
         */
        return response()->json($response);
    }

    /**
     * Update notification subscriptions.
     *
     * @operationId updateNotificationSubscriptions
     */
    public function update(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'selections' => 'present|array',
            'selections.*.notif_id' => 'required|string',
            /**
             * @var array<string, bool>
             */
            'selections.*.channels' => 'required|array',
        ]);

        $allConfig = collect($this->getConfig()['subscriptions'])->flatMap(
            fn($group) => $group['subscriptions'],
        );

        foreach ($data['selections'] as $selection) {
            // Reject unknown ids rather than writing a row nothing will ever
            // read. `notif_id` is a varchar(5), so an over-long id would also be
            // silently truncated by MySQL and then never match a NOTIF_ID.
            $config = $allConfig->firstWhere(
                'notif_id',
                $selection['notif_id'],
            );
            if (!$config) {
                abort(
                    422,
                    'Unknown notification: '.$selection['notif_id'],
                );
            }

            // check if user has permissions to subscribe to this notification
            if (isset($config['permissions'])) {
                $hasAllPermissions = collect($config['permissions'])->every(
                    fn($permission) => $user->hasPermission($permission),
                );
                if (!$hasAllPermissions) {
                    abort(
                        403,
                        'You do not have permission to subscribe to one of these notifications.',
                    );
                }
            }

            $subscription = $user
                ->notificationSubscriptions()
                ->firstOrNew(['notif_id' => $selection['notif_id']]);
            $newChannels = $subscription['channels'] ?? [];
            // can update state of all channels at once or only a single channel
            foreach ($selection['channels'] as $newChannel => $isSubscribed) {
                $newChannels[$newChannel] = $isSubscribed;
            }
            $subscription->fill(['channels' => $newChannels])->save();
        }

        return response()->noContent();
    }

    private function getConfig()
    {
        return File::getRequire(
            resource_path('defaults/notification-settings.php'),
        );
    }
}
