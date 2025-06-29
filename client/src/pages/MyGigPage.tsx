import MyGigs from "../components/MyGigs/MyGigs";

const MyGigsPage = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-between bg-main">
      <div className="flex flex-col w-full sm:pl-15 border-b-2 border-main mt-5">
        <span className="font-bold text-3xl sm:text-6xl w-full sm:p-4 sm:pl-0 text-center sm:text-left sm:self-start overflow-hidden">My Gigs</span>
      </div>
      <MyGigs />
    </div>
  )
}

export default MyGigsPage;