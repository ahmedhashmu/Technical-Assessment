'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Button,
  Stack,
  Typography,
  Paper,
} from '@mui/material'
import {
  AdminPanelSettings as OperatorIcon,
  Person as BasicIcon,
} from '@mui/icons-material'

interface LoginSelectorProps {
  open: boolean
  onClose?: () => void
}

export default function LoginSelector({ open, onClose }: LoginSelectorProps) {
  const [isOpen, setIsOpen] = useState(open)

  useEffect(() => {
    setIsOpen(open)
  }, [open])

  const handleLogin = (role: 'operator' | 'basic') => {
    const token = role === 'operator' ? 'operator-test-token' : 'basic-test-token'
    apiClient.setToken(token)
    setIsOpen(false)
    if (onClose) onClose()
    
    // Reload page to apply authentication
    window.location.reload()
  }

  return (
    <Dialog 
      open={isOpen} 
      onClose={() => {}} 
      maxWidth="sm" 
      fullWidth
      disableEscapeKeyDown
    >
      <DialogTitle>
        <Typography variant="h5" fontWeight={700} textAlign="center">
          Mock Login
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 1 }}>
          Select a role to continue
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ py: 2 }}>
          {/* Operator Login */}
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              cursor: 'pointer',
              transition: 'all 0.3s',
              '&:hover': {
                elevation: 4,
                transform: 'translateY(-2px)',
              }
            }}
            onClick={() => handleLogin('operator')}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  bgcolor: 'success.50',
                  p: 2,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <OperatorIcon sx={{ fontSize: 32, color: 'success.main' }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight={600}>
                  Login as Operator
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Full access: View transcripts, analysis, and trigger AI analysis
                </Typography>
              </Box>
            </Stack>
          </Paper>

          {/* Basic Login */}
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              cursor: 'pointer',
              transition: 'all 0.3s',
              '&:hover': {
                elevation: 4,
                transform: 'translateY(-2px)',
              }
            }}
            onClick={() => handleLogin('basic')}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  bgcolor: 'warning.50',
                  p: 2,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <BasicIcon sx={{ fontSize: 32, color: 'warning.main' }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight={600}>
                  Login as Basic User
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Limited access: View meeting metadata only
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Stack>
      </DialogContent>
    </Dialog>
  )
}
