var NubeBlanca = cc.Class.extend({
    gameLayer:null,
    sprite:null,
    shape:null,
    ctor:function (gameLayer, posicion) {
        this.gameLayer = gameLayer;
        this.sprite = new cc.PhysicsSprite("#Animación-Nube-Est_01.png");
        var body = new cp.StaticBody();
        body.setPos(posicion);
        this.sprite.setBody(body);
        var radio = this.sprite.getContentSize().width / 2;
        this.shape = new cp.CircleShape(body, radio , cp.vzero);
        this.shape.setCollisionType(tipoEnemigo);
        gameLayer.space.addStaticShape(this.shape);
        gameLayer.addChild(this.sprite,10);

        // Crear animación
        var framesAnimacion = [];
        for (var i = 1; i <= 7; i++) {
            var str = "Animación-Nube-Est_0" + i + ".png";
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
    }


});