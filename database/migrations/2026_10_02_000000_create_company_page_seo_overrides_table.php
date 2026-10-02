<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Per-path SEO overrides for the static public pages.
 *
 * The copy in `App\Support\CompanyPageSeo` is the default and stays in code, so
 * a fresh install needs no rows here. This table only holds what an admin has
 * deliberately changed, keyed by the page path, which lets the marketing, plan
 * and legal pages have editable titles and descriptions without their React
 * bodies becoming database records.
 *
 * Only `title` and `description` are overridable. A row with both columns null
 * is treated as no override at all, so clearing a field reverts that one field
 * to the code default instead of blanking the page.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('company_page_seo_overrides')) {
            return;
        }

        Schema::create('company_page_seo_overrides', function (Blueprint $table) {
            $table->increments('id');
            $table->string('path')->unique();
            $table->string('title')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('company_page_seo_overrides');
    }
};