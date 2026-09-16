'use client';

import { useQuery, useConvex } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";

export default function DataExportPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const convex = useConvex();

  const handleExport = async () => {
    setIsExporting(true);
    setExportStatus("Fetching data from Convex...");
    
    try {
      // Fetch all data using the Convex client
      const [articles, stepsLeaderboard, timerPresets, usersAggregated] = await Promise.all([
        convex.query(api.dataExports.exportArticles, { 
          startDate: startDate || undefined, 
          endDate: endDate || undefined 
        }),
        convex.query(api.dataExports.exportStepsLeaderboard, {}),
        convex.query(api.dataExports.exportTimerPresets, { 
          startDate: startDate || undefined, 
          endDate: endDate || undefined 
        }),
        convex.query(api.dataExports.exportUsersAggregated, {})
      ]);

      setExportStatus("Data fetched! Preparing download...");
      
      // Aggregate all data into one object
      const exportData = {
        metadata: {
          export_timestamp: new Date().toISOString(),
          start_date: startDate || null,
          end_date: endDate || null,
          source: "Lotus Landing - Web Export"
        },
        summary: {
          total_articles: articles?.length || 0,
          total_leaderboard_entries: stepsLeaderboard?.length || 0,
          total_timer_presets: timerPresets?.length || 0,
          total_unique_users: usersAggregated?.length || 0,
          paid_users: usersAggregated?.filter((u: any) => u.is_paid_subscriber).length || 0,
        },
        articles: articles || [],
        steps_leaderboard: stepsLeaderboard || [],
        timer_presets: timerPresets || [],
        users_aggregated: usersAggregated || []
      };

      // Create download
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `lotus-usage-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setExportStatus("✅ Download complete!");
      setTimeout(() => {
        setExportStatus("");
        setIsExporting(false);
      }, 3000);
    } catch (error) {
      console.error("Export failed:", error);
      setExportStatus("❌ Export failed. Check console for details.");
      setIsExporting(false);
    }
  };

  const handleReset = () => {
    setIsExporting(false);
    setExportStatus("");
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <h1 style={{
          fontSize: '36px',
          fontWeight: 'bold',
          marginBottom: '10px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          📊 Lotus Usage Data Export
        </h1>
        
        <p style={{
          color: '#666',
          marginBottom: '30px',
          fontSize: '16px'
        }}>
          Export all usage data from the Lotus app including articles, steps leaderboard, 
          timer presets, and user metrics.
        </p>

        <div style={{
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '30px'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '15px',
            color: '#333'
          }}>
            📅 Date Range (Optional)
          </h2>
          
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1', minWidth: '200px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#555'
              }}>
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={isExporting}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '2px solid #e0e0e0',
                  fontSize: '14px'
                }}
              />
            </div>
            
            <div style={{ flex: '1', minWidth: '200px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#555'
              }}>
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={isExporting}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '2px solid #e0e0e0',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>
          
          <p style={{
            marginTop: '10px',
            fontSize: '13px',
            color: '#888'
          }}>
            Leave empty to export all data
          </p>
        </div>

        <div style={{
          background: '#e3f2fd',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '30px',
          border: '2px solid #2196f3'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '10px',
            color: '#1976d2'
          }}>
            📦 What Will Be Exported:
          </h3>
          <ul style={{
            margin: '0',
            paddingLeft: '20px',
            color: '#555',
            fontSize: '14px',
            lineHeight: '1.8'
          }}>
            <li><strong>Articles:</strong> Artist, text, title, creation date</li>
            <li><strong>Steps Leaderboard:</strong> User names, step counts, user IDs</li>
            <li><strong>Timer Presets:</strong> User IDs, creation dates, modes, names</li>
            <li><strong>Users:</strong> Aggregated by name with subscription info, streaks, meditation data</li>
          </ul>
        </div>

        <button
          onClick={handleExport}
          disabled={isExporting}
          style={{
            width: '100%',
            padding: '16px',
            fontSize: '18px',
            fontWeight: '600',
            color: 'white',
            background: isExporting 
              ? '#cccccc' 
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: '12px',
            cursor: isExporting ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: isExporting 
              ? 'none' 
              : '0 4px 15px rgba(102, 126, 234, 0.4)',
            transform: isExporting ? 'none' : 'translateY(0)',
          }}
          onMouseEnter={(e) => {
            if (!isExporting) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
          }}
        >
          {isExporting ? '⏳ Exporting Data...' : '🚀 Export All Data'}
        </button>

        {exportStatus && (
          <div style={{
            marginTop: '20px',
            padding: '15px',
            background: exportStatus.includes('✅') ? '#d4edda' : '#fff3cd',
            border: `2px solid ${exportStatus.includes('✅') ? '#28a745' : '#ffc107'}`,
            borderRadius: '8px',
            color: exportStatus.includes('✅') ? '#155724' : '#856404',
            fontSize: '14px',
            fontWeight: '500',
            textAlign: 'center'
          }}>
            {exportStatus}
          </div>
        )}

        {exportStatus.includes('✅') && (
          <button
            onClick={handleReset}
            style={{
              width: '100%',
              marginTop: '10px',
              padding: '12px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#667eea',
              background: 'white',
              border: '2px solid #667eea',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#667eea';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.color = '#667eea';
            }}
          >
            Export Again
          </button>
        )}

        <div style={{
          marginTop: '30px',
          padding: '20px',
          background: '#f8f9fa',
          borderRadius: '12px',
          fontSize: '13px',
          color: '#666'
        }}>
          <h4 style={{
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '10px',
            color: '#333'
          }}>
            💡 Next Steps:
          </h4>
          <ol style={{
            margin: '0',
            paddingLeft: '20px',
            lineHeight: '1.8'
          }}>
            <li>Download the JSON file to your computer</li>
            <li>Open the file in a text editor or JSON viewer</li>
            <li>Copy the contents and feed to an AI (ChatGPT, Claude, etc.)</li>
            <li>Ask the AI to generate an executive summary</li>
          </ol>
        </div>

        <div style={{
          marginTop: '20px',
          padding: '15px',
          background: '#fff3cd',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#856404',
          border: '2px solid #ffc107'
        }}>
          <strong>⚠️ Note:</strong> This export includes sensitive user data. 
          Keep the downloaded file secure and delete after use.
        </div>
      </div>
    </div>
  );
}

