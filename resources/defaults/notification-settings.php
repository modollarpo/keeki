<?php

/**
 * Notification subscription preferences.
 *
 * This file is read at runtime through
 * `resource_path('defaults/notification-settings.php')`, so it MUST live in the
 * application's `resources/defaults` directory. The copy under
 * `common/foundation/resources/defaults` belongs to the upstream package and is
 * replaced when the package resources are published, so edits there are lost.
 *
 * Two constraints are enforced by the storage layer:
 *
 *  - `notification_subscriptions.notif_id` is `varchar(5)`, so every `notif_id`
 *    here must be five characters or fewer. Each one must also match the
 *    `NOTIF_ID` constant on the notification class that delivers it, because
 *    that constant is what the delivery trait looks up.
 *  - `channels` is stored as JSON, and only channels listed here are offered in
 *    the UI. A subscription may narrow this further with its own `channels` key
 *    when the underlying notification cannot honour every channel.
 *
 * Security-relevant and transactional notifications are deliberately absent:
 * email verification, password reset, contact-form messages and internal error
 * notices are always delivered and cannot be switched off by a user.
 */
return [
    'available_channels' => ['email', 'browser'],

    'subscriptions' => [
        [
            'group_name' => 'Billing',
            'subscriptions' => [
                [
                    'name' => 'A new invoice is available',
                    'notif_id' => 'B01',
                    'permissions' => [],
                    'channels' => ['email', 'browser'],
                ],
                [
                    'name' => 'A payment failed',
                    'notif_id' => 'B02',
                    'permissions' => [],
                    'channels' => ['email', 'browser'],
                ],
            ],
        ],
        [
            'group_name' => 'Your music',
            'subscriptions' => [
                [
                    'name' => 'You upload a new track or album',
                    'notif_id' => 'A01',
                    'permissions' => [],
                    'channels' => ['email', 'browser'],
                ],
                [
                    'name' => 'A backstage request is approved or declined',
                    'notif_id' => 'R01',
                    'permissions' => [],
                    'channels' => ['email', 'browser'],
                ],
            ],
        ],
        [
            'group_name' => 'Comments',
            'subscriptions' => [
                [
                    'name' => 'Someone replies to your comment',
                    'notif_id' => 'C01',
                    'permissions' => [],
                    // Delivered in-app only; there is no comment email to opt into.
                    'channels' => ['browser'],
                ],
            ],
        ],
        [
            'group_name' => 'Workspaces',
            'subscriptions' => [
                [
                    'name' => 'You are invited to a workspace',
                    'notif_id' => 'W01',
                    'permissions' => [],
                    'channels' => ['email', 'browser'],
                ],
            ],
        ],
    ],
];
