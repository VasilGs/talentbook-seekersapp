import React, { useEffect, useState } from "react";
import { Search, Loader2, X, Check } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { supabase, type User } from "./lib/supabase";

import { UserProfileView } from "./components/UserProfileView";
import { JobSeekerProfileCompletion } from "./components/JobSeekerProfileCompletion";
import { JobCard } from "./components/JobCard";
import { JobDetailsModal } from "./components/JobDetailsModal";

type Page = "search-jobs" | "user-profile" | "complete-profile";

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

export default function App() {
  // auth + page state
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>("search-jobs");

  // profile completion flag (seeker only)
  const [seekerProfileComplete, setSeekerProfileComplete] = useState(false);

  // jobs / swipe
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [currentJobIndex, setCurrentJobIndex] = useState(0);
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(null);

  // details modal
  const [isJobDetailsModalOpen, setIsJobDetailsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // --- Authentication bootstrap (with pretty loader like main app) ---
  useEffect(() => {
    const start = Date.now();
    const MIN = 2500; // keep the same smooth loading animation timing

    supabase.auth.getSession().then(({ data: { session } }) => {
      const remain = Math.max(0, MIN - (Date.now() - start));
      setTimeout(() => {
        setUser(session?.user ?? null);
        if (session?.user) {
          checkSeekerCompletion(session.user);
        } else {
          setSeekerProfileComplete(false);
          setCurrentPage("search-jobs");
        }
        setLoading(false);
      }, remain);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_evt, session) => {
      setLoading(true);
      const wait = setTimeout(() => {
        setUser(session?.user ?? null);
        if (session?.user) {
          checkSeekerCompletion(session.user);
        } else {
          setSeekerProfileComplete(false);
          setCurrentPage("search-jobs");
        }
        setLoading(false);
      }, MIN);
      return () => clearTimeout(wait);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // --- Check if a seeker profile exists (same logic as main app) ---
  const checkSeekerCompletion = async (u: User) => {
    const userType = u.user_metadata?.user_type;
    if (userType !== "job_seeker") {
      // If a company logs into the seekers app, just send them to profile view fallback
      setSeekerProfileComplete(false);
      setCurrentPage("user-profile");
      return;
    }

    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", u.id)
        .maybeSingle();

      if (error || !profile) {
        setSeekerProfileComplete(false);
        setCurrentPage("complete-profile");
      } else {
        setSeekerProfileComplete(true);
      }
    } catch {
      setSeekerProfileComplete(false);
    }
  };

  // --- Jobs fetch (when on search page & logged in) ---
  const fetchJobs = async () => {
    setJobsLoading(true);
    try {
      const { data, error } = await supabase
        .from("job_posts")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (!error) setJobs(data || []);
    } finally {
      setJobsLoading(false);
    }
  };

  useEffect(() => {
    if (user && currentPage === "search-jobs") {
      fetchJobs();
    }
  }, [user, currentPage]);

  // --- UI event handlers (same behavior as main) ---
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // no-op: local UI still clears
    }
  };

  const handleUserNameClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentPage("user-profile");
  };

  const handleSearchJobsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentJobIndex(0);
    setCurrentPage("search-jobs");
  };

  const handleSwipe = (direction: "left" | "right") => {
    // next card
    if (currentJobIndex < jobs.length - 1) {
      setCurrentJobIndex((i) => i + 1);
    } else {
      setCurrentJobIndex(0);
    }
    // clear exit animation direction
    setTimeout(() => setExitDirection(null), 100);
  };

  const handleActionButton = (action: "reject" | "approve") => {
    setExitDirection(action === "reject" ? "left" : "right");
    if (navigator.vibrate) navigator.vibrate(50);
    setTimeout(() => handleSwipe(action === "reject" ? "left" : "right"), 10);
  };

  const handleJobCardClick = (job: Job) => {
    setSelectedJob(job);
    setIsJobDetailsModalOpen(true);
  };

  // --- Loading screen (identical look/feel) ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-8">
            <img
              src="/talent_book_logo_draft_3 copy copy.png"
              alt="TalentBook Logo"
              className="h-16 w-auto mx-auto object-contain"
            />
          </div>
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Loader2 className="w-6 h-6 text-[#FFC107] animate-spin" />
            <span className="text-white text-lg font-medium">Loading TalentBook...</span>
          </div>
          <div className="w-64 h-1 bg-white/20 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-gradient-to-r from-red-600 to-[#FFC107] rounded-full animate-pulse"></div>
          </div>
        </div>

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/5 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FFC107]/5 rounded-full blur-3xl animate-pulse-slow"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white">
      {/* Header */}
      <header className="relative z-10">
        <nav className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-6">
          {/* Logo (clicking acts like “home” → search) */}
          <button
            onClick={handleSearchJobsClick}
            className="focus:outline-none opacity-100 hover:opacity-90 transition"
          >
            <img
              src="/talent_book_logo_draft_3 copy copy.png"
              alt="TalentBook Logo"
              className="h-12 w-auto object-contain"
            />
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center space-x-8">
            {user && (
              <a
                href="#search-jobs"
                onClick={handleSearchJobsClick}
                className="text-gray-300 hover:text-white transition-colors duration-200 font-medium flex items-center space-x-2 hover:bg-white/10 px-4 py-2 rounded-lg"
              >
                <Search className="w-4 h-4" />
                <span>Search Jobs</span>
              </a>
            )}
          </div>

          {/* Auth area */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <button
                  onClick={handleUserNameClick}
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                >
                  {user.user_metadata?.full_name || user.email}
                </button>
                <button
                  onClick={handleSignOut}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:shadow-red-600/25 hover:-translate-y-0.5"
                >
                  Sign Out
                </button>
              </>
            ) : null}
          </div>
        </nav>
      </header>

      {/* Seeker profile view */}
      {user && seekerProfileComplete && currentPage === "user-profile" && (
        <UserProfileView onSignOut={handleSignOut} />
      )}

      {/* Seeker profile completion */}
      {user && !seekerProfileComplete && currentPage === "complete-profile" && (
        // In seeker app we don’t collect signup data via a modal,
        // so provide minimal defaults; the component populates from Supabase after upload.
        <JobSeekerProfileCompletion
          signupData={{
            name: user.user_metadata?.full_name || " ",
            email: user.email || "",
            password: "",
            userType: "job_seeker",
          }}
          onProfileComplete={() => {
            setSeekerProfileComplete(true);
            setCurrentPage("user-profile");
          }}
        />
      )}

      {/* Search / swipe page */}
      {user && seekerProfileComplete && currentPage === "search-jobs" && (
        <div className="min-h-screen py-8 px-4">
          <div className="max-w-md mx-auto">
            {/* Search bar (UI only; same as main) */}
            <div className="mb-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for job"
                  className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all duration-200 pr-14"
                />
                <button className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500 hover:text-red-400 transition-colors duration-200">
                  <Search className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Card stack */}
            <div className="relative h-[500px] mb-1">
              <AnimatePresence mode="wait">
                {jobsLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 text-[#FFC107] animate-spin mx-auto mb-4" />
                      <p className="text-white">Loading jobs...</p>
                    </div>
                  </div>
                ) : jobs.length === 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-white mb-4">No jobs available</h3>
                      <p className="text-gray-300 mb-6">Check back later for new opportunities.</p>
                      <button
                        onClick={fetchJobs}
                        className="bg-[#FFC107] hover:bg-[#FFB300] text-black px-6 py-3 rounded-lg font-semibold transition-all duration-200"
                      >
                        Refresh
                      </button>
                    </div>
                  </div>
                ) : currentJobIndex < jobs.length ? (
                  <JobCard
                    key={jobs[currentJobIndex].id}
                    job={{
                      id: currentJobIndex, // local card id for the component
                      company: jobs[currentJobIndex].company_name,
                      position: jobs[currentJobIndex].position,
                      location: jobs[currentJobIndex].location,
                      salary: jobs[currentJobIndex].salary || "Salary not specified",
                      logo: jobs[currentJobIndex].company_logo || "",
                    }}
                    onSwipe={handleSwipe}
                    onCardClick={() => handleJobCardClick(jobs[currentJobIndex])}
                    exitDirection={exitDirection}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-white mb-4">No more jobs!</h3>
                      <p className="text-gray-300 mb-6">You've seen all available positions.</p>
                      <button
                        onClick={() => setCurrentJobIndex(0)}
                        className="bg-[#FFC107] hover:bg-[#FFB300] text-black px-6 py-3 rounded-lg font-semibold transition-all duration-200"
                      >
                        Start Over
                      </button>
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Action buttons */}
            {!jobsLoading && jobs.length > 0 && currentJobIndex < jobs.length && (
              <div className="flex justify-center space-x-12 mt-2">
                <button
                  onClick={() => handleActionButton("reject")}
                  className="w-16 h-16 bg-gradient-to-br from-red-500/20 to-red-600/20 backdrop-blur-sm border-2 border-red-500/40 rounded-full flex items-center justify-center hover:from-red-500/40 hover:to-red-600/40 hover:border-red-500/70 hover:scale-110 transition-all duration-300 group shadow-lg shadow-red-500/20"
                >
                  <X className="w-8 h-8 text-red-400 group-hover:text-red-300 transition-colors duration-200" />
                </button>
                <button
                  onClick={() => handleActionButton("approve")}
                  className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-sm border-2 border-green-500/40 rounded-full flex items-center justify-center hover:from-green-500/40 hover:to-green-600/40 hover:border-green-500/70 hover:scale-110 active:scale-95 transition-all duration-300 group shadow-lg shadow-green-500/20 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50"
                  aria-label="Approve job"
                  disabled={currentJobIndex >= jobs.length}
                >
                  <Check className="w-8 h-8 text-white/60 group-hover:text-green-400 transition-colors duration-200" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Job details modal (save job etc.) */}
      <JobDetailsModal
        isOpen={isJobDetailsModalOpen}
        onClose={() => setIsJobDetailsModalOpen(false)}
        job={selectedJob}
        userId={user?.id || null}
      />
    </div>
  );
}
