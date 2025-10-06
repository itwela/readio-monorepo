'use client'

import { motion } from 'framer-motion';
import Image from 'next/image';
import React, { useState } from 'react';
import logo from '../assets/images/cropwhitelogo.png';
import { colors } from "../styleUtils/colors";
// TODO: Uncomment after running 'npx convex dev' to regenerate types
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ConvexProvider, ConvexReactClient } from "convex/react";

// Initialize Convex client
const convex = new ConvexReactClient('https://brainy-kingfisher-980.convex.cloud');

interface SurveyData {
  dailyUse: string;
  featuresUsed: string[];
  valueRating: number;
  easeOfUse: string;
  frictionPoints: string;
  stickiness: string;
  emotionalConnection: string;
  dailyRhythm: string;
  shareability: string;
  wishlist: string;
}

function FeedbackSurvey() {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 11; // 10 survey steps + 1 optional contact step
  const [surveyData, setSurveyData] = useState<SurveyData>({
    dailyUse: '',
    featuresUsed: [],
    valueRating: 0,
    easeOfUse: '',
    frictionPoints: '',
    stickiness: '',
    emotionalConnection: '',
    dailyRhythm: '',
    shareability: '',
    wishlist: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  
  // Convex mutation for creating feedback survey
  const createFeedbackSurvey = useMutation(api.userFeedbackSurveys.createFeedbackSurvey);

  const handleFeatureToggle = (feature: string) => {
    setSurveyData(prev => ({
      ...prev,
      featuresUsed: prev.featuresUsed.includes(feature)
        ? prev.featuresUsed.filter(f => f !== feature)
        : prev.featuresUsed.length < 2
        ? [...prev.featuresUsed, feature]
        : prev.featuresUsed
    }));
  };

  const handleInputChange = (field: keyof SurveyData, value: string | number) => {
    setSurveyData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const normalizeResponses = (data: SurveyData): SurveyData => {
    return {
      dailyUse: data.dailyUse.trim() === '' ? 'blank' : data.dailyUse,
      featuresUsed: data.featuresUsed.length === 0 ? ['blank'] : data.featuresUsed,
      valueRating: data.valueRating || 0,
      easeOfUse: data.easeOfUse.trim() === '' ? 'blank' : data.easeOfUse,
      frictionPoints: data.frictionPoints.trim() === '' ? 'blank' : data.frictionPoints,
      stickiness: data.stickiness.trim() === '' ? 'blank' : data.stickiness,
      emotionalConnection: data.emotionalConnection.trim() === '' ? 'blank' : data.emotionalConnection,
      dailyRhythm: data.dailyRhythm.trim() === '' ? 'blank' : data.dailyRhythm,
      shareability: data.shareability.trim() === '' ? 'blank' : data.shareability,
      wishlist: data.wishlist.trim() === '' ? 'blank' : data.wishlist,
    };
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // TODO: Uncomment after running 'npx convex dev' to regenerate types
    try {
      // Save survey data to Convex
      const normalized = normalizeResponses(surveyData);
      await createFeedbackSurvey({
        responses: normalized,
        user_email: userEmail.trim() === '' ? undefined : userEmail.trim(),
        user_name: userName.trim() === '' ? undefined : userName.trim(),
      });
      
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting survey:', error);
      // You could show an error message here
    } finally {
      setIsSubmitting(false);
    }
    

  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return surveyData.dailyUse !== '';
      case 2: return surveyData.featuresUsed.length === 2;
      case 3: return surveyData.valueRating > 0;
      case 4: return surveyData.easeOfUse.trim() !== '';
      case 5: return surveyData.frictionPoints.trim() !== '';
      case 6: return surveyData.stickiness.trim() !== '';
      case 7: return surveyData.emotionalConnection.trim() !== '';
      case 8: return surveyData.dailyRhythm.trim() !== '';
      case 9: return surveyData.shareability !== '';
      case 10: return surveyData.wishlist.trim() !== '';
      case 11: return true; // optional contact info step
      default: return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-main-bold text-center" style={{ color: colors.readioWhite }}>
              Daily Use
            </h2>
            <p className="text-center font-main" style={{ color: colors.readioWhite }}>
              On average, how many times per day do you open the Lotus App?
            </p>
            <div className="space-y-3">
              {['1-2 times', '3-5 times', '6+ times'].map((option) => (
                <button
                  key={option}
                  onClick={() => handleInputChange('dailyUse', option)}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    surveyData.dailyUse === option
                      ? 'border-orange-400 bg-orange-400/20'
                      : 'border-gray-300 hover:border-orange-300'
                  }`}
                  style={{ 
                    backgroundColor: surveyData.dailyUse === option ? 'rgba(219, 88, 26, 0.2)' : 'transparent',
                    borderColor: surveyData.dailyUse === option ? colors.readioOrange : colors.readioWhite,
                    color: colors.readioWhite
                  }}
                >
                  {surveyData.dailyUse === option ? '☑' : '☐'} {option}
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-main-bold text-center" style={{ color: colors.readioWhite }}>
              Features in Flow
            </h2>
            <p className="text-center font-main" style={{ color: colors.readioWhite }}>
              Which 2 features do you use the most?
            </p>
            <div className="space-y-3">
              {[
                'Timers (fitness/focus/recovery)',
                'Hydration reminders',
                'Step tracker (DailyRhythm)',
                'Guided meditations',
                'FitHop music',
                'Audio literature'
              ].map((feature) => (
                <button
                  key={feature}
                  onClick={() => handleFeatureToggle(feature)}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    surveyData.featuresUsed.includes(feature)
                      ? 'border-orange-400 bg-orange-400/20'
                      : 'border-gray-300 hover:border-orange-300'
                  }`}
                  style={{ 
                    backgroundColor: surveyData.featuresUsed.includes(feature) ? 'rgba(219, 88, 26, 0.2)' : 'transparent',
                    borderColor: surveyData.featuresUsed.includes(feature) ? colors.readioOrange : colors.readioWhite,
                    color: colors.readioWhite
                  }}
                >
                  {surveyData.featuresUsed.includes(feature) ? '☑' : '☐'} {feature}
                </button>
              ))}
              <p className="text-sm text-center opacity-80" style={{ color: colors.readioWhite }}>
                Selected: {surveyData.featuresUsed.length}/2
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-main-bold text-center" style={{ color: colors.readioWhite }}>
              Value Check
            </h2>
            <p className="text-center font-main" style={{ color: colors.readioWhite }}>
              On a scale of 1–10, how valuable do you feel the Lotus App is to your daily wellbeing?
            </p>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleInputChange('valueRating', rating)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    surveyData.valueRating === rating
                      ? 'border-orange-400 bg-orange-400/20'
                      : 'border-gray-300 hover:border-orange-300'
                  }`}
                  style={{ 
                    backgroundColor: surveyData.valueRating === rating ? 'rgba(219, 88, 26, 0.2)' : 'transparent',
                    borderColor: surveyData.valueRating === rating ? colors.readioOrange : colors.readioWhite,
                    color: colors.readioWhite
                  }}
                >
                  {rating}
                </button>
              ))}
            </div>
            <p className="text-center text-sm opacity-80" style={{ color: colors.readioWhite }}>
              1 = Not valuable at all, 10 = Extremely valuable
            </p>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-main-bold text-center" style={{ color: colors.readioWhite }}>
              Ease of Use
            </h2>
            <p className="text-center font-main" style={{ color: colors.readioWhite }}>
              What feels most smooth or intuitive about using the app right now? (1–2 sentences)
            </p>
            <textarea
              value={surveyData.easeOfUse}
              onChange={(e) => handleInputChange('easeOfUse', e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full p-4 rounded-lg border-2 resize-none"
              rows={4}
              style={{ 
                backgroundColor: colors.readioBlack,
                borderColor: colors.readioWhite,
                color: colors.readioWhite
              }}
            />
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-main-bold text-center" style={{ color: colors.readioWhite }}>
              Friction Points
            </h2>
            <p className="text-center font-main" style={{ color: colors.readioWhite }}>
              {`What's one small thing that feels clunky, confusing, or gets in your way?`}
            </p>
            <textarea
              value={surveyData.frictionPoints}
              onChange={(e) => handleInputChange('frictionPoints', e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full p-4 rounded-lg border-2 resize-none"
              rows={4}
              style={{ 
                backgroundColor: colors.readioBlack,
                borderColor: colors.readioWhite,
                color: colors.readioWhite
              }}
            />
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-main-bold text-center" style={{ color: colors.readioWhite }}>
              Stickiness
            </h2>
            <p className="text-center font-main" style={{ color: colors.readioWhite }}>
              {`If you missed using Lotus for a week, what's the first thing you'd miss the most?`}
            </p>
            <textarea
              value={surveyData.stickiness}
              onChange={(e) => handleInputChange('stickiness', e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full p-4 rounded-lg border-2 resize-none"
              rows={4}
              style={{ 
                backgroundColor: colors.readioBlack,
                borderColor: colors.readioWhite,
                color: colors.readioWhite
              }}
            />
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-main-bold text-center" style={{ color: colors.readioWhite }}>
              Emotional Connection
            </h2>
            <p className="text-center font-main" style={{ color: colors.readioWhite }}>
              How does using Lotus make you feel in a word or short phrase? (e.g., grounded, focused, curious)
            </p>
            <textarea
              value={surveyData.emotionalConnection}
              onChange={(e) => handleInputChange('emotionalConnection', e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full p-4 rounded-lg border-2 resize-none"
              rows={4}
              style={{ 
                backgroundColor: colors.readioBlack,
                borderColor: colors.readioWhite,
                color: colors.readioWhite
              }}
            />
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-main-bold text-center" style={{ color: colors.readioWhite }}>
              Daily Rhythm
            </h2>
            <p className="text-center font-main" style={{ color: colors.readioWhite }}>
              Have you noticed any positive habits or rhythms forming because of Lotus? If yes, which ones?
            </p>
            <textarea
              value={surveyData.dailyRhythm}
              onChange={(e) => handleInputChange('dailyRhythm', e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full p-4 rounded-lg border-2 resize-none"
              rows={4}
              style={{ 
                backgroundColor: colors.readioBlack,
                borderColor: colors.readioWhite,
                color: colors.readioWhite
              }}
            />
          </div>
        );

      case 9:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-main-bold text-center" style={{ color: colors.readioWhite }}>
              Shareability
            </h2>
            <p className="text-center font-main" style={{ color: colors.readioWhite }}>
              Would you recommend Lotus to a friend?
            </p>
            <div className="space-y-3">
              {['Already have', 'Would if asked', 'Not yet'].map((option) => (
                <button
                  key={option}
                  onClick={() => handleInputChange('shareability', option)}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    surveyData.shareability === option
                      ? 'border-orange-400 bg-orange-400/20'
                      : 'border-gray-300 hover:border-orange-300'
                  }`}
                  style={{ 
                    backgroundColor: surveyData.shareability === option ? 'rgba(219, 88, 26, 0.2)' : 'transparent',
                    borderColor: surveyData.shareability === option ? colors.readioOrange : colors.readioWhite,
                    color: colors.readioWhite
                  }}
                >
                  {surveyData.shareability === option ? '☑' : '☐'} {option}
                </button>
              ))}
            </div>
          </div>
        );

      case 10:
        
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-main-bold text-center" style={{ color: colors.readioWhite }}>
              Wishlist
            </h2>
            <p className="text-center font-main" style={{ color: colors.readioWhite }}>
              If you could add one new feature or improvement tomorrow, what would it be?
            </p>
            <textarea
              value={surveyData.wishlist}
              onChange={(e) => handleInputChange('wishlist', e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full p-4 rounded-lg border-2 resize-none"
              rows={4}
              style={{ 
                backgroundColor: colors.readioBlack,
                borderColor: colors.readioWhite,
                color: colors.readioWhite
              }}
            />
          </div>
        );

      case 11:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-main-bold text-center" style={{ color: colors.readioWhite }}>
              Contact (Optional)
            </h2>
            <p className="text-center font-main" style={{ color: colors.readioWhite }}>
              Leave your name and email if youd like us to follow up.
            </p>
            <div className="space-y-4">
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Your name (optional)"
                className="w-full p-4 rounded-lg border-2"
                style={{ 
                  backgroundColor: colors.readioBlack,
                  borderColor: colors.readioWhite,
                  color: colors.readioWhite
                }}
              />
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="Your email (optional)"
                className="w-full p-4 rounded-lg border-2"
                style={{ 
                  backgroundColor: colors.readioBlack,
                  borderColor: colors.readioWhite,
                  color: colors.readioWhite
                }}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.readioBrown }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 rounded-lg max-w-md mx-4"
          style={{ backgroundColor: colors.readioDustyWhite }}
        >
          <div className="mb-6">
            <Image alt="logo" width={60} height={60} src={logo.src as string} className="mx-auto mb-4" />
            <h1 className="text-3xl font-giant font-bold mb-2" style={{ color: colors.readioBrown }}>
              Thank You! 🎉
            </h1>
          </div>
          <p className="font-main text-lg mb-6" style={{ color: colors.readioBrown }}>
            {`Your feedback is invaluable to us. We're committed to making Lotus even better for you.`}
          </p>
          <button
            onClick={() => {
              setIsSubmitted(false);
              setCurrentStep(1);
              setSurveyData({
                dailyUse: '',
                featuresUsed: [],
                valueRating: 0,
                easeOfUse: '',
                frictionPoints: '',
                stickiness: '',
                emotionalConnection: '',
                dailyRhythm: '',
                shareability: '',
                wishlist: ''
              });
            }}
            className="px-6 py-3 rounded-lg font-main-bold transition-all hover:scale-105"
            style={{ backgroundColor: colors.readioOrange, color: colors.readioWhite }}
          >
            Take Another Survey
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.readioBrown }}>
      {/* Background with walking animation */}
      <div className="fixed inset-0 z-[-1] opacity-20">
        <div className="w-full h-full bg-gradient-to-br from-orange-900 to-brown-800"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-2">
            <Image alt="logo" width={40} height={40} src={logo.src} />
            <h1 className="text-2xl font-main font-bold" style={{ color: colors.readioWhite }}>
              Lotus
            </h1>
          </div>
          <div className="text-right">
            <p className="text-sm font-main" style={{ color: colors.readioWhite }}>
              Step {currentStep} of {totalSteps}
            </p>
            <div className="w-32 h-2 bg-gray-600 rounded-full mt-1">
              <div 
                className="w-full rounded-full transition-all duration-500"
                style={{ 
                  backgroundColor: colors.readioOrange,
                  width: `${(currentStep / totalSteps) * 100}%`
                }}
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-6">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-2xl"
          >
            {renderStep()}
          </motion.div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center p-6">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className={`px-6 py-3 rounded-lg font-main-bold transition-all ${
              currentStep === 1 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:scale-105'
            }`}
            style={{ 
              backgroundColor: currentStep === 1 ? colors.readioBlack : colors.readioBlack,
              color: colors.readioWhite,
              border: currentStep === 1 ? 'none' : `2px solid ${colors.readioWhite}`
            }}
          >
            Previous
          </button>

          {currentStep < totalSteps ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canProceed()}
                className={`px-6 py-3 rounded-lg font-main-bold transition-all ${
                  !canProceed() 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:scale-105'
                }`}
                style={{ 
                  backgroundColor: !canProceed() ? colors.readioBlack : colors.readioOrange,
                  color: colors.readioWhite
                }}
              >
                Next
              </button>
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className={`px-6 py-3 rounded-lg font-main-bold transition-all hover:scale-105`}
                style={{ 
                  backgroundColor: colors.readioBlack,
                  color: colors.readioWhite,
                  border: `2px solid ${colors.readioWhite}`
                }}
              >
                Skip
              </button>
            </div>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              className={`px-6 py-3 rounded-lg font-main-bold transition-all ${
                !canProceed() || isSubmitting
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:scale-105'
              }`}
              style={{ 
                backgroundColor: !canProceed() || isSubmitting ? colors.readioBlack : colors.readioOrange,
                color: colors.readioWhite
              }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Survey'}
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="text-center p-4 opacity-60">
          <p className="text-sm font-main" style={{ color: colors.readioWhite }}>
            Your feedback helps us create a better experience for everyone
          </p>
        </div>
      </div>
    </div>
  );
}

// Wrap the component with ConvexProvider
export default function FeedbackSurveyWithProvider() {
  return (
    <ConvexProvider client={convex}>
      <FeedbackSurvey />
    </ConvexProvider>
  );
}
