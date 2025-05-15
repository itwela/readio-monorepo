'use client'

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { colors } from '../styleUtils/colors';

export default function TermsOfService() {
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
          ← Back to Home
        </Link>
      </div>
      
      <div className="space-y-8">
        <div className="border-b border-gray-800 pb-6">
          <h1 style={{ color: colors.readioGold }} className="text-3xl md:text-4xl font-bold mb-2">Lotus – Terms of Service</h1>
          <p style={{ color: colors.readioGold }}>Effective Date: {effectiveDate}</p>
        </div>
        
        <p className="text-xl" style={{ color: colors.readioWhite }}>{`Welcome to Lotus. By using our mobile application, you agree to these Terms of Service ("Terms"). If you do not agree, do not use the app.`}</p>
        
        <section className="space-y-6">
          <div>
            <h2 style={{ color: colors.readioGold }} className="text-2xl font-semibold mb-4">1. Use of the App</h2>
            <p style={{ color: colors.readioWhite }}>{`You must be at least 13 years old to use Lotus. By using the app, you affirm that you meet this requirement. You agree not to use Lotus for any unlawful or harmful purposes.`}</p>
          </div>
          
          <div>
            <h2 style={{ color: colors.readioGold }} className="text-2xl font-semibold mb-4">2. Accounts</h2>
            <p style={{ color: colors.readioWhite }}>{`To access certain features, you may need to create an account. You are responsible for maintaining the confidentiality of your login credentials and for all activities under your account.`}</p>
          </div>
          
          <div>
            <h2 style={{ color: colors.readioGold }} className="text-2xl font-semibold mb-4">3. Content & Media</h2>
            <p style={{ color: colors.readioWhite }}>{`All content provided, including videos, music, and guided sessions, is for personal, non-commercial use only. You may not copy, distribute, or modify content without written permission.`}</p>
          </div>
          
          <div>
            <h2 style={{ color: colors.readioGold }} className="text-2xl font-semibold mb-4">4. Subscription & Payments</h2>
            <p style={{ color: colors.readioWhite }}>{`Some features may require a paid subscription. By subscribing, you agree to the pricing and billing terms presented to you. Payments are handled through the App Store / Play Store, and you are subject to their refund policies.`}</p>
          </div>
          
          <div>
            <h2 style={{ color: colors.readioGold }} className="text-2xl font-semibold mb-4">5. Disclaimer</h2>
            <p style={{ color: colors.readioWhite }}>{`Lotus does not provide medical advice. The content is for informational and wellness purposes only. Always consult a qualified healthcare provider regarding your health or mental state.`}</p>
          </div>
          
          <div>
            <h2 style={{ color: colors.readioGold }} className="text-2xl font-semibold mb-4">6. Limitation of Liability</h2>
            <p style={{ color: colors.readioWhite }}>{`Lotus is provided "as is" and we disclaim all warranties. We are not liable for any damages arising from your use of the app.`}</p>
          </div>
          
          <div>
            <h2 style={{ color: colors.readioGold }} className="text-2xl font-semibold mb-4">7. Modifications</h2>
            <p style={{ color: colors.readioWhite }}>{`We may update these Terms. Continued use of the app after changes means you accept the new terms. We'll notify you of significant updates.`}</p>
          </div>
          
          <div>
            <h2 style={{ color: colors.readioGold }} className="text-2xl font-semibold mb-4">8. Governing Law</h2>
            <p style={{ color: colors.readioWhite }}>{`These Terms are governed by the laws of the State of California. Disputes will be resolved in the courts of California.`}</p>
          </div>
        </section>
      </div>
    </motion.div>
  );
}
