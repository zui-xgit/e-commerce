<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class AdminController extends Controller
{
    /**
     * Show the admin login form.
     */
    public function show(Request $request): Response
    {


        return Inertia::render('auth/login', [
            // TODO: 
            // we will also add the name of the shop later though. 
            'canResetPassword' => Features::enabled(Features::resetPasswords()),
            'status' => $request->session()->get('status'),
        ]);

        
    }

}
