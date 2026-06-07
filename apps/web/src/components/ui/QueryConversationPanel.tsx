import React, { useState, useEffect } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';

interface Comment {
  id: number;
  query_id: number;
  comment_text: string;
  user_id: number;
  username: string;
  user_role: string;
  created_at: string;
}

interface QueryConversationPanelProps {
  queryId: number;
  queryText: string;
  fieldKey: string;
  queryStatus: string;
  onClose: () => void;
  onQueryResolved?: () => void;
}

export default function QueryConversationPanel({ 
  queryId, 
  queryText, 
  fieldKey, 
  queryStatus, 
  onClose,
  onQueryResolved
}: QueryConversationPanelProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchComments();
  }, [queryId]);

  const fetchComments = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/v2/edc/queries/${queryId}/comments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await res.json();
      if (result.success) {
        setComments(result.data);
      } else {
        setError(result.errors?.[0] || 'Failed to fetch query discussions.');
      }
    } catch (err: any) {
      setError(err.message || 'Error communicating with server.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    setSubmitting(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/v2/edc/queries/${queryId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ comment_text: newComment })
      });
      const result = await res.json();
      if (result.success) {
        setNewComment('');
        await fetchComments();
      } else {
        setError(result.errors?.[0] || 'Failed to submit comment.');
      }
    } catch (err: any) {
      setError(err.message || 'Error communicating with server.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolveQuery = async () => {
    const resolution = prompt('Please enter query resolution comments:');
    if (!resolution || resolution.trim() === '') return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/v2/edc/queries/${queryId}/resolve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ resolution_text: resolution })
      });
      const result = await res.json();
      if (result.success) {
        if (onQueryResolved) onQueryResolved();
        onClose();
      } else {
        alert(result.errors?.[0] || 'Failed to resolve query.');
      }
    } catch (err: any) {
      alert(err.message || 'Error communicating with server.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
      <div className="flex flex-col w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-4">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <MessageSquare className="h-5 w-5 text-indigo-500" />
            <h3 className="font-semibold text-lg">Clinical Query discussion</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Query Context Description */}
        <div className="bg-amber-50/50 dark:bg-amber-950/10 border-b border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Query status: {queryStatus}
            </span>
            <code className="text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400">
              {fieldKey}
            </code>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
            "{queryText}"
          </p>
        </div>

        {/* Comments Feed Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px]">
          {loading ? (
            <div className="flex justify-center py-10">
              <span className="text-slate-500 animate-pulse">Loading discussion threads...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg text-sm">
              {error}
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-10 text-slate-500 dark:text-slate-400 text-sm italic">
              No replies yet. Type a comment below to start conversation.
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map(c => {
                const isMonitor = ['CRA Monitor', 'Monitor', 'Head of Medical Affairs', 'Admin'].includes(c.user_role);
                return (
                  <div key={c.id} className={`flex flex-col max-w-[85%] rounded-lg p-3 ${
                    isMonitor 
                      ? 'bg-slate-100 dark:bg-slate-800 self-start mr-auto border border-slate-200 dark:border-slate-700' 
                      : 'bg-indigo-50/50 dark:bg-indigo-950/20 self-end ml-auto border border-indigo-200/30 dark:border-indigo-800/20'
                  }`}>
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {c.username}
                      </span>
                      <span className="text-[10px] font-semibold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded">
                        {c.user_role}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {c.comment_text}
                    </p>
                    <span className="text-[10px] text-slate-400 self-end mt-1">
                      {new Date(c.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions & Comment Input Form */}
        <div className="border-t border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-900/40">
          {queryStatus === 'OPEN' && (
            <button
              onClick={handleResolveQuery}
              className="w-full mb-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm transition-colors shadow-sm shadow-emerald-500/10"
            >
              Resolve Query (Post Answer Comments)
            </button>
          )}

          <form onSubmit={handleSubmitComment} className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              disabled={submitting}
              className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-shadow"
            />
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white p-2 rounded-lg transition-colors shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
