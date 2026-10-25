import { useState } from 'react'
import { Search, Filter, RefreshCw } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../api/client'
import EmailRow from './EmailRow'

interface EmailListPageProps {
  tab: 'scheduled' | 'sent'
}

export default function EmailListPage({ tab }: EmailListPageProps) {
  const [search, setSearch] = useState('')

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['emails', tab, search],
    queryFn: () => api.get<{ items: any[]; total: number }>(`/emails?tab=${tab}&q=${search}`),
    refetchInterval: 5000,
  })

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-pill"
          />
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-lg">
          <Filter className="w-5 h-5 text-gray-600" />
        </button>
        <button onClick={() => refetch()} className="p-2 hover:bg-gray-100 rounded-lg">
          <RefreshCw className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-14 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      ) : data?.items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No {tab} emails</p>
          {tab === 'scheduled' && (
            <button
              onClick={() => window.location.href = '/compose'}
              className="text-primary hover:underline"
            >
              Compose your first email
            </button>
          )}
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
          {data?.items.map((email) => (
            <EmailRow key={email.id} email={email} tab={tab} />
          ))}
        </div>
      )}
    </div>
  )
}
