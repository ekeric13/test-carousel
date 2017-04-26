function scrollTo(params) {
  return new Promise((res,rej)=>{
    const {
      element,
      to,
      duration,
      scrollDirection,
      callback,
      context
    } = params;
    var start = element[scrollDirection],
        change = to - start,
        increment = 20;

    var animateScroll = function(elapsedTime) {        
        elapsedTime += increment;
        var position = easeInOut(elapsedTime, start, change, duration);                        
        element[scrollDirection] = position;
        if (elapsedTime < duration) {
          window.requestAnimationFrame(animateScroll.bind(null, elapsedTime));
        } else {
          console.log('FINISHED');
          if (typeof callback == 'function') { 
            callback.call(context); 
          }
          res();
        }
    };

    window.requestAnimationFrame(animateScroll.bind(null,0));
    
  })
}

function easeInOut(currentTime, start, change, duration) {
    currentTime /= duration / 2;
    var answer;
    if (currentTime < 1) {
        answer = change / 2 * currentTime * currentTime + start;
        return answer;
    } else {
      currentTime -= 1;
      answer =  -change / 2 * (currentTime * (currentTime - 2) - 1) + start;
      return answer;
    }
}

export default scrollTo;