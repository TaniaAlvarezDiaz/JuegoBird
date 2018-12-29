var ModoControl = cc.Class.extend({

    ctor: function (gameLayer, posicion) {
        this.gameLayer = gameLayer;
        this.sprite = new cc.PhysicsSprite(res.modoControl);
        var body = new cp.StaticBody();
        body.setPos(posicion);
        this.sprite.setBody(body);
        this.shape = new cp.BoxShape(body,
            this.sprite.getContentSize().width,
            this.sprite.getContentSize().height);
        this.shape.setCollisionType(tipoModoControl);
        this.shape.setSensor(true);
        gameLayer.space.addStaticShape(this.shape);
        gameLayer.addChild(this.sprite, 10);

    },
    eliminar: function (){
        this.gameLayer.space.removeShape(this.shape);
        this.gameLayer.removeChild(this.sprite);
    }


});