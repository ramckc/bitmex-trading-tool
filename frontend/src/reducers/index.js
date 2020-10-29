import { combineReducers } from 'redux';

import orders from './orders';
import login from './login';
import candles from './candles';

const rootReducer = combineReducers({ orders, login, candles });

export default rootReducer;
