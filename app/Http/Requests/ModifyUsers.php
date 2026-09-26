<?php namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ModifyUsers extends FormRequest
{
    /**
     * @return array
     */
    public function rules()
    {
        $userId = $this->route('id');

        $rules = [
            'name' => 'alpha|min:2|max:255|nullable',
            'permissions' => 'array',
            'groups' => 'array',
            'password' => 'nullable|min:3|max:255',
            'email' => "email|min:3|max:255|unique:users,email,$userId",
        ];

        if ($this->method() === 'POST') {
            $rules['email'] = 'required|' . $rules['email'];
            $rules['password'] = 'required|' . $rules['password'];
        }

        return $rules;
    }
}
