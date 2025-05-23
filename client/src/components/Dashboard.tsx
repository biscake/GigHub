import { Card } from "./Card"
import api from '../lib/api';
import { useEffect, useState } from "react";
import { Loading } from "./Loading";
import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '../types/api';
import type { Gig } from "../types/gig";

export const Dashboard = () => {
  const [apiErr, setApiErr] = useState<string | null>(null);
  const [gigs, setGigs] = useState<Gig[] | null>(null);
  const [loading, setLoading] = useState(true);
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

  return (
    <div className="w-full md:ml-[20vw] md:w-[80vw] bg-black h-screen text-white overflow-y-auto no-scrollbar">
      {loading ? <Loading /> : (
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
            {gigs && gigs.map(gig => <Card key={gig.id} {...gig} />)}
          </div>
        </>
      )}


    </div>
  )
}