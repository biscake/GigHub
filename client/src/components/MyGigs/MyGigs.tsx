import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { useState } from 'react';
import type { GigApplication, AppTabProps } from '../../types/application';
import { PageSelector } from '../PageSelector';
import OngoingGigsPanel from './OngoingGigsPanel';
import type { Gig } from '../../types/gig';
import OngoingGigModal from './OngoingGigModal';
import PostedGigPanel from './PostedGigsPanel';
import PostedGigsModal from './PostedGigModal';

const MyGigs = () => {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedGig, setSelectedGig] = useState<Gig | null>(null);
  const [applications, setApplications] = useState<GigApplication[] | null>(null);
  
  const handleChange = (idx: number) => {
    setSelectedIndex(idx);
    setPage(1);
  }

  return (
    <div className='flex flex-col w-full h-full overflow-hidden'>
      <TabGroup selectedIndex={selectedIndex} onChange={handleChange} className="w-full flex flex-col h-full overflow-y-auto no-scrollbar">
        <TabList className="flex justify-center py-6 px-2">
          <AppTab className='rounded-tl-lg rounded-bl-lg' setPage={setPage}>Ongoing Gigs</AppTab>
          <AppTab className='rounded-tr-lg rounded-br-lg' setPage={setPage}>Posted Gigs</AppTab>
        </TabList>
        <TabPanels className="flex-1 flex flex-col scrollbar-minimal overflow-y-auto">
          <TabPanel className="flex flex-col flex-1 w-full justify-center items-center">
            <OngoingGigModal gig={selectedGig} setSelectedGig={setSelectedGig} />
            {selectedIndex === 0 && <OngoingGigsPanel page={page} setTotalPages={setTotalPages} setSelectedGig={setSelectedGig} />}
          </TabPanel>
          <TabPanel className="flex flex-col flex-1 w-full justify-center items-center">
            <PostedGigsModal gig={selectedGig} setSelectedGig={setSelectedGig} applications={applications} setApplications={setApplications}/>
            {selectedIndex === 1 && <PostedGigPanel page={page} setTotalPages={setTotalPages} setSelectedGig={setSelectedGig} setApplications={setApplications} />}
          </TabPanel>
        </TabPanels>
      </TabGroup>
      <PageSelector currentPage={page} totalPages={totalPages} handlePageChange={(next) => setPage(next)} />
    </div>
  )
}

const AppTab = ({ children, className = "", setPage }: AppTabProps) => {
  return (
    <Tab
      className={`bg-[#d5aea6] sm:px-7 px-1 py-2 sm:py-2 text-sm sm:text-lg text-[#fef8f1] font-semibold focus:not-data-focus:outline-none w-[250px]
        data-focus:outline data-focus:outline-white data-hover:bg-[#b58880]/70
        data-selected:bg-[#b58880] data-selected:data-hover:bg-[#b58880]/80 cursor-pointer ${className}`}
      onChange={() => setPage(1)}
    >
      {children}
    </Tab>
  )
}

export default MyGigs;