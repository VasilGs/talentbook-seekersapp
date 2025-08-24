import React, { useState, useEffect } from 'react'
import { Modal } from './ui/modal'
import { Button } from './ui/button'
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  Clock, 
  CheckCircle, 
  XCircle, 
  UserCheck,
  Briefcase,
  Calendar,
  Loader2,
  User
} from 'lucide-react'
import { supabase } from '../lib/supabase'

interface JobApplication {
  id: string
  created_at: string
  status: string
  cover_letter_text: string | null
  job_post: {
    id: string
    position: string
    company_name: string
  }
  applicant: {
    id: string
    first_name: string | null
    last_name: string | null
    profile_picture: string | null
    description: string | null
  }
}

interface ApplicationsDashboardModalProps {
  isOpen: boolean
  onClose: () => void
  companyUserId: string
  onViewApplicant: (applicationId: string, applicantId: string) => void
}

export function ApplicationsDashboardModal({ 
  isOpen, 
  onClose, 
  companyUserId, 
  onViewApplicant 
}: ApplicationsDashboardModalProps) {
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Fetch applications when modal opens
  useEffect(() => {
    if (isOpen && companyUserId) {
      fetchApplications()
    }
  }, [isOpen, companyUserId])

  const fetchApplications = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          id,
          created_at,
          status,
          cover_letter_text,
          job_post:job_posts!inner (
            id,
            position,
            company_name
          ),
          applicant:profiles!inner (
            id,
            first_name,
            last_name,
            profile_picture,
            description
          )
        `)
        .eq('job_posts.user_id', companyUserId)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      setApplications(data || [])
    } catch (err: any) {
      setError(err.message || 'Failed to fetch applications')
      console.error('Error fetching applications:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40'
      case 'reviewed':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40'
      case 'interviewing':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/40'
      case 'accepted':
        return 'bg-green-500/20 text-green-400 border-green-500/40'
      case 'rejected':
        return 'bg-red-500/20 text-red-400 border-red-500/40'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/40'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'reviewed':
        return <Eye className="w-4 h-4" />
      case 'interviewing':
        return <UserCheck className="w-4 h-4" />
      case 'accepted':
        return <CheckCircle className="w-4 h-4" />
      case 'rejected':
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getApplicantName = (applicant: JobApplication['applicant']) => {
    if (applicant.first_name && applicant.last_name) {
      return `${applicant.first_name} ${applicant.last_name}`
    }
    if (applicant.first_name) {
      return applicant.first_name
    }
    return 'Anonymous Applicant'
  }

  // Filter applications based on search term and status
  const filteredApplications = applications.filter(app => {
    const matchesSearch = searchTerm === '' || 
      getApplicantName(app.applicant).toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.job_post.position.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Group applications by status for summary
  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      className="bg-gradient-to-br from-neutral-800 via-neutral-900 to-neutral-800 border border-white/20 max-w-6xl max-h-[90vh] overflow-hidden"
    >
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white font-poppins">
                Applications Dashboard
              </h2>
              <p className="text-gray-300">
                Review and manage job applications
              </p>
            </div>
          </div>
          
          <Button 
            onClick={fetchApplications}
            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium border border-white/20"
          >
            Refresh
          </Button>
        </div>

        {/* Summary Cards */}
        {!loading && applications.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{applications.length}</p>
                <p className="text-gray-400 text-sm">Total</p>
              </div>
            </div>
            <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/20">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-400">{statusCounts.pending || 0}</p>
                <p className="text-yellow-300 text-sm">Pending</p>
              </div>
            </div>
            <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">{statusCounts.reviewed || 0}</p>
                <p className="text-blue-300 text-sm">Reviewed</p>
              </div>
            </div>
            <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-400">{statusCounts.interviewing || 0}</p>
                <p className="text-purple-300 text-sm">Interviewing</p>
              </div>
            </div>
            <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">{statusCounts.accepted || 0}</p>
                <p className="text-green-300 text-sm">Accepted</p>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search applicants or job positions..."
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all duration-200 text-white placeholder-gray-400"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all duration-200 text-white appearance-none cursor-pointer"
            >
              <option value="all" className="bg-neutral-800">All Status</option>
              <option value="pending" className="bg-neutral-800">Pending</option>
              <option value="reviewed" className="bg-neutral-800">Reviewed</option>
              <option value="interviewing" className="bg-neutral-800">Interviewing</option>
              <option value="accepted" className="bg-neutral-800">Accepted</option>
              <option value="rejected" className="bg-neutral-800">Rejected</option>
            </select>
          </div>
        </div>

        {/* Applications List */}
        <div className="max-h-[50vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 text-green-600 animate-spin mx-auto mb-4" />
                <p className="text-white">Loading applications...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Error Loading Applications</h3>
              <p className="text-gray-300 mb-4">{error}</p>
              <Button 
                onClick={fetchApplications}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium"
              >
                Try Again
              </Button>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {applications.length === 0 ? 'No Applications Yet' : 'No Matching Applications'}
              </h3>
              <p className="text-gray-300">
                {applications.length === 0 
                  ? 'Applications will appear here when candidates apply to your job posts.'
                  : 'Try adjusting your search or filter criteria.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((application) => (
                <div 
                  key={application.id} 
                  className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-200 cursor-pointer"
                  onClick={() => onViewApplicant(application.id, application.applicant.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      {/* Applicant Avatar */}
                      <div className="w-12 h-12 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {application.applicant.profile_picture ? (
                          <img 
                            src={application.applicant.profile_picture} 
                            alt={getApplicantName(application.applicant)}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-6 h-6 text-gray-400" />
                        )}
                      </div>

                      {/* Application Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-white truncate">
                            {getApplicantName(application.applicant)}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${getStatusColor(application.status)}`}>
                            {getStatusIcon(application.status)}
                            <span className="capitalize">{application.status}</span>
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-300 mb-2">
                          <div className="flex items-center">
                            <Briefcase className="w-4 h-4 mr-1" />
                            <span>{application.job_post.position}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span>Applied {formatDate(application.created_at)}</span>
                          </div>
                        </div>

                        {application.applicant.description && (
                          <p className="text-gray-300 text-sm line-clamp-2">
                            {application.applicant.description}
                          </p>
                        )}

                        {application.cover_letter_text && (
                          <div className="mt-3 p-3 bg-white/5 rounded-lg border border-white/10">
                            <p className="text-gray-300 text-sm line-clamp-3">
                              <span className="font-medium text-white">Cover Letter: </span>
                              {application.cover_letter_text}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* View Button */}
                    <Button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 ml-4">
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {filteredApplications.length > 0 && (
          <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
            <p className="text-gray-400 text-sm">
              Showing {filteredApplications.length} of {applications.length} application{applications.length !== 1 ? 's' : ''}
            </p>
            <div className="flex items-center space-x-3">
              <Button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium border border-white/20">
                Export Data
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}