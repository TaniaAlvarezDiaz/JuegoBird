var Vida = cc.Class.extend({
    ctor: function (gameLayer, posicion) {
        this.gameLayer = gameLayer;

        // Crear sprite
        this.sprite = new cc.PhysicsSprite("#vida1.png");

        // Crear cuerpo estatico
        var body = new cp.StaticBody();
        body.setPos(posicion);
        this.sprite.setBody(body);

        // Crear forma rectangular
        this.shape = new cp.BoxShape(body,
            this.sprite.getContentSize().width,
            this.sprite.getContentSize().height);
        this.shape.setCollisionType(tipoVida);
        this.shape.setSensor(true);

        // Añadir forma estática al Space
        gameLayer.space.addStaticShape(this.shape);

        // Añadir sprite a la capa
        gameLayer.addChild(this.sprite, 10);

        // Crear animación
        var framesAnimacion = [];
        for (var i = 1; i <= 3; i++) {
            var str = "vida" + i + ".png";
            var frame = cc.spriteFrameCache.getSpriteFrame(str);
            framesAnimacion.push(frame);
        }
        var animacion = new cc.Animation(framesAnimacion, 0.2);
        var actionAnimacionBucle =
            new cc.RepeatForever(new cc.Animate(animacion));

        // Ejecutar  animación
        this.sprite.runAction(actionAnimacionBucle);
    },
    eliminar: function () {
        this.gameLayer.space.removeShape(this.shape);
        this.gameLayer.removeChild(this.sprite);
    }

});