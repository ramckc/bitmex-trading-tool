import React from "react";
import { Tab, Tabs, Form, Button } from "react-bootstrap";
import { changeLeverage } from "../../actions/ordersActions";
import NormalOrders from "./innerTabs/normalOrders";
import OrderManager from "./innerTabs/orderManager";
import PendingOrders from "./innerTabs/PendingOrders";
import { connect } from "react-redux";
import { subscribe } from "../../utils/realtimeConnector";

class OrderBox extends React.Component {
  constructor() {
    super();
    this.state = {
      btcBalance: 0,
      actualPrice: 9000,
      balanceAtMargin: 0,
      availableBalance: 0,
      isIsolated: false,
      leverage: 1,
      levBalance: 0,
      newLev: 0
    };
  }

  componentDidMount() {
    subscribe("MARGIN", (data) => {
      const margin = JSON.parse(data)[0];
      if (margin) {
        this.setState({
          btcBalance: margin.walletBalance / 100000000,
          availableBalance: margin.availableMargin / 100000000,
          balancaAtMargin: margin.maintmargin / 100000000,
          levBalance: this.state.availableBalance * this.state.leverage,
        });
      }
    });
    /*suscribe("CANDLE", (data) => {
      const transaction = JSON.parse(data);
      console.log('transaction', transaction);
      const price = parseFloat(transaction.price);
      this.setState({ actualPrice: price });
    });*/
  }

  componentDidUpdate(prevProps) {
    if (this.props.position) {
      if (this.props.position.leverage !== prevProps.position.leverage) {
        this.setState({
          levBalance: this.state.availableBalance * this.props.position.leverage,
          leverage: this.props.position.leverage,
        });

        if(this.props.position.leverage !== 100) {
          this.setState({isIsolated: true})
        };
      }
    }
  }

  changeLev(event) {
    event.preventDefault();
    const newLev = this.state.newLev;
    const isIsolated = this.state.isIsolated;
    const user = this.props.user;
    let userID;

    if (user) userID = user.uid;

    if (newLev !== this.state.leverage) {
      const levInfo = { newLev, isIsolated, userID };
      const response = this.props.dispatch(changeLeverage(levInfo));
      //if (response.status === 200) this.setState({leverage: newLev, isIsolated: true});
    }
  }

  inputChange(event) {
        const value = event.target.value;
        this.setState(
            {
                ...this.state,
                [event.target.name]: value
            });
    }

  render() {
    return (
      <div>
        <center>
          <h2 className="text-muted">OrderBox</h2>
          <Form
            className="justify-content-center"
            onSubmit={this.changeLev.bind(this)}
          >
            <Form.Group controlId="formBalance">
              <Form.Label>
                Wallet Balance: {this.state.btcBalance.toFixed(4)} (
                {(this.state.btcBalance * this.state.actualPrice).toFixed(2)} $)
                <br />
                Available Balance: {this.state.availableBalance.toFixed(4)} (
                {(this.state.availableBalance * this.state.actualPrice).toFixed(
                  2
                )}{" "}
                $)
                <br />
                Leveraged Balance: {this.state.levBalance.toFixed(4)} (
                {(this.state.levBalance * this.state.actualPrice).toFixed(2)} $)
              </Form.Label>
            </Form.Group>

            <Form.Group controlId="formLeverage">
              <Form.Label>Leverage: {this.state.leverage}x</Form.Label>
              <Form.Control
                className="w-25 ml-1"
                type="number"
                name="newLev"
                required={true}
                placeholder="lev"
                min="1"
                max="100"
                required="true"
                onChange={this.inputChange.bind(this)}
              />
            </Form.Group>

            <Button
              onClick={this.changeLev.bind(this)}
              type="submit"
              name="updateButtom"
              variant="success"
            >
              Update Lev
            </Button>
          </Form>
          <Tabs
            defaultActiveKey="normal"
            id="orderType"
            className="justify-content-center"
          >
            <Tab eventKey="normal" title="Normal">
              <NormalOrders {...this.state} />
            </Tab>

            <Tab eventKey="manager" title="Manager">
              <OrderManager {...this.state} />
            </Tab>

            <Tab eventKey="pending" title="Pending">
              <PendingOrders {...this.state} />
            </Tab>
          </Tabs>
        </center>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  interval: state.candles.interval,
  user: state.login.user,
});

export default connect(mapStateToProps)(OrderBox);
