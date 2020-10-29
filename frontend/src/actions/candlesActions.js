export const GET_CANDLES = "GET_CANDLES";
export const GET_CANDLES_SUCCESS = "GET_CANDLES_SUCCESS";
export const GET_CANDLES_FAILURE = "GET_CANDLES_FAILURE";
export const SET_CANDLES_INTERVAL = "SET_CANDLES_INTERVAL";
export const ADD_INDICATOR = "ADD_INDICATOR";
export const SET_INDICATOR = "SET_INDICATOR";
export const getCandles = () => ({
  type: GET_CANDLES,
});

export const getCandlesSuccess = (candles) => ({
  type: GET_CANDLES_SUCCESS,
  payload: candles,
});

export const getCandlesFailure = () => ({
  type: GET_CANDLES_FAILURE,
});

export const setCandlesInterval = (interval) => ({
  type: SET_CANDLES_INTERVAL,
  payload: interval,
});

export const addIndicator = (indicator) => ({
  type: ADD_INDICATOR,
  payload: indicator,
});

export const setIndicator = (payload) => ({
  type: SET_INDICATOR,
  payload,
});

export function fetchCandles(interval, count) {
  return async (dispatch) => {
    dispatch(getCandles());
    try {
      const getMarketChartUrl = `http://localhost:8000/bitmex/getCandles?interval=${interval}&count=${count}`;
      const chartResponse = await fetch(getMarketChartUrl);
      const candles = await chartResponse.json();
      candles.map((c) => (c.date = new Date(c.timestamp)));
      candles.sort((c1, c2) => {
        return c1.date.getTime() - c2.date.getTime();
      });
      dispatch(getCandlesSuccess(candles));
    } catch (error) {
      console.log(error);
      dispatch(getCandlesFailure());
    }
  };
}
