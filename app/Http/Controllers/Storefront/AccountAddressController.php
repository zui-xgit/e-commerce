<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Http\Requests\Storefront\DeliveryAddressRequest;
use App\Support\DeliveryFields;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AccountAddressController extends Controller
{
    /**
     * Show the user's one permanent delivery address.
     */
    public function index(Request $request): Response
    {
        return Inertia::render('storefront/account/addresses', [
            'deliveryAddress' => DeliveryFields::payload(
                $request->user()->deliveryInformation
            ),
        ]);
    }

    /**
     * Create the address when the user does not have one yet.
     */
    public function store(DeliveryAddressRequest $request): RedirectResponse
    {
        $request->user()->deliveryInformation()->updateOrCreate(
            [],
            DeliveryFields::columns($request->validated())
        );

        $this->flash('Address saved. Checkout will fill in your details automatically.');

        return back();
    }

    /**
     * Update the existing address. Checkout submissions never call this.
     */
    public function update(DeliveryAddressRequest $request): RedirectResponse
    {
        $address = $request->user()->deliveryInformation;

        if (! $address) {
            return back()->withErrors([
                'address' => __('No saved address to update.'),
            ]);
        }

        $address->update(DeliveryFields::columns($request->validated()));

        $this->flash('Address updated. New orders will use these details.');

        return back();
    }

    /**
     * Remove the saved address; future checkouts start empty again.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->user()->deliveryInformation()->delete();

        $this->flash('Address removed.');

        return back();
    }

    private function flash(string $message): void
    {
        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __($message),
        ]);
    }
}
