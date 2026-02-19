'use client'

import { useState } from 'react'
import { MeetingWithAnalysis } from '@/types'
import { format } from 'date-fns'
import { apiClient } from '@/lib/api-client'
import {
  Card,
  CardContent,
  CardActions,
  Box,
  Typography,
  Chip,
  Button,
  Collapse,
  IconButton,
  CircularProgress,
  Divider,
  Stack,
  Paper,
} from '@mui/material'
import {
  ExpandMore as ExpandMoreIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon,
  Psychology as BrainIcon,
  AutoAwesome as SparklesIcon,
} from '@mui/icons-material'

interface MeetingCardProps {
  meeting: MeetingWithAnalysis
  onAnalyze?: (meetingId: string) => void
  userRole?: 'operator' | 'basic'
}

export default function MeetingCard({ meeting, onAnalyze, userRole = 'operator' }: MeetingCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)

  const handleAnalyze = async () => {
    setAnalyzing(true)
    try {
      await apiClient.analyzeMeeting(meeting.id)
      if (onAnalyze) {
        onAnalyze(meeting.id)
      }
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setAnalyzing(false)
    }
  }

  const getSentimentColor = (sentiment: string): 'success' | 'error' | 'default' => {
    switch (sentiment) {
      case 'positive': return 'success'
      case 'negative': return 'error'
      default: return 'default'
    }
  }

  const getOutcomeColor = (outcome: string): 'success' | 'info' | 'error' | 'default' => {
    switch (outcome) {
      case 'closed': return 'success'
      case 'follow_up': return 'info'
      case 'no_interest': return 'error'
      default: return 'default'
    }
  }

  // Basic users see limited view
  if (userRole === 'basic') {
    return (
      <Card elevation={2} sx={{ transition: 'all 0.3s', '&:hover': { elevation: 4 } }}>
        <CardContent>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
                <Chip
                  label={meeting.type}
                  color={meeting.type === 'sales' ? 'primary' : 'secondary'}
                  size="small"
                />
                <Chip
                  label={`ID: ${meeting.id}`}
                  variant="outlined"
                  size="small"
                />
                <Chip
                  label="Limited Access"
                  color="warning"
                  size="small"
                  variant="outlined"
                />
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {format(new Date(meeting.occurredAt), 'PPP p')}
                </Typography>
              </Stack>
            </Box>
          </Box>

          {/* Limited Access Message */}
          <Paper elevation={0} sx={{ bgcolor: 'warning.50', p: 2, borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary">
              🔒 Transcript and analysis are only available to operators
            </Typography>
          </Paper>
        </CardContent>
      </Card>
    )
  }

  // Operator sees full view
  return (
    <Card elevation={2} sx={{ transition: 'all 0.3s', '&:hover': { elevation: 4 } }}>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
              <Chip
                label={meeting.type}
                color={meeting.type === 'sales' ? 'primary' : 'secondary'}
                size="small"
              />
              <Chip
                label={`ID: ${meeting.id}`}
                variant="outlined"
                size="small"
              />
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {format(new Date(meeting.occurredAt), 'PPP p')}
              </Typography>
            </Stack>
          </Box>
          
          <Button
            variant={meeting.analysis ? "outlined" : "contained"}
            startIcon={analyzing ? <CircularProgress size={16} color="inherit" /> : <BrainIcon />}
            onClick={handleAnalyze}
            disabled={analyzing}
            size="small"
          >
            {analyzing ? 'Analyzing...' : (meeting.analysis ? 'Re-analyze' : 'Analyze')}
          </Button>
        </Box>

        {/* Transcript Preview */}
        <Paper elevation={0} sx={{ bgcolor: 'grey.50', p: 2, mb: 2, borderRadius: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <DescriptionIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
            <Typography variant="body2" fontWeight={500} color="text.secondary">
              Transcript Preview
            </Typography>
          </Stack>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {meeting.transcript}
          </Typography>
        </Paper>

        {/* Analysis Results */}
        {meeting.analysis && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                <SparklesIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                <Typography variant="body2" fontWeight={600}>
                  AI Analysis
                </Typography>
              </Stack>
              
              <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                    Sentiment
                  </Typography>
                  <Chip
                    label={meeting.analysis.sentiment}
                    color={getSentimentColor(meeting.analysis.sentiment)}
                    size="small"
                  />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                    Outcome
                  </Typography>
                  <Chip
                    label={meeting.analysis.outcome.replace('_', ' ')}
                    color={getOutcomeColor(meeting.analysis.outcome)}
                    size="small"
                  />
                </Box>
              </Stack>

              <Paper elevation={0} sx={{ bgcolor: 'primary.50', p: 2, borderRadius: 2 }}>
                <Typography variant="body2" color="text.primary">
                  {meeting.analysis.summary}
                </Typography>
              </Paper>
            </Box>
          </>
        )}
      </CardContent>

      <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
        <Button
          onClick={() => setExpanded(!expanded)}
          endIcon={
            <ExpandMoreIcon
              sx={{
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s',
              }}
            />
          }
          size="small"
        >
          {expanded ? 'Show Less' : 'Show More'}
        </Button>
      </CardActions>

      {/* Expanded Content */}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Divider />
        <CardContent sx={{ bgcolor: 'grey.50' }}>
          {/* Full Transcript */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
              Full Transcript
            </Typography>
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
              <Typography variant="body2" color="text.primary" sx={{ whiteSpace: 'pre-wrap' }}>
                {meeting.transcript}
              </Typography>
            </Paper>
          </Box>

          {/* Detailed Analysis */}
          {meeting.analysis && (
            <Box>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
                Detailed Analysis
              </Typography>
              
              <Stack spacing={2}>
                {/* Topics */}
                {meeting.analysis.topics.length > 0 && (
                  <Box>
                    <Typography variant="body2" fontWeight={500} color="text.secondary" sx={{ mb: 1 }}>
                      Topics Discussed
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {meeting.analysis.topics.map((topic, idx) => (
                        <Chip key={idx} label={topic} color="info" size="small" variant="outlined" />
                      ))}
                    </Stack>
                  </Box>
                )}

                {/* Objections */}
                {meeting.analysis.objections.length > 0 && (
                  <Box>
                    <Typography variant="body2" fontWeight={500} color="text.secondary" sx={{ mb: 1 }}>
                      Objections Raised
                    </Typography>
                    <Stack spacing={0.5}>
                      {meeting.analysis.objections.map((objection, idx) => (
                        <Typography key={idx} variant="body2" color="text.secondary" sx={{ display: 'flex' }}>
                          <Box component="span" sx={{ color: 'error.main', mr: 1 }}>•</Box>
                          {objection}
                        </Typography>
                      ))}
                    </Stack>
                  </Box>
                )}

                {/* Commitments */}
                {meeting.analysis.commitments.length > 0 && (
                  <Box>
                    <Typography variant="body2" fontWeight={500} color="text.secondary" sx={{ mb: 1 }}>
                      Commitments Made
                    </Typography>
                    <Stack spacing={0.5}>
                      {meeting.analysis.commitments.map((commitment, idx) => (
                        <Typography key={idx} variant="body2" color="text.secondary" sx={{ display: 'flex' }}>
                          <Box component="span" sx={{ color: 'success.main', mr: 1 }}>✓</Box>
                          {commitment}
                        </Typography>
                      ))}
                    </Stack>
                  </Box>
                )}
              </Stack>
            </Box>
          )}
        </CardContent>
      </Collapse>
    </Card>
  )
}
