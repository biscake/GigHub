import { Card } from "./Card"

export const Dashboard = () => {
  return (
    <div className="w-full md:ml-[20vw] md:w-[80vw] bg-black h-screen border border-red-200 text-white">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
        <Card />
        <Card />
        <Card />
      </div>
    </div>
  )
}