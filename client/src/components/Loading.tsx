import { Spinner } from "./Spinner"

export const Loading = () => {
  return (
    <div className="w-full h-full fixed top-0 left-0 bg-[#f8efe5] z-200">
      <Spinner />
    </div>
  )
}
