import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../api/client'
import { ArrowLeft, Star, Archive, Trash2 } from 'lucide-react'
import dayjs from 'dayjs'
import DOMPurify from 'dompurify'

export default function EmailDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: email, isLoading } = useQuery({
    queryKey: ['email', id],
    queryFn: () => api.get<any>(`/emails/${id}`),
  })

  if (isLoading) {
    return <div className="p-6">Loading...</div>
  }

  if (!email) {
    return <div className="p-6">Email not found</div>
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-medium flex-1 truncate">{email.subject}</h1>
        <button className="p-2 hover:bg-gray-100 rounded">
          <Star className={`w-5 h-5 ${email.starred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded">
          <Archive className="w-5 h-5 text-gray-400" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded">
          <Trash2 className="w-5 h-5 text-gray-400" />
        </button>
        <div className="w-px h-6 bg-gray-200"></div>
        {email.user?.avatarUrl ? (
          <img src={email.user.avatarUrl} alt="" className="w-8 h-8 rounded-full" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary"></div>
        )}
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-primary font-medium">
            {email.sender?.fromName?.[0] || 'A'}
          </div>
          <div className="flex-1">
            <div className="font-medium">{email.sender?.fromName} <span className="text-gray-500">&lt;{email.sender?.fromEmail}&gt;</span></div>
            <div className="text-sm text-gray-500">to me</div>
          </div>
          <div className="text-sm text-gray-500">
            {email.sentAt ? dayjs(email.sentAt).format('MMM D, h:mm A') : dayjs(email.scheduledAt).format('MMM D, h:mm A')}
          </div>
        </div>
      </div>

      <div 
        className="prose max-w-none mb-6"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(email.bodyHtml) }}
      />

      {email.attachments && email.attachments.length > 0 && (
        <div className="flex gap-4">
          {email.attachments.map((att: any) => (
            <div key={att.id} className="border border-gray-200 rounded-lg overflow-hidden w-48">
              <div className="h-32 bg-gray-100 flex items-center justify-center">
                <img src="/placeholder.png" alt="" className="max-h-full" />
              </div>
              <div className="p-2">
                <div className="text-sm truncate">{att.filename}</div>
                <div className="text-xs text-gray-500">{(att.sizeBytes / 1024 / 1024).toFixed(1)} MB</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
