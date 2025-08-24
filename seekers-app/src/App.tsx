import React, { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { UserProfileView } from './components/UserProfileView'
import { JobSeekerProfileCompletion } from './components/JobSeekerProfileCompletion'
import { JobCard } from './components/JobCard'
import { JobDetailsModal } from './components/JobDetailsModal'

export default function App() {
  const [session, setSession] = useState<any>(null)
  const [jobs, setJobs] = useState<any[]>([])
  const [selectedJob, setSelectedJob] = useState<any | null>(null)
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_e, ses) => setSession(ses))
    return () => { listener?.subscription.unsubscribe() }
  }, [])

  useEffect(() => {
    async function loadJobs() {
      const { data, error } = await supabase.from('job_posts').select('*').eq('status','active').limit(25)
      if (!error) setJobs(data || [])
    }
    loadJobs()
  }, [])

  useEffect(() => {
    async function checkProfile() {
      if (!session?.user) return
      const { data, error } = await supabase.from('user_profiles').select('*').eq('user_id', session.user.id).maybeSingle()
      if (error || !data) setProfileComplete(false)
      else setProfileComplete(true)
    }
    checkProfile()
  }, [session])

  if (!session) {
    return (
      <div className="min-h-screen grid place-items-center text-white bg-neutral-900">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Please sign in to continue</h1>
          <p className="text-white/70">Open the Home app to create an account or log in.</p>
        </div>
      </div>
    )
  }

  if (profileComplete === false) {
    return <JobSeekerProfileCompletion />
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <header className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Seeker</h1>
      </header>
      <main className="max-w-5xl mx-auto px-6 space-y-10">
        <UserProfileView />
        <section>
          <h2 className="text-2xl font-semibold mb-4">Recommended Jobs</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {jobs.map((job) => (
              <JobCard key={job.id} job={{
                id: 0, company: job.company_name || 'Company', position: job.position, location: job.location, salary: job.salary || '', logo: job.company_logo || '/talent book singular icon.png'
              }} onSwipe={() => {}} onCardClick={() => setSelectedJob(job)} />
            ))}
          </div>
        </section>
      </main>
      {selectedJob && <JobDetailsModal job={selectedJob} onClose={() => setSelectedJob(null)} />}
    </div>
  )
}
