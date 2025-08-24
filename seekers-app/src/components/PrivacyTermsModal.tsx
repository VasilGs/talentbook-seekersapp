import React from 'react'
import { Modal } from './ui/modal'
import { Button } from './ui/button'
import { Shield, Mail, Phone, Building2, Globe, Lock, Eye, FileText } from 'lucide-react'

interface PrivacyTermsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PrivacyTermsModal({ isOpen, onClose }: PrivacyTermsModalProps) {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      className="bg-gradient-to-br from-neutral-800 via-neutral-900 to-neutral-800 border border-white/20 max-w-4xl max-h-[90vh] overflow-y-auto"
    >
      <div className="p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-[#FFC107] to-[#FFB300] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 font-poppins">
            PRIVACY POLICY AND TERMS OF USE
          </h1>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 mb-6">
            <h2 className="text-xl font-semibold text-[#FFC107] mb-3">TALENTBOOK PLATFORM</h2>
            <div className="space-y-2 text-gray-300">
              <p className="flex items-center justify-center">
                <Building2 className="w-4 h-4 mr-2 text-[#FFC107]" />
                Owned by Geocorp Global Services Ltd.
              </p>
              <p className="flex items-center justify-center">
                <FileText className="w-4 h-4 mr-2 text-[#FFC107]" />
                Company ID: 205493264
              </p>
              <p className="flex items-center justify-center">
                <Globe className="w-4 h-4 mr-2 text-[#FFC107]" />
                Address: Sofia, Frank Lloyd Wright St. 2
              </p>
              <p className="flex items-center justify-center">
                <Mail className="w-4 h-4 mr-2 text-[#FFC107]" />
                Email: privacy@talentbook.com
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8 text-gray-300 leading-relaxed">
          {/* Section 1 */}
          <section className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <span className="w-8 h-8 bg-[#FFC107] rounded-full flex items-center justify-center text-black font-bold text-sm mr-3">1</span>
              Introduction
            </h3>
            <p>
              Welcome to the Talentbook platform – an innovative service for posting job advertisements 
              and professional communication with Swipe functionality. This Privacy Policy and Terms of 
              Use describe the rules for processing your personal data and the conditions for using the 
              platform's services.
            </p>
          </section>

          {/* Section 2 */}
          <section className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <span className="w-8 h-8 bg-[#FFC107] rounded-full flex items-center justify-center text-black font-bold text-sm mr-3">2</span>
              Data Controller
            </h3>
            <p>
              The Data Controller is Geocorp Global Services Ltd., registered office and address: Sofia, 
              Frank Lloyd Wright St. 2, Company ID: 205493264, contact email: privacy@talentbook.com.
            </p>
          </section>

          {/* Section 3 */}
          <section className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <span className="w-8 h-8 bg-[#FFC107] rounded-full flex items-center justify-center text-black font-bold text-sm mr-3">3</span>
              Types of Data Collected
            </h3>
            <p className="mb-4">When using the platform, we collect the following categories of data:</p>
            <ul className="space-y-2 ml-4">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-[#FFC107] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Data you provide during registration and profile creation (name, company name, phone, email, photo, professional information, CV, job ads, etc.);
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-[#FFC107] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Data from your public profile visible to other users according to your privacy settings;
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-[#FFC107] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Technical data from devices and logs, including IP address, device type, browser, cookies, unique identifiers, location information, and other metadata;
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-[#FFC107] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Content of chat communication conducted through the platform between employers and candidates.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <span className="w-8 h-8 bg-[#FFC107] rounded-full flex items-center justify-center text-black font-bold text-sm mr-3">4</span>
              Purposes of Processing Personal Data
            </h3>
            <p className="mb-4">Your personal data is processed for the following purposes:</p>
            <ul className="space-y-2 ml-4">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-[#FFC107] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Creating, managing, and maintaining a Talentbook profile;
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-[#FFC107] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Posting job ads and applying for job positions;
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-[#FFC107] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Connecting and communicating between employers and candidates via chat;
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-[#FFC107] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Personalizing content, advertisements, and marketing activities;
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-[#FFC107] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Fulfilling contractual obligations and complying with legal requirements;
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-[#FFC107] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Improving and developing the platform's services.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <span className="w-8 h-8 bg-[#FFC107] rounded-full flex items-center justify-center text-black font-bold text-sm mr-3">5</span>
              Legal Basis for Processing
            </h3>
            <p className="mb-4">Personal data processing is based on:</p>
            <ul className="space-y-2 ml-4">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-[#FFC107] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Your explicit, free, specific, informed, and unambiguous consent, which you may withdraw at any time without affecting the lawfulness of processing before withdrawal;
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-[#FFC107] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Performance of a contract to which you are a party;
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-[#FFC107] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Legitimate interest of the controller (e.g., ensuring security, improving services, marketing activities respecting your interests);
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-[#FFC107] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Legal requirements.
              </li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <span className="w-8 h-8 bg-[#FFC107] rounded-full flex items-center justify-center text-black font-bold text-sm mr-3">6</span>
              Sharing Personal Data
            </h3>
            <p className="mb-4">Data may be shared with:</p>
            <ul className="space-y-2 ml-4 mb-6">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-[#FFC107] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Other users within the platform (employers and candidates);
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-[#FFC107] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                IT service providers and hosting;
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-[#FFC107] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Marketing and advertising partners;
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-[#FFC107] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Partners in over 197 countries, strictly observing data protection measures;
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-[#FFC107] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Legislative and supervisory authorities upon request and according to law.
              </li>
            </ul>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2 flex items-center">
                <Globe className="w-4 h-4 mr-2 text-blue-400" />
                Data Transfer Outside the EU/EEA
              </h4>
              <p className="text-sm">
                If personal data is transferred outside the European Union and European Economic Area, we ensure 
                appropriate safeguards for your data according to Regulation (EU) 2016/679, such as using standard 
                contractual clauses approved by the European Commission.
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <span className="w-8 h-8 bg-[#FFC107] rounded-full flex items-center justify-center text-black font-bold text-sm mr-3">7</span>
              Data Retention
            </h3>
            <p>
              Personal data is stored for the period necessary to achieve the purposes for which it was 
              collected or according to legal requirements, but no longer than 7 years after the last activity 
              on the profile.
            </p>
          </section>

          {/* Section 8 */}
          <section className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <span className="w-8 h-8 bg-[#FFC107] rounded-full flex items-center justify-center text-black font-bold text-sm mr-3">8</span>
              Your Rights Regarding Personal Data
            </h3>
            <p className="mb-4">As a user, you have the right to:</p>
            <ul className="space-y-2 ml-4 mb-6">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-[#FFC107] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Access your personal data;
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-[#FFC107] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Request correction of inaccurate or incomplete data;
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-[#FFC107] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Request deletion of data ("Right to be forgotten");
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-[#FFC107] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Restrict data processing;
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-[#FFC107] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Receive your personal data in a structured, commonly used, and machine-readable format;
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-[#FFC107] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Object to data processing;
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-[#FFC107] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Withdraw your consent at any time without affecting the lawfulness of processing until withdrawal;
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-[#FFC107] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                File a complaint with the Commission for Personal Data Protection (CPDP).
              </li>
            </ul>
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2 flex items-center">
                <Mail className="w-4 h-4 mr-2 text-green-400" />
                Exercising Your Rights
              </h4>
              <p className="text-sm">
                To exercise your rights, you can contact us at the provided email: privacy@talentbook.com. We will 
                respond within 1 month from receipt of your request, and if necessary, this period may be extended 
                by 2 months with notification.
              </p>
            </div>
          </section>

          {/* Continue with remaining sections... */}
          {/* Section 9 */}
          <section className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <span className="w-8 h-8 bg-[#FFC107] rounded-full flex items-center justify-center text-black font-bold text-sm mr-3">9</span>
              Automated Processing
            </h3>
            <p>
              The platform may use automated processes, including profiling, to personalize content and 
              advertisements. Users have the right not to be subject to automated decision-making with 
              legal effects or significantly affecting their interests unless they have given explicit consent.
            </p>
          </section>

          {/* Section 10 */}
          <section className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <span className="w-8 h-8 bg-[#FFC107] rounded-full flex items-center justify-center text-black font-bold text-sm mr-3">10</span>
              Processing Data of Children
            </h3>
            <p>
              The platform is not intended for persons under 14 years of age. If you are under this age, 
              please do not use our services without parental or guardian consent.
            </p>
          </section>

          {/* Section 11 */}
          <section className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <span className="w-8 h-8 bg-[#FFC107] rounded-full flex items-center justify-center text-black font-bold text-sm mr-3">11</span>
              Data Protection Officer (DPO)
            </h3>
            <p>
              For questions related to personal data processing, you can also contact our Data Protection 
              Officer at: <a href="mailto:dpo@talentbook.com" className="text-[#FFC107] hover:text-[#FFB300] transition-colors duration-200">dpo@talentbook.com</a>.
            </p>
          </section>

          {/* Section 12 - Cookies */}
          <section className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <span className="w-8 h-8 bg-[#FFC107] rounded-full flex items-center justify-center text-black font-bold text-sm mr-3">12</span>
              Cookies
            </h3>
            <p className="mb-4">Talentbook uses "cookies" and similar technologies for:</p>
            <ul className="space-y-2 ml-4 mb-6">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-[#FFC107] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Ensuring functionality and managing user sessions;
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-[#FFC107] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Analyzing and improving the service by collecting anonymized information about user behavior;
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-[#FFC107] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Personalizing content and ads according to your interests;
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-[#FFC107] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Executing technical and marketing tasks to ensure optimal platform performance.
              </li>
            </ul>
            
            <h4 className="text-white font-semibold mb-3">Types of Cookies:</h4>
            <ul className="space-y-2 ml-4 mb-6">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <strong className="text-white">Necessary cookies:</strong> provide the basic functionality of the platform and allow its use;
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <strong className="text-white">Analytical cookies:</strong> collect information about site usage to improve services;
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <strong className="text-white">Advertising cookies:</strong> used to personalize the ads shown to you.
              </li>
            </ul>

            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2 flex items-center">
                <Eye className="w-4 h-4 mr-2 text-orange-400" />
                Consent and Cookie Management
              </h4>
              <p className="text-sm">
                Before using all cookies except strictly necessary ones, we will ask for your consent via a visible 
                banner. You can manage, limit, or delete cookies through your browser settings or via the platform's 
                interface. Refusing some types of cookies may limit platform functionality.
              </p>
            </div>
          </section>

          {/* Section 13 */}
          <section className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <span className="w-8 h-8 bg-[#FFC107] rounded-full flex items-center justify-center text-black font-bold text-sm mr-3">13</span>
              Data Security
            </h3>
            <p className="mb-4">
              We apply adequate technical and organizational measures to protect personal data against 
              unauthorized access, loss, alteration, or destruction, including:
            </p>
            <ul className="space-y-2 ml-4">
              <li className="flex items-start">
                <Lock className="w-4 h-4 mt-1 mr-3 text-[#FFC107] flex-shrink-0" />
                Data encryption;
              </li>
              <li className="flex items-start">
                <Lock className="w-4 h-4 mt-1 mr-3 text-[#FFC107] flex-shrink-0" />
                Restricted access to data;
              </li>
              <li className="flex items-start">
                <Lock className="w-4 h-4 mt-1 mr-3 text-[#FFC107] flex-shrink-0" />
                Staff training on privacy issues;
              </li>
              <li className="flex items-start">
                <Lock className="w-4 h-4 mt-1 mr-3 text-[#FFC107] flex-shrink-0" />
                Periodic security audits and checks.
              </li>
            </ul>
          </section>

          {/* Section 14 */}
          <section className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <span className="w-8 h-8 bg-[#FFC107] rounded-full flex items-center justify-center text-black font-bold text-sm mr-3">14</span>
              Terms of Use
            </h3>
            <ul className="space-y-3 ml-4">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-[#FFC107] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Users (employers and candidates) create and manage their profiles themselves and are responsible for the accuracy and timeliness of the information provided;
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-[#FFC107] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Use of the platform for illegal activities, spam, or rights violations is prohibited;
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-[#FFC107] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                The platform is not responsible for relationships or actions between employers and candidates conducted outside the system;
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-[#FFC107] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Users retain ownership rights over the profiles and content they create;
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-[#FFC107] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Geocorp Global Services Ltd. reserves the right to change services and terms, notifying users about the changes accordingly.
              </li>
            </ul>
          </section>

          {/* Section 15 */}
          <section className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <span className="w-8 h-8 bg-[#FFC107] rounded-full flex items-center justify-center text-black font-bold text-sm mr-3">15</span>
              Contacts
            </h3>
            <p className="mb-4">For questions related to privacy and personal data processing, you can contact us at:</p>
            <div className="space-y-3">
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-3 text-[#FFC107]" />
                <span>Email: </span>
                <a href="mailto:privacy@talentbook.com" className="text-[#FFC107] hover:text-[#FFB300] transition-colors duration-200 ml-1">
                  privacy@talentbook.com
                </a>
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-3 text-[#FFC107]" />
                <span>Phone: [contact phone number]</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-3 text-[#FFC107]" />
                <span>DPO Email: </span>
                <a href="mailto:dpo@talentbook.com" className="text-[#FFC107] hover:text-[#FFB300] transition-colors duration-200 ml-1">
                  dpo@talentbook.com
                </a>
              </div>
            </div>
          </section>

          {/* Last Updated */}
          <div className="text-center py-6 border-t border-white/10">
            <p className="text-gray-400 text-sm">
              <strong>Last updated:</strong> 19.08.2025
            </p>
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-8 text-center">
          <Button
            onClick={onClose}
            className="bg-[#FFC107] hover:bg-[#FFB300] text-black px-8 py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-[#FFC107]/25"
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  )
}