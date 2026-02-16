'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Alert,
} from '@mui/material'
import {
  People as UsersIcon,
  Search as SearchIcon,
} from '@mui/icons-material'

export default function ContactsPage() {
  const router = useRouter()
  const [searchValue, setSearchValue] = useState('')

  const sampleContacts = [
    'contact_001',
    'contact_002',
    'contact_003',
  ]

  const handleSearch = () => {
    if (searchValue.trim()) {
      router.push(`/contacts/${searchValue.trim()}`)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
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
              <UsersIcon sx={{ fontSize: 28, color: 'primary.main' }} />
            </Paper>
            <Typography variant="h4" fontWeight={700} color="text.primary">
              Contacts
            </Typography>
          </Stack>
          <Typography variant="body1" color="text.secondary">
            View meeting history and analysis for each contact
          </Typography>
        </Box>

        {/* Search Box */}
        <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
            Search by Contact ID
          </Typography>
          <Stack direction="row" spacing={2}>
            <TextField
              fullWidth
              placeholder="Enter contact ID (e.g., contact_xyz789)"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyPress={handleKeyPress}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
            <Button
              variant="contained"
              onClick={handleSearch}
              sx={{ minWidth: 120 }}
            >
              Search
            </Button>
          </Stack>
        </Paper>

        {/* Sample Contacts */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Sample Contacts
          </Typography>
          <Grid container spacing={3}>
            {sampleContacts.map((contactId) => (
              <Grid item xs={12} sm={6} md={4} key={contactId}>
                <Card
                  elevation={2}
                  sx={{
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardActionArea onClick={() => router.push(`/contacts/${contactId}`)}>
                    <CardContent>
                      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1.5 }}>
                        <Paper
                          elevation={0}
                          sx={{
                            bgcolor: 'primary.50',
                            p: 1,
                            borderRadius: 1.5,
                            display: 'flex',
                          }}
                        >
                          <UsersIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                        </Paper>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {contactId}
                        </Typography>
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        View meeting history and AI analysis
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Info Box */}
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
            How to Use
          </Typography>
          <Stack spacing={0.5}>
            <Typography variant="body2">
              1. Enter a contact ID in the search box above
            </Typography>
            <Typography variant="body2">
              2. View all meetings associated with that contact
            </Typography>
            <Typography variant="body2">
              3. Click "Analyze" on any meeting to extract AI insights
            </Typography>
          </Stack>
        </Alert>
      </Container>
    </Box>
  )
}
