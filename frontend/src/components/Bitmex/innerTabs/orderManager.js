import React from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Toast from 'react-bootstrap/Toast';
import { createOrder, resetOrderErrors } from '../../../actions/ordersActions';
import { connect } from 'react-redux';
import Alert from 'react-bootstrap/Alert';

class OrderManager extends React.Component {


    constructor() {
        super();
        this.state = {
            // Orden principal
            risk: 0,
            orderQty: 0,
            btcMargin: 0,
            side: '',
            lev: 1,
            rr: 3,
            ordPrice: 0,
            slPrice: 0,
            tpPrice: 0,
            modalOM: false,
            btcInRisk: 0,
            btcTarget: 0,
            btcAtLost: 0,
            btcAtProfit: 0,
            newRisk: 0,
            newRR: 0,
            orderExec: 'Limit',
            variancePercent: 0,
            marketPercent: 0,
            // Orden STOP
            slExec: 'Market',
            stopTrigger: 0,
            stopVariance: 0,
            stopMarket: 0,
            // Order TP
            tpExec: 'Limit',
            profitTrigger: 0,
            profitVariance: 0,
            profitMarket: 0,
            showError: false,
            messageError: 'An unexpected error hapenned',
            levBalance: 0
        };

    };

    componentDidMount() {
        this.setState({levBalance: this.props.levBalance});
    }

    hideError() {this.props.dispatch(resetOrderErrors())};

    componentDidUpdate(prevProps) {
        console.log(this.props.orderBoxErrors, prevProps.orderBoxErrors);
        if (this.props.orderBoxErrors !== prevProps.orderBoxErrors) {
          this.setState({
            showError: this.props.orderBoxErrors
          });
        }
        if(this.props.levBalance !== prevProps.levBalance) {
            this.setState({
                levBalance: this.props.levBalance
            });
        }
    }

    handleSubmit(event) {
        event.preventDefault();
    };


    buySide(value) {
        const balance = parseFloat(this.props.btcBalance*this.props.actualPrice);
        const btcBalance = this.props.btcBalance;
        const price = parseFloat(this.state.ordPrice);
        const risk = parseInt(this.state.risk);
        const lev = parseFloat(this.state.lev);
        const orderQty = parseFloat(this.state.orderQty);
        const rr = parseFloat(this.state.rr);
        const btcQty = btcBalance - orderQty/price;

        let btcToLose = btcBalance * (risk/100); // Cantidad de BTC a perder.
        let btcToWin = btcBalance * ((risk/100)*rr);

        let qtyPercent = orderQty*100/balance;
        let stopPercent = (100/qtyPercent)*risk;
        let profitPercent = (100/qtyPercent)*risk*rr;

      
        let stopLossPrice = (price * (1 - stopPercent/100)).toFixed(2);
        let takeProfitPrice = (price * (1 + profitPercent/100)).toFixed(2);

        let balanceAtStop = btcBalance - btcToLose;
        let balanceAtProfit = btcBalance + btcToWin;

        //STOP LOSS Y TAKE PROFIT SELL REDUCE ONLY



        this.setState({ btcMargin: btcQty, side: 'Buy', modalOM: true, slPrice: stopLossPrice, tpPrice: takeProfitPrice, btcInRisk: btcToLose, btcAtProfit: balanceAtProfit, btcAtLost: balanceAtStop });
        //console.log(this.state.btcAtProfit, this.state.btcAtStop);
    };

    sellSide(value) {
        const balance = parseFloat(this.props.btcBalance*this.props.actualPrice);
        const btcBalance = this.props.btcBalance;
        const price = parseFloat(this.state.ordPrice);
        const risk = parseInt(this.state.risk);
        const orderQty = parseFloat(this.state.orderQty);
        const rr = parseFloat(this.state.rr);
        const btcQty = btcBalance - orderQty/price;



        let btcToLose = btcBalance * (risk/100); // Cantidad de BTC a perder.
        let btcToWin = btcBalance * ((risk/100)*rr);

        let qtyPercent = orderQty*100/balance;
        let stopPercent = (100/qtyPercent)*risk;
        let profitPercent = (100/qtyPercent)*risk*rr;

      
        let stopLossPrice = (price * (1 + stopPercent/100));
        let takeProfitPrice = (price * (1 - profitPercent/100));

        let balanceAtStop = btcBalance - btcToLose;
        let balanceAtProfit = btcBalance + btcToWin;


        this.setState({ btcTarget: btcToWin, newRR: rr, newRisk: risk, btcMargin: btcQty, side: 'Sell', modalOM: true, slPrice: stopLossPrice, tpPrice: takeProfitPrice, btcInRisk: btcToLose, btcAtProfit: balanceAtProfit, btcAtLost: balanceAtStop });
        //console.log(this.state.btcAtProfit, this.state.btcAtStop);
    };



    inputChange(event) {
        const value = event.target.value;
        this.setState(
            {
                ...this.state,
                [event.target.name]: value
            });
    };

    handleClose() {
        this.setState({modalOM: false});
    };

    finalSl(event) {
        const newPrice = parseFloat(event.target.value);
        const price = this.state.ordPrice;
        const btcBalance = this.props.btcBalance;
        const orderQty = this.state.orderQty;
        const tpPrice = this.state.tpPrice;
      
        // Calcular porcentaje de perdida hasta el SL.

        let newRisk;
        if (this.state.side === 'Sell') newRisk = ((newPrice - price) * 100)/price;
        else newRisk = ((price - newPrice) * 100)/price;

        let btcToLose = btcBalance * (newRisk/100);

        const newRR = (price - tpPrice) / (newPrice - price);

        const atStop = btcBalance - btcToLose;

        this.setState({
            newRR: newRR, 
            newRisk: newRisk,
            btcInRisk: btcToLose,
            btcAtLost: atStop,
            slPrice: newPrice
        });

        console.log(newRR, newRisk);

    };

    finalTp(event) {
        const newPrice = parseFloat(event.target.value);
        const price = parseFloat(this.state.ordPrice);
        const btcBalance = this.props.btcBalance;
        const orderQty = this.state.orderQty;
        const slPrice = this.state.slPrice;
      
        // Calcular porcentaje de ganancia hasta el TP.

        let profitPercent;
        if (this.state.side === 'Sell') profitPercent = parseFloat(((newPrice - price) * 100)/price);
        else profitPercent = parseFloat(((price - newPrice) * 100)/price);


        let btcToWin = parseFloat(btcBalance * (profitPercent/100));
        btcToWin = btcToWin * -1; // Cantidad de BTC a ganar.
        const newRR = parseFloat((newPrice - price) / (price - slPrice));
        const atProfit = btcBalance + btcToWin;

        this.setState({
            newRR: newRR,
            btcTarget: btcToWin,
            btcAtProfit: atProfit,
            tpPrice: newPrice
        });

    };

    sendOrders() {
        //Order normal
        const price = this.state.ordPrice;
        const orderQty = this.state.orderQty;
        const side = this.state.side;
        let triggerPrice;
        let orderToCancel;
        let tag;
        const exec = this.state.orderExec;
        const variancePercent = this.state.variancePercent;
        const marketPercent = this.state.marketPercent;
        // Order TP
        const tpPrice = this.state.tpPrice;
        const tpExec = this.state.tpExec;
        const profitTrigger = this.state.profitTrigger;
        const profitVariance = this.state.profitVariance;
        const profitMarket = this.state.profitMarket;
        // Order SL
        const slPrice = this.state.slPrice;
        const slExec = this.state.slExec;
        if ( slExec === 'Market') this.setState({stopTrigger: slPrice});
        const stopTrigger = this.state.stopTrigger;
        const stopVariance = this.state.stopVariance;
        const stopMarket = this.state.stopMarket;

        let counterSide;
        let counterTag;


        let type = 'normal';

        if (side === 'Buy') {
            tag = 'Long';
            counterSide = 'Sell';
            counterTag = 'Short';

        } else {
            counterSide = 'Buy';
            tag = 'Short';
            counterTag = 'Long';
        }

        if ( exec === 'Best' && triggerPrice !==undefined) type = 'tracked';

        

        const order = {
            tag,
            type,
            exec,
            side,
            orderQty,
            price,
            variancePercent,
            marketPercent,
            triggerPrice: 0,
            reduced: false
        };

        const slOrder = {
            tag: 'Stop Loss',
            type,
            exec: 'Market',
            side: counterSide,
            orderQty,
            variancePercent: stopVariance,
            marketPercent: stopMarket,
            triggerPrice: slPrice,
            reduced: true
        };

        const tpOrder = {
            tag: 'Take Profit',
            type,
            exec: 'Limit',
            side: counterSide,
            orderQty,
            price: tpPrice,
            variancePercent: profitVariance,
            marketPercent: profitMarket,
            triggerPrice: profitTrigger,
            reduced: false,
        };

        const user = this.props.user;
        let userID;
        if (user) userID = user.uid;

        const orders = {order, slOrder, tpOrder, userID};
        console.log(orders);
        this.props.dispatch(createOrder(orders, true));
        this.setState({modalOM: false});

    };

    slType(event) {


    }



    render() {

        /*Order Info:

                                    <Form.Label>Order Quantity: {this.state.orderQty}$</Form.Label><br/>
                                    <Form.Label>Order Side: {this.state.side}$</Form.Label><br/>
                                    <Form.Group>
                                        <Form.Label>Order Price: {this.state.ordPrice}$</Form.Label><br/>
                                        <Form.Control as="select" className="w-50 ml-1" name="orderExec">
                                            <option>Limit</option>
                                            <option>Market</option>
                                            <option>Best</option>
                                        </Form.Control>
                                    </Form.Group>  */

        return (

            <>
                <Modal show={this.state.modalOM} onHide={this.handleClose.bind(this)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Check your orders</Modal.Title>
                    </Modal.Header>
        
                    <Modal.Body>

                        <Row>
                            <Col>
                                <Card bg="primary" text="light">
                                    <Card.Body>
                                        <Card.Title>Order Info</Card.Title>
                                        <Card.Text>  
                                            <Form.Label>Order Quantity: {this.state.orderQty}$</Form.Label>
                                            <Form.Label>Order Side: {this.state.side}$</Form.Label>
                                            <Form.Group>
                                                <Form.Label>Order Price: {this.state.ordPrice}$</Form.Label>
                                                <Form.Control as="select" className="w-50 ml-1" name="orderExec">
                                                    <option>Limit</option>
                                                    <option>Market</option>
                                                </Form.Control>
                                            </Form.Group>  
                                        </Card.Text>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col>
                                <Card bg="secondary" text="light">
                                    <Card.Body>
                                        <Card.Title>Balance Overview</Card.Title>
                                        <Card.Text>  
                                            
                                            <Form.Label>At TP: {this.state.btcAtProfit.toFixed(8)} BTC ({(this.state.btcAtProfit*this.state.tpPrice).toFixed(2)}$) </Form.Label>
                                            <Form.Label>At SL: {this.state.btcAtLost.toFixed(8)} BTC ({(this.state.btcAtLost*this.state.slPrice).toFixed(2)}$)</Form.Label>
                                        </Card.Text>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>

                        <Row>

                            <Col>
                                <Card bg="danger" text="light">
                                    <Card.Body>
                                        <Card.Title>Risk Taking</Card.Title>
                                        <Card.Text>
                                            <Form.Label>Risk: {this.state.newRisk.toFixed(2)}% </Form.Label>
                                            <Form.Label>Suggested SL Price:</Form.Label>
                                            <Form.Group>
                                                <Form.Control step=".5" className="w-50 ml-1" type="number" name="slPrice" placeholder="SL Price" required={true} value={this.state.slPrice} onChange={this.finalSl.bind(this)}/>
                                                <Form.Control as="select" className="w-50 ml-1" name="slExec">
                                                    <option>Market</option>
                                                </Form.Control>
                                            </Form.Group>
                                        
                                        
                                            <Form.Label>Lost in BTC: {this.state.btcInRisk.toFixed(8)} </Form.Label>
                                            <Form.Label>Lost in USD: {(this.state.btcInRisk*this.state.ordPrice).toFixed(2)}$ </Form.Label>
                                        </Card.Text>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col>
                                <Card bg="success" text="light">
                                    <Card.Body>
                                        <Card.Title>Profit Target</Card.Title>
                                        <Card.Text>
                                            <Form.Label>R/R Profit Target: {(this.state.newRR).toFixed(2)} </Form.Label>
                                            <Form.Label>Suggested TP Price: </Form.Label>
                                            <Form.Group>
                                                <Form.Control step=".5" className="w-50 ml-1" type="number" name="tpPrice" placeholder="TP Price" required={true} value={this.state.tpPrice} onChange={this.finalTp.bind(this)}/>
                                                <Form.Control as="select" className="w-50 ml-1" name="tpExec">
                                                    <option>Limit</option>
                                                </Form.Control>
                                            </Form.Group>
                                            <Form.Label>Profit in BTC: {this.state.btcTarget.toFixed(8)} </Form.Label>
                                            <Form.Label>Profit in USD: {(this.state.btcTarget*this.state.ordPrice).toFixed(2)}$ </Form.Label>
                                        </Card.Text>
                                    </Card.Body>
                                </Card>
                            </Col>


                        </Row>
                  
                    </Modal.Body>
        
                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.handleClose.bind(this)}>
            Cancel
                        </Button>
                        <Button variant="success" onClick={this.sendOrders.bind(this)}>
            Confirm
                        </Button>
                    </Modal.Footer>
                </Modal>
                
                <Form className="justify-content-center" onSubmit={this.handleSubmit.bind(this)}>

                    <Form.Group controlId="formRR">
                        <Form.Label>RR</Form.Label>
                        <Form.Control className="w-25 ml-1" type="number" name="rr" placeholder="R/R" required={true} value={this.state.rr} onChange={this.inputChange.bind(this)} />                            
                    </Form.Group>

                    <Form.Group controlId="formRisk">
                        <Form.Label>Risk</Form.Label>
                        <Form.Control className="w-25 ml-1" type="number" name="risk" placeholder="Risk" required={true} onChange={this.inputChange.bind(this)} value={this.state.risk} />
                    </Form.Group>

                    <Form.Group controlId="formQty">
                        <Form.Label>Order Qty</Form.Label>
                        <Form.Control onChange={this.inputChange.bind(this)} value={this.state.orderQty} className="w-25 ml-1" type="number" name="orderQty" placeholder="Quantity"/>
                    </Form.Group>

                    <Form.Group controlId="formQty">
                        <Form.Label>Order Price</Form.Label>
                        <Form.Control onChange={this.inputChange.bind(this)} value={this.state.price} className="w-25 ml-1" type="number" name="ordPrice" placeholder="Price"/>
                    </Form.Group>

                    <Button onClick={this.buySide.bind(this)} type="submit" name="side" value="Buy" variant="success">Long</Button>
                    <Button onClick={this.sellSide.bind(this)} type="submit" name="side" value="Sell" variant="danger">Short</Button>
                                
                </Form>
                <Alert variant="danger" show={this.state.showError} onClose={this.hideError.bind(this)} dismissible>
                {this.state.messageError}   
                </Alert>

            </>
    
        );}
};

const mapStateToProps = state => ({
    loading: state.orders.loading,
    orders: state.orders.orders,
    hasErrors: state.orders.hasErrors,
    user: state.login.user,
    orderBoxErrors: state.orders.orderBoxErrors
});

export default connect(mapStateToProps)(OrderManager);