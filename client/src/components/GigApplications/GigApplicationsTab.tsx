import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import SentApplicationsPanel from './SentApplicationsPanel';
import type { ReactNode } from 'react';

const GigApplicationsTab = () => {
  return (
    <TabGroup defaultIndex={0} className="flex flex-col h-full mt-2">
      <TabList className="w-full flex justify-center gap-7">
        <AppTab>My Applications</AppTab>
        <AppTab>Received Applications</AppTab>
      </TabList>
      <TabPanels className="flex-1 h-full flex flex-col">
        <SentApplicationsPanel />
        <TabPanel>
          {/* <ReceivedApplicationsPanel /> */}
        </TabPanel>
      </TabPanels>
    </TabGroup>
  )
}

const AppTab = ({ children }: { children: ReactNode }) => {
  return (
    <Tab className="rounded-full px-3 py-1 text-sm/6 font-semibold text-white focus:not-data-focus:outline-none 
    data-focus:outline data-focus:outline-white data-hover:bg-white/5
    data-selected:bg-white/10 data-selected:data-hover:bg-white/10 cursor-pointer">
      {children}
    </Tab>
  )
}

export default GigApplicationsTab;