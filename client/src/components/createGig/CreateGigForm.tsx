import { FormProvider, useFormContext, type FieldError } from 'react-hook-form';
import type { CreateGigFormProps } from '../../types/form';
import type { InputProps } from '../../types/inputProps';
import { descriptionValidator, priceValidation, titleValidation } from '../../validators/createGigValidators';
import { Textarea } from '../Textarea';
import { UploadFile } from './UploadFile';

const CreateGigForm: React.FC<CreateGigFormProps> = ({ apiErr, methods, image, setImage, setCroppedImagePixels }) => {
  return (
    <FormProvider {...methods}>
      <form
        method='post'
        noValidate
        className="w-full flex flex-col text-center text-sm bg-white"
      >
        <UploadFile
          register={methods.register}
          name="file"
          id="file"
          image={image}
          setImage={setImage}
          setCroppedImagePixels={setCroppedImagePixels}
        />

        <div className='p-5 flex flex-col gap-1'>
          <FormInput {...titleValidation} />
          <FormInput {...priceValidation} />
          <Textarea {...descriptionValidator}/>
        </div>
        
        {apiErr && (
          <p className="text-sm text-rose-400 flex flex-col mb-4">
            {Array.isArray(apiErr)
              ? apiErr.map((err, i) => (
                  <span key={i}>
                    {err.msg}
                  </span>
                ))
              : apiErr}
          </p>
        )}
      </form>
    </FormProvider>
  )
}

export const FormInput: React.FC<InputProps> = (props) => {
  const { register, formState: { errors } } = useFormContext();

  const inputError = errors[props.name] as FieldError | undefined;

  return (
    <div className='relative'>
      <label className="flex flex-row">
        <input
          {...props}
          {...(props.className 
            ? { className: props.className } 
            : { className: "autofill:shadow-[inset_0_0_0px_1000px_rgb(255,209,220)] w-full border border-gray-300 rounded-3xl px-4 py-2 focus:outline-none focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-40"})}
          {...register(props.name, props.validation)}
        />
      </label>
        <div className="text-rose-400 text-xs min-h-[1lh]">
          {inputError?.message}
        </div>
    </div>
  )
}


export default CreateGigForm;
