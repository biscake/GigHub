import type { AxiosError } from 'axios';
import { useState } from 'react';
import { FormProvider, useForm, type SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import api from '../../../lib/api';
import { cpasswordValidation, emailValidation, passwordValidation, usernameValidation } from '../../../lib/validators';
import { type SignupFormInputs } from '../../../types/form';
import { Input } from '../../Input/Input';

const SignupForm = () => {
  const [apiErr, setApiErr] = useState<string | null>(null);

  const methods = useForm<SignupFormInputs>({ mode: 'onChange' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const submitCredential: SubmitHandler<SignupFormInputs> = async (data) => {
    try {
      const res = await api.post('/api/register', data, { headers: { 'Content-Type': 'application/json' } });

      if (res.data.success) {
        await login({ username: data.username, password: data.password });
        navigate('/');
      } else {
        setApiErr(res.data.message);
      }
    } catch (err) {
      const error = err as AxiosError;
      setApiErr(error && "Something went wrong. Please try again");
    }

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