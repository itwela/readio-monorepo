'use client'

import { motion } from 'framer-motion';
import Link from 'next/link';
import { colors } from '../styleUtils/colors';

export default function SupportPage() {
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
          <h1 style={{ color: colors.readioGold }} className="text-3xl md:text-4xl font-bold mb-2">{`Lotus – Support`}</h1>
          <p style={{ color: colors.readioWhite }} className="text-xl">{`Need help with Lotus? We're here for you.`}</p>
        </div>
        
        <section className="space-y-6">
          
          {/* SECTION - FREQUENTLY ASKED QUESTIONS */}
          {/* <div>
            <h2 style={{ color: colors.readioGold }} className="text-2xl font-semibold mb-4">{`Frequently Asked Questions`}</h2>
            <div className="space-y-3" style={{ color: colors.readioWhite }}>
              <p><strong style={{ color: colors.readioGold }}>{`Q: How do I reset my password?`}</strong></p>
              <p>{`A: Currently, password resets can be initiated from the login screen. If you encounter issues, please contact us.`}</p>
              
              <p><strong style={{ color: colors.readioGold }}>{`Q: I'm having trouble with a meditation session.`}</strong></p>
              <p>{`A: Please ensure your app is updated to the latest version and that you have a stable internet connection. If the problem persists, let us know the specific session and device you're using.`}</p>

            </div>
          </div> */}

          {/* SECTION - KNOWN ISSUES */}
          {/* <div>
            <h2 style={{ color: colors.readioGold }} className="text-2xl font-semibold mb-4">{`Known Issues`}</h2>
            <div className="space-y-3" style={{ color: colors.readioWhite }}>
                <p>{`We are currently investigating an issue where [describe known issue, e.g., 'the background audio occasionally stutters on older Android devices during long sessions.']. We appreciate your patience as we work on a fix.`}</p>
                 <p>{`No other major issues are known at this time. If you find something, please report it!`}</p>
            </div>
          </div> */}

          {/* SECTION - CONTACT US */}
          <div>
            <h2 style={{ color: colors.readioGold }} className="text-2xl font-semibold mb-4">{`Contact Us`}</h2>
            <p style={{ color: colors.readioWhite }}>
              {`For any questions, bug reports, or feedback, please don't hesitate to reach out to us at: `}
              <a href="mailto:support@lotusapp.com" style={{ color: colors.readioGold }} className="hover:underline">
                {`support@lotusapp.com`}
              </a>
            </p>
            <p style={{ color: colors.readioWhite, marginTop: '0.5rem' }}>
              {`We typically respond within 24-48 hours.`}
            </p>
          </div>
          
          <div>
            <h2 style={{ color: colors.readioGold }} className="text-2xl font-semibold mb-4">{`Legal & More`}</h2>
            <ul className="list-none space-y-2" style={{ color: colors.readioWhite }}>
              <li>
                <Link href="/privacy" style={{ color: colors.readioGold }} className="hover:underline">
                  {`Privacy Policy`}
                </Link>
              </li>
              <li>
                <Link href="/terms" style={{ color: colors.readioGold }} className="hover:underline">
                  {`Terms and Conditions`}
                </Link>
              </li>
              {/* Optional: Add social media links here */}
              {/*
              <li>
                <a href="https://twitter.com/lotusapp" target="_blank" rel="noopener noreferrer" style={{ color: colors.readioGold }} className="hover:underline">
                  Follow us on X (Twitter)
                </a>
              </li>
              */}
            </ul>
          </div>
        </section>
      </div>
    </motion.div>
  );
}
