import { TabPanel } from "@headlessui/react"
import type { ReactNode } from "react";
import { Spinner } from "../Spinner";

const ApplicationPanel = ({ children, title, loading, error }: { children: ReactNode; title: string; loading: boolean; error: string | null; }) => {
  if (error) {
    return (
      <p className="text-s text-rose-400 self-center my-auto">
        {error}
      </p>
    )
  }

  if (loading) {
    return <Spinner />
  }

  return (
    <TabPanel className="px-8 pb-6">
      <div className="font-bold text-xl sm:text-3xl w-full p-4 pl-0 pt-0">{title}</div>
      <ul className="flex flex-col gap-3">
        {children}
      </ul>
    </TabPanel>
  )
}

export default ApplicationPanel;