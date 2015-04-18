function CorrectingInterval(func, delay) {
  var instance = this;
  this.stop = false;

  function tick(func, delay) {
    if (!instance.started) {
      instance.func = func;
      instance.delay = delay;
      instance.startTime = new Date().valueOf();
      instance.target = delay;
      instance.started = true;

    if(!instance.stop)
      setTimeout(tick, delay);
    } else {
      var elapsed = new Date().valueOf() - instance.startTime,
        adjust = instance.target - elapsed;

      instance.func();
      instance.target += instance.delay;
      
    if(!instance.stop)
      setTimeout(tick, instance.delay + adjust);
    }
  };

  tick(func, delay);
}

global.CorrectingInterval = CorrectingInterval;