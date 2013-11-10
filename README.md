# MacGifer

![Vote KO widget](http://f.cl.ly/items/1n3g0W0F0G3V0i0d0321/Screen%20Shot%202012-11-04%20at%2010.01.36%20AM.png)

In a divided world, streaming formats are a matter of inclusion. GIF was introduced by CompuServe in 1987, they didn't know how powerful it was going to be. 26 years later, using NodeJS together with Redis, WebRTC, websockets and HTML5, MacGifer introduces GIF-based streaming, making it possible for Internet Explorer 6.0 to be part of society once again.

## Requirements
```sh
# Redis
sudo add-apt-repository ppa:chris-lea/redis-server
sudo apt-get update
sudo apt-get install redis-server
```

## Deploying

```sh
# ssh access
ssh deploy@sophilabs.2013.nodeknockout.com
ssh root@sophilabs.2013.nodeknockout.com

# or, if you get prompted for a password
ssh -i ./id_deploy deploy@sophilabs.2013.nodeknockout.com
ssh -i ./id_deploy root@sophilabs.2013.nodeknockout.com

# using the included script
./deploy nko
```

## How does it work?
```
        Browser                      Node.js                  Browser/phone
     (broadcaster)                    server                mplayer/microwave
           .                            .                       (watcher)
           |                            |                           .
           |--.                         |                           |
           |  | Get webcam frame        |<--------------------------|
           |  | (WebRTC)                |--.     HTTP Request       |
           |<-`                         |  |                        |
           |--.                         |  | Encode GIF header      |
           |  | Draw on                 |  | (GIFEncoder)           |
           |  | HTML5 canvas            |  |                        |
           |<-`                         |<-`                        |
 	   |--.                         |-------------------------->|
           |  | Apply                   |       Write header        |
           |  | extensions              |        to response        |
   	   |<-`                         |                           |
           |--.                         |                           |
           |  | Encode frame            |                           |
           |  | (GIFEncoder)            |                           |
           |<-`                         |                           |
           |--------------------------->|--.                        |
           |         Send frame         |  | Publish to             |
           |        (websockets)        |  | Redis channel          |
           |                            |<-`                        |
           |                            |--.                        |
           |                            |  | Read from              |
           |                            |  | Redis channel          |
           |                            |<-`                        |
           |                            |-------------------------->|
           |                            |       Write frame         |
           |                            |       to response         |
           |                            |                           |
           `                            `                           `
```

## Authors
* [Eduardo Veiga](https://github.com/cinemascop89)
* [Pablo Ricco](http://github.com/pricco)
* [Sebastian Nogara](http://github.com/snogaraleal)

## Credits and Thanks
* This project was created for the [Node.js Knockout](nodeknockout.com/)
* Thanks to [Sophilabs](http://sophilabs.com) team for the place and food!
