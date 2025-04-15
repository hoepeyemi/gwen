'use client'

import { useFormStatus } from 'react-dom'
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { joinWaitlist } from '../actions/waitlist'
import { useActionState } from 'react'
import { useState, useEffect } from 'react'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button 
      type="submit" 
      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-semibold hover:scale-105 transition-all shadow-lg" 
      disabled={pending}
      size="lg"
    >
      {pending ? 'Joining...' : 'Request Early Access'}
    </Button>
  )
}

export function WaitlistForm() {
  const [state, formAction] = useActionState(joinWaitlist, null)
  const [animateSuccess, setAnimateSuccess] = useState(false)
  
  useEffect(() => {
    if (state?.success) {
      setAnimateSuccess(true)
    }
  }, [state?.success])

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <Label htmlFor="fullName" className="text-white text-lg mb-2 block">Full Name</Label>
        <Input
          id="fullName"
          name="fullName"
          type="text"
          required
          placeholder="Your full name"
          className="bg-white/20 border-white/30 text-white placeholder:text-white/50 backdrop-blur-sm py-6 px-4 focus:ring-blue-400 focus:border-blue-400"
        />
        {state?.error?.fullName && (
          <p className="mt-2 text-sm text-red-300 animate-shake">{state.error.fullName}</p>
        )}
      </div>
      <div>
        <Label htmlFor="emailOrPhone" className="text-white text-lg mb-2 block">Email or Phone</Label>
        <Input
          id="emailOrPhone"
          name="emailOrPhone"
          type="text"
          required
          placeholder="What's the best way to reach you?"
          className="bg-white/20 border-white/30 text-white placeholder:text-white/50 backdrop-blur-sm py-6 px-4 focus:ring-blue-400 focus:border-blue-400"
        />
        {state?.error?.emailOrPhone && (
          <p className="mt-2 text-sm text-red-300 animate-shake">{state.error.emailOrPhone}</p>
        )}
      </div>
      <SubmitButton />
      {state?.success && (
        <div className={`mt-4 rounded-lg bg-green-600/20 border border-green-400/30 p-4 text-green-200 backdrop-blur-sm text-center ${animateSuccess ? 'animate-fade-in' : ''}`}>
          <p className="font-semibold">Successfully joined the banking waitlist!</p>
          <p className="text-sm mt-1">We'll notify you when new features launch.</p>
        </div>
      )}
    </form>
  )
}

