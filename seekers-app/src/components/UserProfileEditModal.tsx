import React, { useState, useEffect } from 'react'
import { Modal } from './ui/modal'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { 
  User, 
  Upload, 
  Plus, 
  X, 
  Calendar, 
  Building2, 
  Camera, 
  Trash2,
  Globe,
  Loader2
} from 'lucide-react'
import { supabase } from '../lib/supabase'

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

interface UserProfileEditModalProps {
  isOpen: boolean
  onClose: () => void
  profileData: ProfileData
  jobExperiences: JobExperience[]
  onUpdateSuccess: () => void
}

export function UserProfileEditModal({ 
  isOpen, 
  onClose, 
  profileData, 
  jobExperiences, 
  onUpdateSuccess 
}: UserProfileEditModalProps) {
  const [formData, setFormData] = useState({
    firstName: profileData.first_name || '',
    lastName: profileData.last_name || '',
    description: profileData.description || '',
    connections: profileData.connections || 0,
    currentJobCompany: profileData.current_job_company || '',
    currentJobPosition: profileData.current_job_position || '',
    currentJobStartDate: profileData.current_job_start_date || '',
    currentJobLocation: profileData.current_job_location || '',
    profilePicture: null as File | null,
    profilePictureUrl: profileData.profile_picture || ''
  })

  const [experiences, setExperiences] = useState<JobExperience[]>(jobExperiences)
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Update form data when profileData changes
  useEffect(() => {
    setFormData({
      firstName: profileData.first_name || '',
      lastName: profileData.last_name || '',
      description: profileData.description || '',
      connections: profileData.connections || 0,
      currentJobCompany: profileData.current_job_company || '',
      currentJobPosition: profileData.current_job_position || '',
      currentJobStartDate: profileData.current_job_start_date || '',
      currentJobLocation: profileData.current_job_location || '',
      profilePicture: null,
      profilePictureUrl: profileData.profile_picture || ''
    })
    setExperiences(jobExperiences)
  }, [profileData, jobExperiences])

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({ 
        ...prev, 
        profilePicture: file,
        profilePictureUrl: URL.createObjectURL(file)
      }))
    }
  }

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    setFiles(prev => [...prev, ...selectedFiles])
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const addJobExperience = () => {
    const newExperience: JobExperience = {
      id: `temp-${Date.now()}`,
      company_name: '',
      company_website: '',
      position_name: '',
      position_description: '',
      start_date: '',
      end_date: '',
      created_at: new Date().toISOString()
    }
    setExperiences([...experiences, newExperience])
  }

  const updateJobExperience = (id: string, field: keyof JobExperience, value: string) => {
    setExperiences(prev => 
      prev.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    )
  }

  const removeJobExperience = (id: string) => {
    setExperiences(prev => prev.filter(exp => exp.id !== id))
  }

  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${profileData.id}-${Date.now()}.${fileExt}`
      const filePath = `${folder}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('user-files')
        .upload(filePath, file)

      if (uploadError) {
        console.error('Upload error:', uploadError)
        return null
      }

      const { data } = supabase.storage
        .from('user-files')
        .getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      console.error('File upload error:', error)
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      let profilePictureUrl = formData.profilePictureUrl

      // Handle profile picture upload
      if (formData.profilePicture) {
        // Delete old profile picture if it exists and is different
        if (profileData.profile_picture && profileData.profile_picture !== formData.profilePictureUrl) {
          const oldPath = profileData.profile_picture.split('user-files/')[1]
          if (oldPath) {
            await supabase.storage.from('user-files').remove([oldPath])
          }
        }
        
        const uploadedUrl = await uploadFile(formData.profilePicture, 'profile-pictures')
        if (uploadedUrl) {
          profilePictureUrl = uploadedUrl
        } else {
          setError('Failed to upload profile picture.')
          setLoading(false)
          return
        }
      }

      // Upload additional files
      const existingFiles = profileData.files || []
      const uploadedFiles = [...existingFiles]
      
      for (const file of files) {
        const uploadedUrl = await uploadFile(file, 'documents')
        if (uploadedUrl) {
          uploadedFiles.push({
            name: file.name,
            url: uploadedUrl,
            type: file.type
          })
        }
      }

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
          profile_picture: profilePictureUrl,
          description: formData.description,
          connections: formData.connections,
          current_job_company: formData.currentJobCompany || null,
          current_job_position: formData.currentJobPosition || null,
          current_job_start_date: formData.currentJobStartDate || null,
          current_job_location: formData.currentJobLocation || null,
          files: uploadedFiles,
          updated_at: new Date().toISOString()
        })
        .eq('id', profileData.id)

      if (profileError) {
        throw profileError
      }

      // Handle job experiences
      const existingExperienceIds = jobExperiences.map(exp => exp.id)
      const currentExperienceIds = experiences.map(exp => exp.id)

      // Delete removed experiences
      const experiencesToDelete = existingExperienceIds.filter(id => !currentExperienceIds.includes(id))
      if (experiencesToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('job_experiences')
          .delete()
          .in('id', experiencesToDelete)

        if (deleteError) {
          throw deleteError
        }
      }

      // Update or insert experiences
      for (const experience of experiences) {
        if (experience.id.startsWith('temp-')) {
          // Insert new experience
          const { error: insertError } = await supabase
            .from('job_experiences')
            .insert({
              profile_id: profileData.id,
              company_name: experience.company_name,
              company_website: experience.company_website || null,
              position_name: experience.position_name,
              position_description: experience.position_description || null,
              start_date: experience.start_date,
              end_date: experience.end_date || null
            })

          if (insertError) {
            throw insertError
          }
        } else {
          // Update existing experience
          const { error: updateError } = await supabase
            .from('job_experiences')
            .update({
              company_name: experience.company_name,
              company_website: experience.company_website || null,
              position_name: experience.position_name,
              position_description: experience.position_description || null,
              start_date: experience.start_date,
              end_date: experience.end_date || null,
              updated_at: new Date().toISOString()
            })
            .eq('id', experience.id)

          if (updateError) {
            throw updateError
          }
        }
      }

      // Success - close modal and refresh data
      onUpdateSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating your profile.')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      firstName: profileData.first_name || '',
      lastName: profileData.last_name || '',
      description: profileData.description || '',
      connections: profileData.connections || 0,
      currentJobCompany: profileData.current_job_company || '',
      currentJobPosition: profileData.current_job_position || '',
      currentJobStartDate: profileData.current_job_start_date || '',
      currentJobLocation: profileData.current_job_location || '',
      profilePicture: null,
      profilePictureUrl: profileData.profile_picture || ''
    })
    setExperiences(jobExperiences)
    setFiles([])
    setError(null)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      className="bg-gradient-to-br from-neutral-800 via-neutral-900 to-neutral-800 border border-white/20 max-w-4xl max-h-[90vh] overflow-y-auto"
    >
      <div className="p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 overflow-hidden">
            <img 
              src="/talent book singular icon.png" 
              alt="TalentBook Icon" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 font-poppins">
            Edit Your Profile
          </h1>
          <p className="text-gray-300">
            Update your information to keep your profile current
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-6 font-poppins flex items-center">
              <User className="w-5 h-5 mr-3 text-[#FFC107]" />
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <Label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
                  First Name
                </Label>
                <input
                  type="text"
                  id="firstName"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#FFC107] focus:border-transparent transition-all duration-200 text-white placeholder-gray-400"
                  placeholder="Enter your first name"
                />
              </div>

              {/* Last Name */}
              <div>
                <Label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
                  Last Name
                </Label>
                <input
                  type="text"
                  id="lastName"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#FFC107] focus:border-transparent transition-all duration-200 text-white placeholder-gray-400"
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            {/* Connections */}
            <div className="mt-6">
              <Label htmlFor="connections" className="block text-sm font-medium text-gray-300 mb-2">
                Number of Connections
              </Label>
              <input
                type="number"
                id="connections"
                min="0"
                value={formData.connections}
                onChange={(e) => setFormData(prev => ({ ...prev, connections: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#FFC107] focus:border-transparent transition-all duration-200 text-white placeholder-gray-400"
                placeholder="Enter number of connections"
              />
            </div>

            {/* Profile Picture */}
            <div className="mt-6">
              <Label className="block text-sm font-medium text-gray-300 mb-2">
                Profile Picture
              </Label>
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center overflow-hidden">
                  {formData.profilePictureUrl ? (
                    <img 
                      src={formData.profilePictureUrl} 
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    id="profilePicture"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="profilePicture"
                    className="bg-[#FFC107] hover:bg-[#FFB300] text-black px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer flex items-center space-x-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Photo</span>
                  </label>
                  {formData.profilePictureUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, profilePicture: null, profilePictureUrl: '' }))}
                      className="ml-4 text-red-400 hover:text-red-500 text-sm"
                    >
                      Remove Photo
                    </button>
                  )}
                  <p className="text-gray-400 text-sm mt-2">
                    JPG, PNG or GIF (max 5MB)
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mt-6">
              <Label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                Short Description
              </Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                maxLength={500}
                rows={4}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#FFC107] focus:border-transparent transition-all duration-200 text-white placeholder-gray-400 resize-none"
                placeholder="Tell us about yourself, your skills, and what you're looking for..."
              />
              <p className="text-gray-400 text-sm mt-2">
                {formData.description.length}/500 characters
              </p>
            </div>
          </div>

          {/* Current Job */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-6 font-poppins flex items-center">
              <Building2 className="w-5 h-5 mr-3 text-[#FFC107]" />
              Current Position
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current Job Company */}
              <div>
                <Label htmlFor="currentJobCompany" className="block text-sm font-medium text-gray-300 mb-2">
                  Company
                </Label>
                <input
                  type="text"
                  id="currentJobCompany"
                  value={formData.currentJobCompany}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentJobCompany: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#FFC107] focus:border-transparent transition-all duration-200 text-white placeholder-gray-400"
                  placeholder="Current company name"
                />
              </div>

              {/* Current Job Position */}
              <div>
                <Label htmlFor="currentJobPosition" className="block text-sm font-medium text-gray-300 mb-2">
                  Position
                </Label>
                <input
                  type="text"
                  id="currentJobPosition"
                  value={formData.currentJobPosition}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentJobPosition: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#FFC107] focus:border-transparent transition-all duration-200 text-white placeholder-gray-400"
                  placeholder="Current job title"
                />
              </div>

              {/* Current Job Start Date */}
              <div>
                <Label htmlFor="currentJobStartDate" className="block text-sm font-medium text-gray-300 mb-2">
                  Start Date
                </Label>
                <input
                  type="month"
                  id="currentJobStartDate"
                  value={formData.currentJobStartDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentJobStartDate: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#FFC107] focus:border-transparent transition-all duration-200 text-white"
                />
              </div>

              {/* Current Job Location */}
              <div>
                <Label htmlFor="currentJobLocation" className="block text-sm font-medium text-gray-300 mb-2">
                  Location
                </Label>
                <input
                  type="text"
                  id="currentJobLocation"
                  value={formData.currentJobLocation}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentJobLocation: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#FFC107] focus:border-transparent transition-all duration-200 text-white placeholder-gray-400"
                  placeholder="Job location"
                />
              </div>
            </div>
          </div>

          {/* Job Experience */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white font-poppins flex items-center">
                <Building2 className="w-5 h-5 mr-3 text-[#FFC107]" />
                Work Experience
              </h2>
              <Button
                type="button"
                onClick={addJobExperience}
                className="bg-[#FFC107] hover:bg-[#FFB300] text-black px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Experience</span>
              </Button>
            </div>

            {experiences.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No work experience added yet</p>
                <p className="text-gray-500 text-sm">Click "Add Experience" to get started</p>
              </div>
            ) : (
              <div className="space-y-6">
                {experiences.map((experience, index) => (
                  <div key={experience.id} className="bg-white/5 rounded-xl p-6 border border-white/10 relative">
                    <button
                      type="button"
                      onClick={() => removeJobExperience(experience.id)}
                      className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-400 transition-colors duration-200"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <h3 className="text-lg font-medium text-white mb-4">
                      Experience #{index + 1}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Company Name */}
                      <div>
                        <Label className="block text-sm font-medium text-gray-300 mb-2">
                          Company Name
                        </Label>
                        <input
                          type="text"
                          required
                          value={experience.company_name}
                          onChange={(e) => updateJobExperience(experience.id, 'company_name', e.target.value)}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#FFC107] focus:border-transparent transition-all duration-200 text-white placeholder-gray-400"
                          placeholder="Company name"
                        />
                      </div>

                      {/* Website */}
                      <div>
                        <Label className="block text-sm font-medium text-gray-300 mb-2">
                          Company Website
                        </Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Globe className="h-4 w-4 text-gray-500" />
                          </div>
                          <input
                            type="url"
                            value={experience.company_website || ''}
                            onChange={(e) => updateJobExperience(experience.id, 'company_website', e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#FFC107] focus:border-transparent transition-all duration-200 text-white placeholder-gray-400"
                            placeholder="https://company.com"
                          />
                        </div>
                      </div>

                      {/* Position */}
                      <div>
                        <Label className="block text-sm font-medium text-gray-300 mb-2">
                          Position
                        </Label>
                        <input
                          type="text"
                          required
                          value={experience.position_name}
                          onChange={(e) => updateJobExperience(experience.id, 'position_name', e.target.value)}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#FFC107] focus:border-transparent transition-all duration-200 text-white placeholder-gray-400"
                          placeholder="Job title"
                        />
                      </div>

                      {/* Start Date */}
                      <div>
                        <Label className="block text-sm font-medium text-gray-300 mb-2">
                          Start Date
                        </Label>
                        <input
                          type="month"
                          required
                          value={experience.start_date}
                          onChange={(e) => updateJobExperience(experience.id, 'start_date', e.target.value)}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#FFC107] focus:border-transparent transition-all duration-200 text-white"
                        />
                      </div>

                      {/* End Date */}
                      <div className="md:col-span-2">
                        <Label className="block text-sm font-medium text-gray-300 mb-2">
                          End Date
                        </Label>
                        <input
                          type="month"
                          value={experience.end_date || ''}
                          onChange={(e) => updateJobExperience(experience.id, 'end_date', e.target.value)}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#FFC107] focus:border-transparent transition-all duration-200 text-white"
                          placeholder="Leave empty if current job"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mt-4">
                      <Label className="block text-sm font-medium text-gray-300 mb-2">
                        Job Description
                      </Label>
                      <textarea
                        value={experience.position_description || ''}
                        onChange={(e) => updateJobExperience(experience.id, 'position_description', e.target.value)}
                        maxLength={300}
                        rows={3}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#FFC107] focus:border-transparent transition-all duration-200 text-white placeholder-gray-400 resize-none"
                        placeholder="Describe your role and achievements..."
                      />
                      <p className="text-gray-400 text-sm mt-2">
                        {(experience.position_description || '').length}/300 characters
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Additional Files */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-6 font-poppins flex items-center">
              <Upload className="w-5 h-5 mr-3 text-[#FFC107]" />
              Additional Documents
            </h2>

            <div className="space-y-4">
              {/* File Upload */}
              <div>
                <input
                  type="file"
                  id="additionalFiles"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFilesChange}
                  className="hidden"
                />
                <label
                  htmlFor="additionalFiles"
                  className="bg-white/10 hover:bg-white/20 border-2 border-dashed border-white/30 hover:border-[#FFC107]/50 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-200"
                >
                  <Upload className="w-8 h-8 text-gray-400 mb-4" />
                  <p className="text-white font-medium mb-2">Upload additional documents</p>
                  <p className="text-gray-400 text-sm">PDF, DOC, DOCX, JPG, PNG (max 10MB each)</p>
                </label>
              </div>

              {/* New Files List */}
              {files.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-300">New Files to Upload:</h3>
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                      <div className="flex items-center space-x-3">
                        <Upload className="w-4 h-4 text-[#FFC107]" />
                        <span className="text-white text-sm">{file.name}</span>
                        <span className="text-gray-400 text-xs">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="p-1 text-gray-400 hover:text-red-400 transition-colors duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              onClick={handleClose}
              className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-medium border border-white/20"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#FFC107] hover:bg-[#FFB300] text-black px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-[#FFC107]/25 flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating Profile...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}