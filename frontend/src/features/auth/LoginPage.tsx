import { Button } from '../../components/ui/Button'
import { toast } from 'sonner'

export default function LoginPage() {
  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google'
  }

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault()
    toast.info("Email/password sign-in isn't enabled in this build. Please use Google.")
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-md p-8 border border-gray-200 rounded-[10px]">
        <h1 className="text-[28px] font-bold mb-6">Login</h1>
        
        <Button onClick={handleGoogleLogin} className="w-full mb-4 bg-[#E6F4EA] text-gray-900 hover:bg-[#CCEBDA] border-0" variant="outline">
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Login with Google
        </Button>
        
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">or sign up through email</span>
          </div>
        </div>
        
        <form onSubmit={handleEmailLogin}>
          <input
            type="email"
            placeholder="Email ID"
            className="w-full px-4 py-2 mb-3 border border-gray-200 rounded-lg bg-gray-50"
            disabled
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 mb-4 border border-gray-200 rounded-lg bg-gray-50"
            disabled
          />
          <Button type="submit" className="w-full">Login</Button>
        </form>
      </div>
    </div>
  )
}
