'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Link from 'next/link'
import PsychologyIcon from '@mui/icons-material/Psychology'
import AddIcon from '@mui/icons-material/Add'
import PeopleIcon from '@mui/icons-material/People'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import PersonIcon from '@mui/icons-material/Person'
import LogoutIcon from '@mui/icons-material/Logout'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import { apiClient } from '@/lib/api-client'

export default function Navbar() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [currentRole, setCurrentRole] = useState<'operator' | 'basic' | null>(null)
  const [currentEmail, setCurrentEmail] = useState<string | null>(null)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  // Handle client-side mounting
  useEffect(() => {
    // Mark as mounted
    setMounted(true)
    
    // Small delay to ensure localStorage is ready after login redirect
    const timer = setTimeout(() => {
      // Check authentication status
      const isAuth = apiClient.isAuthenticated()
      
      if (!isAuth) {
        router.push('/login')
        return
      }
      
      // Load user data from localStorage
      const role = apiClient.getCurrentRole()
      const email = apiClient.getCurrentEmail()
      
      console.log('Navbar: Loading auth state', { role, email, isAuth })
      
      setCurrentRole(role)
      setCurrentEmail(email)
      
      // If no role/email but token exists, redirect to login
      if (!role || !email) {
        console.log('Navbar: Missing role or email, redirecting to login')
        router.push('/login')
      }
    }, 100) // 100ms delay to ensure localStorage is populated
    
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run on mount

  const handleLogout = () => {
    apiClient.clearToken()
    setCurrentRole(null)
    setCurrentEmail(null)
    setAnchorEl(null)
    router.push('/login')
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

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
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
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

            {/* User Role Display - Only render on client after mount */}
            {mounted && currentRole && (
              <>
                <Chip
                  icon={currentRole === 'operator' ? <AdminPanelSettingsIcon /> : <PersonIcon />}
                  label={currentRole === 'operator' ? 'Admin' : 'Basic User'}
                  color={currentRole === 'operator' ? 'success' : 'warning'}
                  size="small"
                />
                
                <IconButton onClick={handleMenuOpen} size="small">
                  <AccountCircleIcon />
                </IconButton>
                
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  <MenuItem disabled>
                    <Typography variant="caption" color="text.secondary">
                      {currentEmail}
                    </Typography>
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <LogoutIcon sx={{ mr: 1, fontSize: 20 }} />
                    Logout
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  )
}
