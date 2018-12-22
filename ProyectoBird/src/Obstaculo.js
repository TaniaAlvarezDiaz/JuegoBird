var Obstaculo = cc.Class.extend({
    gameLayer:null,
    sprite:null,
    shape:null,
    ctor:function (gameLayer, posicion, imagenSprite, imagenAnimacion, framesAnimacion, tieneAnimacion, nivel) {
        this.gameLayer = gameLayer;
        this.sprite = new cc.PhysicsSprite(imagenSprite);
        var body = new cp.StaticBody();
        body.setPos(posicion);
        this.sprite.setBody(body);
      /*  if (nivel == 1) {
            var radio = this.sprite.getContentSize().width / 2;
            this.shape = new cp.CircleShape(body, radio , cp.vzero);
        }else if (nivel == 2) {*/
            this.shape = new cp.BoxShape(body,
                this.sprite.getContentSize().width,
                this.sprite.getContentSize().height);
  //      }
        this.shape.setCollisionType(tipoEnemigo);
        gameLayer.space.addStaticShape(this.shape);
        gameLayer.addChild(this.sprite,10);

    //    if (tieneAnimacion==true) {
            // Crear animación
            var framesAnimacion = [];
            for (var i = 1; i <= framesAnimacion; i++) {
                var str = imagenAnimacion + i + ".png";
                var frame = cc.spriteFrameCache.getSpriteFrame(str);
                framesAnimacion.push(frame);
            }
            var animacion = new cc.Animation(framesAnimacion, 0.2);
            var actionAnimacionBucle =
                new cc.RepeatForever(new cc.Animate(animacion));
            // ejecutar la animación
            this.sprite.runAction(actionAnimacionBucle);
     //   }

    },
    eliminar: function (){
        this.gameLayer.space.removeShape(this.shape);
        this.gameLayer.removeChild(this.sprite);
    }


});