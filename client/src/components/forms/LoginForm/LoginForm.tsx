import { type AxiosError } from 'axios';
import { useState } from 'react';
import { FormProvider, useForm, type SubmitHandler } from 'react-hook-form';
import api from '../../../lib/api';
import { type ApiErrorResponse } from '../../../types/api';
import { type LoginFormInputs } from '../../../types/form';
import { Input } from '../..//Input/Input';

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
          setApiErr("An unexpected error occurred. Please try again.");
        }
      })
  }

  return (
    <FormProvider { ...methods }> 
      <form
        method='post' 
        onSubmit={methods.handleSubmit(submitCredential)} 
      >
        <Input
          name="email"
          id="email"
          type="text"
          placeholder="Email"
        />
        <Input
          name="password"
          id="password"
          type="password"
          placeholder="Password"
          autocomplete="on"
        />
        {apiErr && <p style={{color: "red"}}>{apiErr}</p>}
        <button 
          type='submit'
        >
          Log in
        </button>
      </form>
    </FormProvider>
  )
}

export default LoginForm;