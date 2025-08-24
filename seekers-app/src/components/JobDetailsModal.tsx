import React, { useState, useEffect } from 'react'
import { Modal } from './ui/modal'
import { Button } from './ui/button'
import { MapPin, DollarSign, ExternalLink, Bookmark, BookmarkCheck, Building2, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface Job {
  id: string;
  company_name: string;
  company_logo: string | null;
  position: string;
  location: string;
  salary: string | null;
  job_type: string | null;
  experience_level: string | null;
  short_description: string | null;
  requirements: string | null;
  skills: string[] | null;
  application_link: string | null;
  is_remote: boolean | null;
  status: string | null;
  created_at: string;
}

interface JobDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  job: Job | null
  userId: string | null
}

export function JobDetailsModal({ isOpen, onClose, job, userId }: JobDetailsModalProps) {
  const [isSaved, setIsSaved] = useState(false)
  const [savingLoading, setSavingLoading] = useState(false)
  const [checkingLoading, setCheckingLoading] = useState(false)

  // Check if job is already saved when modal opens
  useEffect(() => {
    if (isOpen && job && userId) {
      checkIfJobSaved()
    }
  }, [isOpen, job, userId])

  const checkIfJobSaved = async () => {
    if (!job || !userId) return
    
    setCheckingLoading(true)
    try {
      const { data, error } = await supabase
        .from('saved_jobs')
        .select('id')
        .eq('user_id', userId)
        .eq('job_id', job.id)
        .maybeSingle()

      if (error) {
        console.error('Error checking saved job:', error)
      } else {
        setIsSaved(!!data)
      }
    } catch (error) {
      console.error('Error checking saved job:', error)
    } finally {
      setCheckingLoading(false)
    }
  }

  const handleSaveJob = async () => {
    if (!job || !userId) return

    setSavingLoading(true)
    try {
      const { error } = await supabase
        .from('saved_jobs')
        .insert({
          user_id: userId,
          job_id: job.id
        })

      if (error) {
        console.error('Error saving job:', error)
      } else {
        setIsSaved(true)
      }
    } catch (error) {
      console.error('Error saving job:', error)
    } finally {
      setSavingLoading(false)
    }
  }

  const handleUnsaveJob = async () => {
    if (!job || !userId) return

    setSavingLoading(true)
    try {
      const { error } = await supabase
        .from('saved_jobs')
        .delete()
        .eq('user_id', userId)
        .eq('job_id', job.id)

      if (error) {
        console.error('Error unsaving job:', error)
      } else {
        setIsSaved(false)
      }
    } catch (error) {
      console.error('Error unsaving job:', error)
    } finally {
      setSavingLoading(false)
    }
  }

  const handleApply = () => {
    if (job?.application_link) {
      window.open(job.application_link, '_blank')
    }
  }

  if (!job) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="bg-gradient-to-br from-neutral-800 via-neutral-900 to-neutral-800 border border-white/20 max-w-2xl">
      <div className="p-8">
        {/* Header */}
        <div className="flex items-start space-x-6 mb-8">
          {/* Company Logo */}
          <div className="flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center overflow-hidden">
              {job.company_logo ? (
                <img 
                  src={job.company_logo} 
                  alt={`${job.company_name} logo`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building2 className="w-8 h-8 text-white/60" />
              )}
            </div>
          </div>

          {/* Job Info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-white mb-2 font-poppins">
              {job.position}
            </h2>
            <p className="text-[#FFC107] text-lg font-semibold mb-3">
              {job.company_name}
            </p>
            
            {/* Job Details */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-300">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{job.location}</span>
                {job.is_remote && <span className="ml-1 text-green-400">(Remote)</span>}
              </div>
              {job.salary && (
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-1" />
                  <span>{job.salary}</span>
                </div>
              )}
              {job.job_type && (
                <div className="bg-white/10 px-2 py-1 rounded-md">
                  <span>{job.job_type}</span>
                </div>
              )}
              {job.experience_level && (
                <div className="bg-white/10 px-2 py-1 rounded-md">
                  <span>{job.experience_level}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {job.short_description && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Job Description</h3>
            <p className="text-gray-300 leading-relaxed">
              {job.short_description}
            </p>
          </div>
        )}

        {/* Requirements */}
        {job.requirements && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Requirements</h3>
            <div className="text-gray-300 leading-relaxed whitespace-pre-line">
              {job.requirements}
            </div>
          </div>
        )}

        {/* Skills */}
        {job.skills && job.skills.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-3">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-gradient-to-r from-red-600/20 to-red-700/20 border border-red-600/40 text-red-300 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Apply Button */}
          <Button
            onClick={handleApply}
            disabled={!job.application_link}
            className="flex-1 bg-[#FFC107] hover:bg-[#FFB300] text-black py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-[#FFC107]/25 flex items-center justify-center space-x-2"
          >
            <ExternalLink className="w-5 h-5" />
            <span>Apply Now</span>
          </Button>

          {/* Save Job Button */}
          <Button
            onClick={isSaved ? handleUnsaveJob : handleSaveJob}
            disabled={savingLoading || checkingLoading || !userId}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
              isSaved
                ? 'bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-600/40'
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
            }`}
          >
            {savingLoading || checkingLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isSaved ? (
              <BookmarkCheck className="w-5 h-5" />
            ) : (
              <Bookmark className="w-5 h-5" />
            )}
            <span>
              {savingLoading ? 'Saving...' : isSaved ? 'Saved' : 'Save Job'}
            </span>
          </Button>
        </div>

        {!userId && (
          <p className="text-center text-gray-400 text-sm mt-4">
            Please log in to save jobs and apply
          </p>
        )}
      </div>
    </Modal>
  )
}