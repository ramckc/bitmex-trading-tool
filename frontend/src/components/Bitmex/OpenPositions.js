import React from "react";
import Table from "react-bootstrap/Table";

const headers = {
  symbol: "Symbol",
  currentQty: "Order Quantity",
  avgEntryPrice: "Avg. Price",
  maintMargin: "Margin",
  side: "Side",
  unrealisedRoePcnt: "ROE %",
  leverage: "Lev",
  breakEvenPrice: "BE Price",
  liquidationPrice: "Liq. Price",
  realisedPnl: "Realised PnL",
  unrealisedPnl: "Unrealised PnL",
};

class OpenPositions extends React.Component {
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
        <tr key="pos">
          {Object.keys(headers).map((key, i) => {
            if (this.props.position["currentQty"] > 0)
              return <td key={i}>{this.props.position[key]}</td>;
          })}
        </tr>
      </tbody>
    );
  }

  render() {
    return (
      <Table striped bordered hover responsive>
        {this.getHeader()}
        {this.getBody()}
      </Table>
    );
  }
}
export default OpenPositions;
