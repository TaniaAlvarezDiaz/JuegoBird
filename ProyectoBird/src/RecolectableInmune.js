var RecolectableInmune = cc.Class.extend({
    gameLayer:null,
    sprite:null,
    shape:null,
    ctor:function (gameLayer, posicion) {
        this.gameLayer = gameLayer;

        // Crear Sprite
        this.sprite = new cc.PhysicsSprite("#apple_01.png");
        // Cuerpo estatico, no le afectan las fuerzas, gravedad, etc.
        var body = new cp.StaticBody();
        body.setPos(posicion);
        this.sprite.setBody(body);
        // Los cuerpos estáticos nunca se añaden al Space

        // Crear forma circular
        var radio = this.sprite.getContentSize().width / 2;
        this.shape = new cp.CircleShape(body, radio , cp.vzero);
        this.shape.setCollisionType(tipoRecolectableInmune);
        // setSensor(true) no genera choques, es como un “fantasma”, nunca genera colisiones reales
        this.shape.setSensor(true);
        // Añadir forma estática al Space
        gameLayer.space.addStaticShape(this.shape);
        // Añadir sprite a la capa
        gameLayer.addChild(this.sprite,10);


        // Crear animación
        var framesAnimacion = [];
        for (var i = 1; i <= 2; i++) {
            var str = "apple_0" + i + ".png";
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