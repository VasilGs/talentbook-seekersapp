import React, { useState, useEffect } from 'react'
import { Modal } from './ui/modal'
import { Button } from './ui/button'
import { 
  Bookmark, 
  MapPin, 
  DollarSign, 
  Clock, 
  Building2, 
  Eye, 
  BookmarkX,
  Loader2,
  Search,
  Calendar,
  ExternalLink
} from 'lucide-react'
import { supabase } from '../lib/supabase'

interface SavedJob {
  id: string
  created_at: string
  job_post: {
    id: string
    company_name: string
    company_logo: string | null
    position: string
    location: string
    salary: string | null
    job_type: string | null
    experience_level: string | null
    short_description: string | null
    is_remote: boolean | null
    application_link: string | null
    created_at: string
  }
}

interface SavedJobsModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  onViewJobDetails: (job: any) => void
}

export function SavedJobsModal({ isOpen, onClose, userId, onViewJobDetails }: SavedJobsModalProps) {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [unsavingJobId, setUnsavingJobId] = useState<string | null>(null)

  // Fetch saved jobs when modal opens
  useEffect(() => {
    if (isOpen && userId) {
      fetchSavedJobs()
    }
  }, [isOpen, userId])

  const fetchSavedJobs = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase
        .from('saved_jobs')
        .select(`
          id,
          created_at,
          job_post:job_posts!inner (
            id,
            company_name,
            company_logo,
            position,
            location,
            salary,
            job_type,
            experience_level,
            short_description,
            is_remote,
            application_link,
            created_at
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      setSavedJobs(data || [])
    } catch (err: any) {
      setError(err.message || 'Failed to fetch saved jobs')
      console.error('Error fetching saved jobs:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUnsaveJob = async (savedJobId: string) => {
    setUnsavingJobId(savedJobId)
    
    try {
      const { error } = await supabase
        .from('saved_jobs')
        .delete()
        .eq('id', savedJobId)

      if (error) {
        throw error
      }

      // Remove from local state
      setSavedJobs(prev => prev.filter(job => job.id !== savedJobId))
    } catch (err: any) {
      console.error('Error unsaving job:', err)
      // You might want to show a toast notification here
    } finally {
      setUnsavingJobId(null)
    }
  }

  const handleViewJob = (savedJob: SavedJob) => {
    // Transform the saved job data to match the expected job format
    const jobData = {
      id: savedJob.job_post.id,
      company_name: savedJob.job_post.company_name,
      company_logo: savedJob.job_post.company_logo,
      position: savedJob.job_post.position,
      location: savedJob.job_post.location,
      salary: savedJob.job_post.salary,
      job_type: savedJob.job_post.job_type,
      experience_level: savedJob.job_post.experience_level,
      short_description: savedJob.job_post.short_description,
      requirements: null, // Not available in this query
      skills: null, // Not available in this query
      application_link: savedJob.job_post.application_link,
      is_remote: savedJob.job_post.is_remote,
      status: 'active', // Assume active since it's saved
      created_at: savedJob.job_post.created_at
    }
    
    onViewJobDetails(jobData)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Filter jobs based on search term
  const filteredJobs = savedJobs.filter(savedJob => 
    searchTerm === '' || 
    savedJob.job_post.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    savedJob.job_post.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    savedJob.job_post.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      className="bg-gradient-to-br from-neutral-800 via-neutral-900 to-neutral-800 border border-white/20 max-w-4xl max-h-[90vh] overflow-hidden"
    >
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#FFC107] to-[#FFB300] rounded-xl flex items-center justify-center">
              <Bookmark className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white font-poppins">
                My Saved Jobs
              </h2>
              <p className="text-gray-300">
                Jobs you've bookmarked for later
              </p>
            </div>
          </div>
          
          <Button 
            onClick={fetchSavedJobs}
            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium border border-white/20"
          >
            Refresh
          </Button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search saved jobs..."
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#FFC107] focus:border-transparent transition-all duration-200 text-white placeholder-gray-400"
            />
          </div>
        </div>

        {/* Jobs List */}
        <div className="max-h-[50vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 text-[#FFC107] animate-spin mx-auto mb-4" />
                <p className="text-white">Loading saved jobs...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookmarkX className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Error Loading Saved Jobs</h3>
              <p className="text-gray-300 mb-4">{error}</p>
              <Button 
                onClick={fetchSavedJobs}
                className="bg-[#FFC107] hover:bg-[#FFB300] text-black px-6 py-2 rounded-lg font-medium"
              >
                Try Again
              </Button>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bookmark className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {savedJobs.length === 0 ? 'No Saved Jobs Yet' : 'No Matching Jobs'}
              </h3>
              <p className="text-gray-300">
                {savedJobs.length === 0 
                  ? 'Start saving jobs you\'re interested in to see them here.'
                  : 'Try adjusting your search criteria.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((savedJob) => (
                <div 
                  key={savedJob.id} 
                  className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      {/* Company Logo */}
                      <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {savedJob.job_post.company_logo ? (
                          <img 
                            src={savedJob.job_post.company_logo} 
                            alt={`${savedJob.job_post.company_name} logo`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Building2 className="w-6 h-6 text-gray-400" />
                        )}
                      </div>

                      {/* Job Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-white mb-1">
                              {savedJob.job_post.position}
                            </h3>
                            <p className="text-[#FFC107] font-medium">
                              {savedJob.job_post.company_name}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-gray-300 mb-3">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span>{savedJob.job_post.location}</span>
                            {savedJob.job_post.is_remote && <span className="ml-1 text-green-400">(Remote)</span>}
                          </div>
                          
                          {savedJob.job_post.salary && (
                            <div className="flex items-center">
                              <DollarSign className="w-4 h-4 mr-1" />
                              <span>{savedJob.job_post.salary}</span>
                            </div>
                          )}
                          
                          {savedJob.job_post.job_type && (
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              <span>{savedJob.job_post.job_type}</span>
                            </div>
                          )}
                        </div>

                        {savedJob.job_post.short_description && (
                          <p className="text-gray-300 text-sm line-clamp-2 mb-3">
                            {savedJob.job_post.short_description}
                          </p>
                        )}

                        <div className="flex items-center text-xs text-gray-400">
                          <Calendar className="w-3 h-3 mr-1" />
                          <span>Saved {formatDate(savedJob.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        onClick={() => handleViewJob(savedJob)}
                        className="bg-[#FFC107] hover:bg-[#FFB300] text-black px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </Button>
                      
                      <Button
                        onClick={() => handleUnsaveJob(savedJob.id)}
                        disabled={unsavingJobId === savedJob.id}
                        className="bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/40 px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
                      >
                        {unsavingJobId === savedJob.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <BookmarkX className="w-4 h-4" />
                        )}
                        <span>Unsave</span>
                      </Button>

                      {savedJob.job_post.application_link && (
                        <Button
                          onClick={() => window.open(savedJob.job_post.application_link!, '_blank')}
                          className="bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-600/40 px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>Apply</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {filteredJobs.length > 0 && (
          <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
            <p className="text-gray-400 text-sm">
              Showing {filteredJobs.length} of {savedJobs.length} saved job{savedJobs.length !== 1 ? 's' : ''}
            </p>
            <div className="flex items-center space-x-3">
              <Button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium border border-white/20">
                Export List
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}