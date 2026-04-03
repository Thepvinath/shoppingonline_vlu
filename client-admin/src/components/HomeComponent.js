import React, { Component } from 'react';
import home_img from '../../src/asset/images/home_img.jpg'
class Home extends Component {
  render() {
    return (
      <div className="align-center">
        <h2 className="text-center">ADMIN HOME</h2>
        <img
          src={home_img}
          width="800px"
          height="600px"
          alt=""
        />
      </div>
    );
  }
}

export default Home;
