import { Slot, useRouter, useSegments } from 'expo-router'
import { useEffect, useState } from 'react'
import { AuthProvider, useAuth } from '../provider/AuthProvider'
import  supabase  from '../lib/supabase'

const InitialLayout = () => {
  const { session, initialized } = useAuth()
    const segments = useSegments()
    const router = useRouter()
    const [hasCompletedSurvey, setHasCompletedSurvey] = useState<boolean | null>(null)
    

  useEffect(() => {
    const checkSurveyCompletion = async () => {
      if (session?.user?.id) {
        const { data, error } = await supabase
          .from('profiles')
          .select('hasCompletedSurvey')
          .eq('id', session.user.id)
          .maybeSingle()
        
        if (error) {
          console.error('Error checking survey completion:', error)
          return
        }
        
        setHasCompletedSurvey(data?.hasCompletedSurvey ?? false)
      }
    }

    if (session?.user) {
      checkSurveyCompletion()
    }
  }, [session])

  useEffect(() => {
    if (!initialized || hasCompletedSurvey === null) return

    const inAuthGroup = segments[0] === 'auth'
    const isSetupSurvey = segments[1] === 'setupScreen'
    
    if (session) {
      if (!hasCompletedSurvey && !isSetupSurvey) {
        router.replace('/auth/setupScreen/' as any)
      } else if (!inAuthGroup && !isSetupSurvey) {
        router.replace('/auth/galleryScreen/' as any)
      }
    } else if (!session && !isSetupSurvey) {
      router.replace('/')
    }
  }, [session, initialized, hasCompletedSurvey])

  return <Slot />
}
  
  export default function App() {
    return (
      <AuthProvider>
        <InitialLayout />
      </AuthProvider>
    )
  }