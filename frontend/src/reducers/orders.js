import * as actions from '../actions/ordersActions';

export const initialState = {
    orders: [],
    loading: false,
    hasErrors: false,
    orderBoxErrors: false,
};

export default function ordersReducer(state = initialState, action) {
    switch (action.type) {
        case actions.GET_ORDERS:
            return { ...state, loading: true };
        case actions.GET_ORDERS_SUCCESS:
            return { orders: action.payload, loading: false, hasErrors: false, orderBoxErrors: false };
        case actions.CREATE_ORDER_FAILURE:
            return { ...state, loading: false, orderBoxErrors: true }
        case actions.GET_ORDERS_FAILURE:
            return { ...state, loading: false, hasErrors: true };
        case actions.RESET_ORDER_ERRORS:
            return { ...state, orderBoxErrors: false, hasErrors: false };
        case actions.CREATE_ORDER_SUCCESS:
            const orders = state.orders;
            orders.push(action.payload);
            return { orders, loding: false, hasErrors: false, orderBoxErrors: false };
        case actions.CHANGE_LEVERAGE:
            return { ...state, loading: true };
        case actions.CHANGE_LEVERAGE_FAILURE:
            return { ...state, loading: false, hasErrors: true };
        case actions.CHANGE_LEVERAGE_SUCCESS:
            return { ...state, loading: false, hasErrors: false };
        case actions.CANCEL_ORDER:
            return { ...state, loading: true };
        case actions.CANCEL_ORDER_FAILURE:
            return { ...state, loading: false, hasErrors: true };
        case actions.CANCEL_ORDER_SUCCESS:
            return { ...state, loading: false, hasErrors: false };
        default:
            return state;
    }
}
