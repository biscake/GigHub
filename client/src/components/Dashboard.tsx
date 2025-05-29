import { Card } from "./Card"
import api from '../lib/api';
import { useEffect, useState } from "react";
import { Spinner } from "./Spinner";
import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '../types/api';
import type { Gig } from "../types/gig";
import { SearchBar } from "./SearchBar";
import { PageSelector } from "./PageSelector";

const Dashboard = () => {
  const [apiErr, setApiErr] = useState<string | null>(null);
  const [gigs, setGigs] = useState<Gig[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  // SetFilters to be done
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    page: 1,
  })

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setApiErr(null);
      try {
        const res = await api.get('/api/gigs', {
          params: {
            category: filters.category,
            search: filters.search,
            page: filters.page
          }
        });

        setTotalPages(res.data.totalPages);
        console.log(res.data.totalPages)
        console.log(res.data.gigs)
        setGigs(res.data.gigs);
      } catch (err) {

        const error = err as AxiosError<ApiErrorResponse>;

        const errorMessage = error.response?.data?.message;

        setApiErr(errorMessage || "Something went wrong. Please try again");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [filters.category, filters.search, filters.page]);

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
          {apiErr && (
            <p className="text-sm text-rose-400">
              {Array.isArray(apiErr)
                ? apiErr.map((err, i) => (
                  <span key={i}>
                    {err.msg}
                  </span>
                ))
                : apiErr}
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4 overflow-y-auto no-scrollbar">
            {gigs && gigs.map(gig => <Card key={gig.id} {...gig} />)}
          </div>
        </>
      )}
      <PageSelector 
        currentPage={ filters.page } 
        totalPages={ totalPages } 
        handlePageChange={ handlePageChange }

      />
    </div>
  )
}

export default Dashboard;