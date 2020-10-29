import React from 'react';
import Button from 'react-bootstrap/Button';
import { createOrder } from '../../../actions/ordersActions';
import { connect } from 'react-redux';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';

class PendingOrders extends React.Component {

    constructor() {
        super();
        this.state = {
            orderCondition: 'Above',
            side: 'none',
            stop: false,
            showError: false,
            errorMessage: 'An unexpected error happened'
        };
    };

    hideError() {this.setState({showError: false})};

    handleSubmit(event) {
        event.preventDefault();
        const data = new FormData(event.target);
        const side = this.state.side;
        let orderQty = parseFloat(data.get('orderQty'));
        let triggerPrice = data.get('triggerPrice');
        let tag;
        let type = 'pending';
        let reduced = false;
        let exec = "Market";
        let orderCondition = this.state.orderCondition;
        
        console.log('qty', orderQty);
        console.log('btcBalance', this.props.btcBalance);
        console.log('leverage', this.props.leverage);
        console.log('actual', this.props.actualPrice);
        console.log('total', (this.props.btcBalance * this.props.leverage) * this.props.actualPrice);

        if(orderQty > (this.props.btcBalance * this.props.leverage) * this.props.actualPrice) {
            console.log('en el if');
            this.setState({showError: true, messageError: 'You dont have enough money'});
            return;
        };
        console.log('fuera el if');

        if ( side === 'Buy') tag = 'Long'; // Setear los tag en base al SIDE
        else if ( side === 'Sell' ) tag = 'Short';

        if ( this.state.stop === true) reduced = true; // Si es stop, sobre-escribir el tag

        const user = this.props.user;
        let userID;
        if (user) userID = user.uid; 

        //[order, stopOrder, tpOrder]

        const order = {
            tag,
            type,
            exec,
            side,
            orderCondition,
            orderQty,
            triggerPrice,
            reduced,
            userID
        };
        this.props.dispatch(createOrder(order, false));
    };

    buySide(value) {
        this.setState({ side: 'Buy'});
    };

    sellSide(value) {
        this.setState({ side: 'Sell'});
    };

    reduceCheck = () => {
        console.log(this.state.stop);
        this.setState(initialState => ({
            stop: !initialState.stop,
        }));
        
    };

    conditionChange = (event) => {
        const newCondition = event.target.value;
        this.setState({orderCondition: newCondition});
    }


    render() {

        return (
           
            <div><Form onSubmit={this.handleSubmit.bind(this)}>
                <Form.Group controlId="formConditional">
                    <Form.Control as="select" className="w-50 ml-1" name="orderCondition" onChange={this.conditionChange.bind(this)}>
                        <option>Above</option>
                        <option>Below</option>
                    </Form.Control>
                    <Form.Control as="select" className="w-50 ml-1" name="timeFrame">
                        <option>1h</option>
                        <option>4h</option>
                        <option>1D</option>
                    </Form.Control>
                     <Form.Control min="1" required={true} step=".5" className="w-50 ml-1" type="number" name="triggerPrice" placeholder="Trigger Price"/>
                </Form.Group>

                <Form.Group controlId="formQty">
                    <Form.Control min="1" step="1" className="w-50 ml-1" type="number" name="orderQty" placeholder="Quantity" required={true}/>                            
                </Form.Group>

                <Form.Group controlId="formReduceOnly">
                    <Form.Check name="reduceOnly" label="Reduce Only" checked={this.state.stop} onChange={this.reduceCheck.bind(this)} />
                </Form.Group>

                <Button onClick={this.buySide.bind(this)} type="submit" name="side" value="Buy" variant="success">Long</Button>
                <Button onClick={this.sellSide.bind(this)} type="submit" name="side" value="Sell" variant="danger">Short</Button>
                                
            </Form>
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
    user: state.login.user
});
  
export default connect(mapStateToProps)(PendingOrders);
