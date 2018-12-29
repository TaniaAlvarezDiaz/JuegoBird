var RecolectableCongelar = cc.Class.extend({
    gameLayer:null,
    sprite:null,
    shape:null,

    ctor: function (gameLayer, posicion) {
        this.gameLayer = gameLayer;
        this.sprite = new cc.PhysicsSprite(res.recolectable_congelar_png);
        this.body = new cp.StaticBody();
        this.body.setPos(posicion);
        this.sprite.setBody(this.body);
        this.shape = new cp.BoxShape(this.body,
            this.sprite.getContentSize().width,
            this.sprite.getContentSize().height);
        this.shape.setCollisionType(tipoRecolectableCongelar);
        this.shape.setSensor(true);
        gameLayer.space.addStaticShape(this.shape);
        gameLayer.addChild(this.sprite,10);

    },
    eliminar: function (){
        this.gameLayer.space.removeShape(this.shape);
        this.gameLayer.removeChild(this.sprite);
    }

});