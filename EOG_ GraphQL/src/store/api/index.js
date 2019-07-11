import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'
import { split } from 'apollo-link'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'
import gql from 'graphql-tag'

// Create an http link:
const httpLink = new HttpLink({
    uri: 'https://react.eogresources.com/graphql',
})

// Create a WebSocket link:
const wsLink = new WebSocketLink({
    uri: `ws://react.eogresources.com/graphql`,
    options: {
        reconnect: true,
    },
})

// using the ability to split links, you can send data to each link
// depending on what kind of operation is being sent
const link = split(
    // split based on operation type
    ({ query }) => {
        const definition = getMainDefinition(query)
        return (
            definition.kind === 'OperationDefinition' &&
            definition.operation === 'subscription'
        )
    },
    wsLink,
    httpLink
)

const cache = new InMemoryCache()

const client = new ApolloClient({
    cache,
    link,
})

const fetchMetrics = async () => {
    const { data, ...rest } = await client.query({
        query: gql`
            {
                getMetrics
            }
        `,
    })
    return { data, ...rest }
}

const fetchPastData = async metricName => {
    console.log(metricName)
    const { data, ...rest } = await client.query({
        query: gql`
      {
        getMeasurements(
          input: {
            metricName: "${metricName}"
            after: ${new Date(new Date().getTime() - 30 * 60000).getTime()}
          }
        ) {
          at
          metric
          value
        }
      }
    `,
    })
    return { data, ...rest }
}

const subscribeMetricsData = async () => {
    const subscription = await client.subscribe({
        query: gql`
            subscription {
                newMeasurement {
                    at
                    unit
                    value
                    metric
                }
            }
        `,
    })
    return subscription
}

export default { fetchMetrics, subscribeMetricsData, fetchPastData }
