import { Clock, Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'

interface EmailRowProps {
  email: any
  tab: 'scheduled' | 'sent'
}

export default function EmailRow({ email, tab }: EmailRowProps) {
  const navigate = useNavigate()

  const timeStr = tab === 'scheduled' 
    ? dayjs(email.scheduledAt).format('ddd h:mm:ss A')
    : dayjs(email.sentAt).format('MMM D, h:mm:ss A')

  return (
    <div
      onClick={() => navigate(`/emails/${email.id}`)}
      className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer"
    >
      <div className="w-32 text-sm text-gray-900 truncate">
        To: {email.toEmail}
      </div>
      
      {tab === 'scheduled' ? (
        <div className="flex items-center gap-1 px-2 py-1 bg-scheduled-bg border border-scheduled-border text-scheduled-text rounded-pill text-xs">
          <Clock className="w-3 h-3" />
          {timeStr}
        </div>
      ) : (
        <span className={`px-2 py-1 rounded-pill text-xs border ${
          email.status === 'failed' 
            ? 'bg-failed-bg border-failed-border text-failed-text'
            : 'bg-sent-bg border-sent-border text-sent-text'
        }`}>
          {email.status === 'failed' ? 'Failed' : 'Sent'}
        </span>
      )}
      
      <div className="flex-1 min-w-0">
        <span className="font-medium text-gray-900">{email.subject}</span>
        <span className="text-gray-500"> - {email.preview}</span>
      </div>
      
      <button
        onClick={(e) => {
          e.stopPropagation()
        }}
        className="p-1 hover:bg-gray-200 rounded"
      >
        <Star className={`w-4 h-4 ${email.starred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
      </button>
    </div>
  )
}
