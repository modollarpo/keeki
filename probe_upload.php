<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$row = DB::table('settings')->where('name', 'uploading')->first();
$json = decrypt($row->value);
$data = json_decode($json, true);

echo "json_decode ok  : " . ($data !== null ? 'yes' : 'NO') . "\n";
echo "top-level keys  : " . implode(', ', array_keys($data ?? [])) . "\n\n";

echo "--- backends ---\n";
foreach ($data['backends'] ?? [] as $b) {
    echo "  id={$b['id']} name={$b['name']} type={$b['type']}\n";
}
if (empty($data['backends'])) {
    echo "  (NONE)\n";
}

echo "\n--- types ---\n";
foreach ($data['types'] ?? [] as $name => $cfg) {
    printf(
        "  %-16s backends=%-16s max=%-9s accept=%s\n",
        $name,
        json_encode($cfg['backends'] ?? []),
        $cfg['max_file_size'] ?? '-',
        json_encode($cfg['accept'] ?? []),
    );
}
if (empty($data['types'])) {
    echo "  (NONE)\n";
}

echo "\n--- brandingImages upload type as the app resolves it ---\n";
$uploads = app(Common\Files\Uploads\Uploads::class);
$r = new ReflectionObject($uploads);
foreach ($r->getMethods() as $m) {
    if ($m->isPublic() && !in_array($m->getName(), ['__construct'], true)) {
        echo "  method: " . $m->getName() . "\n";
    }
}

echo "\n--- file entries ---\n";
echo "  count: " . DB::table('file_entries')->count() . "\n";
