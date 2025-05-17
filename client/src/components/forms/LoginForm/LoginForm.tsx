import { type AxiosError } from 'axios';
import { useState } from 'react';
import { FormProvider, useForm, type SubmitHandler } from 'react-hook-form';
import api from '../../../lib/api';
import { type ApiErrorResponse } from '../../../types/api';
import { type LoginFormInputs } from '../../../types/form';
import { Input } from '../../Input/Input';
import { Link } from 'react-router-dom';

const LoginForm = () => {
  const [apiErr, setApiErr] = useState<string | null>(null);

  const methods = useForm<LoginFormInputs>();

  const submitCredential: SubmitHandler<LoginFormInputs> = data => {
    // post request to api 
    api.post('api/user/login', data, {headers: {'Content-Type': 'application/json'}})
      .then(res => {
        // TODO: login user;
        return res;
      })
      .catch(error => {
        const err = error as AxiosError;

        const data = err.response?.data as ApiErrorResponse;

        if (data?.message) {
          setApiErr(data.message);
        } else {
          setApiErr("Error. Please try again.");
        }
      })
  }

  return (
    <FormProvider { ...methods }> 
      <div className="flex items-center justify-center h-screen">
        <form
          method='post' 
          onSubmit={methods.handleSubmit(submitCredential)} 
          className="flex flex-col gap-[0.7rem] text-center text-sm border border-gray-300 rounded-md px-5 py-7 focus:outline-none"
        >
          <div className="font-bold text-xl">Log in</div>
          <Input
            name="username"
            id="username"
            type="text"
            placeholder="Username"
            className="border border-gray-300 rounded-3xl px-4 py-2 focus:outline-none"
          />
          <Input
            name="password"
            id="password"
            type="password"
            placeholder="Password"
            autocomplete="on"
            className="border border-gray-300 rounded-3xl px-4 py-2 focus:outline-none"
          />
          <div className="flex flex-row items-center justify-between w-full">
            <Input
              name="remember"
              id="remember"
              type="checkbox"
              className="accent-pink-300 cursor-pointer align-middle scale-50"
              text="remember me"
            />
            {/* Link to Reset Password Page TODO */}
            <Link to="/" className="text-[0.5rem] align-middle h-fit">Forgot password?</Link>
          </div>
          {apiErr && <p style={{color: "gray"}}>{apiErr}</p>}
          <button 
            type='submit'
            className="border border-gray-300 rounded-3xl px-4 py-2 focus:outline-none"
          >
            Log in
          </button>
          <div className="text-[0.5rem]">
            <span>Don't have an account? </span>
            <Link className="font-bold :hover" to="/signup">Register</Link>
          </div>
        </form>
      </div>
    </FormProvider>
  )
}

export default LoginForm;