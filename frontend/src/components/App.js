import React from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import Main from './Main';
import Login from './Login';
import { fetchLoginStatus } from '../actions/loginActions';
import Register from './Register';

class App extends React.Component {
    componentDidMount() {
        this.props.dispatch(fetchLoginStatus());
    }
  
    render() {
        return (
            <Router>
                <Switch>
                    <Route exact path="/login" component={Login} />
                    <PrivateRoute exact path="/" {...this.props} component={Main} />
                    <PrivateRoute exact path="/orders" {...this.props} component={Main} />
                    <Route exact path="/register" component={Register} />
                </Switch>
            </Router>
        );
    }
}

const mapStateToProps = state => ({
    logged: state.login.logged,
    user: state.login.user,
});

function PrivateRoute({ component: Component, logged, ...rest }) {
    return (
        <Route
            {...rest}
            render={props =>
                logged === true ? (
                    <Component {...props} />
                ) : (
                    <Redirect
                        to={{
                            pathname: '/login',
                            state: { from: props.location }
                        }}
                    />
                )
            }
        />
    );
}

export default connect(mapStateToProps)(App);
