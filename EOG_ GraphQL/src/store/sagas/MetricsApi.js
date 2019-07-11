import { takeEvery, call, put, cancel } from 'redux-saga/effects'
import * as actions from '../actions'
import api from '../api'

function* fetchMetrics(action) {
    const { data, error } = yield call(api.fetchMetrics)
    if (error) {
        yield put({ type: actions.API_ERROR, error: error.errors[0].message })
        yield cancel()
    }
    yield put({ type: actions.METRICS_RECEIVED, metrics: data.getMetrics })
}

function* fetchPastData(action) {
    const { data } = yield call(api.fetchPastData, action.metricName)
    const newData = data.getMeasurements
    let metricsData = {}
    newData.map(item => {
        const { metric, at, value } = item
        metricsData = {
            ...metricsData,
            [at]: {
                ...metricsData[at],
                [metric]: value,
                at: `${new Date(at).getHours() % 12 || 12}-${new Date(
                    at
                ).getMinutes()}`,
            },
        }
        return null
    })
    const graphData = Object.keys(metricsData).map(key => metricsData[key])
    yield put({ type: actions.PAST_METRICS_DATA_RECEIVED, graphData })
}

function* watchApiCalls() {
    yield takeEvery(actions.FETCH_METRICS, fetchMetrics)
    // yield takeEvery(actions.FETCH_METRICS_DATA, subscribeMetricsData);
    yield takeEvery(actions.FETCH_PAST_METRICS_DATA, fetchPastData)
}

export default [watchApiCalls]
