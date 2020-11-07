import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { ESK } from './useEsk';

const url = process.env.NODE_ENV === 'development' ? 'ws://localhost:8080/ws' : 'wss://demo.eskit.net/ws'

ReactDOM.render(
  <React.StrictMode>
    <ESK url={url}>
      <App />
    </ESK>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
