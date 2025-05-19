import type { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { FormProvider, useForm, type SubmitHandler } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../lib/api';
import { cpasswordValidation, emailValidation, passwordValidation, usernameValidation } from '../../lib/validators';
import type { ApiErrorResponse, ValidationError } from '../../types/api';
import { type SignupFormInputs } from '../../types/form';
import { Input } from '../Input';

const SignupForm = () => {
  const [apiErr, setApiErr] = useState<string | ValidationError[] | null>(null);

  const methods = useForm<SignupFormInputs>({ mode: 'onChange' });
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const submitCredential: SubmitHandler<SignupFormInputs> = async (data) => {
    try {
      const res = await api.post('/api/register', data, { headers: { 'Content-Type': 'application/json' } });

      if (res.data.success) {
        await login({ username: data.username, password: data.password, rememberMe: true });
        navigate('/');
      } else {
        setApiErr(res.data.message);
      }
    } catch (err) {
      console.error(err)
      const error = err as AxiosError<ApiErrorResponse>;

      const validationErrors = error.response?.data?.errors;

      setApiErr(validationErrors || "Something went wrong. Please try again");
    }

  }

  return (
    <FormProvider {...methods}>
      <div className="bg-gray-50 flex items-center justify-center min-h-screen px-4">
        <form 
          method='post' 
          noValidate
          onSubmit={methods.handleSubmit(submitCredential)} 
          className="w-full max-w-sm flex flex-col gap-5 text-center text-sm border border-gray-200 shadow-lg rounded-2xl px-8 py-10 bg-white"
        >
          <div className="font-bold text-3xl">Sign Up</div>
          <Input {...usernameValidation}
            className="w-full border border-gray-300 rounded-3xl px-4 py-2 focus:outline-none"/>
          <Input {...emailValidation}
            className="w-full border border-gray-300 rounded-3xl px-4 py-2 focus:outline-none"/>
          <Input {...passwordValidation}
            className="w-full border border-gray-300 rounded-3xl px-4 py-2 focus:outline-none"/>
          <Input {...cpasswordValidation(methods.watch)}
            className="w-full border border-gray-300 rounded-3xl px-4 py-2 focus:outline-none"/>
          {apiErr && (
            <p className="text-sm text-rose-400">
              {Array.isArray(apiErr)
                ? apiErr.map((err, i) => (
                    <span key={i}>
                      {err.msg}
                    </span>
                  ))
                : apiErr}
            </p>
          )}
          <button 
            type='submit'
            className="text-xl border border-gray-300 rounded-3xl px-4 py-2 focus:outline-none"
          >
            Register
          </button>
          <div className="text-sm">
            <span>Already have an account? </span>
            <Link className="font-bold :hover" to="/login">Log In</Link>
          </div>
        </form>
      </div>
    </FormProvider>
  )
}

export default SignupForm;