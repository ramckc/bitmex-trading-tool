import React from "react";
import { connect } from "react-redux";
import OrdersHistory from "./Bitmex/OrdersHistory";
import CandlesChart from "./Bitmex/CandlesChart";
import Jumbotron from "react-bootstrap/Jumbotron";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import { signOut } from "../actions/loginActions";
import OrderBox from "./Bitmex/OrderBox";
import ChartSettings from "./Bitmex/ChartSettings";
import OpenPositions from "./Bitmex/OpenPositions";
import { Tabs, Tab } from "react-bootstrap/";
import { register, subscribe } from "../utils/realtimeConnector";
import ActiveOrders from "./Bitmex/ActiveOrders";

class Main extends React.Component {
  constructor() {
    super();
    this.state = {
      position: {},
    };
  }
  componentDidMount() {
    register(this.props.user);

    subscribe("POSITION", (data) => {
      if (!data) return;
      const parsedPosition = JSON.parse(data);
      parsedPosition.realisedPnl = (parsedPosition.realisedPnl / 1000000000).toFixed(4);
      parsedPosition.unrealisedPnl = (parsedPosition.unrealisedPnl / 100000000).toFixed(4);
      parsedPosition.maintMargin = (parsedPosition.maintMargin / 100000000).toFixed(4);
      parsedPosition.unrealisedRoePcnt = (parsedPosition.unrealisedRoePcnt * 100);
      const position = {
        ...parsedPosition,
        side: parsedPosition.currentQty < 0 ? "Sell" : "Buy",
      };

      this.setState({ position });
    });
  }

  render() {
    return (
      <div>
        <Jumbotron fluid>
          <h1>Cryptools.trade v0.1</h1>
          <Button
            variant="outline-danger"
            onClick={() => this.props.dispatch(signOut())}
          >
            Log out
          </Button>
        </Jumbotron>
        <Container fluid>
          <Row>
            <Col>
              <Row>
                <Col xs={15} md={9}>
                  <CandlesChart {...this.state} />
                  <center>
                    <div>
                      <Tabs
                        defaultActiveKey="activeOrders"
                        id="dashboardTabs"
                        className="justify-content-center"
                      >
                        <Tab eventKey="openPositions" title="Open Positions">
                          <OpenPositions {...this.state} />
                        </Tab>
                        <Tab eventKey="activeOrders" title="Active Orders">
                          <ActiveOrders />
                        </Tab>
                        <Tab eventKey="orderHistory" title="Orders History">
                          <OrdersHistory />
                        </Tab>
                      </Tabs>
                    </div>
                  </center>
                </Col>
                <Col xs={3} md={3}>
                  <Row>
                    <center>
                      <OrderBox {...this.state} />
                      <ChartSettings />
                    </center>
                  </Row>
                  <Row>

                  </Row>
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.login.user,
});

export default connect(mapStateToProps)(Main);
