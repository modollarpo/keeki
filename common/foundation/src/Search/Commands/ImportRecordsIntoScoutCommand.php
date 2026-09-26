<?php

namespace Common\Search\Commands;

use Common\Search\ImportRecordsIntoScout;
use Illuminate\Console\Command;

class ImportRecordsIntoScoutCommand extends Command
{
    protected $signature = 'search:import-records-into-scout {model?} {driver?}';

    protected $description = 'Import records into scout';

    public function handle(): void
    {
        $model = $this->argument('model') ?? '*';
        $driver = $this->argument('driver') ?? config('scout.driver');

        // Defensive: a bare driver name as the first positional argument
        // (e.g. "search:import-records-into-scout meilisearch") is not a
        // model class. Fall back to importing every searchable model.
        if ($model !== '*' && !class_exists($model)) {
            $knownDrivers = ['meilisearch', 'mysql', 'tntsearch'];
            if (in_array($model, $knownDrivers, true)) {
                $driver = $model;
                $model = '*';
            }
        }

        (new ImportRecordsIntoScout())->execute($model, $driver);
    }
}
