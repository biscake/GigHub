import GigApplications from "../components/GigApplications/GigApplications";
import GigApplicationStats from "../components/GigApplications/GigApplicationStats";

const GigApplicationPage = () => {
  return (
    <div className="w-full h-full md:ml-[20vw] md:w-[80vw] flex flex-col items-center justify-between h-screen text-white">
      <GigApplicationStats className="h-[15%] w-full bg-gray-700/40 border-b-2 border-gray-700" />
      <GigApplications />
    </div>
  )
}

export default GigApplicationPage;