"use client";

import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { Check, Star } from "lucide-react";
import { useState, useRef } from "react";
import confetti from "canvas-confetti";
import NumberFlow from "@number-flow/react";
import { Briefcase, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PricingPlan {
  name: string;
  price: string;
  yearlyPrice: string;
  period: string;
  features: string[];
  description: string;
  buttonText: string;
  href: string;
  isPopular: boolean;
  userType: 'job_seeker' | 'employer';
}

interface PricingProps {
  plans: PricingPlan[];
  title?: string;
  description?: string;
  onViewAddOns?: () => void;
}

// Default job seeker plans
const defaultJobSeekerPlans: PricingPlan[] = [
  {
    name: "Basic",
    price: "0",
    yearlyPrice: "0",
    period: "forever",
    features: [
      "View and apply to all job postings",
      "Saved searches + email/push notifications",
      "Public profile/portfolio",
      "Basic job matching",
      "Standard application process"
    ],
    description: "Perfect for professionals starting their job search",
    buttonText: "Get Started Free",
    href: "#",
    isPopular: false,
    userType: 'job_seeker'
  },
  {
    name: "Pro",
    price: "12",
    yearlyPrice: "99",
    period: "month",
    features: [
      "Everything in Basic",
      "Profile Boost (higher in search results): up to 5 boosts/month",
      "Top of the stack when applying: 3 priority highlights/week",
      "Advanced filters (salary, remote, tech stack, etc.)",
      "\"Who viewed me\" + read receipts on messages",
      "Up to 20 direct messages (InMails) to employers/month",
      "CV/cover letter templates + AI tips for optimization"
    ],
    description: "Advanced features for serious job seekers",
    buttonText: "Upgrade to Pro",
    href: "#",
    isPopular: true,
    userType: 'job_seeker'
  }
];

// Default employer plans (keeping existing structure)
const defaultEmployerPlans: PricingPlan[] = [
  {
    name: "Free",
    price: "0",
    yearlyPrice: "0",
    period: "forever",
    features: [
      "Post up to 3 job listings",
      "Basic candidate search",
      "Standard application management",
      "Email notifications",
      "Basic company profile"
    ],
    description: "Perfect for small businesses getting started",
    buttonText: "Get Started Free",
    href: "#",
    isPopular: false,
    userType: 'employer'
  },
  {
    name: "Basic",
    price: "50",
    yearlyPrice: "500",
    period: "month",
    features: [
      "Everything in Free",
      "Unlimited job postings",
      "Advanced candidate search",
      "Priority job placement",
      "Candidate messaging",
      "Application tracking",
      "Basic analytics"
    ],
    description: "Great for growing companies",
    buttonText: "Choose Basic",
    href: "#",
    isPopular: true,
    userType: 'employer'
  },
  {
    name: "Premium",
    price: "150",
    yearlyPrice: "1500",
    period: "month",
    features: [
      "Everything in Basic",
      "Featured company profile",
      "Advanced analytics & insights",
      "Bulk candidate messaging",
      "Custom branding",
      "Priority customer support",
      "API access"
    ],
    description: "For established companies with high-volume hiring",
    buttonText: "Choose Premium",
    href: "#",
    isPopular: false,
    userType: 'employer'
  }
];

export function Pricing({
  plans = [],
  title = "Simple, Transparent Pricing",
  description = "Choose the plan that works for you\nAll plans include access to our platform, lead generation tools, and dedicated support.",
  onViewAddOns,
}: PricingProps) {
  const [isMonthly, setIsMonthly] = useState(true);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const switchRef = useRef<HTMLButtonElement>(null);
  const [selectedUserType, setSelectedUserType] = useState<'job_seeker' | 'employer'>('job_seeker');

  const handleToggle = (checked: boolean) => {
    setIsMonthly(!checked);
    if (checked && switchRef.current) {
      const rect = switchRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      confetti({
        particleCount: 50,
        spread: 60,
        origin: {
          x: x / window.innerWidth,
          y: y / window.innerHeight,
        },
        colors: [
          "#dc2626",
          "#f59e0b",
          "#ef4444",
          "#fbbf24",
        ],
        ticks: 200,
        gravity: 1.2,
        decay: 0.94,
        startVelocity: 30,
        shapes: ["circle"],
      });
    }
  };

  // Use provided plans or default plans based on selected user type
  const allPlans = plans.length > 0 ? plans : [
    ...defaultJobSeekerPlans,
    ...defaultEmployerPlans
  ];
  
  // Filter plans based on selected user type
  const filteredPlans = allPlans.filter(plan => plan.userType === selectedUserType);

  return (
    <div className="py-16 lg:py-24">
      <div className="text-center space-y-4 mb-12">
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white font-poppins">
          {title}
        </h2>
        <p className="text-gray-300 text-lg whitespace-pre-line max-w-3xl mx-auto">
          {description}
        </p>
        
        {/* User Type Selection */}
        <div className="flex justify-center mt-8 mb-8">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-2 border border-white/10 flex items-center space-x-2">
            <button
              onClick={() => setSelectedUserType('job_seeker')}
              className={`flex items-center space-x-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                selectedUserType === 'job_seeker'
                  ? 'bg-[#FFC107] text-black shadow-lg shadow-[#FFC107]/25'
                  : 'bg-transparent text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Briefcase className="w-5 h-5" />
              <span>For Job Seekers</span>
            </button>
            <button
              onClick={() => setSelectedUserType('employer')}
              className={`flex items-center space-x-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                selectedUserType === 'employer'
                  ? 'bg-[#FFC107] text-black shadow-lg shadow-[#FFC107]/25'
                  : 'bg-transparent text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>For Employers</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-center items-center mb-10 space-x-4">
        <span className="text-white font-medium">Monthly</span>
        <Label>
          <Switch
            ref={switchRef as any}
            checked={!isMonthly}
            onCheckedChange={handleToggle}
            className="relative"
          />
        </Label>
        <span className="text-white font-medium">
          Annual <span className="text-red-400">(Save 20%)</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {filteredPlans.map((plan, index) => (
          <motion.div
            key={index}
            initial={{ y: 50, opacity: 0 }}
            whileInView={
              isDesktop
                ? {
                    y: plan.isPopular ? -20 : 0,
                    opacity: 1,
                    x: filteredPlans.length === 3 ? (index === 2 ? -30 : index === 0 ? 30 : 0) : 0,
                    scale: filteredPlans.length === 3 && (index === 0 || index === 2) ? 0.94 : 1.0,
                  }
                : { y: 0, opacity: 1 }
            }
            viewport={{ once: true }}
            transition={{
              duration: 1.6,
              type: "spring",
              stiffness: 100,
              damping: 30,
              delay: 0.4,
              opacity: { duration: 0.5 },
            }}
            className={cn(
              `rounded-2xl border p-8 bg-white/5 backdrop-blur-sm text-center lg:flex lg:flex-col lg:justify-center relative`,
              plan.isPopular ? "border-[#FFC107] border-2" : "border-white/20",
              "flex flex-col",
              !plan.isPopular && "mt-5",
              filteredPlans.length === 3 && (index === 0 || index === 2)
                ? "z-0 transform translate-x-0 translate-y-0"
                : "z-10",
            )}
          >
            {plan.isPopular && (
              <div className="absolute top-0 right-0 bg-[#FFC107] py-1 px-3 rounded-bl-xl rounded-tr-xl flex items-center">
                <Star className="text-white h-4 w-4 fill-current" />
                <span className="text-black ml-1 font-sans font-semibold text-sm">
                  Popular
                </span>
              </div>
            )}
            <div className="flex-1 flex flex-col">
              <p className="text-base font-semibold text-gray-300 uppercase tracking-wide">
                {plan.name}
              </p>
              <div className="mt-6 flex items-center justify-center gap-x-2">
                <span className="text-5xl font-bold tracking-tight text-white">
                  <NumberFlow
                    value={
                      isMonthly ? Number(plan.price) : Number(plan.yearlyPrice)
                    }
                    format={{
                      style: "currency",
                      currency: "EUR",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }}
                    formatter={(value) => `€${value}`}
                    transformTiming={{
                      duration: 500,
                      easing: "ease-out",
                    }}
                    willChange
                    className="font-variant-numeric: tabular-nums"
                  />
                </span>
                {plan.period !== "Next 3 months" && (
                  <span className="text-sm font-semibold leading-6 tracking-wide text-gray-400">
                    / {plan.period}
                  </span>
                )}
              </div>

              <p className="text-xs leading-5 text-gray-400 mb-6">
                {isMonthly ? "billed monthly" : "billed annually"}
              </p>

              <ul className="mt-5 gap-3 flex flex-col">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <span className="text-left text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <hr className="w-full my-6 border-white/20" />

              <button
                className={cn(
                  buttonVariants({
                    variant: "outline",
                  }),
                  "group relative w-full gap-2 overflow-hidden text-lg font-semibold tracking-tighter",
                  "transform-gpu ring-offset-current transition-all duration-300 ease-out hover:ring-2 hover:ring-[#FFC107] hover:ring-offset-1",
                  plan.isPopular
                    ? "bg-[#FFC107] text-black border-[#FFC107] hover:bg-[#FFB300]"
                    : "bg-transparent text-white border-white/30 hover:bg-[#FFC107] hover:text-black hover:border-[#FFC107]"
                )}
              >
                {plan.buttonText}
              </button>
              <p className="mt-4 text-xs leading-5 text-gray-400">
                {plan.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* New button for Add-ons */}
      {onViewAddOns && (
        <div className="mt-12 text-center">
          <Button
            onClick={onViewAddOns}
            className="bg-[#FFC107] hover:bg-[#FFB300] text-black px-8 py-4 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-[#FFC107]/25 text-lg flex items-center justify-center mx-auto space-x-3"
          >
            <Zap className="w-6 h-6" />
            <span>Explore Premium Add-ons</span>
          </Button>
        </div>
      )}

      {/* New button for Add-ons */}
      {onViewAddOns && (
        <div className="mt-12 text-center">
          <Button
            onClick={onViewAddOns}
            className="bg-[#FFC107] hover:bg-[#FFB300] text-black px-8 py-4 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-[#FFC107]/25 text-lg flex items-center justify-center mx-auto space-x-3"
          >
            <Zap className="w-6 h-6" />
            <span>Explore Premium Add-ons</span>
          </Button>
        </div>
      )}
    </div>
  );
}