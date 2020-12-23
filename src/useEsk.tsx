import React, { useContext, useEffect, useRef, useState } from 'react'
import { Client, Message, Projection } from 'esk-client-typescript'

const ESKContext = React.createContext<Client | undefined>(undefined);
const ESKProvider = ESKContext.Provider

export const useEsk = () => {
    return useContext(ESKContext)
}

export const ESK: React.FC<{ url: string, children: React.ReactChild }> = ({ url, children }) => {
    const [ client, setClient ] = useState<Client | undefined>(undefined)
    useEffect(() => {
        const _client = new Client({ url })
        setClient(_client)
    }, [url])
    return <><ESKProvider value={client}>{children}</ESKProvider></>
}

export function useProjection<Params, T>(projection: Projection<Params, T>, params: Params) {
    const client = useEsk()
    const [state, setState] = useState(projection.state)

    useEffect(() => {
        const onEvent = (message: Message) => {
            console.log('onEvent', message.payload, state)
            const nextState = projection.fn(message, params, projection.state)
            projection.state = nextState
            setState(nextState)
        }
        const onOpen = () => {
            projection.topics.forEach(topic => {
                client!.subscribe(topic, 0, onEvent)
            });
        }
        if (client) {
            if (!client.connected) {
                client.on('open', onOpen)
            } else {
                onOpen()
            }
            return () => {
                projection.topics.forEach(topic => {
                    client!.unsubscribe(topic, onEvent)
                });
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [client])
    return state
}