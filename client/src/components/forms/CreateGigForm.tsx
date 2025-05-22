import type { AxiosError } from 'axios';
import { useState } from 'react';
import { FormProvider, useForm, type SubmitHandler } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import api from '../../lib/api';
import type { ApiErrorResponse, ValidationError } from '../../types/api';
import type { CreateGigFormInputs } from '../../types/gig';
import { FormInput } from './FormInput';

const CreateGigForm = () => {
  const [apiErr, setApiErr] = useState<string | ValidationError[] | null>(null);

  const methods = useForm<CreateGigFormInputs>({ mode: 'onChange' });
  const { user } = useAuth();

  const submitCredential: SubmitHandler<CreateGigFormInputs> = async (data) => {
    try {
      console.log(user);
      if (!user) {
        throw new Error("User not logged in");
      }
      
      const res = await api.post('/api/gig/create', { ...data, file: data.file[0], authorId: user.id }, { headers: { 'Content-Type': 'multipart/form-data' } });

      return res;
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
      <div className="bg-gray-50 flex items-center justify-center min-h-screen px-4">
        <form 
          method='post' 
          noValidate
          onSubmit={methods.handleSubmit(submitCredential)} 
          className="w-full max-w-sm flex flex-col gap-5 text-center text-sm border border-gray-200 shadow-lg rounded-2xl px-8 py-10 bg-white"
        >
          <div className="font-bold text-3xl">Sign Up</div>
          <FormInput
            name='file'
            id='file'
            type='file'
          />
          <FormInput
            name="title"
            id="title"
            type="text"
            placeholder="Title"
          />
          <FormInput
            name='price'
            id="price"
            type="number"
            placeholder="Price"
            min={0}
            step={0.5}
          />
          <textarea
            id='description'
            {...methods.register("description")}
          />
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
            Create
          </button>
        </form>
      </div>
    </FormProvider>
  )
}

export default CreateGigForm;