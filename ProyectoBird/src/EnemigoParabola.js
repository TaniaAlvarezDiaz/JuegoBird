var EnemigoParabola = cc.Class.extend({
    gameLayer:null,
    sprite:null,
    shape:null,
    ctor:function (gameLayer, imagen ,posicion,velocidadX,velocidadY) {
        this.gameLayer = gameLayer;
        this.sprite = new cc.PhysicsSprite(imagen);
        this.body = new cp.Body(5,Infinity);
        this.body.setPos(posicion);
        this.body.setAngle(0);
        this.sprite.setBody(this.body);
        gameLayer.space.addBody(this.body);
        var radio = this.sprite.getContentSize().width / 2;
        this.shape = new cp.CircleShape(this.body, radio , cp.vzero);
        this.shape.setCollisionType(tipoEnemigo);
        gameLayer.space.addShape(this.shape);
        gameLayer.addChild(this.sprite,10);
        this.tipo = "enemigoParabolico";
        this.clonado = false;
        this.permiteClonacion = false;
        this.body.applyImpulse(cp.v(velocidadX, velocidadY), cp.v(0, 0));
    },
    eliminar: function (){
        this.gameLayer.space.removeShape(this.shape);
        this.gameLayer.removeChild(this.sprite);
    },
    actualizar: function(vel){
        this.body.applyImpulse(cp.v(vel, 0), cp.v(0, 0));
    }
});