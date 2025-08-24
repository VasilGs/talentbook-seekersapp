import React from 'react'
import { Modal } from './ui/modal'
import { Button } from './ui/button'
import { AlertTriangle, Trash2, ArrowLeft } from 'lucide-react'

interface DeleteConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  userType: 'job_seeker' | 'company'
}

export function DeleteConfirmationModal({ isOpen, onClose, onConfirm, userType }: DeleteConfirmationModalProps) {
  const isCompany = userType === 'company'

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="bg-gradient-to-br from-red-900/90 via-red-800/90 to-red-900/90 border border-red-500/30 max-w-md">
      <div className="p-8">
        {/* Warning Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center border-4 border-red-500/40">
            <AlertTriangle className="w-10 h-10 text-red-400" />
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 font-poppins">
            Delete {isCompany ? 'Company' : 'Your'} Account?
          </h2>
          <div className="space-y-3 text-gray-300">
            <p className="font-medium text-red-300">
              ⚠️ This action cannot be undone!
            </p>
            <p>
              {isCompany 
                ? 'Deleting your company account will permanently remove:'
                : 'Deleting your account will permanently remove:'
              }
            </p>
            <ul className="text-left space-y-2 bg-red-500/10 rounded-lg p-4 border border-red-500/20">
              {isCompany ? (
                <>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-red-400 rounded-full mr-3"></span>
                    Your company profile and information
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-red-400 rounded-full mr-3"></span>
                    All published job posts
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-red-400 rounded-full mr-3"></span>
                    Application history and candidate data
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-red-400 rounded-full mr-3"></span>
                    Company documents and files
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-red-400 rounded-full mr-3"></span>
                    Your profile and personal information
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-red-400 rounded-full mr-3"></span>
                    Work experience and job history
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-red-400 rounded-full mr-3"></span>
                    Uploaded documents and certificates
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-red-400 rounded-full mr-3"></span>
                    Job applications and saved jobs
                  </li>
                </>
              )}
              <li className="flex items-center">
                <span className="w-2 h-2 bg-red-400 rounded-full mr-3"></span>
                Your TalentBook account access
              </li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          {/* Delete Button */}
          <Button
            onClick={onConfirm}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-4 rounded-lg font-bold transition-all duration-200 hover:shadow-lg hover:shadow-red-600/25 flex items-center justify-center space-x-3 text-lg"
          >
            <Trash2 className="w-5 h-5" />
            <span>Delete my account forever</span>
          </Button>

          {/* Cancel Button */}
          <Button
            onClick={onClose}
            className="w-full bg-white/10 hover:bg-white/20 text-white py-4 rounded-lg font-semibold transition-all duration-200 border-2 border-white/20 hover:border-white/40 flex items-center justify-center space-x-3 text-lg"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Changed my mind</span>
          </Button>
        </div>

        {/* Additional Warning */}
        <div className="mt-6 p-4 bg-red-500/10 rounded-lg border border-red-500/20">
          <p className="text-red-300 text-sm text-center">
            <strong>Note:</strong> You will be immediately signed out and redirected to the home page. 
            This action is permanent and cannot be reversed.
          </p>
        </div>
      </div>
    </Modal>
  )
}