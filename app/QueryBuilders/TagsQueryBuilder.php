<?php

namespace App\QueryBuilders;

use App\Models\Tag;
use Common\Database\QueryBuilder\BaseQueryBuilder;
use Common\Database\QueryBuilder\Filter;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Database\Eloquent\Builder;

class TagsQueryBuilder extends BaseQueryBuilder
{
    protected string $model = Tag::class;

    public function paginate(): Paginator
    {
        $this->applySorting();
        $this->applySearchQuery();
        $this->loadRequestedRelations();
        $this->applyFilters();

        return $this->builder->paginate($this->getPerPage());
    }

    protected function shouldScopeToWorkspace(): bool
    {
        return false;
    }

    protected function getBaseBuilder(): Builder
    {
        return Tag::query()->withCount(['tracks', 'albums']);
    }

    protected function applyFilter(Filter $filter): Builder
    {
        return match ($filter->key) {
            'created_at', 'updated_at', 'user_id' => $this->simpleFilter(
                $filter,
            ),
        };
    }
}
