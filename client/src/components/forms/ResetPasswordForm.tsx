import type { AxiosError } from 'axios';
import { useState } from 'react';
import { FormProvider, useForm, type SubmitHandler } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../lib/api';
import type { ApiErrorResponse, ValidationError } from '../../types/api';
import { type ResetPasswordFormInputs } from '../../types/form';
import { cpasswordValidation, passwordValidation } from '../../validators/signupFormValidators';
import { FormInput } from './FormInput';
import { v4 as uuidv4 } from 'uuid';

const ResetPasswordForm = () => {
  const [apiErr, setApiErr] = useState<string | ValidationError[] | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState<string | null>(null);

  const methods = useForm<ResetPasswordFormInputs>({ mode: 'onChange' });
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get('token');
  const navigate = useNavigate();

  const submitCredential: SubmitHandler<ResetPasswordFormInputs> = async (data) => {
    try {
      const key = idempotencyKey ?? uuidv4();
      if (!idempotencyKey) {
        setIdempotencyKey(key);
      }

      await api.post('/api/auth/reset-password', { ...data, resetToken }, {
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': key
        }
      });

      navigate('/login');
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;

      const validationErrors = error.response?.data?.errors;

      const errorMessage = error.response?.data?.message;

      setApiErr(validationErrors || errorMessage || "Something went wrong. Please try again");
    }

  }

  const inputStyle : string = "w-full border border-gray-300 rounded-3xl px-4 py-2 focus:outline-none";

  return (
    <FormProvider {...methods}>
      <div className="bg-gray-50 flex items-center justify-center min-h-screen px-4">
        <form 
          method='post' 
          noValidate
          onSubmit={methods.handleSubmit(submitCredential)} 
          className="w-full max-w-sm flex flex-col gap-5 text-center text-sm border border-gray-200 shadow-lg rounded-2xl px-8 py-10 bg-white"
        >
          <div className="font-bold text-3xl">Reset Password</div>
          <FormInput {...passwordValidation}
            className={inputStyle}/>
          <FormInput {...cpasswordValidation(methods.watch)}
            className={inputStyle}/>
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
            Reset
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

export default ResetPasswordForm;