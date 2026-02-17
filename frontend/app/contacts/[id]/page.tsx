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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  const [userRole, setUserRole] = useState<UserRole>('operator')

  const fetchMeetings = async (role: UserRole) => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiClient.getContactMeetings(contactId, role)
      setMeetings(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load meetings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMeetings(userRole)
  }, [contactId, userRole])

  const handleAnalyze = () => {
    fetchMeetings(userRole)
  }

  const handleRoleChange = (newRole: UserRole) => {
    setUserRole(newRole)
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
          <Button variant="contained" onClick={() => fetchMeetings(userRole)} fullWidth>
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
          </Stack>
        </Box>

        {/* Role Selector */}
        <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
          <Stack direction="row" spacing={3} alignItems="center">
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>User Role</InputLabel>
              <Select
                value={userRole}
                label="User Role"
                onChange={(e) => handleRoleChange(e.target.value as UserRole)}
              >
                <MenuItem value="operator">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <OperatorIcon fontSize="small" />
                    <span>Operator (Admin)</span>
                  </Stack>
                </MenuItem>
                <MenuItem value="basic">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <BasicIcon fontSize="small" />
                    <span>Basic User</span>
                  </Stack>
                </MenuItem>
              </Select>
            </FormControl>

            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Current Access Level:
              </Typography>
              <Chip
                icon={userRole === 'operator' ? <OperatorIcon /> : <BasicIcon />}
                label={userRole === 'operator' ? 'Full Access' : 'Limited Access'}
                color={userRole === 'operator' ? 'success' : 'warning'}
              />
            </Box>

            <Box sx={{ flex: 1 }}>
              <Alert severity={userRole === 'operator' ? 'info' : 'warning'} sx={{ borderRadius: 2 }}>
                <Typography variant="body2">
                  {userRole === 'operator' 
                    ? '✓ You can see full transcripts and AI analysis'
                    : '⚠ You can only see meeting metadata (no transcripts or analysis)'}
                </Typography>
              </Alert>
            </Box>
          </Stack>
        </Paper>

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
                userRole={userRole}
              />
            ))}
          </Stack>
        )}
      </Container>
    </Box>
  )
}
