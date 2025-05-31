import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react"
import type { ReactNode } from "react";

const ApplicationDisclosureContainer = ({ title, children }: { title: string; children: ReactNode }) => {
  return (
      <Disclosure as="div" className="rounded-xl shadow-sm border-1 border-main max-w-full" defaultOpen={false}>
        <DisclosureButton className="w-full flex cursor-pointer text-2xl overflow-hidden">
          <div className="text-left text-lg sm:text-3xl font-semibold p-4">{title}</div>
        </DisclosureButton>
        <DisclosurePanel className="flex flex-col gap-4 p-4 pt-0">
          {children}
        </DisclosurePanel>
      </Disclosure>
  )
}

export default ApplicationDisclosureContainer;