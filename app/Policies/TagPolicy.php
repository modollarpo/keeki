<?php

namespace App\Policies;

use App\Models\User;
use Common\Core\Policies\BasePolicy;

class TagPolicy extends BasePolicy
{
    public function index(?User $user)
    {
        return true;
    }

    public function show(?User $user)
    {
        return true;
    }

    public function store(User $user)
    {
        return $this->hasPermission($user, 'tags.update');
    }

    public function update(User $user)
    {
        return $this->hasPermission($user, 'tags.update');
    }

    public function destroy(User $user)
    {
        return $this->hasPermission($user, 'tags.update');
    }
}
