import { useMemo, useState } from "react";
import { useGetApi } from "../../hooks/useGetApi";
import type { GigFilters, GigsResponse } from "../../types/gig";
import { PageSelector } from "../PageSelector";
import { SearchBar } from "./SearchBar";
import DashboardGigs from "./DashboardGigs";

const Dashboard = () => {
  const [filters, setFilters] = useState<GigFilters>({
    category: '',
    search: '',
    page: 1,
  })

  const apiOptions = useMemo(() => ({
    params: {
      category: filters.category,
      search: filters.search,
      page: filters.page
    }
  }), [filters.category, filters.search, filters.page]);

  const { data, error, loading } = useGetApi<GigsResponse>('/api/gigs', apiOptions)

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({
      category: prev.category,
      search: value,
      page: 1
    }));
  }

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({
      category: prev.category,
      search: prev.search,
      page: newPage
    }));
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-between bg-[#fef8f2] w-full">
      <SearchBar placeholder="Search All Gigs" handleSearch={handleSearchChange} />
      <DashboardGigs gigs={data?.gigs} loading={loading} error={error} />
      <PageSelector 
        currentPage={ filters.page } 
        totalPages={ data?.totalPages ?? 1} 
        handlePageChange={ handlePageChange }
      />
    </div>
  )
}

export default Dashboard;