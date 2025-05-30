import { TabPanel } from "@headlessui/react"
import type { ReactNode } from "react";

const ApplicationPanel = ({ children, title }: { children: ReactNode; title: string; }) => {
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