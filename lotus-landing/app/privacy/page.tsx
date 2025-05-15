'use client'

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { colors } from '../styleUtils/colors';

export default function PrivacyPolicy() {
  const [effectiveDate] = useState(new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }));

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.5 }}
      className="py-8"
    >
      <div className="mb-6">
        <Link href="/" style={{ color: colors.readioGold }} className="hover:underline mb-4 inline-block">
          {`← Back to Home`}
        </Link>
      </div>
      
      <div className="space-y-8">
        <div className="border-b border-gray-800 pb-6">
          <h1 style={{ color: colors.readioGold }} className="text-3xl md:text-4xl font-bold mb-2">{`Lotus – Privacy Policy`}</h1>
          <p style={{ color: colors.readioGold }}>{`Effective Date: ${effectiveDate}`}</p>
        </div>
        
        <p className="text-xl" style={{ color: colors.readioWhite }}>{`We value your privacy. This Privacy Policy explains what data we collect and how we use it.`}</p>
        
        <section className="space-y-6">
          <div>
            <h2 style={{ color: colors.readioGold }} className="text-2xl font-semibold mb-4">{`1. Information We Collect`}</h2>
            <div className="space-y-3" style={{ color: colors.readioWhite }}>
              <p><strong style={{ color: colors.readioGold }}>{`Personal Information:`}</strong>{` If you create an account, we collect your email, name, and optionally, profile preferences.`}</p>
              <p><strong style={{ color: colors.readioGold }}>{`Usage Data:`}</strong>{` We collect anonymized analytics to improve user experience, such as time spent on sessions or features used.`}</p>
              <p><strong style={{ color: colors.readioGold }}>{`Device Info:`}</strong>{` We collect non-identifiable device data (OS, version, crashes) to diagnose issues and improve performance.`}</p>
            </div>
          </div>
          
          <div>
            <h2 style={{ color: colors.readioGold }} className="text-2xl font-semibold mb-4">{`2. How We Use Your Data`}</h2>
            <ul className="list-disc list-inside space-y-2" style={{ color: colors.readioWhite }}>
              <li>{`To operate and personalize your app experience.`}</li>
              <li>{`To improve our app through analytics.`}</li>
              <li>{`To communicate updates or respond to inquiries (if you opt-in).`}</li>
            </ul>
          </div>
          
          <div>
            <h2 style={{ color: colors.readioGold }} className="text-2xl font-semibold mb-4">{`3. Third-Party Services`}</h2>
            <p style={{ color: colors.readioWhite }}>{`We may use third-party services for analytics, authentication, or media delivery (e.g., Google Firebase, Expo, Replicate). These services have their own privacy practices.`}</p>
          </div>
          
          <div>
            <h2 style={{ color: colors.readioGold }} className="text-2xl font-semibold mb-4">{`4. Data Retention`}</h2>
            <p style={{ color: colors.readioWhite }}>{`We retain personal data as long as your account is active or as needed to provide services. You can request deletion at any time via `}<span style={{ color: colors.readioGold }}>{`support@lotusapp.com`}</span>{` or your in-app settings.`}</p>
          </div>
          
          <div>
            <h2 style={{ color: colors.readioGold }} className="text-2xl font-semibold mb-4">{`5. Security`}</h2>
            <p style={{ color: colors.readioWhite }}>{`We use reasonable measures to protect your data. However, no app is 100% secure. Use Lotus at your own risk.`}</p>
          </div>
          
          <div>
            <h2 style={{ color: colors.readioGold }} className="text-2xl font-semibold mb-4">{`6. Your Rights`}</h2>
            <p style={{ color: colors.readioWhite }}>{`Depending on your location, you may have rights to access, correct, or delete your personal data. Email us at `}<span style={{ color: colors.readioGold }}>{`support@lotusapp.com`}</span>{` for any requests.`}</p>
          </div>
          
          <div>
            <h2 style={{ color: colors.readioGold }} className="text-2xl font-semibold mb-4">{`7. Children's Privacy`}</h2>
            <p style={{ color: colors.readioWhite }}>{`We do not knowingly collect data from children under 13. If we learn that we have, we'll delete it immediately.`}</p>
          </div>
          
          <div>
            <h2 style={{ color: colors.readioGold }} className="text-2xl font-semibold mb-4">{`8. Changes`}</h2>
            <p style={{ color: colors.readioWhite }}>{`We may update this Privacy Policy. We'll notify users of major changes via the app or email.`}</p>
          </div>
        </section>
      </div>
    </motion.div>
  );
}
