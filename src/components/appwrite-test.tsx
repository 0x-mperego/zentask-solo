"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { account } from '@/lib/appwrite'
import { toast } from 'sonner'

export function AppwriteTest() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const sendPing = async () => {
    setLoading(true)
    try {
      // Test connessione con Appwrite
      const response = await account.get()
      setResult(`✅ Connesso come: ${response.name || response.email}`)
      toast.success('Connessione Appwrite riuscita!')
    } catch (error: any) {
      if (error.code === 401) {
        setResult('⚠️ Connessione OK, ma nessun utente autenticato')
        toast.success('Connessione Appwrite riuscita! (Non autenticato)')
      } else {
        setResult(`❌ Errore: ${error.message}`)
        toast.error('Errore connessione Appwrite')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Test Appwrite</CardTitle>
        <CardDescription>
          Verifica la connessione con il backend Appwrite
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={sendPing} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Connessione...' : 'Send a ping'}
        </Button>
        
        {result && (
          <div className="p-3 rounded-md bg-muted text-sm">
            {result}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 