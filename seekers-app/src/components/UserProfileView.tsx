import React, { useState, useEffect } from 'react'
import { 
  User, 
  Users, 
  MapPin, 
  Calendar, 
  Briefcase, 
  FileText, 
  Award, 
  FolderOpen, 
  Bookmark,
  Settings, 
  Trash2,
  Share2,
  Building2,
  Clock,
  Loader2,
  ExternalLink,
  Download
} from 'lucide-react'
import { DeleteConfirmationModal } from './DeleteConfirmationModal'
import { UserProfileEditModal } from './UserProfileEditModal'
import { SavedJobsModal } from './SavedJobsModal'
import { JobDetailsModal } from './JobDetailsModal'
import { ShareProfileModal } from './ShareProfileModal'
import { supabase } from '../lib/supabase'

// TypeScript interfaces for the data structures
interface ProfileFile {
  name: string
  url: string
  type: string
}

interface ProfileData {
  id: string
  first_name: string | null
  last_name: string | null
  profile_picture: string | null
  connections: number | null
  description: string | null
  current_job_company: string | null
  current_job_position: string | null
  current_job_start_date: string | null
  current_job_location: string | null
  files: ProfileFile[] | null
  created_at: string
  updated_at: string
}

interface JobExperience {
  id: string
  company_name: string
  company_website: string | null
  position_name: string
  position_description: string | null
  start_date: string
  end_date: string | null
  created_at: string
}

interface UserProfileViewProps {
  onSignOut: () => void
}

export function UserProfileView({ onSignOut }: UserProfileViewProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showEditProfileModal, setShowEditProfileModal] = useState(false)
  const [showSavedJobsModal, setShowSavedJobsModal] = useState(false)
  const [showShareProfileModal, setShowShareProfileModal] = useState(false)
  const [selectedJobForDetails, setSelectedJobForDetails] = useState<any>(null)
  const [showJobDetailsModal, setShowJobDetailsModal] = useState(false)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [jobExperiences, setJobExperiences] = useState<JobExperience[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch user profile data and job experiences
  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        throw new Error('No authenticated user found')
      }

      // Fetch profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) {
        throw new Error(`Failed to fetch profile: ${profileError.message}`)
      }

      setProfileData(profile)

      // Fetch job experiences
      const { data: experiences, error: experiencesError } = await supabase
        .from('job_experiences')
        .select('*')
        .eq('profile_id', user.id)
        .order('start_date', { ascending: false })

      if (experiencesError) {
        console.error('Error fetching job experiences:', experiencesError)
        // Don't throw error for job experiences, just log it
      } else {
        setJobExperiences(experiences || [])
      }

    } catch (err: any) {
      setError(err.message || 'Failed to load profile data')
      console.error('Error fetching user profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const getFullName = () => {
    if (!profileData) return 'Loading...'
    if (profileData.first_name && profileData.last_name) {
      return `${profileData.first_name} ${profileData.last_name}`
    }
    if (profileData.first_name) {
      return profileData.first_name
    }
    return 'Anonymous User'
  }

  const formatJobDate = (dateString: string) => {
    return new Date(dateString + '-01').toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    })
  }

  const calculateJobDuration = (startDate: string, endDate?: string | null) => {
    const start = new Date(startDate + '-01')
    const end = endDate ? new Date(endDate + '-01') : new Date()
    
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30.44)) // Average days per month
    
    const years = Math.floor(diffMonths / 12)
    const months = diffMonths % 12
    
    if (years > 0 && months > 0) {
      return `${years} year${years > 1 ? 's' : ''}, ${months} month${months > 1 ? 's' : ''}`
    } else if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''}`
    } else {
      return `${months} month${months > 1 ? 's' : ''}`
    }
  }

  const handleFileAction = (file: ProfileFile, action: 'view' | 'download') => {
    if (action === 'view') {
      window.open(file.url, '_blank')
    } else if (action === 'download') {
      const link = document.createElement('a')
      link.href = file.url
      link.download = file.name
      link.click()
    }
  }

  const handleConfirmDelete = async () => {
    try {
      // Get the current user session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token || !session?.user?.id) {
        console.error('No valid session found')
        setShowDeleteModal(false)
        await onSignOut()
        return
      }

      // Call the Edge Function to delete the user account
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id
        })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        // User successfully deleted from backend, clear client-side session
        await supabase.auth.setSession(null)
      } else {
        console.error('Error deleting account:', result.error)
        // If deletion fails, still sign out the user locally
      }

      // Close the modal first
      setShowDeleteModal(false)
      
      // Sign out the user (this will redirect to home page)
      await onSignOut()
    } catch (error) {
      console.error('Error deleting account:', error)
      // Only show error if it's not a "user not found" type error
      const errorMessage = (error as Error).message
      if (!errorMessage.includes('User not found') && !errorMessage.includes('user_not_found')) {
        alert('Error deleting account:\n\n' + errorMessage)
      }
      setShowDeleteModal(false)
      // Clear the session locally and sign out
      await supabase.auth.setSession(null)
      onSignOut()
    }
  }

  const handleViewJobDetails = (job: any) => {
    setSelectedJobForDetails(job)
    setShowSavedJobsModal(false)
    setShowJobDetailsModal(true)
  }

  const handleCloseJobDetails = () => {
    setShowJobDetailsModal(false)
    setShowSavedJobsModal(true) // Return to saved jobs modal
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#FFC107] animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading your profile...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Error Loading Profile</h3>
          <p className="text-gray-300 mb-4">{error || 'Failed to load profile data'}</p>
          <button
            onClick={fetchUserProfile}
            className="bg-[#FFC107] hover:bg-[#FFB300] text-black px-6 py-2 rounded-lg font-medium transition-all duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
            {/* Profile Picture */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-[#FFC107]/20">
                {profileData.profile_picture ? (
                  <img 
                    src={profileData.profile_picture} 
                    alt={getFullName()}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-white/10 flex items-center justify-center">
                    <User className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2 font-poppins">
                    {getFullName()}
                  </h1>
                  {profileData.connections !== null && (
                    <div className="flex items-center text-gray-300 mb-3">
                      <Users className="w-5 h-5 mr-2 text-[#FFC107]" />
                      <span>Connections: {profileData.connections}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons - Top Row */}
                <div className="flex flex-wrap gap-3">
                  <button 
                    onClick={() => setShowShareProfileModal(true)}
                    className="bg-[#FFC107] hover:bg-[#FFB300] text-black px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:shadow-[#FFC107]/25 flex items-center space-x-2"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share Profile</span>
                  </button>
                  <button 
                    onClick={() => setShowEditProfileModal(true)}
                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 border border-white/20 flex items-center space-x-2"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </button>
                </div>
              </div>

              {/* Description */}
              {profileData.description && (
                <p className="text-gray-300 leading-relaxed mb-6">
                  {profileData.description}
                </p>
              )}

              {/* Current Job */}
              {profileData.current_job_position && profileData.current_job_company && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {profileData.current_job_position}
                      </h3>
                      <p className="text-[#FFC107] font-medium mb-2">
                        {profileData.current_job_company}
                      </p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-400">
                        {profileData.current_job_start_date && (
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span>
                              Started {formatJobDate(profileData.current_job_start_date)} 
                              ({calculateJobDuration(profileData.current_job_start_date)})
                            </span>
                          </div>
                        )}
                        {profileData.current_job_location && (
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span>{profileData.current_job_location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Professional Experience */}
        {jobExperiences.length > 0 && (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 font-poppins flex items-center">
              <Briefcase className="w-6 h-6 mr-3 text-[#FFC107]" />
              Professional Experience
            </h2>
            
            <div className="space-y-6">
              {jobExperiences.map((job, index) => (
                <div key={job.id} className="border-l-2 border-red-600/30 pl-6 relative">
                  <div className="absolute -left-2 top-0 w-4 h-4 bg-red-600 rounded-full"></div>
                  <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {job.position_name}
                        </h3>
                        <p className="text-[#FFC107] font-medium">
                          {job.company_name}
                        </p>
                        {job.company_website && (
                          <a 
                            href={job.company_website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-sm flex items-center mt-1"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Visit Website
                          </a>
                        )}
                      </div>
                      <div className="flex items-center text-sm text-gray-400">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>
                          {formatJobDate(job.start_date)} - {job.end_date ? formatJobDate(job.end_date) : 'Present'}
                        </span>
                      </div>
                    </div>
                    {job.position_description && (
                      <p className="text-gray-300 leading-relaxed">
                        {job.position_description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {/* Documents Section */}
          <button 
            onClick={() => {
              const certificates = profileData.files?.filter(file => 
                file.name.toLowerCase().includes('certificate') || 
                file.name.toLowerCase().includes('cert')
              ) || []
              if (certificates.length > 0) {
                handleFileAction(certificates[0], 'view')
              }
            }}
            disabled={!profileData.files?.some(file => 
              file.name.toLowerCase().includes('certificate') || 
              file.name.toLowerCase().includes('cert')
            )}
            className="bg-gradient-to-br from-white/10 to-white/5 hover:from-[#FFC107]/20 hover:to-[#FFB300]/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-[#FFC107]/50 transition-all duration-300 hover:shadow-xl hover:shadow-[#FFC107]/10 hover:-translate-y-1 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-[#FFC107] to-[#FFB300] rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-[#FFC107]/30">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-white font-semibold text-lg group-hover:text-[#FFC107] transition-colors duration-300">Certificates</h3>
                <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-300">
                  {profileData.files?.some(file => 
                    file.name.toLowerCase().includes('certificate') || 
                    file.name.toLowerCase().includes('cert')
                  ) ? 'View credentials' : 'No certificates uploaded'}
                </p>
              </div>
            </div>
          </button>

          <button 
            onClick={() => {
              const cvs = profileData.files?.filter(file => 
                file.name.toLowerCase().includes('cv') || 
                file.name.toLowerCase().includes('resume')
              ) || []
              if (cvs.length > 0) {
                handleFileAction(cvs[0], 'view')
              }
            }}
            disabled={!profileData.files?.some(file => 
              file.name.toLowerCase().includes('cv') || 
              file.name.toLowerCase().includes('resume')
            )}
            className="bg-gradient-to-br from-white/10 to-white/5 hover:from-red-600/20 hover:to-red-700/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-red-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-red-600/10 hover:-translate-y-1 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-red-600/30">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-white font-semibold text-lg group-hover:text-red-400 transition-colors duration-300">Open CV</h3>
                <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-300">
                  {profileData.files?.some(file => 
                    file.name.toLowerCase().includes('cv') || 
                    file.name.toLowerCase().includes('resume')
                  ) ? 'View resume' : 'No CV uploaded'}
                </p>
              </div>
            </div>
          </button>

          <button 
            onClick={() => {
              const otherDocs = profileData.files?.filter(file => 
                !file.name.toLowerCase().includes('cv') && 
                !file.name.toLowerCase().includes('resume') &&
                !file.name.toLowerCase().includes('certificate') &&
                !file.name.toLowerCase().includes('cert')
              ) || []
              if (otherDocs.length > 0) {
                handleFileAction(otherDocs[0], 'view')
              }
            }}
            disabled={!profileData.files?.some(file => 
              !file.name.toLowerCase().includes('cv') && 
              !file.name.toLowerCase().includes('resume') &&
              !file.name.toLowerCase().includes('certificate') &&
              !file.name.toLowerCase().includes('cert')
            )}
            className="bg-gradient-to-br from-white/10 to-white/5 hover:from-gray-600/20 hover:to-gray-700/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-gray-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-gray-600/10 hover:-translate-y-1 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-gray-600 to-gray-700 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-gray-600/30">
                <FolderOpen className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-white font-semibold text-lg group-hover:text-gray-300 transition-colors duration-300">Other Documents</h3>
                <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-300">
                  {profileData.files?.some(file => 
                    !file.name.toLowerCase().includes('cv') && 
                    !file.name.toLowerCase().includes('resume') &&
                    !file.name.toLowerCase().includes('certificate') &&
                    !file.name.toLowerCase().includes('cert')
                  ) ? 'View documents' : 'No other documents'}
                </p>
              </div>
            </div>
          </button>

          {/* Applications Section */}
          <button 
            onClick={() => setShowSavedJobsModal(true)}
            className="bg-gradient-to-br from-white/10 to-white/5 hover:from-blue-600/20 hover:to-blue-700/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-600/10 hover:-translate-y-1 group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-blue-600/30">
                <Bookmark className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-white font-semibold text-lg group-hover:text-blue-400 transition-colors duration-300">My Saved Jobs</h3>
                <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-300">View bookmarked jobs</p>
              </div>
            </div>
          </button>

          {/* Spacer for alignment */}
          <div className="hidden lg:block"></div>

          {/* Delete Profile - Prominent placement */}
          <button 
            onClick={() => setShowDeleteModal(true)}
            className="bg-gradient-to-br from-red-600/15 to-red-700/10 hover:from-red-600/30 hover:to-red-700/20 backdrop-blur-sm rounded-2xl p-6 border border-red-600/40 hover:border-red-500/70 transition-all duration-300 hover:shadow-xl hover:shadow-red-600/20 hover:-translate-y-1 group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-red-600/40">
                <Trash2 className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-red-400 font-semibold text-lg group-hover:text-red-300 transition-colors duration-300">Delete My Profile</h3>
                <p className="text-red-400/70 text-sm group-hover:text-red-300/80 transition-colors duration-300">Permanent action</p>
              </div>
            </div>
          </button>
        </div>

        {/* Documents List (if any files exist) */}
        {profileData.files && profileData.files.length > 0 && (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 font-poppins flex items-center">
              <FileText className="w-6 h-6 mr-3 text-[#FFC107]" />
              Documents & Files
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {profileData.files.map((file, index) => (
                <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-medium truncate">{file.name}</p>
                      <p className="text-gray-400 text-sm">{file.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleFileAction(file, 'view')}
                      className="p-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-lg transition-all duration-200 flex items-center space-x-1"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleFileAction(file, 'download')}
                      className="p-2 bg-green-600/20 hover:bg-green-600/40 text-green-400 rounded-lg transition-all duration-200 flex items-center space-x-1"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        userType="job_seeker"
      />

      {/* Edit Profile Modal */}
      {showEditProfileModal && profileData && (
        <UserProfileEditModal
          isOpen={showEditProfileModal}
          onClose={() => setShowEditProfileModal(false)}
          profileData={profileData}
          jobExperiences={jobExperiences}
          onUpdateSuccess={fetchUserProfile}
        />
      )}

      {/* Saved Jobs Modal */}
      {showSavedJobsModal && profileData && (
        <SavedJobsModal
          isOpen={showSavedJobsModal}
          onClose={() => setShowSavedJobsModal(false)}
          userId={profileData.id}
          onViewJobDetails={handleViewJobDetails}
        />
      )}

      {/* Job Details Modal */}
      {showJobDetailsModal && selectedJobForDetails && (
        <JobDetailsModal
          isOpen={showJobDetailsModal}
          onClose={handleCloseJobDetails}
          job={selectedJobForDetails}
          userId={profileData?.id || null}
        />
      )}

      {/* Share Profile Modal */}
      {showShareProfileModal && profileData && (
        <ShareProfileModal
          isOpen={showShareProfileModal}
          onClose={() => setShowShareProfileModal(false)}
          profileId={profileData.id}
          profileName={getFullName()}
        />
      )}
    </div>
  )
}