import React, { useState, useEffect } from 'react';
import { Heart, Calendar, Download, Mail, ExternalLink } from 'lucide-react';
import { supabase, Opportunity, UserFavorite } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';

export default function FavoritesList() {
  const [favorites, setFavorites] = useState<(UserFavorite & { opportunity: Opportunity })[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select(`
          *,
          opportunity:opportunities(*)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFavorites(data || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (favoriteId: string) => {
    try {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('id', favoriteId);

      if (error) throw error;
      setFavorites(prev => prev.filter(f => f.id !== favoriteId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const setReminder = async (opportunityId: string) => {
    const reminderDate = prompt('Enter reminder date (YYYY-MM-DD):');
    if (!reminderDate) return;

    try {
      const { error } = await supabase
        .from('user_reminders')
        .insert({
          user_id: user?.id,
          opportunity_id: opportunityId,
          reminder_date: reminderDate,
          message: 'Reminder for opportunity deadline'
        });

      if (error) throw error;
      alert('Reminder set successfully!');
    } catch (error) {
      console.error('Error setting reminder:', error);
      alert('Error setting reminder');
    }
  };

  const downloadOpportunity = (opportunity: Opportunity) => {
    const content = `
Opportunity Details
==================

Title: ${opportunity.title}
Agency: ${opportunity.agency}
Department: ${opportunity.department || 'N/A'}
State: ${opportunity.state || 'Federal'}
Type: ${opportunity.opportunity_type}
Budget: $${opportunity.budget_min?.toLocaleString()} - $${opportunity.budget_max?.toLocaleString()}
NAICS Code: ${opportunity.naics_code || 'N/A'}
Set-Aside: ${opportunity.set_aside_code || 'N/A'}
Solicitation Number: ${opportunity.solicitation_number || 'N/A'}
Response Deadline: ${opportunity.response_deadline ? format(new Date(opportunity.response_deadline), 'PPP') : 'N/A'}
Posted Date: ${format(new Date(opportunity.posted_date), 'PPP')}
Source URL: ${opportunity.source_url || 'N/A'}

Description:
${opportunity.description || 'No description available'}

AI Analysis:
${opportunity.ai_analysis_summary || 'No AI analysis available'}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${opportunity.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const emailOpportunity = (opportunity: Opportunity) => {
    const subject = encodeURIComponent(`Government Opportunity: ${opportunity.title}`);
    const body = encodeURIComponent(`
I wanted to share this government contract opportunity with you:

Title: ${opportunity.title}
Agency: ${opportunity.agency}
Budget: $${opportunity.budget_min?.toLocaleString()} - $${opportunity.budget_max?.toLocaleString()}
Deadline: ${opportunity.response_deadline ? format(new Date(opportunity.response_deadline), 'PPP') : 'N/A'}

${opportunity.source_url ? `More details: ${opportunity.source_url}` : ''}

Best regards
    `);

    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading favorites...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Favorite Opportunities</h2>
        <div className="text-sm text-gray-500">
          {favorites.length} opportunities saved
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No favorite opportunities yet.</p>
          <p className="text-sm text-gray-400 mt-1">
            Add opportunities to favorites from the opportunities page.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {favorites.map((favorite) => (
            <div key={favorite.id} className="bg-white rounded-lg shadow border p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {favorite.opportunity.title}
                  </h3>
                  
                  <div className="flex flex-wrap items-center gap-4 mb-3 text-sm text-gray-600">
                    <span>{favorite.opportunity.agency}</span>
                    {favorite.opportunity.state && (
                      <span>{favorite.opportunity.state}</span>
                    )}
                    {favorite.opportunity.budget_min && favorite.opportunity.budget_max && (
                      <span>
                        ${favorite.opportunity.budget_min.toLocaleString()} - 
                        ${favorite.opportunity.budget_max.toLocaleString()}
                      </span>
                    )}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      favorite.opportunity.opportunity_type === 'federal'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {favorite.opportunity.opportunity_type}
                    </span>
                  </div>

                  {favorite.opportunity.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {favorite.opportunity.description}
                    </p>
                  )}

                  <div className="text-xs text-gray-500">
                    Added to favorites: {format(new Date(favorite.created_at), 'PPP')}
                    {favorite.opportunity.response_deadline && (
                      <span className="ml-4">
                        Deadline: {format(new Date(favorite.opportunity.response_deadline), 'PPP')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="ml-6 flex flex-col space-y-2">
                  <button
                    onClick={() => removeFavorite(favorite.id)}
                    className="inline-flex items-center px-3 py-1 text-sm text-red-600 hover:text-red-800"
                  >
                    <Heart className="h-4 w-4 mr-1 fill-current" />
                    Remove
                  </button>
                  
                  <button
                    onClick={() => setReminder(favorite.opportunity.id)}
                    className="inline-flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <Calendar className="h-4 w-4 mr-1" />
                    Remind
                  </button>
                  
                  <button
                    onClick={() => downloadOpportunity(favorite.opportunity)}
                    className="inline-flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </button>
                  
                  <button
                    onClick={() => emailOpportunity(favorite.opportunity)}
                    className="inline-flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                  >
                    <Mail className="h-4 w-4 mr-1" />
                    Email
                  </button>

                  {favorite.opportunity.source_url && (
                    <a
                      href={favorite.opportunity.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Source
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}