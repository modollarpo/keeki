<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * An admin's SEO override for one static public page.
 *
 * Only holds what was deliberately changed; the defaults live in
 * `App\Support\CompanyPageSeo`. A row with both fields null means "no
 * override", so it is removed rather than kept as an empty shell.
 */
class CompanyPageSeoOverride extends Model
{
    protected $table = 'company_page_seo_overrides';

    protected $guarded = [];

    public $timestamps = true;
}