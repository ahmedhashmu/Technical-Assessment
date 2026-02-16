'use client'

import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Link from 'next/link'
import PsychologyIcon from '@mui/icons-material/Psychology'
import AddIcon from '@mui/icons-material/Add'
import PeopleIcon from '@mui/icons-material/People'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import ShieldIcon from '@mui/icons-material/Shield'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import { alpha } from '@mui/material/styles'

export default function Home() {
  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0f9ff 100%)',
          py: { xs: 8, md: 12 },
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Chip
              icon={<AutoAwesomeIcon />}
              label="AI-Powered Meeting Intelligence"
              color="primary"
              sx={{ mb: 3, fontWeight: 500 }}
            />
            
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                fontWeight: 700,
                mb: 3,
                background: 'linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              One Source of Truth for Meeting Intelligence
            </Typography>
            
            <Typography
              variant="h5"
              color="text.secondary"
              sx={{ mb: 5, maxWidth: '800px', mx: 'auto', fontWeight: 400 }}
            >
              Contact-centric meeting analysis with AI-powered insights. 
              Immutable records, derived intelligence, and verified outcomes.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                component={Link}
                href="/meetings/new"
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #0284c7 0%, #075985 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: 4,
                  },
                  transition: 'all 0.3s',
                }}
              >
                Submit Meeting
              </Button>
              
              <Button
                component={Link}
                href="/contacts"
                variant="outlined"
                size="large"
                startIcon={<PeopleIcon />}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 2,
                  },
                  transition: 'all 0.3s',
                }}
              >
                View Contacts
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '2.5rem' }, fontWeight: 700, mb: 2 }}>
            Built for Truth-Driven Organizations
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '700px', mx: 'auto' }}>
            Ingest real operational activity, convert it into verified metrics, 
            and power AI agents with immutable records.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Feature 1 */}
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                height: '100%',
                background: `linear-gradient(135deg, ${alpha('#0ea5e9', 0.05)} 0%, ${alpha('#ffffff', 1)} 100%)`,
                border: 1,
                borderColor: alpha('#0ea5e9', 0.2),
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 6,
                },
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box
                  sx={{
                    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                    borderRadius: 2,
                    p: 1.5,
                    display: 'inline-flex',
                    mb: 3,
                  }}
                >
                  <ShieldIcon sx={{ color: 'white', fontSize: 32 }} />
                </Box>
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  Immutable Records
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Meeting transcripts stored as immutable truth. No retroactive manipulation. 
                  Complete audit trail for compliance.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Feature 2 */}
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                height: '100%',
                background: `linear-gradient(135deg, ${alpha('#8b5cf6', 0.05)} 0%, ${alpha('#ffffff', 1)} 100%)`,
                border: 1,
                borderColor: alpha('#8b5cf6', 0.2),
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 6,
                },
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box
                  sx={{
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    borderRadius: 2,
                    p: 1.5,
                    display: 'inline-flex',
                    mb: 3,
                  }}
                >
                  <PsychologyIcon sx={{ color: 'white', fontSize: 32 }} />
                </Box>
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  Bounded AI Analysis
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  LLM agents constrained by rules and structured outputs. 
                  Extract topics, sentiment, and outcomes without hallucinations.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Feature 3 */}
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                height: '100%',
                background: `linear-gradient(135deg, ${alpha('#10b981', 0.05)} 0%, ${alpha('#ffffff', 1)} 100%)`,
                border: 1,
                borderColor: alpha('#10b981', 0.2),
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 6,
                },
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box
                  sx={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    borderRadius: 2,
                    p: 1.5,
                    display: 'inline-flex',
                    mb: 3,
                  }}
                >
                  <TrendingUpIcon sx={{ color: 'white', fontSize: 32 }} />
                </Box>
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  Contact-Centric Intelligence
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  All data organized by contact. View complete interaction history, 
                  analysis results, and verified outcomes in one place.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)',
          py: { xs: 8, md: 10 },
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2rem', md: '2.5rem' },
                fontWeight: 700,
                color: 'white',
                mb: 3,
              }}
            >
              Ready to Get Started?
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', mb: 5 }}>
              Submit your first meeting transcript and see AI-powered analysis in action.
            </Typography>
            <Button
              component={Link}
              href="/meetings/new"
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              sx={{
                px: 5,
                py: 2,
                fontSize: '1.1rem',
                bgcolor: 'white',
                color: 'primary.main',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.9)',
                  transform: 'translateY(-2px)',
                  boxShadow: 8,
                },
                transition: 'all 0.3s',
              }}
            >
              Submit Meeting Now
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  )
}
