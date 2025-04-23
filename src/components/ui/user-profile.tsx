"use client"

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { shortStellarAddress } from "~/lib/utils"

interface UserProfileProps {
  name?: string | null
  walletAddress?: string | null
  profilePicture?: string | null
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showWallet?: boolean
}

export function UserProfile({
  name,
  walletAddress,
  profilePicture,
  className = '',
  size = 'md',
  showWallet = true
}: UserProfileProps) {
  // Get initials from name
  const initials = name
    ? name
        .split(' ')
        .map(part => part.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : '?'
  
  // Get shortened wallet address
  const shortAddress = walletAddress ? shortStellarAddress(walletAddress) : null
  
  // Determine avatar size
  const avatarSize = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  }[size]
  
  // Determine text sizes
  const nameSize = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }[size]
  
  const addressSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }[size]
  
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Avatar className={avatarSize}>
        {profilePicture ? (
          <AvatarImage src={profilePicture} alt={name || "User"} />
        ) : (
          <AvatarFallback className="bg-blue-100 text-blue-600">{initials}</AvatarFallback>
        )}
      </Avatar>
      <div>
        {name && <p className={`font-medium leading-none ${nameSize}`}>{name}</p>}
        {showWallet && shortAddress && (
          <p className={`text-muted-foreground ${addressSize}`}>{shortAddress}</p>
        )}
      </div>
    </div>
  )
} 