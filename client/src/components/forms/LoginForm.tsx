import { useEffect, useState } from 'react';
import { FormProvider, useForm, type SubmitHandler } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { type LoginFormInputs } from '../../types/form';
import { Checkbox } from '../Checkbox';
import { FormInput } from './FormInput';

const LoginForm = () => {
  const { login, user } = useAuth();
  const [apiErr, setApiErr] = useState<string | null>(null);

  const methods = useForm<LoginFormInputs>();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate])

  const submitCredential: SubmitHandler<LoginFormInputs> = async (data) => {
    const result = await login(data);

    if (!result.success && result.error) {
      setApiErr(result.error);
    } else {
      navigate('/');
    }
  }

  return (
    <FormProvider { ...methods }> 
      <div 
        className="flex items-center justify-center min-h-screen px-4 text-white"
      >
        <form
          method='post' 
          onSubmit={methods.handleSubmit(submitCredential)} 
          className="w-full max-w-sm flex flex-col gap-5 text-center text-sm border border-gray-200 shadow-lg rounded-2xl px-8 py-10 backdrop-blur-sm"
        >
          <div className="font-bold text-3xl">Log in</div>
          <FormInput
            name="username"
            id="username"
            type="text"
            placeholder="Username"
          />
          <FormInput
            name="password"
            id="password"
            type="password"
            placeholder="Password"
            autoComplete="on"
          />
          <div className="flex flex-row items-center justify-between w-full">
            <Checkbox
              name="rememberMe"
              id="rememberMe"
              type="checkbox"
              className="accent-pink-400 cursor-pointer align-middle mx-1"
              text="Remember me"
            />
            <Link to="/accounts/request-reset" className="text-sm align-middle h-fit">Forgot password?</Link>
          </div>
          {apiErr && <p className="text-sm text-rose-400">{apiErr}</p>}
          <button 
            type='submit'
            className="text-xl border border-gray-300 rounded-3xl px-4 py-2 focus:outline-none cursor-pointer"
          >
            Log in
          </button>
          <div className="text-sm">
            <span>Don't have an account? </span>
            <Link className="font-bold :hover" to="/accounts/signup">Register</Link>
          </div>
        </form>
      </div>
    </FormProvider>
  )
}

export default LoginForm;