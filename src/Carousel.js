import React, {Component } from 'react';
import { findDOMNode } from 'react-dom';
import './Carousel.css';

import Slide from './Slide';
import data from './data.json';

import scrollTo from './scrollToAnimate';

import throttle from 'lodash.throttle';
import classNames from 'classnames';

class Carousel extends Component {

  constructor(props) {
    super(props);
    this.handleLeftNav = this.handleLeftNav.bind(this);
    this.onResize = this.onResize.bind(this);
    this.throttleResize = throttle(this.onResize, 250);
    this.throttleScroll = throttle(this.onScroll, 250);
    this.state = {
      allTheWayLeft: false,
      allTheWayRight: false,
      numOfSlidesToScroll: 4
    }
    this.animatingLeft = false;
    this.animatingRight = false;
    this.draggingCarousel = false;
  }


  checkIfAllTheWayOver() {
    const { carouselViewport } = this.refs;
    // if scroll left === 0 
      // do not show button
    var allTheWayLeft = false;
    if ( carouselViewport.scrollLeft === 0 ) {
      console.log('in here');
      allTheWayLeft = true;
    }

    // if scrollLeft + length of viewport === real width of carousel
      // do not show right

    var allTheWayRight = false;

    var totalWidthOfCarousel = carouselViewport.scrollWidth;
    var amountScolled = carouselViewport.scrollLeft;
    var viewportLength = carouselViewport.clientWidth;


    if ( amountScolled + viewportLength === totalWidthOfCarousel ) {
      allTheWayRight = true;
    }


    if ( this.state.allTheWayLeft !== allTheWayLeft || this.state.allTheWayRight !== allTheWayRight ) {
      this.setState({
        allTheWayLeft,
        allTheWayRight
      })
    }
    
  }

  onScroll = (e) => {
    // console.log('scrolling');
    this.checkIfAllTheWayOver();
  }

  componentDidMount() {
    this.checkNumOfSlidesToScroll();
    this.checkIfAllTheWayOver();
    window.addEventListener('resize', this.throttleResize);
    window.addEventListener('keydown', this.whatKey);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.throttleResize);
    window.removeEventListener('keydown', this.whatKey);
  }

  whatKey = (e) => {
    console.log(e.keyCode);
    var leftArrow = e.keyCode === 37;
    var rightArrow = e.keyCode === 39;
    if ( leftArrow && !this.state.allTheWayLeft ) {
      if ( !this.animatingLeft ) {
        this.animatingLeft = true;
        this.handleLeftNav().then(()=>{
          this.animatingLeft = false;
        });
      }
    }
    if ( rightArrow && !this.state.allTheWayRight ) {
      if ( !this.animatingRight ) {        
        this.animatingRight = true;
        this.handleRightNav().then(()=>{
          this.animatingRight = false;
        });
      }
    }
  }

  onResize(e) {
    this.checkNumOfSlidesToScroll();
  }

  checkNumOfSlidesToScroll() {
    // console.log('checking', performance.now());
    var numOfSlidesToScroll;
    if ( window.innerWidth <= 900 ) {      
      numOfSlidesToScroll = 'full';
    } else {
      numOfSlidesToScroll = 4;
    }
    if ( this.state.numOfSlidesToScroll !== numOfSlidesToScroll) {
      console.log('in here', numOfSlidesToScroll);
      this.setState({numOfSlidesToScroll: numOfSlidesToScroll});
    }
  }

  renderSlides() {
    return data.map((state)=>{
      return (
        <Slide 
          name={state.name} 
          key={state.abbreviation}
          ref={compSlide=> this.slide = compSlide}
        />
      )
    })
  }

  widthAndTimeToScroll() {
    const { carouselViewport } = this.refs;
    console.log('what is slide', this.refs, findDOMNode(this.slide));
    var numOfSlidesToScroll = this.state.numOfSlidesToScroll;
    if ( numOfSlidesToScroll === 'full') {
      return {
        widthToScroll: carouselViewport.offsetWidth,
        timeToScroll: 400
      };
    } else {

      var widthOfSlide = findDOMNode(this.slide).offsetWidth;
      var timeToMoveOneSlide = 200;
      return {
        widthToScroll: numOfSlidesToScroll * widthOfSlide,
        timeToScroll: Math.min( (numOfSlidesToScroll * timeToMoveOneSlide), 400)
      }
    }
  }

  handleLeftNav(e) {
    const { carouselViewport } = this.refs;
    var {widthToScroll, timeToScroll} = this.widthAndTimeToScroll();
    var newPos = carouselViewport.scrollLeft - widthToScroll;

       // console.log('left clicked', newPos);
    // if ( this.promise) {
    //   console.log('')
    // }
    var promise = scrollTo({
      element: carouselViewport, 
      to: newPos, 
      duration: timeToScroll, 
      scrollDirection: 'scrollLeft',
      callback: this.checkIfAllTheWayOver,
      context: this
    })
    return promise;
  }

  handleRightNav = (e) => {
    const { carouselViewport } = this.refs;
    var {widthToScroll, timeToScroll} = this.widthAndTimeToScroll();
    var newPos = carouselViewport.scrollLeft + widthToScroll;
    // console.log('right clicked', newPos);
    return scrollTo({
      element: carouselViewport, 
      to: newPos, 
      duration: timeToScroll, 
      scrollDirection: 'scrollLeft',
      callback: this.checkIfAllTheWayOver,
      context: this
    });
  }

  startMoving = (e) => {
    console.log('start e', e);
    this.draggingCarousel = true;
    this.lastX, this.initialX = e.clientX;
  }

  stopMoving = (e) => {
    console.log('stop e', e);
    console.log('how far moved', this.initialX - this.lastX);
    if ( this.draggingCarousel && this.lastX ) {      
      var amountScolled = this.initialX - this.lastX;
      this.draggingCarousel = false;
      this.lastX, this.initialX = null

      var carouselViewport = this.refs.carouselViewport;

      var {widthToScroll, timeToScroll} = this.widthAndTimeToScroll();

      var amountLeftOver;
      if ( this.lastDirection > 0 ) {
        amountLeftOver = widthToScroll - ( amountScolled % widthToScroll );
      } else if ( this.lastDirection < 0 ) {
        amountLeftOver = -(widthToScroll - ( amountScolled % widthToScroll ));
      } else {
        return;
      }

      // var amountLeftOver = amountScolled % widthToScroll;
      var fractionLeftToScroll = Math.abs(amountLeftOver) / widthToScroll;
      console.log('the amount went over', amountScolled, amountLeftOver, widthToScroll);

      var newPos = carouselViewport.scrollLeft + amountLeftOver;
      var newTimeToScroll = fractionLeftToScroll * timeToScroll;

      scrollTo({
        element: carouselViewport, 
        to: newPos, 
        duration: timeToScroll, 
        scrollDirection: 'scrollLeft',
        callback: this.checkIfAllTheWayOver,
        context: this
      });
    } else {
      this.draggingCarousel = false;
      this.lastX, this.initialX = null
    }



  }

  moving = (e) => {
    console.log('getting here');
    if ( this.draggingCarousel ) {
      var currentX = this.lastX - e.clientX;
      console.log('move event', e, e.clientX, currentX);
      var carouselViewport = this.refs.carouselViewport;
      carouselViewport.scrollLeft = carouselViewport.scrollLeft + currentX;
      this.lastX = e.clientX;
      this.lastDirection = currentX;
    }
  }

  render() {

    const {
      allTheWayLeft,
      allTheWayRight
    } = this.state;
    const defaultNavClasses = classNames({
      'carousel-nav': true
    })

    const leftNavClasses = classNames({
      'carousel-left-nav': true,
      'carousel-nav-disabled': allTheWayLeft
    }, defaultNavClasses);

    const rightNavClasses = classNames({
      'carousel-right-nav': true,
      'carousel-nav-disabled': allTheWayRight
    }, defaultNavClasses)
    return (
      <div className="carousel-container">
        <button 
          className={leftNavClasses}
          onClick={this.handleLeftNav}
        >
          &#60;
        </button>
        <div 
          className="carousel-viewport" 
          ref="carouselViewport" 
          onScroll={this.throttleScroll}
          onMouseDown={this.startMoving}
          onMouseUp={this.stopMoving}
          onMouseMove={this.moving}
          onMouseLeave={this.stopMoving}
          >
          {this.renderSlides()}
        </div>
        <button 
          className={rightNavClasses}
          onClick={this.handleRightNav}
        >
          &#62;
        </button>
      </div>
    );
  }
}

export default Carousel;