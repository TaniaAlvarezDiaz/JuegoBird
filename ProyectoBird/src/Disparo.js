var Disparo = cc.Class.extend({
    gameLayer:null,
    sprite:null,
    shape:null,
    ctor:function (gameLayer, posicion, tipoDisparo, nombreDisparo) {
        this.gameLayer = gameLayer;
        this.sprite = new cc.PhysicsSprite(nombreDisparo);
        this.body = new cp.Body(5,Infinity);
        this.body.setPos(posicion);
        this.body.setAngle(0);
        this.sprite.setBody(this.body);
        gameLayer.space.addBody(this.body);
        // Crear forma rectangular
        this.shape = new cp.BoxShape(this.body,
            this.sprite.getContentSize().width,
            this.sprite.getContentSize().height);
        this.shape.setCollisionType(tipoDisparo);
        gameLayer.space.addShape(this.shape);
        gameLayer.addChild(this.sprite,10);
        this.body.applyImpulse(cp.v(400, 0), cp.v(0, 0));
    },
    eliminar: function (){
        this.gameLayer.space.removeShape(this.shape);
        this.gameLayer.removeChild(this.sprite);
    },
    actualizar: function(){
        this.body.applyImpulse(cp.v(100, 0), cp.v(0, 0));
    }
});