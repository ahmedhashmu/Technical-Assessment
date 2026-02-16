import MeetingSubmissionForm from '@/components/MeetingSubmissionForm'
import { Box, Container, Typography, Paper, Stack, Alert } from '@mui/material'
import { Description as FileTextIcon } from '@mui/icons-material'

export default function NewMeetingPage() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 6 }}>
      <Container maxWidth="md">
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
              <FileTextIcon sx={{ fontSize: 28, color: 'primary.main' }} />
            </Paper>
            <Typography variant="h4" fontWeight={700} color="text.primary">
              Submit Meeting Transcript
            </Typography>
          </Stack>
          <Typography variant="body1" color="text.secondary">
            Ingest a new meeting transcript as an immutable record. 
            All data will be stored securely and cannot be modified after submission.
          </Typography>
        </Box>

        {/* Form Card */}
        <Paper elevation={2} sx={{ p: 4, borderRadius: 3, mb: 3 }}>
          <MeetingSubmissionForm />
        </Paper>

        {/* Info Box */}
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>
            About Immutable Records
          </Typography>
          <Typography variant="body2">
            Meeting transcripts are stored as immutable truth. Once submitted, they cannot be 
            modified or deleted. This ensures data integrity and provides a complete audit trail.
          </Typography>
        </Alert>
      </Container>
    </Box>
  )
}
