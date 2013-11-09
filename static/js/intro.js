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
      soundManager.createSound({
        id: 1,
        url: '/sound/intro.mp3',
        autoLoad: true,
        onload: function(){
          var explosion = new Image();
          explosion.onload = function(){
            var logo = new Image();
            logo.onload = function(){
              var background = document.createElement('div');
              background.className = 'background';
              background.appendChild(document.createElement('div'));
              document.body.insertBefore(background, document.body.firstChild);
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
            logo.src = '/img/macgifer.png';
          };
          explosion.src = '/img/explosion.gif';
        }
      });
    }
  });
})();
