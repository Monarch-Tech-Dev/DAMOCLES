'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  PlayCircle,
  PauseCircle,
  Eye,
  Send,
  Calendar,
  BarChart3,
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface BotStatus {
  scheduler_running: boolean;
  test_mode: boolean;
  posts_sent: number;
  last_post: string | null;
  errors: number;
  schedule: Record<string, string>;
  platforms_configured: {
    facebook: boolean;
    twitter: boolean;
    linkedin: boolean;
  };
}

interface Draft {
  type: string;
  content: string;
  data: any;
}

export default function SocialBotAdmin() {
  const [botStatus, setBotStatus] = useState<BotStatus | null>(null);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  const BOT_API = process.env.NEXT_PUBLIC_SOCIAL_BOT_URL || 'http://localhost:8002';

  useEffect(() => {
    fetchBotStatus();
    fetchDrafts();
  }, []);

  const fetchBotStatus = async () => {
    try {
      const response = await fetch(`${BOT_API}/admin/status`);
      const data = await response.json();
      setBotStatus(data);
    } catch (error) {
      console.error('Failed to fetch bot status:', error);
      toast.error('Failed to load bot status');
    } finally {
      setLoading(false);
    }
  };

  const fetchDrafts = async () => {
    try {
      const response = await fetch(`${BOT_API}/admin/drafts`);
      const data = await response.json();
      setDrafts(data.drafts || []);
    } catch (error) {
      console.error('Failed to fetch drafts:', error);
    }
  };

  const toggleBot = async () => {
    try {
      const endpoint = botStatus?.scheduler_running ? '/admin/control/pause' : '/admin/control/resume';
      const response = await fetch(`${BOT_API}${endpoint}`, { method: 'POST' });

      if (response.ok) {
        toast.success(botStatus?.scheduler_running ? 'Bot paused' : 'Bot resumed');
        fetchBotStatus();
      }
    } catch (error) {
      toast.error('Failed to toggle bot');
    }
  };

  const toggleTestMode = async () => {
    try {
      const endpoint = botStatus?.test_mode
        ? '/admin/control/test-mode/disable'
        : '/admin/control/test-mode/enable';

      const response = await fetch(`${BOT_API}${endpoint}`, { method: 'POST' });
      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        fetchBotStatus();
      }
    } catch (error) {
      toast.error('Failed to toggle test mode');
    }
  };

  const selectDraft = (draft: Draft) => {
    setSelectedDraft(draft);
    setEditedContent(draft.content);
  };

  const postContent = async (platforms: string[] = ['all']) => {
    if (!editedContent) {
      toast.error('Content cannot be empty');
      return;
    }

    setPosting(true);

    try {
      const response = await fetch(`${BOT_API}/admin/post/custom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: editedContent,
          platforms
        })
      });

      if (response.ok) {
        toast.success('Post published successfully!');
        fetchBotStatus();
        setSelectedDraft(null);
        setEditedContent('');
      } else {
        toast.error('Failed to publish post');
      }
    } catch (error) {
      toast.error('Error publishing post');
    } finally {
      setPosting(false);
    }
  };

  const postNow = async (type: string) => {
    try {
      const response = await fetch(`${BOT_API}/manual/post/${type}`, {
        method: 'POST'
      });

      if (response.ok) {
        toast.success(`${type} post queued`);
        fetchBotStatus();
      }
    } catch (error) {
      toast.error('Failed to post');
    }
  };

  const getPostTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      daily: 'Daily Violations',
      shame: 'Creditor Shame',
      weekly: 'Weekly Summary',
      viral: 'Viral Comparison',
      milestone: 'Milestone'
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading bot dashboard...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Social Media Bot Control</h1>
          <p className="text-gray-600 mt-1">Manage automated viral content generation</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={toggleTestMode}
            variant={botStatus?.test_mode ? 'outline' : 'destructive'}
            size="sm"
          >
            {botStatus?.test_mode ? '🧪 Test Mode' : '🔴 LIVE MODE'}
          </Button>
          <Button
            onClick={toggleBot}
            variant={botStatus?.scheduler_running ? 'destructive' : 'default'}
          >
            {botStatus?.scheduler_running ? (
              <>
                <PauseCircle className="w-4 h-4 mr-2" />
                Pause Bot
              </>
            ) : (
              <>
                <PlayCircle className="w-4 h-4 mr-2" />
                Resume Bot
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Bot Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              {botStatus?.scheduler_running ? (
                <>
                  <PlayCircle className="w-6 h-6 text-green-600" />
                  <span className="text-green-600">Running</span>
                </>
              ) : (
                <>
                  <PauseCircle className="w-6 h-6 text-orange-600" />
                  <span className="text-orange-600">Paused</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Posts Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{botStatus?.posts_sent || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Total automated posts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Mode</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={botStatus?.test_mode ? 'bg-blue-500' : 'bg-red-500'}>
              {botStatus?.test_mode ? 'Test Mode' : 'LIVE'}
            </Badge>
            <p className="text-xs text-gray-500 mt-2">
              {botStatus?.test_mode ? 'Posts logged only' : 'Posts published live'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${botStatus?.errors === 0 ? 'text-green-600' : 'text-red-600'}`}>
              {botStatus?.errors || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Failed posts</p>
          </CardContent>
        </Card>
      </div>

      {/* Platform Status */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              {botStatus?.platforms_configured.facebook ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-gray-400" />
              )}
              <div>
                <p className="font-medium">Facebook</p>
                <p className="text-xs text-gray-500">
                  {botStatus?.platforms_configured.facebook ? 'Configured' : 'Not configured'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {botStatus?.platforms_configured.twitter ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-gray-400" />
              )}
              <div>
                <p className="font-medium">Twitter/X</p>
                <p className="text-xs text-gray-500">
                  {botStatus?.platforms_configured.twitter ? 'Configured' : 'Not configured'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {botStatus?.platforms_configured.linkedin ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-gray-400" />
              )}
              <div>
                <p className="font-medium">LinkedIn</p>
                <p className="text-xs text-gray-500">
                  {botStatus?.platforms_configured.linkedin ? 'Configured' : 'Not configured'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Post Editor and Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Drafts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Post Previews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {drafts.map((draft, index) => (
                <div
                  key={index}
                  onClick={() => selectDraft(draft)}
                  className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition ${
                    selectedDraft?.type === draft.type ? 'border-blue-500 bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge>{getPostTypeLabel(draft.type)}</Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        postNow(draft.type);
                      }}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-3">{draft.content}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Editor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Edit & Publish
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDraft ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Content</label>
                  <Textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    rows={12}
                    className="mt-2 font-mono text-sm"
                    placeholder="Edit post content..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {editedContent.length} characters
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => postContent(['all'])}
                    disabled={posting || !editedContent}
                    className="flex-1"
                  >
                    {posting ? 'Publishing...' : 'Publish to All'}
                  </Button>
                  <Button
                    onClick={() => postContent(['facebook'])}
                    disabled={posting || !botStatus?.platforms_configured.facebook}
                    variant="outline"
                  >
                    Facebook
                  </Button>
                  <Button
                    onClick={() => postContent(['twitter'])}
                    disabled={posting || !botStatus?.platforms_configured.twitter}
                    variant="outline"
                  >
                    Twitter
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Eye className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Select a post preview to edit</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Posting Schedule */}
      {botStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Automated Posting Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(botStatus.schedule).map(([key, time]) => (
                <div key={key} className="p-3 border rounded-lg">
                  <p className="text-sm font-medium capitalize">{key.replace('_', ' ')}</p>
                  <p className="text-2xl font-bold mt-1">{time}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
