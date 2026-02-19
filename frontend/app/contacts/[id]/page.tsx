'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { apiClient } from '@/lib/api-client'
import { MeetingWithAnalysis } from '@/types'
import MeetingCard from '@/components/MeetingCard'
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  CircularProgress,
  Button,
  Alert,
  Chip,
} from '@mui/material'
import {
  Person as UserIcon,
  ErrorOutline as AlertCircleIcon,
  AdminPanelSettings as OperatorIcon,
  Person as BasicIcon,
} from '@mui/icons-material'

type UserRole = 'operator' | 'basic'

export default function ContactPage() {
  const params = useParams()
  const contactId = params.id as string

  const [meetings, setMeetings] = useState<MeetingWithAnalysis[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<UserRole | null>(null)

  const fetchMeetings = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiClient.getContactMeetings(contactId)
      setMeetings(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load meetings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Get user role from localStorage
    const role = apiClient.getCurrentRole()
    setUserRole(role)
    fetchMeetings()
  }, [contactId])

  const handleAnalyze = () => {
    fetchMeetings()
  }

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'background.default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Stack alignItems="center" spacing={2}>
          <CircularProgress size={48} />
          <Typography variant="body1" color="text.secondary">
            Loading meetings...
          </Typography>
        </Stack>
      </Box>
    )
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'background.default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
        }}
      >
        <Paper elevation={2} sx={{ p: 4, maxWidth: 500, textAlign: 'center', borderRadius: 3 }}>
          <AlertCircleIcon sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
          <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>
            Error Loading Meetings
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {error}
          </Typography>
          <Button variant="contained" onClick={() => fetchMeetings()} fullWidth>
            Try Again
          </Button>
        </Paper>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 6 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Paper
              elevation={0}
              sx={{
                bgcolor: 'primary.50',
                p: 1.5,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <UserIcon sx={{ fontSize: 28, color: 'primary.main' }} />
            </Paper>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" fontWeight={700} color="text.primary">
                Contact: {contactId}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                {meetings.length} {meetings.length === 1 ? 'meeting' : 'meetings'} found
              </Typography>
            </Box>
            {userRole && (
              <Chip
                icon={userRole === 'operator' ? <OperatorIcon /> : <BasicIcon />}
                label={userRole === 'operator' ? 'Operator Access' : 'Basic Access'}
                color={userRole === 'operator' ? 'success' : 'warning'}
                sx={{ px: 1 }}
              />
            )}
          </Stack>

          {/* Role Info Alert */}
          {userRole && (
            <Alert severity={userRole === 'operator' ? 'info' : 'warning'} sx={{ borderRadius: 2 }}>
              <Typography variant="body2">
                {userRole === 'operator' 
                  ? '✓ You have full access - viewing transcripts and AI analysis'
                  : '⚠ You have limited access - viewing meeting metadata only (no transcripts or analysis)'}
              </Typography>
            </Alert>
          )}
        </Box>

        {/* Meetings List */}
        {meetings.length === 0 ? (
          <Paper elevation={2} sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
            <UserIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
              No Meetings Found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              This contact doesn't have any meetings yet.
            </Typography>
            <Button variant="contained" href="/meetings/new">
              Submit First Meeting
            </Button>
          </Paper>
        ) : (
          <Stack spacing={3}>
            {meetings.map((meeting) => (
              <MeetingCard
                key={meeting.id}
                meeting={meeting}
                onAnalyze={handleAnalyze}
                userRole={userRole ?? undefined}
              />
            ))}
          </Stack>
        )}
      </Container>
    </Box>
  )
}
