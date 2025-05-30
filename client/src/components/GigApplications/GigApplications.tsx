import { Tab, TabGroup, TabList, TabPanels } from '@headlessui/react';
import type { ReactNode } from 'react';
import ReceivedApplicationsPanel from './ReceivedApplicationsPanel';
import SentApplicationsPanel from './SentApplicationsPanel';

const GigApplications = () => {
  return (
    <TabGroup defaultIndex={0} className="w-full flex flex-col h-full overflow-y-auto no-scrollbar ">
      <TabList className="flex justify-center py-6 px-2">
        <AppTab className='rounded-tl-lg rounded-bl-lg'>Received Applications</AppTab>
        <AppTab className='rounded-tr-lg rounded-br-lg'>Sent Applications</AppTab>
      </TabList>
      <TabPanels className="flex-1 flex flex-col">
        <ReceivedApplicationsPanel />
        <SentApplicationsPanel />
      </TabPanels>
    </TabGroup>
  )
}

const AppTab = ({ children, className = "" }: { children: ReactNode; className?: string; }) => {
  return (
    <Tab className={`bg-[#d5aea6] sm:px-7 px-1 py-2 sm:py-2 text-sm sm:text-lg text-[#fef8f1] font-semibold focus:not-data-focus:outline-none w-[250px]
    data-focus:outline data-focus:outline-white data-hover:bg-[#b58880]/70
    data-selected:bg-[#b58880] data-selected:data-hover:bg-[#b58880]/80 cursor-pointer ${className}`}>
      {children}
    </Tab>
  )
}

export default GigApplications;