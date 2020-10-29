import React from 'react';
import Button from 'react-bootstrap/Button';
import { Tabs, Tab } from 'react-bootstrap/';
import { createOrder, resetOrderErrors } from '../../../actions/ordersActions';
import { connect } from 'react-redux';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';

class NormalOrders extends React.Component {

    constructor() {
        super();
        this.state = {
            exec: 'Limit',
            side: 'none',
            stop: false,
            showError: false,
            messageError: 'Error sending the order'
        };
    }

    componentDidUpdate(prevProps) {
        if (this.props.orderBoxErrors !== prevProps.orderBoxErrors) {
            this.setState({
                showError: this.props.orderBoxErrors
            });
        };
    }

    async handleSubmit(event) {
        event.preventDefault();
        const data = new FormData(event.target);
        const exec = this.state.exec;
        const side = this.state.side;
        let orderQty = data.get('orderQty');
        let triggerPrice = data.get('triggerPrice');
        if (triggerPrice === '' || triggerPrice === '0') triggerPrice = undefined;
        let orderToCancel = data.get('orderToCancel');
        let price;
        let variancePercent = data.get('variancePercent');
        let marketPercent = data.get('marketPercent');
        let tag;
        let type = 'normal';
        let reduced = false;

        if (side === 'Buy') tag = 'Long'; // Setear los tag en base al SIDE
        else if (side === 'Sell') tag = 'Short';

        if (this.state.stop === true) reduced = true; // Si es stop, sobre-escribir el tag

        if (exec === 'Limit') price = data.get('price');;
        if (exec === 'Best') {
            triggerPrice = 0;
            type = 'tracked';
        }

        const user = this.props.user;
        let userID;
        if (user) userID = user.uid;

        //[order, stopOrder, tpOrder]

        const order = {
            tag,
            type,
            exec,
            side,
            orderQty,
            price,
            variancePercent,
            marketPercent,
            triggerPrice,
            orderToCancel,
            reduced,
            userID
        };

        this.props.dispatch(createOrder(order, false));
    };

    hideError() {
        this.props.dispatch(resetOrderErrors());
        this.setState({ messageError: 'You dont have enough money' });
    };

    tabExec(key) {
        this.setState({ exec: key });
    };

    buySide(value) {
        this.setState({ side: 'Buy' });
    };

    sellSide(value) {
        this.setState({ side: 'Sell' });
    };

    reduceCheck = () => {
        this.setState(initialState => ({
            stop: !initialState.stop,
        }));

    };

    /*inputChange(event) {
        const value = event.target.value;
        this.setState(
            {
                ...this.state,
                [event.target.name]: value
            });
    }*/


    render() {
        return (
            <div><Tabs defaultActiveKey="Limit" id="uncontrolled-tab-example" className="justify-content-center" onSelect={this.tabExec.bind(this)}>
                <Tab eventKey="Limit" title="Limit">
                    <Form onSubmit={this.handleSubmit.bind(this)}>
                        <Form.Group controlId="formPrice">
                            <Form.Control step=".5" className="w-50 ml-1" type="number" name="price" placeholder="price" required={true} />
                        </Form.Group>

                        <Form.Group controlId="formOrderQty">
                            <Form.Control min="1" step="1" className="w-50 ml-1" type="number" name="orderQty" placeholder="Quantity" required={true} />
                        </Form.Group>

                        <Form.Group controlId="formTriggerPrice">
                            <Form.Control step=".5" className="w-50 ml-1" type="number" name="triggerPrice" placeholder="Trigger Price" />
                        </Form.Group>

                        <Form.Group controlId="formOrderCancel">
                            <Form.Control className="w-50 ml-1" type="number" disabled={true} name="orderToCancel" placeholder="Order to cancel" />
                        </Form.Group>

                        <Form.Group controlId="formReduceOnly">
                            <Form.Check name="reduceOnly" label="Reduce Only" checked={this.state.stop} onChange={this.reduceCheck.bind(this)} />
                        </Form.Group>

                        <Button onClick={this.buySide.bind(this)} type="submit" name="side" value="Buy" variant="success">Long</Button>
                        <Button onClick={this.sellSide.bind(this)} type="submit" name="side" value="Sell" variant="danger">Short</Button>

                    </Form>
                </Tab>



                <Tab eventKey="Market" title="Market">
                    <Form onSubmit={this.handleSubmit.bind(this)}>

                        <Form.Group controlId="formOrderQty">
                            <Form.Control min="1" step="1" className="w-50 ml-1" type="number" name="orderQty" placeholder="Quantity" required={true} />
                        </Form.Group>

                        <Form.Group controlId="formTriggerPrice">
                            <Form.Control step=".5" className="w-50 ml-1" type="number" name="triggerPrice" placeholder="Trigger Price" />
                        </Form.Group>

                        <Form.Group controlId="formOrderCancel">
                            <Form.Control className="w-50 ml-1" type="number" disabled={true} name="orderToCancel" placeholder="Order to cancel" />
                        </Form.Group>

                        <Form.Group controlId="formReduceOnly">
                            <Form.Check name="reduceOnly" label="Reduce Only" checked={this.state.stop} onChange={this.reduceCheck.bind(this)} />
                        </Form.Group>

                        <Button onClick={this.buySide.bind(this)} type="submit" name="side" value="Buy" variant="success">Long</Button>
                        <Button onClick={this.sellSide.bind(this)} type="submit" name="side" value="Sell" variant="danger">Short</Button>

                    </Form>
                </Tab>

                <Tab eventKey="Best" title="Best">
                    <Form onSubmit={this.handleSubmit.bind(this)}>

                        <Form.Group controlId="formOrderQty">
                            <Form.Control min="1" step="1" className="w-50 ml-1" type="number" name="orderQty" placeholder="Quantity" required={true} />
                        </Form.Group>

                        <Form.Group controlId="formVariancePercent">
                            <Form.Control min="0" step=".1" className="w-50 ml-1" type="number" name="variancePercent" placeholder="Variance Percent" />
                        </Form.Group>

                        <Form.Group controlId="formMarketPercent">
                            <Form.Control min="0" step=".1" className="w-50 ml-1" type="number" name="marketPercent" placeholder="Market Percent" />
                        </Form.Group>

                        <Form.Group controlId="formOrderCancel">
                            <Form.Control className="w-50 ml-1" type="number" disabled={true} name="orderToCancel" placeholder="Order to cancel" />
                        </Form.Group>

                        <Form.Group controlId="formReduceOnly">
                            <Form.Check name="reduceOnly" label="Reduce Only" checked={this.state.stop} onChange={this.reduceCheck.bind(this)} />
                        </Form.Group>

                        <Button onClick={this.buySide.bind(this)} type="submit" name="side" value="Buy" variant="success">Long</Button>
                        <Button onClick={this.sellSide.bind(this)} type="submit" name="side" value="Sell" variant="danger">Short</Button>


                    </Form>
                </Tab>

            </Tabs>
                <Alert variant="danger" show={this.state.showError} onClose={this.hideError.bind(this)} dismissible>
                    {this.state.messageError}
                </Alert>
            </div>
        );
    }
};

const mapStateToProps = state => ({
    loading: state.orders.loading,
    orders: state.orders.orders,
    hasErrors: state.orders.hasErrors,
    user: state.login.user,
    orderBoxErrors: state.orders.orderBoxErrors
});

export default connect(mapStateToProps)(NormalOrders);
