import * as firebase from 'firebase';

const firebaseConfig = {
    apiKey: 'AIzaSyBYZupMcmnXq_8FFKVbjl3UzQa1hsWLSZM',
    authDomain: 'cryptotrading-radp.firebaseapp.com',
    databaseURL: 'https://cryptotrading-radp.firebaseio.com',
    projectId: 'cryptotrading-radp',
    storageBucket: 'cryptotrading-radp.appspot.com',
    messagingSenderId: '764170808557',
    appId: '1:764170808557:web:20f6746cb84509ad9db0e4',
    measurementId: 'G-LMFCP973MP'
};

export default !firebase.apps.length ? firebase.initializeApp(firebaseConfig) : firebase.app();
