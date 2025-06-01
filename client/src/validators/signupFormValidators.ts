import { type Path, type UseFormWatch } from "react-hook-form";
import type { hasPasswordField, InputValidation } from "../types/validators";

export const usernameValidation : InputValidation = {
  name: "username",
  type: "text",
  id: "username", 
  placeholder: "Username",
  validation: {
    required: {
      value: true,
      message: "Username Required"
    },
    pattern: {
      value: /^[a-zA-Z0-9]+$/,
      message: "Invalid username"
    },
    minLength: {
      value: 4,
      message: "Username is too short"
    },
  }
}

export const passwordValidation : InputValidation = {
  name: 'password',
  type: 'password', 
  id: 'password',
  placeholder: 'Password',
  autoComplete: 'on',
  validation: {
    required: {
      value: true,
      message: 'Password Required',
    },
    minLength: {
      value: 8,
      message: 'Password is too short'
    },
    pattern: {
      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,16}$/,
      message: 'Invalid password'
    }
  }
}

const passwordField = 'password'

export const cpasswordValidation = <T extends hasPasswordField>(watch: UseFormWatch<T>) => ({
  name: 'cpassword',
  type: 'password', 
  id: 'cpassword',
  placeholder: 'Confirm password',
  autoComplete: 'on',
  validation: {
    required: {
      value: true,
      message: 'Please confirm your password',
    },
    validate: (val: string) => {
      const password = watch(passwordField as Path<T>);
        return password === val || 'Password does not match';
    }
  }
})

export const emailValidation = {
  name: 'email',
  type: 'text',
  id: 'email',
  placeholder: 'Email',
  validation: {
    required: {
      value: true,
      message: "Email Required"
    },
    pattern: {
      value: /^((?!\.)[\w\-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/,
      message: "Invalid email"
    }
  }
}