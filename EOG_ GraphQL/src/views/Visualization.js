import React from 'react'
import {
    Card,
    CardHeader,
    CardContent,
    Typography,
    Grid,
} from '@material-ui/core'
import { connect } from 'react-redux'
import * as actions from '../store/actions'
import { useEffectOnce } from 'react-use'
import Select from 'react-select'
import makeAnimated from 'react-select/animated'
import { LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts'
import api from '../store/api'

const animatedComponents = makeAnimated()

const Visualization = props => {
    const { onLoad, metrics, currentValue, subscribeUpdates } = props
    const [selected, setSelected] = React.useState([])
    useEffectOnce(() => {
        onLoad()
        // ['oilTemp', 'tubingPressure', 'casingPressure', 'flareTemp', 'waterTemp', 'injValveOpen'].map(metricName => {
        //     // loadPastData(metricName);
        //     return null;
        // });
        subscribeUpdates()
    })
    const options = metrics.map(m => ({ label: m, value: m }))
    const data = props.graphData
    return (
        <Card>
            <CardHeader title="Plot" subheader="Choose from Input" />
            <CardContent style={{ minHeight: 500 }}>
                <Grid container>
                    {selected.map((s, key) => (
                        <Grid key={key} item xs={2}>
                            <Card>
                                <CardHeader title={s} />
                                <CardContent>
                                    <Typography variant="h3">
                                        {currentValue[s]}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                <Select
                    options={options}
                    components={animatedComponents}
                    isMulti
                    onChange={event => {
                        setSelected(event ? event.map(item => item.value) : [])
                    }}
                />
                <LineChart
                    width={800}
                    height={500}
                    data={data}
                    margin={{ top: 30, right: 30, bottom: 5, left: 50 }}
                >
                    {selected.indexOf('oilTemp') > -1 && (
                        <Line
                            type="monotone"
                            dot={false}
                            activeDot={false}
                            yAxisId={2}
                            dataKey="oilTemp"
                            stroke="#FF0000"
                        />
                    )}
                    {selected.indexOf('injValveOpen') > -1 && (
                        <Line
                            type="monotone"
                            dot={false}
                            activeDot={false}
                            yAxisId={0}
                            dataKey="injValveOpen"
                            stroke="#1100FF"
                        />
                    )}
                    {selected.indexOf('tubingPressure') > -1 && (
                        <Line
                            type="monotone"
                            dot={false}
                            activeDot={false}
                            yAxisId={1}
                            dataKey="tubingPressure"
                            stroke="#00770C"
                        />
                    )}
                    {selected.indexOf('casingPressure') > -1 && (
                        <Line
                            type="monotone"
                            dot={false}
                            activeDot={false}
                            yAxisId={1}
                            dataKey="casingPressure"
                            stroke="#B900AD"
                        />
                    )}
                    {selected.indexOf('flareTemp') > -1 && (
                        <Line
                            type="monotone"
                            dot={false}
                            activeDot={false}
                            yAxisId={2}
                            dataKey="flareTemp"
                            stroke="#C7A600"
                        />
                    )}
                    {selected.indexOf('waterTemp') > -1 && (
                        <Line
                            type="monotone"
                            dot={false}
                            activeDot={false}
                            yAxisId={2}
                            dataKey="waterTemp"
                            stroke="#3C392E"
                        />
                    )}
                    <XAxis dataKey="at" tickSize={10} />
                    <YAxis
                        yAxisId={0}
                        unit="%"
                        orientation="left"
                        stroke="#88f4d8"
                    />
                    <YAxis
                        yAxisId={1}
                        unit="PSI"
                        orientation="left"
                        stroke="#82ca9d"
                    />
                    <YAxis
                        yAxisId={2}
                        unit="F"
                        orientation="left"
                        stroke="#82ca9d"
                    />

                    <Tooltip />
                </LineChart>
            </CardContent>
        </Card>
    )
}

const mapDispatch = dispatch => ({
    onLoad: () => {
        dispatch({
            type: actions.FETCH_METRICS,
        })
    },
    subscribeUpdates: () => {
        api.subscribeMetricsData().then(sub => {
            sub.subscribe(({ data }) => {
                dispatch({
                    type: actions.METRICS_DATA_RECEIVED,
                    metrics: data.newMeasurement,
                })
            })
        })
    },
    loadPastData: metricName => {
        dispatch({
            type: actions.FETCH_PAST_METRICS_DATA,
            metricName,
        })
    },
})

const mapState = state => ({
    metrics: state.metrics.metrics,
    graphData: state.metrics.graphData,
    currentValue: state.metrics.currentValue,
})

export default connect(
    mapState,
    mapDispatch
)(Visualization)
