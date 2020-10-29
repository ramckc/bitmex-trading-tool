import firebase from '../utils/firebase';

export const GET_LOGIN_STATUS = 'GET_LOGIN_STATUS';
export const GET_LOGIN_STATUS_SUCCESS = 'GET_LOGIN_STATUS_SUCCESS';
export const GET_LOGIN_STATUS_FAILURE = 'GET_LOGIN_STATUS_FAILURE';
export const SET_LOGIN_STATUS = 'SET_LOGIN_STATUS';
export const SET_LOGIN_STATUS_SUCCESS = 'SET_LOGIN_STATUS_SUCCESS';
export const SET_LOGIN_STATUS_FAILURE = 'SET_LOGIN_STATUS_FAILURE';
export const SET_SIGNOUT = 'SET_SIGNOUT';

export const getLoginStatus = () => ({
    type: GET_LOGIN_STATUS,
});

export const getLoginStatusSuccess = loginStatus => ({
    type: GET_LOGIN_STATUS_SUCCESS,
    payload: loginStatus
});

export const getLoginStatusFailure = () => ({
    type: GET_LOGIN_STATUS_FAILURE,
});

export const setLoginStatus = () => ({
    type: SET_LOGIN_STATUS,
});

export const setLoginStatusSuccess = (loginStatus) => ({
    type: SET_LOGIN_STATUS_SUCCESS,
    payload: loginStatus
});

export const setLoginStatusFailure = () => ({
    type: SET_LOGIN_STATUS_FAILURE,
});

export const setSignOut = () => ({
    type: SET_SIGNOUT,
});

export function fetchLoginStatus() {
    return async dispatch => {
        dispatch(getLoginStatus());
        try {
            const response = await window.localStorage.getItem('user_data');
            const user = response ? JSON.parse(response) : null;
            if (user) dispatch(getLoginStatusSuccess({ logged: true, user }));
            else dispatch(getLoginStatusSuccess({ logged: false, user: null }));
        } catch (error) {
            console.log(error);
            dispatch(getLoginStatusFailure());
        }
    };
}

export function signIn(email, password) {
    return async dispatch => {
        dispatch(setLoginStatus());

        try {
            firebase.auth().signInWithEmailAndPassword(email, password).catch((error) => {
                console.log(error);
            });
            firebase.auth().onAuthStateChanged(async user => {
                if (user) {
                    // User is signed in.
                    await window.localStorage.setItem('user_data', JSON.stringify(user));
                    dispatch(setLoginStatusSuccess({ logged: true, user }));
                } else {
                    // User is signed out.
                    await window.localStorage.setItem('user_data', '');
                    dispatch(setLoginStatusSuccess({ logged: false, user: null }));
                }
            });
        } catch (error) {
            console.log(error);
            dispatch(setLoginStatusFailure());
        }
    };
}

export function signOut() {
    return async dispatch => {
        try {
            await firebase.auth().signOut();
            await window.localStorage.setItem('user_data', '');
            dispatch(setSignOut());
        } catch(error) {
            console.log(error);
        }
    };
}
