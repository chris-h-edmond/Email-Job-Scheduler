import { NavLink, useNavigate } from 'react-router-dom'
import { Clock, Send, Plus } from 'lucide-react'
import { useAuth } from '../../features/auth/useAuth'
import UserCard from './UserCard'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../api/client'

export default function Sidebar() {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const { data: counts } = useQuery({
    queryKey: ['email-counts'],
    queryFn: () => api.get<{ scheduled: number; sent: number }>('/emails/counts'),
    refetchInterval: 10000,
  })

  return (
    <div className="w-[280px] border-r border-gray-200 flex flex-col h-full">
      <div className="p-4">
        <div className="text-2xl font-pixel font-bold mb-6">ONB</div>
        <UserCard user={user} />
      </div>
      
      <div className="px-4 mb-4">
        <button
          onClick={() => navigate('/compose')}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-primary text-primary rounded-pill hover:bg-primary-50"
        >
          <Plus className="w-4 h-4" />
          Compose
        </button>
      </div>
      
      <div className="px-4 mb-2">
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">CORE</div>
      </div>
      
      <nav className="flex-1 px-2">
        <NavLink
          to="/scheduled"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg mb-1 ${
              isActive ? 'bg-primary-50 text-gray-900 font-medium' : 'text-gray-700 hover:bg-gray-50'
            }`
          }
        >
          <Clock className="w-5 h-5" />
          <span className="flex-1">Scheduled</span>
          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-pill">{counts?.scheduled || 0}</span>
        </NavLink>
        <NavLink
          to="/sent"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg ${
              isActive ? 'bg-primary-50 text-gray-900 font-medium' : 'text-gray-700 hover:bg-gray-50'
            }`
          }
        >
          <Send className="w-5 h-5" />
          <span className="flex-1">Sent</span>
          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-pill">{counts?.sent || 0}</span>
        </NavLink>
      </nav>
    </div>
  )
}
