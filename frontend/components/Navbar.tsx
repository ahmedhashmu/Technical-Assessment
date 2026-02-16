'use client'

import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Link from 'next/link'
import PsychologyIcon from '@mui/icons-material/Psychology'
import AddIcon from '@mui/icons-material/Add'
import PeopleIcon from '@mui/icons-material/People'

export default function Navbar() {
  return (
    <AppBar position="sticky" color="default" elevation={1} sx={{ bgcolor: 'background.paper' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                  borderRadius: 2,
                  p: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PsychologyIcon sx={{ color: 'white', fontSize: 28 }} />
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                TruthOS
              </Typography>
            </Box>
          </Link>

          {/* Navigation */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              component={Link}
              href="/meetings/new"
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0284c7 0%, #075985 100%)',
                },
              }}
            >
              New Meeting
            </Button>
            
            <Button
              component={Link}
              href="/contacts"
              variant="outlined"
              startIcon={<PeopleIcon />}
            >
              Contacts
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  )
}
