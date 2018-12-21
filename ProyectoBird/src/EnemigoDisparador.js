var EnemigoDisparador = cc.Class.extend({
    gameLayer:null,
    sprite:null,
    shape:null,
    ctor:function (gameLayer, posicion, imagenSprite, iniImagenAnim, numTotalAnim) {
        this.gameLayer = gameLayer;
        this.sprite = new cc.PhysicsSprite(imagenSprite);
        this.body = new cp.StaticBody();
        this.body.setPos(posicion);
        this.sprite.setBody(this.body);
        var radio = this.sprite.getContentSize().width / 2;
        this.shape = new cp.CircleShape(this.body, radio , cp.vzero);
        this.shape.setCollisionType(tipoEnemigo);
        gameLayer.space.addStaticShape(this.shape);
        gameLayer.addChild(this.sprite,10);

        // Crear animación
        var framesAnimacion = [];
        for (var i = 1; i <= numTotalAnim; i++) {
            var str = iniImagenAnim + i + ".png";
            var frame = cc.spriteFrameCache.getSpriteFrame(str);
            framesAnimacion.push(frame);
        }
        var animacion = new cc.Animation(framesAnimacion, 0.2);
        var actionAnimacionBucle =
            new cc.RepeatForever(new cc.Animate(animacion));
        this.sprite.runAction(actionAnimacionBucle);
    },
    eliminar: function (){
        this.gameLayer.space.removeShape(this.shape);
        this.gameLayer.removeChild(this.sprite);
    }


});