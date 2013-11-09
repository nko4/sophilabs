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
        onload: function(){
          var explosion = new Image();
          explosion.onload = function(){
            console.log('aaa');
          };
          explosion.src = '/img/explosion.gif';
          soundManager.play(1, {volume: 100, position: 21000});
          setTimeout(function(){
            soundManager.stopAll();
          }, 20000);
        }
      });
    }
  });
})();
