import React, { useState } from 'react'
import { User, Upload, Plus, X, Calendar, Building2, FileText, Camera, Trash2 } from 'lucide-react'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { supabase, type User as SupabaseUser } from '../lib/supabase'

interface SignupData {
  name: string
  email: string
  password: string
  userType: 'job_seeker' | 'company'
}

interface JobExperience {
  id: string
  company: string
  website: string
  position: string
  description: string
  startDate: string
  endDate: string
}

interface JobSeekerProfileCompletionProps {
  signupData: SignupData
  onProfileComplete: () => void
}

export function JobSeekerProfileCompletion({ signupData, onProfileComplete }: JobSeekerProfileCompletionProps) {
  const [formData, setFormData] = useState({
    firstName: signupData.name.split(' ')[0] || '',
    lastName: signupData.name.split(' ').slice(1).join(' ') || '',
    email: signupData.email,
    profilePicture: null as File | null,
    profilePictureUrl: '',
    description: ''
  })
  
  const [jobExperiences, setJobExperiences] = useState<JobExperience[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addJobExperience = () => {
    const newJob: JobExperience = {
      id: Date.now().toString(),
      company: '',
      website: '',
      position: '',
      description: '',
      startDate: '',
      endDate: ''
    }
    setJobExperiences([...jobExperiences, newJob])
  }

  const updateJobExperience = (id: string, field: keyof JobExperience, value: string) => {
    setJobExperiences(prev => 
      prev.map(job => 
        job.id === id ? { ...job, [field]: value } : job
      )
    )
  }

  const removeJobExperience = (id: string) => {
    setJobExperiences(prev => prev.filter(job => job.id !== id))
  }

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, profilePicture: file }))
      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      setFormData(prev => ({ ...prev, profilePictureUrl: previewUrl }))
    }
  }

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    setFiles(prev => [...prev, ...selectedFiles])
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const uploadFile = async (file: File, folder: string): Promise<{ publicUrl: string; filePath: string } | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `temp-${Date.now()}.${fileExt}`
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

      return { publicUrl: data.publicUrl, filePath }
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
      // First, create the user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          data: {
            full_name: signupData.name,
            user_type: signupData.userType,
          }
        }
      })

      if (authError) {
        throw new Error(`Account creation failed: ${authError.message}`)
      }

      if (!authData.user) {
        throw new Error('Account creation failed: No user returned')
      }

      const newUser = authData.user

      let profilePictureUrl = ''
      
      // Upload profile picture if provided
      if (formData.profilePicture) {
        const uploadResult = await uploadFile(formData.profilePicture, 'profile-pictures')
        if (uploadResult) {
          profilePictureUrl = uploadResult.publicUrl
          // Update the file path to include the actual user ID
          const fileExt = formData.profilePicture.name.split('.').pop()
          const newFileName = `${newUser.id}-${Date.now()}.${fileExt}`
          const newFilePath = `profile-pictures/${newFileName}`
          
          // Move the file to the correct path with user ID
          const { error: moveError } = await supabase.storage
            .from('user-files')
            .move(uploadResult.filePath, newFilePath)
          
          if (!moveError) {
            const { data } = supabase.storage
              .from('user-files')
              .getPublicUrl(newFilePath)
            profilePictureUrl = data.publicUrl
          }
        }
      }

      // Upload additional files
      const uploadedFiles = []
      for (const file of files) {
        const uploadResult = await uploadFile(file, 'documents')
        if (uploadResult) {
          // Update the file path to include the actual user ID
          const fileExt = file.name.split('.').pop()
          const newFileName = `${newUser.id}-${Date.now()}.${fileExt}`
          const newFilePath = `documents/${newFileName}`
          
          // Move the file to the correct path with user ID
          const { error: moveError } = await supabase.storage
            .from('user-files')
            .move(uploadResult.filePath, newFilePath)
          
          let finalUrl = uploadResult.publicUrl
          if (!moveError) {
            const { data } = supabase.storage
              .from('user-files')
              .getPublicUrl(newFilePath)
            finalUrl = data.publicUrl
          }
          
          uploadedFiles.push({
            name: file.name,
            url: finalUrl,
            type: file.type
          })
        }
      }

      // Update or insert profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: newUser.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          profile_picture: profilePictureUrl,
          description: formData.description,
          files: uploadedFiles,
          updated_at: new Date().toISOString()
        })

      if (profileError) {
        throw profileError
      }

      // Insert job experiences into separate table
      if (jobExperiences.length > 0) {
        const experienceData = jobExperiences.map(job => ({
          profile_id: newUser.id,
          company_name: job.company,
          company_website: job.website,
          position_name: job.position,
          position_description: job.description,
          start_date: job.startDate,
          end_date: job.endDate
        }))

        const { error: experienceError } = await supabase
          .from('job_experiences')
          .insert(experienceData)

        if (experienceError) {
          throw experienceError
        }
      }

      // Call completion callback
      onProfileComplete()
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving your profile.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
            Complete Your Profile
          </h1>
          <p className="text-gray-300">
            Let's set up your profile to help you find the perfect job
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

            {/* Email (readonly) */}
            <div className="mt-6">
              <Label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </Label>
              <input
                type="email"
                id="email"
                value={formData.email}
                readOnly
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-gray-400 cursor-not-allowed"
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
                required
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
                <span>Add Job</span>
              </Button>
            </div>

            {jobExperiences.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No work experience added yet</p>
                <p className="text-gray-500 text-sm">Click "Add Job" to get started</p>
              </div>
            ) : (
              <div className="space-y-6">
                {jobExperiences.map((job, index) => (
                  <div key={job.id} className="bg-white/5 rounded-xl p-6 border border-white/10 relative">
                    <button
                      type="button"
                      onClick={() => removeJobExperience(job.id)}
                      className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-400 transition-colors duration-200"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <h3 className="text-lg font-medium text-white mb-4">
                      Job Experience #{index + 1}
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
                          value={job.company}
                          onChange={(e) => updateJobExperience(job.id, 'company', e.target.value)}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#FFC107] focus:border-transparent transition-all duration-200 text-white placeholder-gray-400"
                          placeholder="Company name"
                        />
                      </div>

                      {/* Website */}
                      <div>
                        <Label className="block text-sm font-medium text-gray-300 mb-2">
                          Company Website
                        </Label>
                        <input
                          type="url"
                          value={job.website}
                          onChange={(e) => updateJobExperience(job.id, 'website', e.target.value)}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#FFC107] focus:border-transparent transition-all duration-200 text-white placeholder-gray-400"
                          placeholder="https://company.com"
                        />
                      </div>

                      {/* Position */}
                      <div>
                        <Label className="block text-sm font-medium text-gray-300 mb-2">
                          Position
                        </Label>
                        <input
                          type="text"
                          required
                          value={job.position}
                          onChange={(e) => updateJobExperience(job.id, 'position', e.target.value)}
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
                          value={job.startDate}
                          onChange={(e) => updateJobExperience(job.id, 'startDate', e.target.value)}
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
                          value={job.endDate}
                          onChange={(e) => updateJobExperience(job.id, 'endDate', e.target.value)}
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
                        required
                        value={job.description}
                        onChange={(e) => updateJobExperience(job.id, 'description', e.target.value)}
                        maxLength={300}
                        rows={3}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#FFC107] focus:border-transparent transition-all duration-200 text-white placeholder-gray-400 resize-none"
                        placeholder="Describe your role and achievements..."
                      />
                      <p className="text-gray-400 text-sm mt-2">
                        {job.description.length}/300 characters
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
              <FileText className="w-5 h-5 mr-3 text-[#FFC107]" />
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
                  <p className="text-white font-medium mb-2">Upload certificates, awards, or other documents</p>
                  <p className="text-gray-400 text-sm">PDF, DOC, DOCX, JPG, PNG (max 10MB each)</p>
                </label>
              </div>

              {/* Uploaded Files List */}
              {files.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-300">Uploaded Files:</h3>
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-4 h-4 text-[#FFC107]" />
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

          {/* Submit Button */}
          <div className="flex justify-center">
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#FFC107] hover:bg-[#FFB300] text-black px-8 py-4 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-[#FFC107]/25 text-lg"
            >
              {loading ? 'Saving Profile...' : 'Complete Profile'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}