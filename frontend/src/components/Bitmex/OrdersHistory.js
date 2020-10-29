import React from "react";
import { connect } from "react-redux";
import { fetchOrders } from "../../actions/ordersActions";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";
import Table from "react-bootstrap/Table";

/*
{ tipos de orden
  Limit
  Market
  Best
  Fixed Order (Limit, Market, Best) == ReduceOnly

  Trail Stop: (Pegged Order Bitmex)

  Custom Stop: Pending Order

  * Type: Normal, Pending 
  * Exec: Limit, Market, Best
  * Price: Price
  * variancePercent: Porcentaje de varianza para ordenes con Exec = Best
  * Side: Buy o Sell
  * Qty: amount
  * triggerType: Custom / Tracked
  * triggerPrice: Trigger Price para pendingOrders
  * marketPercent: Porcentaje para ejecucion de Market Order con Price = Best
  * CustomPrice: Nuevo precio para Pending Orders
  * CustomPercent: Nuevo precio para Pending Orders
  * Status: Order Status // Waiting, New, Filled, Cancelled
  * clOrdID: ID de Orden en Bitmex
  * OrderToCancel: ID de orden a cancelar al momento de que esta se cree
  * 
  * 
  * 
  * 
  * 
  API RealTime Bitmex >> 
    Cuando sea que el precio alcance TriggerPrice se dispara candle.low < = triggerPrice <= candle.high >>
                            status != Filled && exec = Best

                              .closed = true;
                              if .close === true && .close < [indicator]



  * 
  * 
}*/

const headers = {
  clOrdID: "OrderID",
  symbol: "Symbol",
  status: "Status",
  tag: "Type",
  exec: "Execution",
  orderQty: "Order Quantity",
  price: "Price",
  variancePercent: "Variance for Best",
  marketPercent: "Market for Best",
  triggerPrice: "Trigger",
  OrderToCancel: "Order to Cancel",
};

class OrdersHistory extends React.Component {
  componentDidMount() {
    if (this.props.logged)
      this.props.dispatch(fetchOrders(this.props.user.uid));
  }

  getHeader() {
    return (
      <thead>
        <tr>
          {Object.keys(headers).map((key) => {
            return <th key={key}>{headers[key]}</th>;
          })}
        </tr>
      </thead>
    );
  }

  getBody() {
    return (
      <tbody>
        {this.props.orders.map((order, i) => {
          return (
            <tr key={i}>
              {Object.keys(headers).map((key, i) => {
                return <td key={i}>{order[key]}</td>;
              })}
            </tr>
          );
        })}
      </tbody>
    );
  }

  render() {
    if (this.props.loading)
      return (
        <Spinner animation="border" role="status">
          <span className="sr-only">Loading...</span>
        </Spinner>
      );
    if (this.props.hasErrors || !this.props.orders)
      return <Alert variant="danger">Unable to display orders.</Alert>;

    if (!this.props.logged)
      return <Alert variant="info">Please login to see your orders</Alert>;

    return (
      <Table striped bordered hover responsive>
        {this.getHeader()}
        {this.getBody()}
      </Table>
    );
  }
}

const mapStateToProps = (state) => ({
  loading: state.orders.loading,
  orders: state.orders.orders,
  hasErrors: state.orders.hasErrors,
  logged: state.login.logged,
  user: state.login.user,
});

export default connect(mapStateToProps)(OrdersHistory);
