var EnemigoVolador = cc.Class.extend({
    gameLayer:null,
    sprite:null,
    shape:null,
    ctor:function (gameLayer, posicion, nomImagenSprite, numTotalAnim) {
        this.gameLayer = gameLayer;
        this.sprite = new cc.PhysicsSprite("#" + nomImagenSprite + "1.png");
        this.body = new cp.Body(5,Infinity);
        this.body.setPos(posicion);
        this.body.setAngle(0);
        this.sprite.setBody(this.body);
        gameLayer.space.addBody(this.body);
        this.shape = new cp.BoxShape(this.body,
            this.sprite.getContentSize().width,
            this.sprite.getContentSize().height);
        this.shape.setCollisionType(tipoEnemigo);
        gameLayer.space.addShape(this.shape);
        gameLayer.addChild(this.sprite,10);
        this.body.applyImpulse(cp.v(-500, 500), cp.v(0, 0));

        // Crear animación
        var framesAnimacion = [];
        for (var i = 1; i <= numTotalAnim; i++) {
            var str = nomImagenSprite + i + ".png";
            var frame = cc.spriteFrameCache.getSpriteFrame(str);
            framesAnimacion.push(frame);
        }
        var animacion = new cc.Animation(framesAnimacion, 0.2);
        var actionAnimacionBucle =
            new cc.RepeatForever(new cc.Animate(animacion));
        // ejecutar la animación
        this.sprite.runAction(actionAnimacionBucle);
    },
    eliminar: function (){
        this.gameLayer.space.removeShape(this.shape);
        this.gameLayer.removeChild(this.sprite);
    },
    actualizar: function(velX, velY){
        this.body.applyImpulse(cp.v(velX, velY), cp.v(0, 0));
    }
});