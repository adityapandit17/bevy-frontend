"use client"

import { useEffect } from "react"

/**
 * Suppresses Next.js error overlay for handled API errors
 * Errors marked with isHandled=true are already shown via toast notifications
 */
export function ErrorSuppressor() {
  useEffect(() => {
    // Suppress unhandled promise rejections for handled errors
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason
      // If error is marked as handled (already shown toast), prevent default behavior
      if (error && typeof error === 'object') {
        const errorObj = error as any
        if (errorObj.isHandled || errorObj.toastShown) {
          event.preventDefault()
          event.stopPropagation()
          // Still log to console for debugging, but don't show Next.js overlay
          console.warn('Handled API error (toast already shown):', errorObj.message || error)
          return false
        }
      }
    }

    // Suppress console errors for handled errors to prevent Next.js overlay
    const originalConsoleError = console.error
    console.error = (...args: any[]) => {
      // Check if any argument is a handled error
      for (const arg of args) {
        if (arg && typeof arg === 'object') {
          const errorObj = arg as any
          if (errorObj.isHandled || errorObj.toastShown) {
            // Suppress console.error for handled errors
            return
          }
          // Also check error.message for handled errors
          if (errorObj.message && typeof errorObj.message === 'string') {
            // Check if it's a validation error that we've already handled
            if (errorObj.message.includes('has already been taken') || 
                errorObj.message.includes('Email has already been taken')) {
              return
            }
          }
        }
      }
      // Call original console.error for other errors
      originalConsoleError.apply(console, args)
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection, true)

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection, true)
      console.error = originalConsoleError
    }
  }, [])

  return null
}

