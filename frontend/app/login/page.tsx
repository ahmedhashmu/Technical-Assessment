'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Stack,
  Divider,
} from '@mui/material'
import {
  Psychology as BrainIcon,
  Login as LoginIcon,
} from '@mui/icons-material'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.detail?.message || 'Login failed')
        setLoading(false)
        return
      }

      // Store token
      localStorage.setItem('auth_token', data.access_token)
      localStorage.setItem('user_email', data.user.email)
      localStorage.setItem('user_role', data.user.role)

      // Redirect to home
      router.push('/')
    } catch (err) {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  const fillDemo = (role: 'admin' | 'user') => {
    if (role === 'admin') {
      setEmail('admin@truthos.com')
      setPassword('AdminPass123')
    } else {
      setEmail('user@truthos.com')
      setPassword('UserPass123')
    }
  }

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
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          {/* Logo */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                display: 'inline-flex',
                background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                borderRadius: 3,
                p: 2,
                mb: 2,
              }}
            >
              <BrainIcon sx={{ fontSize: 48, color: 'white' }} />
            </Box>
            <Typography
              variant="h4"
              fontWeight={700}
              sx={{
                background: 'linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              TruthOS
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Meeting Intelligence Platform
            </Typography>
          </Box>

          {/* Login Form */}
          <form onSubmit={handleLogin}>
            <Stack spacing={3}>
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
                autoComplete="email"
              />

              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
                autoComplete="current-password"
              />

              {error && (
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                  {error}
                </Alert>
              )}

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                startIcon={<LoginIcon />}
                sx={{
                  background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #0284c7 0%, #075985 100%)',
                  },
                }}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </Stack>
          </form>

          {/* Demo Credentials */}
          <Box sx={{ mt: 4 }}>
            <Divider sx={{ mb: 3 }}>
              <Typography variant="caption" color="text.secondary">
                Demo Credentials
              </Typography>
            </Divider>

            <Stack spacing={2}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: 'success.50',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: 'success.100',
                  },
                }}
                onClick={() => fillDemo('admin')}
              >
                <Typography variant="subtitle2" fontWeight={600} color="success.main">
                  Admin (Operator)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  admin@truthos.com / AdminPass123
                </Typography>
                <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                  Full access: View transcripts, analysis, and trigger AI analysis
                </Typography>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: 'warning.50',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: 'warning.100',
                  },
                }}
                onClick={() => fillDemo('user')}
              >
                <Typography variant="subtitle2" fontWeight={600} color="warning.main">
                  Basic User
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  user@truthos.com / UserPass123
                </Typography>
                <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                  Limited access: View meeting metadata only
                </Typography>
              </Paper>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}
