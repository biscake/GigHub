import type { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { FormProvider, useForm, type SubmitHandler } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from "uuid";
import { useAuth } from '../../hooks/useAuth';
import api from '../../lib/api';
import type { ApiErrorResponse, ValidationError } from '../../types/api';
import { type SignupFormInputs } from '../../types/form';
import { cpasswordValidation, emailValidation, passwordValidation, usernameValidation } from '../../utils/validators';
import { FormInput } from './FormInput';

const SignupForm = () => {
  const [idempotencyKey, setIdempotencyKey] = useState<string | null>(null);
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
      const key = idempotencyKey ?? uuidv4();
      if (!idempotencyKey) {
        setIdempotencyKey(key);
      }

      await api.post('/api/auth/register', data, {
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': key
        }
      });

      await login({ username: data.username , password: data.password, rememberMe: true });
      navigate('/');
    } catch (err) {
      console.error(err)
      const error = err as AxiosError<ApiErrorResponse>;

      const validationErrors = error.response?.data?.errors;

      const errorMessage = error.response?.data?.message;

      setApiErr(validationErrors || errorMessage || "Something went wrong. Please try again");
    }
  }

  return (
    <FormProvider {...methods}>
      <div className="bg-cover flex items-center justify-center min-h-screen px-4" style={{ backgroundImage: "url('/Login.png')" }}>
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
            className="text-xl border border-gray-300 rounded-3xl px-4 py-2 focus:outline-none mt-5"
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