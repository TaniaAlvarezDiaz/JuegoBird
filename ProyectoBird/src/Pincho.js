var Pincho = cc.Class.extend({

    ctor: function (gameLayer, posicion) {
        this.gameLayer = gameLayer;

        // Crear Sprite - Cuerpo y forma
        this.sprite = new cc.PhysicsSprite(res.pincho);

        // Crear cuerpo estatico
        var body = new cp.StaticBody();
        body.setPos(posicion);
        this.sprite.setBody(body);

        // Crear forma rectangular
        this.shape = new cp.BoxShape(body,
            this.sprite.getContentSize().width,
            this.sprite.getContentSize().height);

        // Añadir forma estática al Space
        gameLayer.space.addStaticShape(this.shape);

        // Añadir sprite a la capa
        gameLayer.addChild(this.sprite, 10);

        // Radar superior (para detectar las colisiones solo cuando el jugador cae sobre los pinchos)
        var mitadAncho = this.sprite.getContentSize().width / 2;
        var mitadAlto = this.sprite.getContentSize().height / 2;

        this.shapeRadar = new cp.PolyShape(body,
            [-mitadAncho + 15, mitadAlto + 3, mitadAncho - 15, mitadAlto + 3],
            cp.v(0, 0));

        this.shapeRadar.setSensor(true);
        this.shapeRadar.setCollisionType(tipoPincho);

        gameLayer.space.addShape(this.shapeRadar);

    }


});