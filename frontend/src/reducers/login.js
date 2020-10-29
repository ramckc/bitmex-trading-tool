import * as actions from '../actions/loginActions';

export const initialState = {
    logged: false,
    user: null,
    loading: false,
    hasErrors: false
};

export default function loginReducer(state = initialState, action) {
    switch (action.type) {
        case actions.GET_LOGIN_STATUS:
            return { ...state, loading: true };
        case actions.GET_LOGIN_STATUS_SUCCESS:
            return {
                ...state,
                logged: action.payload.logged,
                user: action.payload.user,
                loading: false,
                hasErrors: false
            };
        case actions.GET_LOGIN_STATUS_FAILURE:
            return { ...state, loading: false, hasErrors: true };
        case actions.SET_LOGIN_STATUS:
            return { ...state, loading: true };
        case actions.SET_LOGIN_STATUS_SUCCESS:
            return {
                logged: action.payload.logged,
                user: action.payload.user,
                loading: false,
                hasErrors: false
            };
        case actions.SET_LOGIN_STATUS_FAILURE:
            return { ...state, loading: false, hasErrors: true };
        case actions.SET_SIGNOUT:
            return { ...state, logged: false, user: null };
        default:
            return state;
    }
}
