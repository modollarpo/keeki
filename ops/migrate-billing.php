<?php
/**
 * Idempotent billing migration:
 *  1. Move music.download + music.offline from free roles to the Pro product.
 *  2. Set clean Pro pricing (monthly default, 6-mo, 12-mo).
 *  3. Verify final state.
 */
require '/var/www/bemusic/vendor/autoload.php';
$app = require_once '/var/www/bemusic/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Common\Billing\Models\Product;
use Common\Permissions\Models\Permission;
use Illuminate\Support\Facades\DB;

$premiumPerms = ['music.download', 'music.offline'];
$permIds = Permission::whereIn('name', $premiumPerms)->pluck('id')->all();
$permNames = Permission::whereIn('id', $permIds)->pluck('name', 'id')->all();

if (count($permIds) !== count($premiumPerms)) {
    fwrite(STDERR, 'Missing premium permissions in DB: ' . implode(',', $premiumPerms) . "\n");
    exit(1);
}

echo "=== 1. Strip premium perms from free roles ===\n";
$roleModelClass = 'App\Models\Role';
foreach (['Users', 'Guests'] as $roleName) {
    $roleId = DB::table('roles')->where('name', $roleName)->value('id');
    if (!$roleId) {
        echo "$roleName role not found, skipping\n";
        continue;
    }
    DB::table('permissionables')
        ->where('permissionable_type', $roleModelClass)
        ->where('permissionable_id', $roleId)
        ->whereIn('permission_id', $permIds)
        ->delete();
    echo "removed premium perms from $roleName (role id $roleId)\n";
}

echo "\n=== 2. Grant premium perms to Pro product ===\n";
$pro = Product::where('name', 'LIKE', '%Pro%')
    ->orWhere('recommended', true)
    ->first();
if (!$pro) {
    fwrite(STDERR, "Could not find Pro product\n");
    exit(1);
}
echo "Pro product id={$pro->id} name='{$pro->name}'\n";

$payload = [];
foreach ($permIds as $id) {
    $payload[$id] = ['restrictions' => json_encode([])];
}
$pro->permissions()->sync($payload);
echo "synced product permissions\n";

echo "\n=== 3. Set Pro pricing ===\n";
$prices = $pro->prices()->orderBy('interval_count')->get();
$mapping = [
    ['interval_count' => 1, 'amount' => 3.99, 'default' => true],
    ['interval_count' => 6, 'amount' => 21.99, 'default' => false],
    ['interval_count' => 12, 'amount' => 39.99, 'default' => false],
];
foreach ($prices as $i => $price) {
    $target = $mapping[$i] ?? $mapping[count($mapping) - 1];
    $price->amount = $target['amount'];
    $price->interval = 'month';
    $price->interval_count = $target['interval_count'];
    $price->default = $target['default'];
    $price->save();
    echo "price#{$price->id}: \${$price->amount}/month x{$price->interval_count}" .
        ($price->default ? ' [DEFAULT]' : '') . "\n";
}

echo "\n=== 4. Verify ===\n";
echo "Products & permissions:\n";
foreach (Product::with('permissions', 'prices')->orderBy('position')->get() as $p) {
    $permStr = $p->permissions->pluck('name')->implode(', ');
    echo "#{$p->id} {$p->name} free=" . ($p->free ? 'Y' : 'N') .
        " rec=" . ($p->recommended ? 'Y' : 'N') .
        " trial={$p->trial_period_days} perms=[{$permStr}]\n";
}
echo "\nRole premium-perm leftovers:\n";
$leftovers = DB::table('permissionables')
    ->whereIn('permission_id', $permIds)
    ->where('permissionable_type', $roleModelClass)
    ->get();
if ($leftovers->isEmpty()) {
    echo "(none)\n";
} else {
    foreach ($leftovers as $row) {
        echo "role {$row->permissionable_id} has {$permNames[$row->permission_id]}\n";
    }
}
echo "\nALL DONE\n";