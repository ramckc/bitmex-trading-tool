import * as actions from "../actions/candlesActions";

export const initialState = {
  candles: [],
  indicators: [],
  currentCandle: null,
  interval: "1m",
  loading: false,
  hasErrors: false,
};

export default function candlesReducer(state = initialState, action) {
  switch (action.type) {
    case actions.GET_CANDLES:
      return { ...state, loading: true };
    case actions.GET_CANDLES_SUCCESS:
      return {
        ...state,
        candles: action.payload,
        loading: false,
        hasErrors: false,
      };
    case actions.GET_CANDLES_FAILURE:
      return { ...state, loading: false, hasErrors: true };
    case actions.SET_CANDLES_INTERVAL:
      return { ...state, interval: action.payload };
    case actions.ADD_INDICATOR:
      const indicators = state.indicators.slice();
      indicators.push(action.payload);
      return { ...state, indicators };
    case actions.SET_INDICATOR:
      const { name, enabled, sourcePath, windowSize } = action.payload;
      const updatedIndicators = state.indicators.slice().map((indicator) => {
        if (indicator.name === name) {
          indicator.enabled = enabled;
          if (windowSize) indicator.windowSize = windowSize;
          if (sourcePath) indicator.sourcePath = sourcePath;
          indicator.name = `${indicator.type}-${indicator.windowSize}`;
        }
        return indicator;
      });
      return { ...state, indicators: updatedIndicators };
    default:
      return state;
  }
}
