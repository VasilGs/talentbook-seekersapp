import React, { useState } from 'react'
import { Modal } from './ui/modal'
import { Button } from './ui/button'
import { Link, Copy, Check, Share2, ExternalLink } from 'lucide-react'

interface ShareProfileModalProps {
  isOpen: boolean
  onClose: () => void
  profileId: string
  profileName?: string
}

export function ShareProfileModal({ isOpen, onClose, profileId, profileName }: ShareProfileModalProps) {
  const [copied, setCopied] = useState(false)
  
  // Generate the shareable profile URL
  const profileUrl = `${window.location.origin}/profile/${profileId}`
  
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl)
      setCopied(true)
      
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch (error) {
      console.error('Failed to copy link:', error)
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea')
      textArea.value = profileUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleShareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profileName ? `${profileName}'s` : 'Check out this'} TalentBook Profile`,
          text: `View ${profileName ? `${profileName}'s` : 'this'} professional profile on TalentBook`,
          url: profileUrl,
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    }
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      className="bg-gradient-to-br from-neutral-800 via-neutral-900 to-neutral-800 border border-white/20 max-w-md"
    >
      <div className="p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-[#FFC107] to-[#FFB300] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Share2 className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 font-poppins">
            Share Your Profile
          </h2>
          <p className="text-gray-300">
            Share your professional profile with others
          </p>
        </div>

        {/* Profile Link Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Your Profile Link
            </label>
            <div className="flex items-center space-x-3">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Link className="h-4 w-4 text-gray-500" />
                </div>
                <input
                  type="text"
                  value={profileUrl}
                  readOnly
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC107] focus:border-transparent"
                />
              </div>
              <Button
                onClick={handleCopyLink}
                className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                  copied 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-[#FFC107] hover:bg-[#FFB300] text-black'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </Button>
            </div>
            <p className="text-gray-400 text-xs mt-2">
              Anyone with this link can view your public profile
            </p>
          </div>

          {/* Share Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Share Options</h3>
            
            {/* Native Share (if supported) */}
            {navigator.share && (
              <Button
                onClick={handleShareNative}
                className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg font-medium transition-all duration-200 border border-white/20 flex items-center justify-center space-x-2"
              >
                <Share2 className="w-4 h-4" />
                <span>Share via Device</span>
              </Button>
            )}

            {/* Social Media Links */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => {
                  const twitterUrl = `https://twitter.com/intent/tweet?text=Check out ${profileName ? `${profileName}'s` : 'this'} professional profile on TalentBook&url=${encodeURIComponent(profileUrl)}`
                  window.open(twitterUrl, '_blank')
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <span>𝕏</span>
                <span>Twitter</span>
              </Button>
              
              <Button
                onClick={() => {
                  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`
                  window.open(linkedinUrl, '_blank')
                }}
                className="bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <span>in</span>
                <span>LinkedIn</span>
              </Button>
            </div>

            <Button
              onClick={() => {
                const emailSubject = `Check out ${profileName ? `${profileName}'s` : 'this'} TalentBook Profile`
                const emailBody = `I wanted to share ${profileName ? `${profileName}'s` : 'this'} professional profile with you:\n\n${profileUrl}\n\nView it on TalentBook to see their experience and skills.`
                const mailtoUrl = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`
                window.location.href = mailtoUrl
              }}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Share via Email</span>
            </Button>
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-8">
          <Button
            onClick={onClose}
            className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg font-medium transition-all duration-200 border border-white/20"
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  )
}