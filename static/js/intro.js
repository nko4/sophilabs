(function(){
  soundManager.setup({
    url: '/vendor/soundmanager2/swf/',
    flashVersion: 9,
    useHTML5Audio: true,
    preferFlash: false,
    useFlashBlock: false,
    debugFlash: false,
    debugMode: false,
    onready: function() {
      var t = (new Date()).getTime();
      var backgroundImage = '/img/explosion.gif?t=' + t;
      var logoImage = '/img/macgifer.png?t=' + t;
      soundManager.createSound({
        id: 1,
        url: '/sound/intro.mp3',
        autoLoad: true,
        onload: function(){
          var background = new Image();
          background.onload = function(){
            var logo = new Image();
            logo.onload = function(){
              //Chrome bug: background image doesn't load after refresh
              var intro = document.createElement('div');
              intro.className = 'intro';
              var background = document.createElement('div');
              background.className = 'background';
              background.style.backgroundImage = 'url(' + backgroundImage  + ')';
              intro.appendChild(background);
              var logo = document.createElement('div');
              logo.className = 'logo';
              logo.style.backgroundImage = 'url(' + logoImage  + ')';
              intro.appendChild(logo);
              document.body.insertBefore(intro, document.body.firstChild);
              var volume = 100;
              soundManager.play(1, {volume: volume, from: 21000, to: 29000});
              setTimeout(function(){
                setTimeout(function stop(){
                    volume -= 1;
                    if (volume <= 0) {
                      soundManager.stopAll();
                    } else {
                      soundManager.setVolume(1, volume);
                      setTimeout(stop, 20);
                    }
                }, 1);
              }, 5000);
            };
            logo.src = logoImage;
          };
          background.src = backgroundImage;
        }
      });
    }
  });
})();
