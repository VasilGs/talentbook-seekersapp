import React from 'react'
import { motion, useMotionValue, useTransform, PanInfo } from 'motion/react'
import { MapPin, DollarSign } from 'lucide-react'

interface Job {
  id: number
  company: string
  position: string
  location: string
  salary: string
  logo: string
}

interface JobCardProps {
  job: Job
  onSwipe: (direction: 'left' | 'right') => void
  onCardClick: (job: Job) => void
  exitDirection?: 'left' | 'right' | null
}

export function JobCard({ job, onSwipe, onCardClick, exitDirection }: JobCardProps) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-30, 30])
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0])

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 150
    
    if (info.offset.x > threshold) {
      // Swipe right - approval
      onSwipe('right')
    } else if (info.offset.x < -threshold) {
      // Swipe left - refusal
      onSwipe('left')
    } else {
      // Reset position if not swiped far enough
      x.set(0)
    }
  }

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent card click when dragging
    if (Math.abs(x.get()) > 10) return
    
    e.preventDefault()
    onCardClick(job)
  }

  return (
    <motion.div
      className="relative w-full max-w-sm mx-auto bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 cursor-grab active:cursor-grabbing"
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      onClick={handleCardClick}
      whileDrag={{ scale: 1.05 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ 
        x: exitDirection === 'right' ? 400 : exitDirection === 'left' ? -400 : (x.get() > 0 ? 400 : -400),
        opacity: 0,
        rotate: exitDirection === 'right' ? 15 : exitDirection === 'left' ? -15 : (x.get() > 0 ? 15 : -15),
        transition: { 
          duration: 0.4,
          ease: [0.4, 0, 0.2, 1] // Custom cubic-bezier for smooth easing
        }
      }}
      transition={{ 
        type: "spring", 
        damping: 25, 
        stiffness: 400,
        mass: 0.8
      }}
    >
      {/* Company Logo */}
      <div className="flex justify-center mb-6">
        <div className="w-24 h-24 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center overflow-hidden">
          {job.logo ? (
            <img 
              src={job.logo} 
              alt={`${job.company} logo`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-white/60 text-center">
              <div className="text-xs font-medium">Company</div>
              <div className="text-xs">Logo</div>
            </div>
          )}
        </div>
      </div>

      {/* Job Information */}
      <div className="text-center space-y-4">
        {/* Company and Position */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-2">
            {job.company} is looking for
          </h2>
          <h3 className="text-2xl font-bold text-white">
            {job.position}
          </h3>
        </div>

        {/* Location */}
        <div className="flex items-center justify-center text-gray-300">
          <MapPin className="w-4 h-4 mr-2" />
          <span>{job.location}</span>
        </div>

        {/* Salary */}
        <div className="flex items-center justify-center text-gray-300">
          <DollarSign className="w-4 h-4 mr-2" />
          <span>{job.salary}</span>
        </div>

        {/* Click to view details hint */}
        <div className="w-full bg-[#FFC107] border border-[#FFC107] text-black py-4 px-8 rounded-2xl font-medium text-center mt-6 transition-all duration-200 hover:bg-[#FFB300]">
          Tap to view details
        </div>
      </div>

      {/* Swipe Indicators */}
      <motion.div
        className="absolute top-8 left-8 bg-red-500/20 border-2 border-red-500 rounded-xl px-4 py-2"
        style={{ 
          opacity: useTransform(x, [-150, -50, 0], [1, 0.5, 0]),
          rotate: useTransform(x, [-150, 0], [-15, 0])
        }}
      >
        <span className="text-red-400 font-bold text-lg">PASS</span>
      </motion.div>

      <motion.div
        className="absolute top-8 right-8 bg-green-500/20 border-2 border-green-500 rounded-xl px-4 py-2"
        style={{ 
          opacity: useTransform(x, [0, 50, 150], [0, 0.5, 1]),
          rotate: useTransform(x, [0, 150], [0, 15])
        }}
      >
        <span className="text-green-400 font-bold text-lg">LIKE</span>
      </motion.div>
    </motion.div>
  )
}