import type { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { FormProvider, useForm, type SubmitHandler } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../lib/api';
import type { ApiErrorResponse, ValidationError } from '../../types/api';
import { type SignupFormInputs } from '../../types/form';
import { cpasswordValidation, emailValidation, passwordValidation, usernameValidation } from '../../validators/signupFormValidators';
import { FormInput } from './FormInput';
import { useIdempotencyKey } from '../../hooks/useIdempotencyKey';
import { useE2EE } from '../../hooks/useE2EE';

const SignupForm = () => {
  const idempotencyKey = useIdempotencyKey();
  const [apiErr, setApiErr] = useState<string | ValidationError[] | null>(null);

  const methods = useForm<SignupFormInputs>({ mode: 'onChange' });
  const { login, user } = useAuth();
  const { setPassword } = useE2EE();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const submitCredential: SubmitHandler<SignupFormInputs> = async (data) => {
    try {
      await api.post('/api/auth/register', data, {
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey.get()
        }
      });

      setPassword(() => data.password);
      await login({ username: data.username , password: data.password, rememberMe: true });
      navigate('/');
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;

      const validationErrors = error.response?.data?.errors;

      const errorMessage = error.response?.data?.message;

      setApiErr(validationErrors || errorMessage || "Something went wrong. Please try again");
    } finally {
      idempotencyKey.clear();
    }
  }

  return (
    <FormProvider {...methods}>
      <div className="flex items-center justify-center min-h-screen px-4">
        <form 
          method='post' 
          noValidate
          onSubmit={methods.handleSubmit(submitCredential)} 
          className="w-full max-w-sm flex flex-col gap-1.5 text-white text-center text-sm border border-gray-200 shadow-lg rounded-2xl px-8 py-10 backdrop-blur-sm"
        >
          <div className="font-bold text-3xl mb-4 -mt-2">Sign Up</div>
          <FormInput {...usernameValidation} />
          <FormInput {...emailValidation} />
          <FormInput {...passwordValidation} />
          <FormInput {...cpasswordValidation(methods.watch)} />
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
            className="text-xl border border-gray-300 rounded-3xl px-4 py-2 focus:outline-none mt-5 cursor-pointer"
          >
            Register
          </button>
          <div className="text-sm">
            <span>Already have an account? </span>
            <Link className="font-bold :hover" to="/accounts/login">Log In</Link>
          </div>
        </form>
      </div>
    </FormProvider>
  )
}

export default SignupForm;