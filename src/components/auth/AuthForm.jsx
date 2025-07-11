import { Auth } from './Auth'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../../lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import PropTypes from 'prop-types'

export function AuthForm({ mode = 'sign_in' }) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">
          {mode === 'sign_in' ? 'Welcome Back' : 'Join ALX Showcase'}
        </CardTitle>
        <CardDescription>
          {mode === 'sign_in' 
            ? 'Sign in to your account to continue' 
            : 'Create an account to start showcasing your projects'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Auth
          supabaseClient={supabase}
          view={mode}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'hsl(var(--primary))',
                  brandAccent: 'hsl(var(--primary))',
                }
              }
            },
            className: {
              anchor: 'text-primary hover:text-primary/80',
              button: 'bg-primary hover:bg-primary/90 text-primary-foreground',
              input: 'border-input bg-background',
              label: 'text-foreground',
              message: 'text-destructive',
            }
          }}
          providers={['github', 'google']}
          redirectTo={`${window.location.origin}/dashboard`}
          showLinks={false}
        />
      </CardContent>
    </Card>
  )
}

AuthForm.propTypes = {
  mode: PropTypes.oneOf(['sign_in', 'sign_up'])
}