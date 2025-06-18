import React, { useState, useEffect } from 'react';
import { getAllSettings } from '../services/settingsService';
import { formatSettingsForDisplay, downloadSettingsAsJson } from '../utils/debugSettings';
import type { SettingsStorage } from '../shared/settings';

const SettingsDebugView: React.FC = () => {
  const [settings, setSettings] = useState<SettingsStorage | null>(null);
  const [formattedSettings, setFormattedSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      // Get settings
      const currentSettings = getAllSettings();
      setSettings(currentSettings);
      
      // Format settings for display
      const formatted = formatSettingsForDisplay();
      setFormattedSettings(formatted);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCopyAll = () => {
    if (!settings) return;
    
    try {
      const settingsJson = JSON.stringify(settings, null, 2);
      navigator.clipboard.writeText(settingsJson);
      setCopied(true);
      
      // Reset copied status after 3 seconds
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      console.error('Error copying settings:', error);
    }
  };

  const handleDownload = () => {
    downloadSettingsAsJson();
  };

  if (loading) {
    return <div className="settings-debug-loading">Loading settings...</div>;
  }

  if (!settings) {
    return <div className="settings-debug-error">Error loading settings</div>;
  }

  return (
    <div className="settings-debug-container">
      <div className="settings-debug-header">
        <h2>Settings Debug View</h2>
        <div className="settings-debug-actions">
          <button 
            className="settings-debug-copy-btn"
            onClick={handleCopyAll}
          >
            {copied ? 'Copied!' : 'Copy All Settings'}
          </button>
          <button 
            className="settings-debug-download-btn"
            onClick={handleDownload}
          >
            Download Settings
          </button>
        </div>
      </div>

      <div className="settings-debug-content">
        {formattedSettings.map((category) => (
          <div key={category.category} className="settings-category">
            <h3>{category.category}</h3>
            <table className="settings-table">
              <thead>
                <tr>
                  <th>Setting</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {category.settings.map((setting) => (
                  <tr key={setting.key}>
                    <td>{setting.label}</td>
                    <td>
                      {typeof setting.value === 'boolean' 
                        ? setting.value ? 'Enabled' : 'Disabled'
                        : setting.value === '' 
                          ? <em>Empty</em> 
                          : String(setting.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      <div className="settings-debug-raw">
        <h3>Raw Settings</h3>
        <pre>{JSON.stringify(settings, null, 2)}</pre>
      </div>

      <style>{`
        .settings-debug-container {
          padding: 20px;
          font-family: system-ui, -apple-system, sans-serif;
        }
        
        .settings-debug-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .settings-debug-actions {
          display: flex;
          gap: 10px;
        }
        
        .settings-debug-content {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .settings-category {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 15px;
          background-color: #f9f9f9;
        }
        
        .settings-category h3 {
          margin-top: 0;
          padding-bottom: 8px;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .settings-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .settings-table th, .settings-table td {
          padding: 8px;
          text-align: left;
          border-bottom: 1px solid #eee;
        }
        
        .settings-table th {
          font-weight: bold;
          background-color: #f5f5f5;
        }
        
        .settings-debug-raw {
          background-color: #f5f5f5;
          padding: 15px;
          border-radius: 8px;
          margin-top: 20px;
          overflow: auto;
        }
        
        .settings-debug-raw pre {
          margin: 0;
          white-space: pre-wrap;
          word-break: break-word;
        }
        
        button {
          background-color: #2196f3;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
        }
        
        button:hover {
          background-color: #0d8bf2;
        }
        
        .settings-debug-download-btn {
          background-color: #4caf50;
        }
        
        .settings-debug-download-btn:hover {
          background-color: #43a047;
        }
      `}</style>
    </div>
  );
};

export default SettingsDebugView; 