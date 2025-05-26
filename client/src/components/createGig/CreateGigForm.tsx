import { FormProvider } from 'react-hook-form';
import type { CreateGigFormProps } from '../../types/form';
import { descriptionValidator, priceValidation, titleValidation } from '../../validators/createGigValidators';
import { FormInput } from '../forms/FormInput';
import { Textarea } from './Textarea';
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

        <div className='p-5 flex flex-col gap-5'>
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

export default CreateGigForm;
