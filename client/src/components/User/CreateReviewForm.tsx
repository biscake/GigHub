import { FormProvider, useForm, type SubmitHandler } from "react-hook-form";
import type { ReviewUserData, UserIdResponse } from "../../types/profile";
import api from "../../lib/api";
import { useIdempotencyKey } from "../../hooks/useIdempotencyKey";
import type { AxiosError } from "axios";
import type { ApiErrorResponse, ValidationError } from "../../types/api";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useGetApi } from "../../hooks/useGetApi";
import { Spinner } from "../Spinner";

const CreateReviewForm = () => {
  const [apiErr, setApiErr] = useState<string | ValidationError[] | null>(null);
  const idempotencyKey = useIdempotencyKey();
  const { username: reviewee } = useParams();

  const { data, error, loading } = useGetApi<UserIdResponse>(`/api/users/${reviewee}`);
  
  const methods = useForm<ReviewUserData>();

  if (!data) {
    return <>{error && <p>{error}</p>}</>
  }

  const handleUserReview: SubmitHandler<ReviewUserData> = async (formData) => {
    try {
      await api.post(`/api/users/${reviewee}/review`, {
        ...formData,
        revieweeId: data.userId
      }, {
        headers: {
          'Idempotency-Key': idempotencyKey.get()
        }
      });

    } catch (e) {
      const err = e as AxiosError<ApiErrorResponse>;
      const errorMessage = err.response?.data?.message;

      setApiErr(errorMessage || "Something went wrong. Please try again");
    } finally {
      idempotencyKey.clear();
    }
  }

  if (loading) {
    return <Spinner />
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-between bg-[#fef8f2] w-full p-5">
      <FormProvider {...methods}>
        <div
          className="flex items-center justify-center min-h-screen px-4"
        >
          <form
            method='post'
            onSubmit={methods.handleSubmit(handleUserReview)}
            className="w-full max-w-sm flex flex-col gap-5 text-center text-sm text-black"
          >
            <textarea {...methods.register("comment")} id="comment"></textarea>
            <input
              type="number"
              id="rating"
              min="1"
              max="5"
              step="1"
              {...methods.register("rating")}
            / >
            <button
              className="w-full justify-center rounded-md bg-gray-200 px-3 py-2 text-sm font-semibold text-black shadow-xs hover:bg-gray-400 sm:ml-3 sm:w-auto cursor-pointer"
            >
              Cancel
            </button>
            <button
              className="w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-green-500 sm:ml-3 sm:w-auto cursor-pointer"
              type="submit"
            >
              Submit
            </button>
            {apiErr && (
              <div className="text-red-600 text-sm">
                {Array.isArray(apiErr)
                  ? apiErr.map((err, i) => <div key={i}>{err.msg}</div>)
                  : apiErr}
              </div>
            )}
          </form>
        </div>
      </FormProvider>
    </div>
  )
}

export default CreateReviewForm;