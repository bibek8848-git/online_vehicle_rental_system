'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function SearchParamHandler() {
    const searchParams = useSearchParams()
    const router = useRouter()

    useEffect(() => {
        const token = searchParams.get('token')
        const name = searchParams.get('name')
        const email = searchParams.get('email')
        const avatar = searchParams.get('avatar')
        const role = searchParams.get('role')

        if (token && email && name && role) {
            try {
                localStorage.setItem('token', token)
                localStorage.setItem('user', JSON.stringify({ name, email, avatar, role }))
                
                // Set cookies for middleware
                document.cookie = `token=${token}; path=/; max-age=3600; SameSite=Lax`;
                document.cookie = `user=${encodeURIComponent(JSON.stringify({ name, email, avatar, role }))}; path=/; max-age=3600; SameSite=Lax`;

                // Clean the URL by replacing it with path only
                router.replace('/')
            } catch (err) {
                console.error('Error setting session data:', err)
            }
        }
    }, [searchParams, router])

    return null
}
