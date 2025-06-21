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
    <div className="flex flex-col items-center justify-center bg-main w-full pt-5">
      <FormProvider {...methods}>
        <div
          className="flex flex-col items-center justify-center w-full p-5 rounded-xl border-[0.5px] border-gray-200 shadow-xs"
        >
          <form
            method='post'
            onSubmit={methods.handleSubmit(handleUserReview)}
            className="w-full max-w-sm flex flex-col gap-5 items-center text-center text-sm text-black"
          >
            <h2 className="text-2xl font-semibold text-center text-main">Leave a review: </h2>
            <textarea 
              {...methods.register("comment")} 
              id="comment"
              className="w-full min-h-[100px] resize-none rounded-xl border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-main"
            / >
            <input
              type="number"
              id="rating"
              min="1"
              max="5"
              step="1"
              {...methods.register("rating")}
              className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-main"
            / >
            <button
              className="w-1/4 rounded-md bg-gray-200 py-2 text-sm font-medium text-black hover:bg-gray-300 cursor-pointer"
            >
              Cancel
            </button>
            <button
              className="w-1/4 rounded-md bg-green-600 py-2 text-sm font-medium text-white hover:bg-green-500 cursor-pointer"
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