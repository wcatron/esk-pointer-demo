import React, { useEffect, useState, useCallback } from 'react'
import { useEsk } from './useEsk'
import { Message } from 'esk-client-typescript'

type EventPayload = {
    event: 'ticket' | 'vote' | 'complete'
    value: string
    name: string
}

type Aggregate = {
    currentTicket: string
    complete: boolean
    votes: Record<string, Record<string, number>>,
    count: number
}

function nextAggregate(current: Aggregate, message: Message):Aggregate {
    try {
        const event = JSON.parse(message.payload) as EventPayload
        console.log('nextProjection', current, event)
        const count = current.count + 1
        switch (event.event) {
            case 'ticket':
                return {
                    ...current,
                    currentTicket: event.value,
                    complete: false,
                    votes: {
                        ...current.votes,
                        [event.value]: {}
                    },
                    count
                }
            case 'complete':
                return {
                    ...current,
                    currentTicket: '',
                    complete: true,
                    count
                }
            case 'vote':
                const currentVotes = current.currentTicket in current.votes ? current.votes[current.currentTicket] : {}
                return {
                    ...current,
                    votes: {
                        ...current.votes,
                        [current.currentTicket]: {
                            ...currentVotes,
                            [event.name]: parseInt(event.value) as number
                        }
                    },
                    count
                }
        }
    } catch (e) {
        console.error(e)
        return current
    }
}

// Could not figure out a way to use state in the component
// Attempted using useState<Projection>(...) with a useRef(currentState) but the
// ref.current was not updating to the latest value by the time the next event
// was beeing processed.
let singletonState: Aggregate = {
    complete: true,
    currentTicket: '',
    votes: {},
    count: 0
}

export const SessionView: React.FC<{
    match: {
        params: {
            sessionId: string
        }
    }
}> = ({ match }) => {
    const sessionId = match.params.sessionId
    const [currentTicket, setCurrentTicket] = useState('')
    const [currentVote, setCurrentVote] = useState('')
    const [currentName, setCurrentName] = useState('')
    const [name, setName] = useState<string | undefined>(localStorage.getItem('name') || undefined)
    const client = useEsk()
    const [currentState, setCurrentState] = useState<Aggregate>(singletonState)
    const onEvent = useCallback((message: Message) => {
        const nextState = nextAggregate(singletonState, message)
        singletonState = nextState
        setCurrentState(nextState)
    }, [setCurrentState])

    useEffect(() => {
        const onOpen = () => {
            client!.subscribe(`${sessionId}/events`, 0, onEvent)
        }
        if (client) {
            if (!client.connected) {
                client.on('open', onOpen)
            } else {
                onOpen()
            }
            return () => {
                client.unsubscribe(`${sessionId}/events`, onEvent)
            }
        }
    }, [sessionId, client, onEvent])

    const { complete, votes, currentTicket: displayTicket } = currentState

    if (!name) {
        return <div>
            Enter your name<br />
            <br />
            <input value={currentName} onChange={(e) => {
                setCurrentName(e.currentTarget.value)
                localStorage.setItem('name', e.currentTarget.value)
            }} /><br />
            <button onClick={() => {
                setName(currentName)
            }}>Set</button>
        </div>
    }

    return <div><h2>{match.params.sessionId} / <button onClick={() => {
        // eslint-disable-next-line no-restricted-globals
        const clear = confirm('Clear name?')
        if (clear) {
            localStorage.removeItem('name')
            setName(undefined)
        }
    }}>{name}</button> / {displayTicket || <i style={{
        opacity: 0.5
    }}>ABC-123</i>}</h2>
        {complete ? <div>
            <input disabled={!complete} placeholder='Enter ticket (ABC-123)' onChange={(e) => {
                setCurrentTicket(e.currentTarget.value)
            }} value={currentTicket} /><br /><button disabled={!complete} onClick={() => {
                if (currentTicket in votes) {
                    alert('This ticket has already been pointed! Try a different name.')
                } else {
                    client?.publish(`${sessionId}/events`, JSON.stringify({
                        event: 'ticket',
                        value: currentTicket,
                        name
                    }))
                }
            }}>Set Ticket</button>
        </div> : <div>
                <input disabled={complete} placeholder="Enter vote (1, 2, or 3)" value={currentVote} onChange={(e) => {
                    setCurrentVote(e.currentTarget.value)
                }} /><br /><button disabled={complete} onClick={() => {
                    client?.publish(`${sessionId}/events`, JSON.stringify({
                        event: 'vote',
                        value: parseInt(currentVote),
                        name
                    }))
                    setCurrentVote('')
                }}>
                    Submit Vote
        </button> <button onClick={() => {
                    client?.publish(`${sessionId}/events`, JSON.stringify({
                        event: 'complete',
                        value: currentTicket,
                        name
                    }))
                }} disabled={complete}>Complete Voting</button>
            </div>}
        <div>
            {Object.keys(votes).reverse().map((ticket) => {
                const hideVotes = displayTicket === ticket && !complete
                return <div key={ticket}><h4>{ticket}</h4><div style={{
                    minHeight: 100,
                    padding: 10,
                    border: '1px solid #CCC',
                    margin: 5,
                    borderRadius: 10
                }}>{Object.keys(votes[ticket]).map((name) => <div key={name} style={{
                    marginLeft: 20,
                    marginRight: 20,
                    marginTop: 20,
                    textAlign: 'center',
                    display: 'inline-block'
                }}>{name}<br /><b>{hideVotes ? 'x' : votes[ticket][name] }</b></div>)}</div></div>
            })}
        </div>
        <p style={{
            fontSize: 15
        }}>Events processed {currentState.count}</p>
    </div>
}