import React from 'react';
import { connect } from 'react-redux';
import { registerUser } from '../actions/registerActions';
import { Redirect } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';

class Register extends React.Component {
    handleSubmit(e) {
        e.preventDefault();
        const email = e.target.email.value;
        const password = e.target.password.value;
        const key = e.target.key.value;
        const secret = e.target.secret.value;
        if (email && password)
            this.props.dispatch(registerUser(email, password, key, secret));
    //this.props.dispatch(signIn('abc@trading.com', 'abc1234'))
    };


    registerForm() {
        return (
            <Form onSubmit={this.handleSubmit.bind(this)}>
                <Form.Group controlId="formBasicEmail">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control type="email" name="email" placeholder="Enter email" />
                </Form.Group>

                <Form.Group controlId="formBasicPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control type="password" name="password" placeholder="Password" />
                </Form.Group>

                <Form.Group controlId="formApiKey">
                    <Form.Label>Api Key</Form.Label>
                    <Form.Control type="text" name="key" placeholder="API Key" />
                </Form.Group>

                <Form.Group controlId="formApiSecret">
                    <Form.Label>Api Secret</Form.Label>
                    <Form.Control type="text" name="secret" placeholder="API Secret" />
                </Form.Group>
                <Button variant="primary" type="submit">
          Submit
                </Button>

                <Link to="/login">
          Cancel
                </Link>

            </Form>
        );
    }
  
    render() {
        if (this.props.logged) return <Redirect to="/" />;
        else {
            return (
                <Container fluid>
                    { this.registerForm() }
                </Container>
            );
        }
    }
};

const mapStateToProps = state => ({
    logged: state.login.logged,
    user: state.login.user,
});

export default connect(mapStateToProps)(Register);