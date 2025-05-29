import { useMemo, useState } from "react";
import { useGetApi } from "../hooks/useGetApi";
import type { GigsResponse } from "../types/gig";
import { Card } from "./Card";
import { PageSelector } from "./PageSelector";
import { SearchBar } from "./SearchBar";
import { Spinner } from "./Spinner";

const Dashboard = () => {
  const [filters, setFilters] = useState({
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
    <div className="w-full h-full md:ml-[20vw] md:w-[80vw] flex flex-col items-center justify-between h-screen text-white">
      <SearchBar placeholder="Search All Gigs" handleSearch={handleSearchChange} />
      {loading ? <Spinner /> : (
        <>
          {error && (
            <p className="text-sm text-rose-400">
              {error}
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4 overflow-y-auto no-scrollbar flex-1">
            {data?.gigs && data.gigs.length > 0 ? (
              data.gigs.map(gig => <Card key={gig.id} {...gig} />)
            ) : (
              !error && (
                <div className="col-span-full text-center text-gray-400">
                  <p>No gigs found</p>
                </div>
              )
            )}
          </div>
        </>
      )}
      <PageSelector 
        currentPage={ filters.page } 
        totalPages={ data?.totalPages ?? 1} 
        handlePageChange={ handlePageChange }
      />
    </div>
  )
}

export default Dashboard;