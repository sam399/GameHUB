import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';

interface NotificationPreferences {
  activities: {
    achievement_unlocked: boolean;
    game_reviewed: boolean;
    new_highscore: boolean;
    game_added: boolean;
  };
  system: {
    friend_requests: boolean;
    friend_accepted: boolean;
    messages: boolean;
    leaderboard_updates: boolean;
    achievement_updates: boolean;
  };
  delivery: {
    in_app: boolean;
    email: boolean;
    push: boolean;
  };
  email_digest: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly' | 'never';
    preferred_day: number;
    preferred_hour: number;
  };
  quiet_hours: {
    enabled: boolean;
    start_hour: number;
    end_hour: number;
  };
}

const NotificationPreferences: React.FC = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await api.get('/notification-preferences');
      setPreferences(response.data.data);
    } catch (error) {
      console.error('Failed to fetch preferences:', error);
      toast.error('Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!preferences) return;
    
    try {
      setSaving(true);
      await api.put('/notification-preferences', preferences);
      toast.success('Notification preferences saved');
    } catch (error) {
      console.error('Failed to save preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleActivityToggle = (key: keyof NotificationPreferences['activities']) => {
    if (preferences) {
      setPreferences({
        ...preferences,
        activities: {
          ...preferences.activities,
          [key]: !preferences.activities[key]
        }
      });
    }
  };

  const handleSystemToggle = (key: keyof NotificationPreferences['system']) => {
    if (preferences) {
      setPreferences({
        ...preferences,
        system: {
          ...preferences.system,
          [key]: !preferences.system[key]
        }
      });
    }
  };

  const handleDeliveryToggle = (key: keyof NotificationPreferences['delivery']) => {
    if (preferences) {
      setPreferences({
        ...preferences,
        delivery: {
          ...preferences.delivery,
          [key]: !preferences.delivery[key]
        }
      });
    }
  };

  if (loading) return <div className="flex justify-center items-center p-8"><span className="text-gray-400">Loading preferences...</span></div>;
  if (!preferences) return <div className="text-red-500">Failed to load preferences</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-white mb-8">Notification Preferences</h1>

      {/* Activity Notifications */}
      <section className="bg-gray-900 p-6 rounded-lg">
        <h2 className="text-xl font-bold text-blue-400 mb-4">Activity Notifications</h2>
        <div className="space-y-3">
          {Object.entries(preferences.activities).map(([key, value]) => (
            <label key={key} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={value}
                onChange={() => handleActivityToggle(key as keyof NotificationPreferences['activities'])}
                className="w-4 h-4"
              />
              <span className="text-gray-300">
                {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            </label>
          ))}
        </div>
      </section>

      {/* System Notifications */}
      <section className="bg-gray-900 p-6 rounded-lg">
        <h2 className="text-xl font-bold text-blue-400 mb-4">System Notifications</h2>
        <div className="space-y-3">
          {Object.entries(preferences.system).map(([key, value]) => (
            <label key={key} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={value}
                onChange={() => handleSystemToggle(key as keyof NotificationPreferences['system'])}
                className="w-4 h-4"
              />
              <span className="text-gray-300">
                {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            </label>
          ))}
        </div>
      </section>

      {/* Delivery Methods */}
      <section className="bg-gray-900 p-6 rounded-lg">
        <h2 className="text-xl font-bold text-blue-400 mb-4">Delivery Methods</h2>
        <div className="space-y-3">
          {Object.entries(preferences.delivery).map(([key, value]) => (
            <label key={key} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={value}
                onChange={() => handleDeliveryToggle(key as keyof NotificationPreferences['delivery'])}
                className="w-4 h-4"
              />
              <span className="text-gray-300">
                {key === 'in_app' ? 'In-App' : key.charAt(0).toUpperCase() + key.slice(1)}
              </span>
            </label>
          ))}
        </div>
      </section>

      {/* Email Digest */}
      <section className="bg-gray-900 p-6 rounded-lg">
        <h2 className="text-xl font-bold text-blue-400 mb-4">Email Digest</h2>
        <div className="space-y-4">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.email_digest.enabled}
              onChange={() =>
                setPreferences({
                  ...preferences,
                  email_digest: {
                    ...preferences.email_digest,
                    enabled: !preferences.email_digest.enabled
                  }
                })
              }
              className="w-4 h-4"
            />
            <span className="text-gray-300">Enable Email Digest</span>
          </label>

          {preferences.email_digest.enabled && (
            <>
              <div>
                <label className="block text-gray-300 mb-2">Frequency</label>
                <select
                  value={preferences.email_digest.frequency}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      email_digest: {
                        ...preferences.email_digest,
                        frequency: e.target.value as 'daily' | 'weekly' | 'monthly' | 'never'
                      }
                    })
                  }
                  className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2">Preferred Day</label>
                  <select
                    value={preferences.email_digest.preferred_day}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        email_digest: {
                          ...preferences.email_digest,
                          preferred_day: parseInt(e.target.value)
                        }
                      })
                    }
                    className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 text-sm"
                  >
                    <option value={0}>Sunday</option>
                    <option value={1}>Monday</option>
                    <option value={2}>Tuesday</option>
                    <option value={3}>Wednesday</option>
                    <option value={4}>Thursday</option>
                    <option value={5}>Friday</option>
                    <option value={6}>Saturday</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Preferred Hour (UTC)</label>
                  <select
                    value={preferences.email_digest.preferred_hour}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        email_digest: {
                          ...preferences.email_digest,
                          preferred_hour: parseInt(e.target.value)
                        }
                      })
                    }
                    className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 text-sm"
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>{i}:00</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Quiet Hours */}
      <section className="bg-gray-900 p-6 rounded-lg">
        <h2 className="text-xl font-bold text-blue-400 mb-4">Quiet Hours (UTC)</h2>
        <div className="space-y-4">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.quiet_hours.enabled}
              onChange={() =>
                setPreferences({
                  ...preferences,
                  quiet_hours: {
                    ...preferences.quiet_hours,
                    enabled: !preferences.quiet_hours.enabled
                  }
                })
              }
              className="w-4 h-4"
            />
            <span className="text-gray-300">Enable Quiet Hours</span>
          </label>

          {preferences.quiet_hours.enabled && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 mb-2">Start Hour</label>
                <select
                  value={preferences.quiet_hours.start_hour}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      quiet_hours: {
                        ...preferences.quiet_hours,
                        start_hour: parseInt(e.target.value)
                      }
                    })
                  }
                  className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 text-sm"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>{i}:00</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-300 mb-2">End Hour</label>
                <select
                  value={preferences.quiet_hours.end_hour}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      quiet_hours: {
                        ...preferences.quiet_hours,
                        end_hour: parseInt(e.target.value)
                      }
                    })
                  }
                  className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 text-sm"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>{i}:00</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Save Button */}
      <div className="flex gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg font-semibold transition"
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
        <button
          onClick={fetchPreferences}
          className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default NotificationPreferences;
