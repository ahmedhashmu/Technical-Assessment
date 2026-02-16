'use client'

import { useState } from 'react'
import { apiClient } from '@/lib/api-client'
import { MeetingFormData } from '@/types'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import SendIcon from '@mui/icons-material/Send'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

export default function MeetingSubmissionForm() {
  const [formData, setFormData] = useState<MeetingFormData>({
    meetingId: '',
    contactId: '',
    type: 'sales',
    occurredAt: '',
    transcript: '',
  })
  
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Convert datetime-local to ISO format
      const isoDate = new Date(formData.occurredAt).toISOString()
      
      await apiClient.createMeeting({
        ...formData,
        occurredAt: isoDate,
      })
      
      setSuccess(true)
      setFormData({
        meetingId: '',
        contactId: '',
        type: 'sales',
        occurredAt: '',
        transcript: '',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit meeting')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {success && (
        <Alert icon={<CheckCircleIcon />} severity="success" sx={{ borderRadius: 2 }}>
          <strong>Meeting submitted successfully!</strong>
          <br />
          Your meeting transcript has been saved as an immutable record.
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          <strong>Error</strong>
          <br />
          {error}
        </Alert>
      )}

      <TextField
        label="Meeting ID"
        required
        fullWidth
        value={formData.meetingId}
        onChange={(e) => setFormData({ ...formData, meetingId: e.target.value })}
        placeholder="meet_abc123"
      />

      <TextField
        label="Contact ID"
        required
        fullWidth
        value={formData.contactId}
        onChange={(e) => setFormData({ ...formData, contactId: e.target.value })}
        placeholder="contact_xyz789"
      />

      <TextField
        select
        label="Meeting Type"
        required
        fullWidth
        value={formData.type}
        onChange={(e) => setFormData({ ...formData, type: e.target.value as 'sales' | 'coaching' })}
      >
        <MenuItem value="sales">Sales</MenuItem>
        <MenuItem value="coaching">Coaching</MenuItem>
      </TextField>

      <TextField
        label="Meeting Date & Time"
        type="datetime-local"
        required
        fullWidth
        value={formData.occurredAt}
        onChange={(e) => setFormData({ ...formData, occurredAt: e.target.value })}
        InputLabelProps={{ shrink: true }}
      />

      <TextField
        label="Meeting Transcript"
        required
        fullWidth
        multiline
        rows={10}
        value={formData.transcript}
        onChange={(e) => setFormData({ ...formData, transcript: e.target.value })}
        placeholder="Enter the full meeting transcript here..."
      />

      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={loading}
        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
        sx={{
          py: 1.5,
          background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #0284c7 0%, #075985 100%)',
          },
        }}
      >
        {loading ? 'Submitting...' : 'Submit Meeting'}
      </Button>
    </Box>
  )
}
