import { FormProvider } from 'react-hook-form';
import type { CreateGigFormProps } from '../../types/form';
import { FormInput } from './FormInput';
import { Textarea } from './Textarea';
import { UploadFile } from './UploadFile';

const CreateGigForm: React.FC<CreateGigFormProps> = ({ apiErr, methods, image, setImage, setCroppedImage }) => {
  return (
    <FormProvider {...methods}>
      <form
        method='post'
        noValidate
        className="w-full flex flex-col gap-5 text-center text-sm py-10 bg-white p-5 -mt-4"
      >
        <UploadFile
          register={methods.register}
          name="file"
          id="file"
          image={image}
          setImage={setImage}
          setCroppedImage={setCroppedImage}
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
        <Textarea register={methods.register} name="description" id="description"/>
        
        {apiErr && (
          <p className="text-sm text-rose-400 flex flex-col">
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
