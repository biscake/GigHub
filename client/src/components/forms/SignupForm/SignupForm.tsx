import { type AxiosError } from 'axios';
import { useState } from 'react';
import { FormProvider, useForm, type SubmitHandler } from 'react-hook-form';
import api from '../../../lib/api';
import { cpasswordValidation, emailValidation, passwordValidation, usernameValidation } from '../../../lib/validators';
import { type ApiErrorResponse } from '../../../types/api';
import { type SignupFormInputs } from '../../../types/form';
import { Input } from '../../Input/Input';

const SignupForm = () => {
  const [apiErr, setApiErr] = useState<string | null>(null);

  const methods = useForm<SignupFormInputs>({mode: 'onChange'});

  const submitCredential: SubmitHandler<SignupFormInputs> = data => {
    //post request to api
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
    <FormProvider {...methods}>
      <form 
        method='post' 
        noValidate
        onSubmit={methods.handleSubmit(submitCredential)} 
      >
        <Input {...usernameValidation} />
        <Input {...emailValidation}/>
        <Input {...passwordValidation}/>
        <Input {...cpasswordValidation(methods.watch)}/>
        {apiErr && <p style={{color: "red"}}>{apiErr}</p>}
        <button 
          type='submit' 
        >
          Register
        </button>
      </form>
    </FormProvider>
  )
}

export default SignupForm;