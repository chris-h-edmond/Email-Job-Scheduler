import { useQuery } from '@tanstack/react-query'
import { api } from '../../api/client'

interface User {
  id: string
  name: string
  email: string
  avatarUrl: string | null
}

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        const response = await api.get<User>('/auth/me')
        return response
      } catch {
        return null
      }
    },
    retry: false,
  })

  return {
    user,
    isLoading,
  }
}
