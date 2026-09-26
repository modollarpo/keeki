<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('youtube_blocked_videos', function (Blueprint $table) {
            $table->id();
            $table->string('video_id', 32)->index();
            $table->string('region', 8)->default('XX');
            $table->mediumInteger('code')->nullable();
            $table->unsignedInteger('blocked_count')->default(1);
            $table->timestamp('first_seen')->nullable();
            $table->timestamp('last_seen')->nullable();
            $table->unique(['video_id', 'region']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('youtube_blocked_videos');
    }
};