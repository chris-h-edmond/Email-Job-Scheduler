import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Paperclip, Clock, Upload } from 'lucide-react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import { Button } from '../../components/ui/Button'
import { toast } from 'sonner'

export default function ComposePage() {
  const navigate = useNavigate()
  const [from, setFrom] = useState('')
  const [to, setTo] = useState<string[]>([])
  const [subject, setSubject] = useState('')
  const [delaySeconds, setDelaySeconds] = useState('0')
  const [hourlyLimit, setHourlyLimit] = useState('')
  const [sendLater, setSendLater] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: 'Type Your Reply...',
      }),
    ],
    content: '',
  })

  const handleSchedule = async () => {
    toast.info('Schedule functionality coming soon')
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-medium flex-1">Compose New Email</h1>
        <button className="p-2 hover:bg-gray-100 rounded relative">
          <Paperclip className="w-5 h-5 text-gray-600" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded">
          <Clock className="w-5 h-5 text-gray-600" />
        </button>
        <Button onClick={handleSchedule} variant="outline">
          {sendLater ? 'Send Later' : 'Send'}
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4 pb-2 border-b border-gray-200">
          <span className="w-16 text-sm text-gray-600">From</span>
          <select 
            value={from} 
            onChange={(e) => setFrom(e.target.value)}
            className="flex-1 px-3 py-1 bg-gray-50 border border-gray-200 rounded"
          >
            <option value="">oliver.brown@domain.io</option>
          </select>
        </div>

        <div className="flex items-center gap-4 pb-2 border-b border-gray-200">
          <span className="w-16 text-sm text-gray-600">To</span>
          <div className="flex-1 flex items-center gap-2">
            <input
              type="text"
              placeholder="recipient@example.com"
              className="flex-1 px-2 py-1 outline-none"
            />
            <button className="flex items-center gap-1 text-primary text-sm">
              <Upload className="w-4 h-4" />
              Upload List
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 pb-2 border-b border-gray-200">
          <span className="w-16 text-sm text-gray-600">Subject</span>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
            className="flex-1 px-2 py-1 outline-none"
          />
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Delay between 2 emails</span>
            <input
              type="number"
              value={delaySeconds}
              onChange={(e) => setDelaySeconds(e.target.value)}
              className="w-12 px-2 py-1 border border-gray-200 rounded text-center"
              placeholder="00"
            />
            <span className="text-sm text-gray-500">seconds</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Hourly Limit</span>
            <input
              type="number"
              value={hourlyLimit}
              onChange={(e) => setHourlyLimit(e.target.value)}
              className="w-12 px-2 py-1 border border-gray-200 rounded text-center"
              placeholder="00"
            />
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="flex items-center gap-1 p-2 bg-gray-50 border-b border-gray-200 flex-wrap">
            <button className="p-1 hover:bg-gray-200 rounded">↶</button>
            <button className="p-1 hover:bg-gray-200 rounded">↷</button>
            <div className="w-px h-6 bg-gray-300 mx-1"></div>
            <select className="px-2 py-1 text-sm border border-gray-200 rounded">
              <option>TT</option>
            </select>
            <button className="p-1 hover:bg-gray-200 rounded font-bold">B</button>
            <button className="p-1 hover:bg-gray-200 rounded italic">I</button>
            <button className="p-1 hover:bg-gray-200 rounded underline">U</button>
            <button className="p-1 hover:bg-gray-200 rounded">≡</button>
            <button className="p-1 hover:bg-gray-200 rounded">•</button>
            <button className="p-1 hover:bg-gray-200 rounded">1.</button>
            <button className="p-1 hover:bg-gray-200 rounded">«</button>
            <button className="p-1 hover:bg-gray-200 rounded">»</button>
            <button className="p-1 hover:bg-gray-200 rounded">"</button>
            <button className="p-1 hover:bg-gray-200 rounded">S̶</button>
          </div>
          <EditorContent editor={editor} className="min-h-[200px]" />
        </div>
      </div>
    </div>
  )
}
