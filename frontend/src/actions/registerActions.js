export const SET_REGISTER_SUCCESS = 'SET_REGISTER_STATUS_SUCCESS';
export const SET_REGISTER_FAILURE = 'SET_REGISTER_STATUS_FAILURE';
export const SET_REGISTER = 'SET_REGISTER';


export const setRegisterSuccess = (registerStatus) => ({
    type: SET_REGISTER_SUCCESS,
    payload: registerStatus
});

export const setRegisterFailure = () => ({
    type: SET_REGISTER_FAILURE
});

export const setRegister = () => ({
    type: SET_REGISTER
});

export function registerUser(email, password, key, secret) {
    return async dispatch => {
        dispatch(setRegister());
        try {
            const request = {email, password, key, secret};
            const headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              };
            
            const response = await fetch('http://localhost:8000/user/registerUser', {method: 'POST', body: JSON.stringify(request), headers});
            const data = await response.json();

            if (data.status === 200 || data.status === 201 ) {
                dispatch(setRegisterSuccess({user: data.userID }));
                
            } else dispatch(setRegisterFailure());

        } catch (error) {
            dispatch(setRegisterFailure());

        };

    };
};