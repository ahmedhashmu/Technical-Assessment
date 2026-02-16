'use client'

import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Link from '@mui/material/Link'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import PsychologyIcon from '@mui/icons-material/Psychology'
import GitHubIcon from '@mui/icons-material/GitHub'
import EmailIcon from '@mui/icons-material/Email'

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
        py: 6,
        mt: 'auto',
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          {/* Brand */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                  borderRadius: 2,
                  p: 1,
                  display: 'flex',
                }}
              >
                <PsychologyIcon sx={{ color: 'white', fontSize: 24 }} />
              </Box>
              <Typography variant="h6" fontWeight={700}>
                TruthOS
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Contact-centric meeting analysis with AI-powered insights. One source of truth.
            </Typography>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/meetings/new" underline="hover" color="text.secondary">
                Submit Meeting
              </Link>
              <Link href="/contacts" underline="hover" color="text.secondary">
                View Contacts
              </Link>
              <Link
                href="https://github.com/ahmedhashmu/Technical-Assessment"
                target="_blank"
                underline="hover"
                color="text.secondary"
              >
                Documentation
              </Link>
            </Box>
          </Grid>

          {/* Connect */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Connect
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                href="https://github.com/ahmedhashmu/Technical-Assessment"
                target="_blank"
                color="primary"
              >
                <GitHubIcon />
              </IconButton>
              <IconButton href="mailto:contact@truthos.com" color="primary">
                <EmailIcon />
              </IconButton>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider', textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            © 2026 TruthOS. Built for technical assessment.
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}
