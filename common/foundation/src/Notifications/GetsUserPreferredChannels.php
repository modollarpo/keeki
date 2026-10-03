<?php

namespace Common\Notifications;

/**
 * Resolves a notification's delivery channels from the recipient's saved
 * preferences.
 *
 * Channel names in the UI are deliberately transport-agnostic:
 *
 *   email   -> Laravel's `mail`
 *   browser -> `database`, plus `broadcast` only when a broadcast driver is
 *              actually configured. Requesting `broadcast` without a driver
 *              makes the notification fail rather than degrade, so it is
 *              treated as unavailable instead.
 *
 * Anything else the user selected is passed through untouched.
 *
 * Mandatory notifications (email verification, password reset, contact-form
 * messages) intentionally do not use this trait, so a user cannot lock
 * themselves out of the flows they need.
 */
trait GetsUserPreferredChannels
{
    /**
     * Channels this notification can actually deliver, regardless of what the
     * user picked. Subclasses that use this trait get this for free; override
     * it to narrow the set further.
     *
     * @return array<int, string>
     */
    public static function supportedPreferenceChannels(): array
    {
        return ['email', 'browser'];
    }

    /**
     * @param  \Illuminate\Notifications\Notifiable  $notifiable
     * @return array<int, string>
     */
    public function via($notifiable): array
    {
        $supported = static::supportedPreferenceChannels();

        // Without the preference feature there is nothing to read, so fall back
        // to every transport this notification supports.
        if (!config('app.notif_subs_integrated')) {
            return $this->resolveChannels($supported);
        }

        // Notifications are also sent to transient, unsaved models (the contact
        // form notifies a synthetic recipient). Those have no subscription rows,
        // so treat "no preference row" as "deliver everything" rather than
        // silently dropping the notification.
        $subscription = $notifiable->notificationSubscriptions
            ->where('notif_id', static::NOTIF_ID)
            ->first();

        if (!$subscription) {
            return $this->resolveChannels($supported);
        }

        $selected = collect($subscription->channels ?: [])
            ->filter(fn($enabled) => (bool) $enabled)
            ->keys()
            ->intersect($supported)
            ->all();

        return $this->resolveChannels($selected);
    }

    /**
     * @param  array<int, string>  $channels
     * @return array<int, string>
     */
    private function resolveChannels(array $channels): array
    {
        $resolved = [];

        foreach ($channels as $channel) {
            switch ($channel) {
                case 'email':
                    $resolved[] = 'mail';
                    break;

                case 'browser':
                    $resolved[] = 'database';
                    if (config('broadcasting.default') && config('broadcasting.default') !== 'null') {
                        $resolved[] = 'broadcast';
                    }
                    break;

                default:
                    $resolved[] = $channel;
                    break;
            }
        }

        return array_values(array_unique($resolved));
    }
}
