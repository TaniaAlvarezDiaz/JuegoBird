var Submarino = cc.Class.extend({

    ctor: function (gameLayer, posicion) {
        this.gameLayer = gameLayer;
        this.sprite = new cc.PhysicsSprite(res.submarino_png);
        this.body = new cp.StaticBody();
        this.body.setPos(posicion);
        this.sprite.setBody(this.body);
        var radio = this.sprite.getContentSize().width / 2;
        this.shape = new cp.CircleShape(this.body, radio , cp.vzero);
        this.shape.setCollisionType(tipoEnemigo);
        gameLayer.space.addStaticShape(this.shape);
        gameLayer.addChild(this.sprite,10);

    },
    eliminar: function (){
        this.gameLayer.space.removeShape(this.shape);
        this.gameLayer.removeChild(this.sprite);
    }


});