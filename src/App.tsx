import React, { useState, useEffect } from 'react';
import { Route, BrowserRouter } from 'react-router-dom'
import './App.css';
import { useEsk } from './useEsk';
import { Instructions } from './Instruction';
import { SessionView } from './Session';

function App() {
  const [isConnected, setConnected] = useState(false)
  const client = useEsk()
  useEffect(() => {
    console.log('OnLoad', client)
    if (client?.connected) {
      setConnected(true)
    }
    const onOpen = () => {
      console.log('onOpen')
      setConnected(true)
    }
    const onClose = () => {
      setConnected(false)
    }
    client?.on('open', onOpen)
    client?.on('close', onClose)
    return () => {
      client?.removeListener('open', onOpen)
      client?.removeListener('close', onClose)
    }
  }, [client])

  return (
    <div className="App">
      <header className="App-header" style={{
        background: isConnected ? 'black' : 'gray'
      }}>
        <h1>ESKit Pointer Demo {isConnected ? '✅' : ' (connecting...)'}</h1>
        <BrowserRouter>
          <Route exact path='/' component={Instructions} />
          <Route path='/client/:sessionId' component={SessionView} />
        </BrowserRouter>
        <p><a href="https://github.com/wcatron/esk-pointer-demo">GitHub</a> | <a href='https://www.eskit.net'>ESKit Project</a></p>
      </header>
    </div>
  );
}

export default App;
