import firebase from "../utils/firebase";

export const GET_ORDERS = "GET_ORDERS";
export const GET_ORDERS_SUCCESS = "GET_ORDERS_SUCCESS";
export const GET_ORDERS_FAILURE = "GET_ORDERS_FAILURE";
export const CREATE_ORDER = "CREATE_ORDER";
export const CANCEL_ORDER = "CANCEL_ORDER";
export const CANCEL_ORDER_SUCCESS = "CANCEL_ORDER_SUCCESS";
export const CANCEL_ORDER_FAILURE = "CANCEL_ORDER_FAILURE";
export const CREATE_ORDER_SUCCESS = "CREATE_ORDER_SUCCESS";
export const CREATE_ORDER_FAILURE = "CREATE_ORDER_FAILURE";
export const CHANGE_LEVERAGE = "CHANGE_LEVERAGE";
export const CHANGE_LEVERAGE_SUCCESS = "CHANGE_LEVERAGE_SUCCESS";
export const CHANGE_LEVERAGE_FAILURE = "CHANGE_LEVERAGE_FAILURE";
export const RESET_ORDER_ERRORS = 'RESET_ORDER_ERRORS';

export const cancelOrder = (orderInfo) => {
  return async (dispatch) => {
    const request = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderInfo),
    };
    try {
      const response = await fetch(
        "http://localhost:8000/bitmex/cancelOrder",
        request
      );
      const data = await response.json();
      dispatch(cancelOrderSuccess());
      return { status: 200 };
    } catch (error) {
      dispatch(cancelOrderFailure());
    }
  };
};

export const cancelOrderSuccess = () => ({
  type: CANCEL_ORDER_SUCCESS,
});

export const cancelOrderFailure = () => ({
  type: CANCEL_ORDER_FAILURE,
});

export const changeLeverageFailure = () => ({
  type: CHANGE_LEVERAGE_FAILURE,
});

export const changeLeverageSuccess = () => ({
  type: CHANGE_LEVERAGE_SUCCESS,
});

export const changeLeverage = (levInfo) => {
  return async (dispatch) => {
    const request = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(levInfo),
    };

    try {
      const response = await fetch(
        "http://localhost:8000/bitmex/leverage",
        request
      );
      const data = await response.json();
      dispatch(changeLeverageSuccess());
      return { status: 200 };
    } catch (error) {
      dispatch(changeLeverageFailure());
    }
  };
};

export const createOrder = (order, managed) => {
  return async (dispatch) => {
    const request = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(order),
    };

    if (managed) {
      // Managed Orders
      try {
        const response = await fetch(
          "http://localhost:8000/bitmex/managed",
          request
        );
        const data = await response.json();

        dispatch(createOrderSuccess(data));
      } catch (error) {
        dispatch(createOrderFailure());
      }
    } else {
      //Normal Orders

      try {
        const response = await fetch(
          "http://localhost:8000/bitmex/add",
          request
        );
        const data = await response.json();

        dispatch(createOrderSuccess(data));
      } catch (error) {
        dispatch(createOrderFailure());
      }
    }
  };
};

export const createOrderSuccess = (orderCreated) => ({
  type: CREATE_ORDER_SUCCESS,
  payload: orderCreated,
});

export const createOrderFailure = () => ({
  type: CREATE_ORDER_FAILURE,
});

export const resetOrderErrors = () => ({
  type: RESET_ORDER_ERRORS
})

export const getOrders = () => ({
  type: GET_ORDERS,
});

export const getOrdersSuccess = (orders) => ({
  type: GET_ORDERS_SUCCESS,
  payload: orders,
});

export const getOrdersFailure = () => ({
  type: GET_ORDERS_FAILURE,
});

export function fetchOrders(uid) {
  return async (dispatch) => {
    dispatch(getOrders());

    try {
      const ordersRef = firebase.database().ref(`Users/${uid}/orders`);
      ordersRef.on("value", (snapshot) => {
        const data = snapshot ? snapshot.val() : null;
        const orders = (data ? Object.values(snapshot.val()) : []).filter(
          (o) => o.status === "Placed"
        );
        dispatch(getOrdersSuccess(orders));
      });
    } catch (error) {
      dispatch(getOrdersFailure());
    }
  };
}
