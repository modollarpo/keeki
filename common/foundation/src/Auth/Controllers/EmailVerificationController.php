<?php

namespace Common\Auth\Controllers;

use App\Models\User;
use Common\API\ExcludeRoutesFromPublicDocs;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Gate;

#[ExcludeRoutesFromPublicDocs]
class EmailVerificationController extends Controller
{
    public function validateOtp(Request $request)
    {
        $data = $request->validate(['code' => 'required|string']);

        $user = Auth::user();

        Gate::authorize('update', $user);

        if (!$user->emailVerificationOtpIsValid($data['code'])) {
            $msg = __(
                'The security code you entered is invalid or has expired',
            );
            return abort(422, $msg);
        }

        $user->markEmailAsVerified();

        return response()->noContent();
    }

    public function resendVerificationEmail(Request $request)
    {
        $data = $request->validate(['email' => 'required|email']);

        $user = User::query()->where('email', $data['email'])->firstOrFail();

        Gate::authorize('update', $user);

        $user->sendEmailVerificationNotification();

        return response()->noContent();
    }
}
