import { ChevronDown, LogOut, MessageSquare, ExternalLink } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { api } from '../../api/client'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface UserCardProps {
  user: any
}

export default function UserCard({ user }: UserCardProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout')
      queryClient.clear()
      navigate('/login')
      toast.success('Logged out')
    } catch {
      toast.error('Logout failed')
    }
  }

  if (!user) return null

  const initials = user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-medium">
              {initials}
            </div>
          )}
          <div className="flex-1 text-left min-w-0">
            <div className="text-sm font-medium truncate">{user.name}</div>
            <div className="text-xs text-gray-500 truncate">{user.email}</div>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </button>
      </DropdownMenu.Trigger>
      
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-1" align="start">
          <DropdownMenu.Item 
            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 rounded cursor-pointer"
            onClick={() => toast.info('Slack integration coming soon')}
          >
            <MessageSquare className="w-4 h-4" />
            Connect Slack
          </DropdownMenu.Item>
          <DropdownMenu.Item 
            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 rounded cursor-pointer"
            onClick={() => window.open('/admin/queues', '_blank')}
          >
            <ExternalLink className="w-4 h-4" />
            Queue dashboard
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />
          <DropdownMenu.Item 
            className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded cursor-pointer"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
