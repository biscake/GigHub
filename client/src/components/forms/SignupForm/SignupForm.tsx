import type { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { FormProvider, useForm, type SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import api from '../../../lib/api';
import { cpasswordValidation, emailValidation, passwordValidation, usernameValidation } from '../../../lib/validators';
import type { ApiErrorResponse, ValidationError } from '../../../types/api';
import { type SignupFormInputs } from '../../../types/form';
import { Input } from '../../Input/Input';

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
        await login({ username: data.username, password: data.password });
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
      <form 
        method='post' 
        noValidate
        onSubmit={methods.handleSubmit(submitCredential)} 
      >
        <Input {...usernameValidation} />
        <Input {...emailValidation}/>
        <Input {...passwordValidation}/>
        <Input {...cpasswordValidation(methods.watch)}/>
        {apiErr && (
          <p style={{ color: 'red' }}>
            {Array.isArray(apiErr)
              ? apiErr.map((err, i) => (
                  <span key={i}>
                    {err.msg}
                    <br />
                  </span>
                ))
              : apiErr}
          </p>
        )}
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