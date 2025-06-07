import type { AxiosError } from 'axios';
import { useState } from 'react';
import { FormProvider, useForm, type SubmitHandler } from 'react-hook-form';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import type { ApiErrorResponse } from '../../types/api';
import { type ResetRequestFormInputs } from '../../types/form';
import { FormInput } from './FormInput';
import { useIdempotencyKey } from '../../hooks/useIdempotencyKey';

const ResetRequestForm = () => {
  const [apiErr, setApiErr] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const idempotencyKey = useIdempotencyKey();

  const methods = useForm<ResetRequestFormInputs>();

  const submitCredential: SubmitHandler<ResetRequestFormInputs> = async (data) => {
    try {
      await api.post('/api/auth/request-reset', data, {
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey.get()
        }
      });

      setSuccess(true);
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;

      const errorMessage = error.response?.data?.message;

      setApiErr(errorMessage || "Something went wrong. Please try again");
    } finally {
      idempotencyKey.clear();
    }
  }

  return (
    <div className="text-white">
      {success ? (
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="w-full max-w-sm flex flex-col gap-5 text-center text-xl border border-gray-200 shadow-lg rounded-2xl px-8 py-10 backdrop-blur-sm">
            <span className="w-full border border-gray-300 rounded-3xl px-4 py-2 focus:outline-none">Email Sent!</span>
            <div className="text-sm">
              <span>Back to </span>
              <Link className="font-bold :hover" to="/accounts/login">Log in</Link>
            </div>
          </div>
        </div>
      ) : (
        <FormProvider {...methods}>
          <div className="flex items-center justify-center min-h-screen px-4">
            <form
              method='post'
              onSubmit={methods.handleSubmit(submitCredential)}
              className="w-full max-w-sm flex flex-col gap-5 text-center text-sm border border-gray-200 shadow-lg rounded-2xl px-8 py-10 backdrop-blur-sm"
            >
              <div className="font-bold text-3xl">Forgot Password?</div>
              <FormInput
                name="email"
                id="email"
                type="email"
                placeholder="Email"
              />
              {apiErr && <p className="text-sm text-rose-400">{apiErr}</p>}
              <button
                type='submit'
                className="text-xl border border-gray-300 rounded-3xl px-4 py-2 focus:outline-none cursor-pointer"
              >
                Reset Password
              </button>
            </form>
          </div>
        </FormProvider>
      )}
    </div>

  )
}


export default ResetRequestForm;