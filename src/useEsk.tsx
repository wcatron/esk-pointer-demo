import React, { useContext, useEffect, useState } from 'react'
import { Client } from 'esk-client-typescript'

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