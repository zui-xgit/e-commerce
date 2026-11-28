<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\Response;

class UserPolicy
{
    public function checkout(?User $user): Response
    {
        if ($user?->hasRole('admin')) {
            return Response::deny('Administrators cannot use storefront checkout.');
        }
        return Response::allow();
    }
}
