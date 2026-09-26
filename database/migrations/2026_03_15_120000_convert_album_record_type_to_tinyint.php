<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasColumn('albums', 'record_type')) {
            return;
        }

        DB::table('albums')->update([
            'record_type' => DB::raw("case
                when record_type = 'single' then 9
                when record_type = 'ep' then 8
                when record_type = 'live' then 7
                when record_type = 'compilation' then 6
                else 10
            end"),
        ]);

        Schema::table('albums', function (Blueprint $table) {
            $table->unsignedTinyInteger('record_type')->default(1)->change();
            $table->index(['record_type', 'release_date', 'id']);
        });
    }
};
