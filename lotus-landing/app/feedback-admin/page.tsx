'use client'

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import logo from '../assets/images/cropwhitelogo.png';
import { colors } from "../styleUtils/colors";
// TODO: Uncomment after running 'npx convex dev' to regenerate types
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ConvexProvider, ConvexReactClient } from "convex/react";

// Initialize Convex client
const convex = new ConvexReactClient('https://brainy-kingfisher-980.convex.cloud');

interface SurveyResponse {
  _id: string;
  survey_id: string;
  user_email?: string;
  user_name?: string;
  responses: {
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
  };
  completed_at: string;
  created_at?: string;
}

interface SurveyStats {
  totalSurveys: number;
  averageValueRating: number;
  featureUsage: Record<string, number>;
  shareabilityBreakdown: Record<string, number>;
  dailyUseBreakdown: Record<string, number>;
  recentSurveys?: unknown[];
}

function FeedbackAdmin() {
  const [surveys, setSurveys] = useState<SurveyResponse[]>([]);
  const [stats, setStats] = useState<SurveyStats | null>(null);
  const [selectedSurvey, setSelectedSurvey] = useState<SurveyResponse | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Convex queries for feedback surveys
  const allSurveys = useQuery(api.userFeedbackSurveys.getAllFeedbackSurveys, {});
  const surveyStats = useQuery(api.userFeedbackSurveys.getFeedbackSurveyStats, {});

  // Password protection - you can change this password
  // To change the password, update this line and also update the display text below
  const ADMIN_PASSWORD =  process.env.NODE_ENV === 'production' ? process.env.SURVEY_ADMIN_PASSWORD : process.env.NEXT_PUBLIC_SURVEY_ADMIN_PASSWORD || '▪️';

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setPasswordError('');
    } else {
      setPasswordError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  useEffect(() => {
    if (allSurveys && surveyStats) {
      setIsLoading(false);
      setSurveys(allSurveys.surveys || []);
      setStats(surveyStats);
    }
  }, [allSurveys, surveyStats]);

  const filteredSurveys = surveys.filter(survey => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      survey.user_email?.toLowerCase().includes(searchLower) ||
      survey.user_name?.toLowerCase().includes(searchLower) ||
      survey.responses.easeOfUse.toLowerCase().includes(searchLower) ||
      survey.responses.frictionPoints.toLowerCase().includes(searchLower) ||
      survey.responses.wishlist.toLowerCase().includes(searchLower)
    );
  });

  // Password protection screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.readioBrown }}>
        <div className="max-w-md w-full mx-4">
          <div className="text-center mb-8">
            <Image alt="logo" width={80} height={80} src={logo.src} className="mx-auto mb-4" />
            <h1 className="text-3xl font-main-bold mb-2" style={{ color: colors.readioWhite }}>
              Admin Access
            </h1>
            <p className="text-lg opacity-70" style={{ color: colors.readioWhite }}>
              Enter password to view feedback data
            </p>
          </div>
          
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full p-4 rounded-lg border-2 text-lg font-main"
                style={{ 
                  backgroundColor: colors.readioBlack,
                  borderColor: colors.readioWhite,
                  color: colors.readioWhite
                }}
                autoFocus
              />
            </div>
            
            {passwordError && (
              <p className="text-red-400 text-center font-main">{passwordError}</p>
            )}
            
            <button
              type="submit"
              className="w-full p-4 rounded-lg font-main-bold text-lg transition-all hover:scale-105"
              style={{ backgroundColor: colors.readioOrange, color: colors.readioWhite }}
            >
              Access Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.readioBrown }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 mx-auto" style={{ borderColor: colors.readioOrange }}></div>
          <p className="mt-4 text-xl font-main" style={{ color: colors.readioWhite }}>Loading survey data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.readioBrown }}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <Image alt="logo" width={40} height={40} src={logo.src} />
          <h1 className="text-2xl font-main font-bold" style={{ color: colors.readioWhite }}>
            Lotus Feedback Admin
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-sm font-main" style={{ color: colors.readioWhite }}>
            {stats?.totalSurveys || 0} Total Responses
          </p>
          <button
            onClick={() => {
              setIsAuthenticated(false);
              setPassword('');
              setSelectedSurvey(null);
            }}
            className="px-4 py-2 rounded-lg font-main-bold transition-all hover:scale-105"
            style={{ backgroundColor: colors.readioOrange, color: colors.readioWhite }}
          >
            Logout
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-80 p-6 border-r border-gray-700">
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search surveys..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 rounded-lg border-2"
              style={{ 
                backgroundColor: colors.readioBlack,
                borderColor: colors.readioWhite,
                color: colors.readioWhite
              }}
            />
          </div>

          {/* Stats Summary */}
          {stats && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg" style={{ backgroundColor: colors.readioBlack }}>
                <h3 className="font-main-bold text-lg mb-2" style={{ color: colors.readioWhite }}>
                  Quick Stats
                </h3>
                <div className="space-y-2 text-sm">
                  <p style={{ color: colors.readioWhite }}>
                    <span className="opacity-70">Total Surveys:</span> {stats.totalSurveys}
                  </p>
                  <p style={{ color: colors.readioWhite }}>
                    <span className="opacity-70">Avg Rating:</span> {stats.averageValueRating}/10
                  </p>
                </div>
              </div>

              {/* Feature Usage */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: colors.readioBlack }}>
                <h3 className="font-main-bold text-lg mb-2" style={{ color: colors.readioWhite }}>
                  Top Features
                </h3>
                <div className="space-y-1 text-sm">
                  {Object.entries(stats.featureUsage)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([feature, count]) => {
                      // Map sanitized keys back to readable display names
                      const displayNames: Record<string, string> = {
                        'Timers fitnessfocusrecovery': 'Timers (fitness/focus/recovery)',
                        'Hydration reminders': 'Hydration reminders',
                        'Step tracker DailyRhythm': 'Step tracker (DailyRhythm)',
                        'Guided meditations': 'Guided meditations',
                        'FitHop music': 'FitHop music',
                        'Audio literature': 'Audio literature',
                        '12 times': '1-2 times',
                        '35 times': '3-5 times',
                        '6 times': '6+ times',
                        'Already have': 'Already have',
                        'Would if asked': 'Would if asked',
                        'Not yet': 'Not yet'
                      };
                      
                      return (
                        <p key={feature} style={{ color: colors.readioWhite }}>
                          <span className="opacity-70">{displayNames[feature] || feature}:</span> {count}
                        </p>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* Survey List */}
          <div className="mt-6">
            <h3 className="font-main-bold text-lg mb-3" style={{ color: colors.readioWhite }}>
              Recent Surveys
            </h3>
            <div className="space-y-2">
              {filteredSurveys.slice(0, 10).map((survey) => (
                <button
                  key={survey._id}
                  onClick={() => setSelectedSurvey(survey)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    selectedSurvey?._id === survey._id 
                      ? 'border-2' 
                      : 'border border-transparent'
                  }`}
                  style={{ 
                    backgroundColor: colors.readioBlack,
                    borderColor: selectedSurvey?._id === survey._id ? colors.readioOrange : 'transparent',
                    color: colors.readioWhite
                  }}
                >
                  <p className="font-main-bold text-sm">
                    {survey.user_email || survey.user_name || 'Anonymous'}
                  </p>
                  <p className="text-xs opacity-70">
                    {new Date(survey.completed_at).toLocaleDateString()}
                  </p>
                  <p className="text-xs opacity-70">
                    Rating: {survey.responses.valueRating}/10
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {selectedSurvey ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-main-bold" style={{ color: colors.readioWhite }}>
                  Survey Response Details
                </h2>
                <button
                  onClick={() => setSelectedSurvey(null)}
                  className="px-4 py-2 rounded-lg font-main-bold transition-all hover:scale-105"
                  style={{ backgroundColor: colors.readioOrange, color: colors.readioWhite }}
                >
                  Close
                </button>
              </div>

              {/* Survey Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: colors.readioBlack }}>
                  <h3 className="font-main-bold mb-2" style={{ color: colors.readioWhite }}>
                    Survey Info
                  </h3>
                  <p className="text-sm" style={{ color: colors.readioWhite }}>
                    <span className="opacity-70">ID:</span> {selectedSurvey.survey_id}
                  </p>
                  <p className="text-sm" style={{ color: colors.readioWhite }}>
                    <span className="opacity-70">Completed:</span> {new Date(selectedSurvey.completed_at).toLocaleString()}
                  </p>
                  {selectedSurvey.user_email && (
                    <p className="text-sm" style={{ color: colors.readioWhite }}>
                      <span className="opacity-70">Email:</span> {selectedSurvey.user_email}
                    </p>
                  )}
                  {selectedSurvey.user_name && (
                    <p className="text-sm" style={{ color: colors.readioWhite }}>
                      <span className="opacity-70">Name:</span> {selectedSurvey.user_name}
                    </p>
                  )}
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: colors.readioBlack }}>
                  <h3 className="font-main-bold mb-2" style={{ color: colors.readioWhite }}>
                    Quick Responses
                  </h3>
                  <p className="text-sm" style={{ color: colors.readioWhite }}>
                    <span className="opacity-70">Daily Use:</span> {selectedSurvey.responses.dailyUse}
                  </p>
                  <p className="text-sm" style={{ color: colors.readioWhite }}>
                    <span className="opacity-70">Value Rating:</span> {selectedSurvey.responses.valueRating}/10
                  </p>
                  <p className="text-sm" style={{ color: colors.readioWhite }}>
                    <span className="opacity-70">Shareability:</span> {selectedSurvey.responses.shareability}
                  </p>
                  <p className="text-sm" style={{ color: colors.readioWhite }}>
                    <span className="opacity-70">Features Used:</span> {selectedSurvey.responses.featuresUsed.join(', ')}
                  </p>
                </div>
              </div>

              {/* Detailed Responses */}
              <div className="space-y-4">
                <h3 className="text-xl font-main-bold" style={{ color: colors.readioWhite }}>
                  Detailed Responses
                </h3>
                
                {[
                  { label: 'Ease of Use', response: selectedSurvey.responses.easeOfUse },
                  { label: 'Friction Points', response: selectedSurvey.responses.frictionPoints },
                  { label: 'Stickiness', response: selectedSurvey.responses.stickiness },
                  { label: 'Emotional Connection', response: selectedSurvey.responses.emotionalConnection },
                  { label: 'Daily Rhythm', response: selectedSurvey.responses.dailyRhythm },
                  { label: 'Wishlist', response: selectedSurvey.responses.wishlist },
                ].map((item) => (
                  <div key={item.label} className="p-4 rounded-lg" style={{ backgroundColor: colors.readioBlack }}>
                    <h4 className="font-main-bold mb-2" style={{ color: colors.readioWhite }}>
                      {item.label}
                    </h4>
                    <p className="text-sm" style={{ color: colors.readioWhite }}>
                      {item.response}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="mb-6">
                <Image alt="logo" width={80} height={80} src={logo.src} className="mx-auto opacity-50" />
              </div>
              <h2 className="text-2xl font-main-bold mb-4" style={{ color: colors.readioWhite }}>
                No Survey Selected
              </h2>
              <p className="text-lg opacity-70" style={{ color: colors.readioWhite }}>
                Select a survey from the sidebar to view detailed responses
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Wrap the component with ConvexProvider
export default function FeedbackAdminWithProvider() {
  return (
    <ConvexProvider client={convex}>
      <FeedbackAdmin />
    </ConvexProvider>
  );
}
