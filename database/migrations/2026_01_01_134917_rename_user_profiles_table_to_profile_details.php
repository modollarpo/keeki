<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasTable('profile_details')) {
            return;
        }

        Schema::rename('user_profiles', 'profile_details');
    }
};
