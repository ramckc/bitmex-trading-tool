import * as actions from '../actions/registerActions';

export const initialState = {
    logged: false,
    user: null,
    loading: false,
    hasErrors: false
};

export default function registerReducer(state = initialState, action) {
    switch (action.type) {
        case actions.SET_REGISTER_SUCCESS:
            return { 
                ...state,
                hasErrors: false,
                loading: false,
                user: action.payload.user
            };
        case actions.SET_REGISTER_FAILURE:
            return {
                ...state,
                loading: false,
                hasErrors: true
            };
        case actions.SET_REGISTER:
            return { ...state, 
                loading: true
            };
        default:
            return state;
    };
};
