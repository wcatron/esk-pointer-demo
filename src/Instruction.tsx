import React, { useState } from 'react'
import { Redirect } from 'react-router-dom'

export const Instructions: React.FC = () => {
  const [session, setSession] = useState<string | undefined>(undefined)

  if (session) {
    return <Redirect to={`/client/${session}`} />
  }

  return <div>
    <p>To get started either <button onClick={() => {
      const value = prompt('Enter session ID:')
      if (value) {
        setSession(value)
      }
    }}>join a session</button> or <button onClick={() => {
      const value = prompt('Enter ID for session:')
      if (value) {
        setSession(value)
      }
    }}>start your own.</button></p>
  </div>
}