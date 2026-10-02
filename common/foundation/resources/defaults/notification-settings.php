<?php

return [
    "available_channels" => ["email", "browser", "mobile"],
    "subscriptions" => [
        [
            "group_name" => "Authentication",
            "subscriptions" => [
                [
                    "name" => "Email verification",
                    "notif_id" => "verify",
                    "permissions" => [],
                ],
                [
                    "name" => "Password reset",
                    "notif_id" => "reset",
                    "permissions" => [],
                ],
            ],
        ],
        [
            "group_name" => "Billing",
            "subscriptions" => [
                [
                    "name" => "New invoice",
                    "notif_id" => "invoice",
                    "permissions" => [],
                ],
                [
                    "name" => "Payment failed",
                    "notif_id" => "payment_failed",
                    "permissions" => [],
                ],
            ],
        ],
        [
            "group_name" => "Workspaces",
            "subscriptions" => [
                [
                    "name" => "Workspace invitation",
                    "notif_id" => "invite",
                    "permissions" => [],
                ],
            ],
        ],
        [
            "group_name" => "Comments",
            "subscriptions" => [
                [
                    "name" => "Comment reply",
                    "notif_id" => "comment",
                    "permissions" => [],
                ],
            ],
        ],
        [
            "group_name" => "Activity",
            "subscriptions" => [
                [
                    "name" => "New track upload",
                    "notif_id" => "artist_upload",
                    "permissions" => [],
                ],
                [
                    "name" => "Backstage request update",
                    "notif_id" => "backstage",
                    "permissions" => [],
                ],
                [
                    "name" => "CSV export ready",
                    "notif_id" => "csv_export",
                    "permissions" => [],
                ],
                [
                    "name" => "Contact form message",
                    "notif_id" => "contact",
                    "permissions" => ["admin.access"],
                ],
            ],
        ],
    ],
];
