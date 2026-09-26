<?php

namespace App\Http\Controllers\UserProfile;

use App\Models\User;
use App\Services\Users\UserProfileLoader;
use Common\Auth\Actions\UpdateUser;
use Common\Core\Demo\BlockedOnDemoSite;
use Common\Core\Rendering\RendersClientSideApp;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class UserProfileController extends Controller
{
    use RendersClientSideApp;

    public function show(User $user)
    {
        Gate::authorize('show', $user);

        $loader = request('loader', 'userProfilePage');
        $data = (new UserProfileLoader())->execute($user, $loader);

        return $this->clientSideOrPrerenderedResponse([
            'pageName' =>
                $loader === 'userProfilePage' ? 'user-profile-page' : null,
            'loader' => $loader,
            'data' => $data,
        ]);
    }

    #[BlockedOnDemoSite]
    public function update(Request $request)
    {
        $user = $request->user();
        Gate::authorize('update', $user);

        $data = $request->validate([
            'user' => 'required|array',
            'user.image' => 'nullable|string',
            'user.image_entry_id' => 'nullable|integer',
            'user.name' => 'nullable|string|min:2|max:255',
            'user.username' => [
                'nullable',
                'string',
                'max:100',
                Rule::unique('users', 'username')->ignore($user->id),
            ],
            'profile' => 'nullable|array',
            'profile.city' => 'nullable|string|max:255',
            'profile.country' => 'nullable|string|max:255',
            'profile.description' => 'nullable|string',
            'links' => 'nullable|array',
            'links.*.url' => 'required|string|max:255',
            'links.*.title' => 'nullable|string|max:255',
        ]);

        $user = (new UpdateUser())->execute(
            $user,
            Arr::only($data['user'], [
                'image',
                'image_entry_id',
                'name',
                'username',
            ]),
        );

        $profile = $user
            ->profile()
            ->updateOrCreate(['user_id' => $user->id], $data['profile'] ?? []);

        $user->links()->delete();
        $links = $user->links()->createMany($data['links'] ?? []);

        $user->setRelation('profile', $profile);
        $user->setRelation('links', $links);

        return response()->json([
            'user' => (new UserProfileLoader())->toApiResource($user),
        ]);
    }
}
