import React, {
  Component
} from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  state = {
    response: ''
  };

  componentDidMount() {
    this.callApi()
      .then(res => {
        this.setState({
          response: res.Info
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  callApi = async () => {
    const response = await fetch('/api/users', {
      method: "post",

      // Payload aktarma
      body: JSON.stringify({
        username: "yedehrab",
        email: "hello@gmail.com",
        password: "123"
      })

    });
    // JSON Yanıtını alma
    const body = await response.json();
    return body;
  };

  render() {
    return ( <
      div className = "App" >
      <
      header className = "App-header" >
      <
      img src = {
        logo
      }
      className = "App-logo"
      alt = "logo" / >
      <
      p >
      Edit < code > src / App.js < /code> and save to reloads. {this.state.response} <
      /p> <
      a className = "App-link"
      href = "https://reactjs.org"
      target = "_blank"
      rel = "noopener noreferrer" >
      Learn React <
      /a> <
      /header> <
      /div>
    );
  }
}

export default App;