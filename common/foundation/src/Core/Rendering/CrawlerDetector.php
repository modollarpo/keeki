<?php

namespace Common\Core\Rendering;

use Jaybizzle\CrawlerDetect\CrawlerDetect;

class CrawlerDetector
{
    protected bool|null $isCrawler = null;

    // in-app browsers/webviews (WhatsApp, Telegram, Viber, ...) ship with
    // bot-like user agents, but the person using them is a real browser
    // visitor and must get the full client side app instead of a static page
    private const WEBVIEW_UA_TOKENS = [
        'whatsapp',
        'telegram',
        'viber',
        ' line/',
        'snapchat',
        'instagram',
    ];

    public function isCrawler(): bool
    {
        if ($this->isCrawler !== null) {
            return $this->isCrawler;
        }

        $userAgent = strtolower(request()->userAgent() ?? '');

        if (
            $userAgent &&
            collect(self::WEBVIEW_UA_TOKENS)->contains(
                fn(string $token) => str_contains($userAgent, $token),
            )
        ) {
            return $this->isCrawler = false;
        }

        return $this->isCrawler =
            request()->isMethod('GET') &&
            (request()->query->has('_escaped_fragment_') ||
                request()->server->get('X-BUFFERBOT') ||
                (new CrawlerDetect())->isCrawler());
    }
}
