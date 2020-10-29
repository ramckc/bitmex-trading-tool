import React from "react";
import { connect } from "react-redux";
import { subscribe } from "../../utils/realtimeConnector";
import { Form, Table, Spinner, Alert, Button } from "react-bootstrap";
import { cancelOrder } from "../../actions/ordersActions";

const headers = {
  orderID: "OrderID",
  symbol: "Symbol",
  ordStatus: "Status",
  ordType: "Type",
  side: "Side",
  orderQty: "Order Quantity",
  price: "Price",
  select: "Select",
};

///SYMBOL, ORDERQTY, Order Price, Filled, Remaining, Order Value, Fill Price, Status = New/Partially Filled

class ActiveOrders extends React.Component {
  constructor() {
    super();

    this.state = {
      orders: [],
      ordersToCancel: [],
    };
  }
  componentDidMount() {
    subscribe("ORDER", (data) => {
      this.setState({ orders: JSON.parse(data) });
    });
  }

  handleCancelList(e) {
    let ordersToCancel = this.state.ordersToCancel.slice();
    if (ordersToCancel.includes(e.target.value))
      ordersToCancel = ordersToCancel.filter(
        (order) => order !== e.target.value
      );
    else ordersToCancel.push(e.target.value);

    this.setState({ ordersToCancel });
  }

  handleCancel(e) {
    this.state.ordersToCancel.map((order) => {
      this.props.dispatch(
        cancelOrder({ orderID: order, userID: this.props.user.uid })
      );
    });
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
        {this.state.orders.map((order, i) => {
          return (
            <tr key={i}>
              {Object.keys(headers).map((key, i) => {
                if (key === "select" && order["ordStatus"] !== "Canceled")
                  return (
                    <td key={i}>
                      <Form.Check
                        type="checkbox"
                        value={`${order["orderID"]}`}
                        onChange={this.handleCancelList.bind(this)}
                      />
                    </td>
                  );
                else return <td key={i}>{order[key]}</td>;
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
    if (this.props.hasErrors || !this.state.orders)
      return <Alert variant="danger">Unable to display orders.</Alert>;

    if (!this.props.logged)
      return <Alert variant="info">Please login to see your orders</Alert>;

    return (
      <div>
        <p>
          Actions:{" "}
          <Button variant="danger" onClick={this.handleCancel.bind(this)}>
            Cancel
          </Button>
        </p>
        <Table striped bordered hover responsive>
          {this.getHeader()}
          {this.getBody()}
        </Table>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  loading: state.orders.loading,
  hasErrors: state.orders.hasErrors,
  logged: state.login.logged,
  user: state.login.user,
});

export default connect(mapStateToProps)(ActiveOrders);
