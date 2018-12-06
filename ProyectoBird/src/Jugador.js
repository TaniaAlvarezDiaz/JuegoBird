var estadoSaltando = 2;
var estadoImpactado = 3;

var Jugador = cc.Class.extend({
    ctor: function (gameLayer, posicion) {
        this.gameLayer = gameLayer;
        this.vidas = 3; // Empieza con 3 vidas
        this.turbos = 3;
        this.estado = estadoSaltando;

        // Crear Sprite - Cuerpo y forma
        this.sprite = new cc.PhysicsSprite("#bird_01.png");

        // Cuerpo dinámico, SI le afectan las fuerzas
        this.body = new cp.Body(5, cp.momentForBox(1,
            this.sprite.getContentSize().width,
            this.sprite.getContentSize().height));
        this.body.setPos(posicion);
        //body.w_limit = 0.02;
        this.body.setAngle(0);
        this.sprite.setBody(this.body);

        // Se añade el cuerpo al espacio
        gameLayer.space.addBody(this.body);

        // Forma (La he hecho circular en lugar de cuadrada, debido a que cuando se inclinaba el jugador, la polyshape no tocaba el suelo)
        /*this.shape = new cp.BoxShape(this.body,
            this.sprite.getContentSize().width,
            this.sprite.getContentSize().height);*/
        var radio = this.sprite.getContentSize().width / 2;
        this.shape = new cp.CircleShape(this.body, radio, cp.vzero);

        this.shape.setCollisionType(tipoJugador);

        // Forma dinámica
        gameLayer.space.addShape(this.shape);

        // Polyshape situada ligeramente debajo del jugador (para que no pueda trepar)
        var mitadAncho = this.sprite.getContentSize().width / 2;
        var mitadAlto = this.sprite.getContentSize().height / 2;
        this.shapeRadar = new cp.PolyShape(this.body,
            [-mitadAncho + 10, -mitadAlto, mitadAncho - 10, -mitadAlto],
            cp.v(0, 0));
        this.shapeRadar.setSensor(true);
        this.shapeRadar.setCollisionType(tipoPieJugador);
        gameLayer.space.addShape(this.shapeRadar);

        // Añadir sprite a la capa
        gameLayer.addChild(this.sprite, 10);

        //Animación saltar
        var framesAnimacionSaltar = [];
        for (var i = 1; i <= 3; i++) {
            var str = "bird_0" + i + ".png";
            var frame = cc.spriteFrameCache.getSpriteFrame(str);
            framesAnimacionSaltar.push(frame);
        }
        var animacionSaltar = new cc.Animation(framesAnimacionSaltar, 0.2);
        this.aSaltar = new cc.RepeatForever(new cc.Animate(animacionSaltar));
        this.aSaltar.retain();

        //Animación impactado
        var framesAnimacionImpactado = [];
        for (var i = 1; i <= 3; i++) {
            var str = "bird_0" + i + ".png";
            var frame = cc.spriteFrameCache.getSpriteFrame(str);
            framesAnimacionImpactado.push(frame);
        }
        var animacionImpactado = new cc.Animation(framesAnimacionImpactado, 0.4);
        this.aImpactado = new cc.Repeat(new cc.Animate(animacionImpactado), 1);
        this.aImpactado.retain();

        // Animaión actual
        this.animacion = this.aSaltar;

        // Ejecutar la animación actual
        this.sprite.runAction(this.animacion);

        // Impulso inicial
        this.body.applyImpulse(cp.v(300, 0), cp.v(0, 0));

    },
    saltar: function (saltar) {
        if(saltar == 1){
            if(this.gameLayer.numVecesSaltar <= 1){
                if (this.estado == estadoSaltando) {
                    this.gameLayer.numVecesSaltar++;
                    this.body.applyImpulse(cp.v(0, 400), cp.v(0, 0));
                }
            }
        }
    },
    jetpack: function (jetpack) {
        if(jetpack == 1){
            if (this.estado == estadoSaltando) {
                this.body.applyImpulse(cp.v(0, 100), cp.v(0, 0));
            }
        }
    },
    actualizar: function () {
        switch (this.estado) {
            case estadoImpactado:
                if (this.animacion != this.aImpactado) {
                    this.animacion = this.aImpactado;
                    this.sprite.stopAllActions();
                    this.sprite.runAction(
                        new cc.Sequence(
                            this.animacion,
                            new cc.CallFunc(this.finAnimacionImpactado, this))
                    );
                }
                break;
            case estadoSaltando:
                if (this.animacion != this.aSaltar) {
                    this.animacion = this.aSaltar;
                    this.sprite.stopAllActions();
                    this.sprite.runAction(this.animacion);
                }
                break;
        }
    },
    tocaSuelo: function () {
        /*if (this.estado === estadoSaltando) {
            this.estado = estadoCaminando;
        }*/
    },
    dejaDeTocarSuelo: function () {
       /* if (this.estado === estadoCaminando) {
            this.estado = estadoSaltando;
        }*/
    },
    impactado: function () {
        if (this.estado !== estadoImpactado) {
            this.estado = estadoImpactado;
        }
    },
    finAnimacionImpactado: function () {
        if (this.estado === estadoImpactado) {
            this.estado = estadoSaltando;
        }
    },
    sumarVida: function () {
        this.vidas++;
    },
    restarVida: function () {
        this.vidas--;
    },
    impulsar: function () {
        this.turbos--;
        this.gameLayer.tiempoTurbo = 1;
        this.body.applyImpulse(cp.v(6000, 0), cp.v(0, 0));
    }


});
