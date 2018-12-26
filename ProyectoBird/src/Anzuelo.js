var Anzuelo = cc.Class.extend({

    ctor: function (gameLayer, posicion) {
        this.gameLayer = gameLayer;
        this.sprite = new cc.PhysicsSprite(res.anzuelo_png);
        var body = new cp.StaticBody();
        body.setPos(posicion);
        this.sprite.setBody(body);
        this.shape = new cp.BoxShape(body,
            this.sprite.getContentSize().width,
            this.sprite.getContentSize().height);
        this.shape.setCollisionType(tipoEnemigo);
        gameLayer.space.addStaticShape(this.shape);
        gameLayer.addChild(this.sprite, 10);

    },
    eliminar: function (){
        this.gameLayer.space.removeShape(this.shape);
        this.gameLayer.removeChild(this.sprite);
    }


});