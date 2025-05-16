import { type RegisterOptions, type UseFormWatch } from "react-hook-form";
import { type SignupFormInputs } from "../types/form";

export type InputValidation = {
  name: string;
  type: string;
  id: string;
  placeholder: string;
  autocomplete?: string;
  validation: RegisterOptions;
}

export const usernameValidation : InputValidation = {
  name: "username",
  type: "username",
  id: "username", 
  placeholder: "Username",
  validation: {
    required: {
      value: true,
      message: "Required"
    },
    pattern: {
      value: /^[a-zA-Z0-9]+$/,
      message: "Invalid username"
    },
    minLength: {
      value: 4,
      message: "Username too short"
    },
  }
}

export const passwordValidation : InputValidation = {
  name: 'password',
  type: 'password', 
  id: 'password',
  placeholder: 'Password',
  autocomplete: 'on',
  validation: {
    required: {
      value: true,
      message: 'Required',
    },
    minLength: {
      value: 8,
      message: 'Password is too short'
    },
    pattern: {
      value: /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,16}$/,
      message: 'Invalid password'
    }
  }
}

export const cpasswordValidation = (watch: UseFormWatch<SignupFormInputs>) => ({
  name: 'cpassword',
  type: 'password', 
  id: 'cpassword',
  placeholder: 'Confirm password',
  autocomplete: 'on',
  validation: {
    required: {
      value: true,
      message: 'Required',
    },
    validate: (val: string) => {
      return watch('password') === val || "Password does not match"
    }
  }
})

export const emailValidation = {
  name: 'email',
  type: 'text',
  id: 'email',
  placeholder: 'email',
  validation: {
    required: {
      value: true,
      message: "Required"
    },
    pattern: {
      value: /^((?!\.)[\w\-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/,
      message: "Invalid email"
    }
  }
}