import React from 'react';
import { connect } from 'react-redux';
import { signIn } from '../actions/loginActions';
import { Redirect } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';

class Login extends React.Component {
    handleSubmit(e) {
        e.preventDefault();
        const email = e.target.email.value;
        const password = e.target.password.value;
        if (email && password)
            this.props.dispatch(signIn(email, password));
    //this.props.dispatch(signIn('abc@trading.com', 'abc1234'))
    };

    showRegister = () => {
        return <Redirect to="/register" />;
    };
    
    loginForm() {
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
                <Button variant="primary" type="submit">
          Login
                </Button>

                <Link to="/register">
          Register
                </Link>

            </Form>
        );
    }
  
    render() {
        if (this.props.logged) return <Redirect to="/" />;
        else {
            return (
                <Container fluid>
                    { this.loginForm() }
                </Container>
            );
        }
    }
};

const mapStateToProps = state => ({
    logged: state.login.logged,
    user: state.login.user,
});

export default connect(mapStateToProps)(Login);
