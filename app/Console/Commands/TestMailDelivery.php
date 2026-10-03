<?php namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use Throwable;

/**
 * Verify that outgoing mail actually works, without printing any secret.
 *
 * Gmail rejects a normal account password with a 535 "Username and Password not
 * accepted" the moment 2FA is enabled, and a revoked App Password fails the same
 * way. Nothing in the UI distinguishes that from a working-but-quiet mailer, so
 * this command reports the transport's verdict directly:
 *
 *   php artisan mail:test
 *   php artisan mail:test someone@example.com
 */
class TestMailDelivery extends Command
{
    protected $signature = 'mail:test {recipient? : Where to send the test, defaults to MAIL_FROM_ADDRESS}';

    protected $description = 'Send a test email through the configured mailer and report the transport result';

    public function handle(): int
    {
        $mailer = config('mail.default');
        $config = config("mail.mailers.{$mailer}", []);

        $this->line('--- transport ---');
        $this->line("mailer            : {$mailer}");
        $this->line('host              : '.($config['host'] ?? 'n/a'));
        $this->line('port              : '.($config['port'] ?? 'n/a'));
        $this->line('encryption        : '.($config['scheme'] ?? 'n/a'));
        $this->line('username          : '.($this->mask((string) config('mail.username'))));
        $this->line('password          : '.(config('mail.password') ? 'set' : 'MISSING'));
        $this->line('from              : '.config('mail.from.address').' ('.config('mail.from.name').')');

        if ($config['host'] ?? null) {
            $this->line('dns               : '.$this->resolve((string) $config['host']));
        }

        $recipient = $this->argument('recipient') ?: config('mail.from.address');
        if (!$recipient) {
            $this->error('No recipient: pass one explicitly or set MAIL_FROM_ADDRESS.');

            return self::FAILURE;
        }

        $this->line('');
        $this->line("--- sending to {$recipient} ---");

        try {
            Mail::raw(
                'This is a delivery test from Keekii Music. If you are reading it, outgoing mail is working.',
                fn($message) => $message->to($recipient)->subject('Keekii Music mail delivery test'),
            );
        } catch (Throwable $e) {
            $this->line('');
            $this->error('SEND FAILED');
            $this->line('exception : '.class_basename($e));
            $this->line('message   : '.preg_replace('/\s+/', ' ', $e->getMessage()));

            if (str_contains($e->getMessage(), '535')) {
                $this->line('');
                $this->line('Gmail rejected the credentials. The password is usually an App Password,');
                $this->line('not the account password, and it stops working once it is revoked or');
                $this->line('regenerated. Create a new one at:');
                $this->line('  https://myaccount.google.com/apppasswords');
                $this->line('then save it again in Admin > Settings > Outgoing email.');
            }

            return self::FAILURE;
        }

        $this->info('SEND OK - check the inbox (and spam) of '.$recipient);

        return self::SUCCESS;
    }

    /**
     * Show enough of an address to identify it, but never the whole thing.
     */
    private function mask(string $value): string
    {
        if ($value === '') {
            return 'MISSING';
        }

        [$local, $domain] = array_pad(explode('@', $value, 2), 2, null);
        if ($domain === null) {
            return substr($value, 0, 2).'***';
        }

        return substr($local, 0, 2).'***@'.$domain;
    }

    private function resolve(string $host): string
    {
        $addresses = gethostbynamel($host);

        return $addresses ? implode(', ', $addresses) : 'NO A RECORD';
    }
}
