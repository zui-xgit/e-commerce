<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {   
            $this->call(SiteSettingsSeeder::class);
            $this->call(SampleCatalogSeeder::class);
            $this->call(BannerSeeder::class);

        $adminRole = Role::create(['name' => 'admin']); 
        $customerRole  = Role::create(['name' => 'customer']); 


        $admin = User::factory()->create([
            'name' => 'Admin User',
            'email_verified_at' => now(),   
            'email' => 'benardbenny10@gmail.com',
        ]); 
        $admin->assignRole($adminRole); 


        $customer = User::factory()->create([
            'name' => 'Customer User',
            'email' => 'benardbenny90@gmail.com',
            'email_verified_at' => now(),
        ]);
        $customer->assignRole($customerRole);
    }
}
