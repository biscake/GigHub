import GigApplications from "../components/GigApplications/GigApplications";
import GigApplicationStats from "../components/GigApplications/GigApplicationStats";

const GigApplicationPage = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-between bg-main">
      <div className="flex flex-col w-full sm:pl-15 border-b-2 border-main mt-5">
        <span className="font-bold text-3xl sm:text-6xl w-full sm:p-4 sm:pl-0 text-center sm:text-left sm:self-start overflow-hidden">My Applications</span>
        <GigApplicationStats className="w-full bg-main pb-2" />
      </div>
      <GigApplications />
    </div>
  )
}

export default GigApplicationPage;