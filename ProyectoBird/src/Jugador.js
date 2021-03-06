var estadoSaltando = 2;
var estadoImpactado = 3;
var estadoDisparando = 4;
var estadoSinDisparar = 5;
var estadoPicotazo = 6;
var estadoSinPicotazo = 7;

var Jugador = cc.Class.extend({
    ctor: function (gameLayer, posicion) {
        this.gameLayer = gameLayer;
        this.vidas = 5; // Empieza con 5 vidas
        this.turbos = 3; // Empieza con 3 turbos
        this.estado = estadoSaltando;
        this.disparo = estadoSinDisparar;
        this.picotazo = estadoSinPicotazo;
        this.tiempoInmune = 0;
        this.tiempoInvulnerable = 0;
        this.cadenciaDisparo = 0;
        this.impacto = false;

        // Crear Sprite - Cuerpo y forma
        this.sprite = new cc.PhysicsSprite("#bird_01.png");

        // Cuerpo dinámico, SI le afectan las fuerzas
        this.body = new cp.Body(5, Infinity/*cp.momentForBox(1,
            this.sprite.getContentSize().width,
            this.sprite.getContentSize().height)*/);
        this.body.setPos(posicion);
        this.sprite.setBody(this.body);

        // Se añade el cuerpo al espacio
        gameLayer.space.addBody(this.body);

        var radio = this.sprite.getContentSize().width / 2;
        this.shape = new cp.CircleShape(this.body, radio, cp.vzero);

        this.shape.setCollisionType(tipoJugador);

        // Forma dinámica
        gameLayer.space.addShape(this.shape);

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
            var str = "bird_impactado_0" + i + ".png";
            var frame = cc.spriteFrameCache.getSpriteFrame(str);
            framesAnimacionImpactado.push(frame);
        }
        var animacionImpactado = new cc.Animation(framesAnimacionImpactado, 0.4);
        this.aImpactado = new cc.Repeat(new cc.Animate(animacionImpactado),1);
        this.aImpactado.retain();

        //Animación inmune
        var framesAnimacionInmune = [];
        for (var i = 1; i <= 3; i++) {
            var str = "pajaro_inmune_0" + i + ".png";
            var frame = cc.spriteFrameCache.getSpriteFrame(str);
            framesAnimacionInmune.push(frame);
        }
        var animacionInmune = new cc.Animation(framesAnimacionInmune, 0.4);
        this.aInmune = new cc.Repeat(new cc.Animate(animacionInmune), 1);
        this.aInmune.retain();

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
    disparar: function(disparo){
        if(disparo == 1){
            if (this.cadenciaDisparo <= 0) {
                this.cadenciaDisparo = 50;
                this.disparo = estadoDisparando;
            }
        }
        else{
            this.disparo = estadoSinDisparar;
        }
    },
    darPicotazo: function(pico){
        if(pico == 1){
            if(this.gameLayer.numVecesPicotazo < 1){
                console.log("DANDO PICOTAZO");
                this.picotazo = estadoPicotazo;
                this.gameLayer.numVecesPicotazo++;
                //Colocar sticker picotazo
                var capaControles =
                    this.gameLayer.getParent().getChildByTag(idCapaControles);
                capaControles.addStickerPicotazo();
            }
        }
        else{
            this.picotazo = estadoSinPicotazo;
            var capaControles =
                this.gameLayer.getParent().getChildByTag(idCapaControles);
            capaControles.removeStickerPicotazo();
        }
    },
    actualizar: function () {
        if (this.tiempoInvulnerable > 0 ){
            this.tiempoInvulnerable--;
        }
        if (this.cadenciaDisparo > 0 ){
            this.cadenciaDisparo--;
        }
        if (this.tiempoInmune > 0) {
            this.tiempoInmune--;
        }
        switch (this.estado) {
            case estadoSaltando:
                if (this.tiempoInmune > 0) {
                    this.animacion = this.aInmune;
                    this.sprite.stopAllActions();
                    this.sprite.runAction(this.animacion);
                }
                else if (this.tiempoInvulnerable > 0) {
                    this.animacion = this.aImpactado;
                    this.sprite.stopAllActions();
                    this.sprite.runAction(this.animacion);
                }
                else {
                    if (this.animacion != this.aSaltar) {
                        this.animacion = this.aSaltar;
                        this.sprite.stopAllActions();
                        this.sprite.runAction(this.animacion);
                    }
                }
                break;
        }
    },
    impactado: function (num) {
        if (this.tiempoInmune <= 0) {
            if (this.tiempoInvulnerable <= 0) {
                this.tiempoInvulnerable = 100;
                if (this.vidas > 0) {
                    this.restarVida(num);
                }
            }

        }
    },
    inmune: function () {
        if (this.tiempoInmune <= 0) {
            this.tiempoInmune = 200;
        }
    },
    sumarVida: function () {
        cc.audioEngine.playEffect(res.sonido_sumar_vida_mp3);
        this.vidas++;
    },
    restarVida: function (num) {
        this.vidas = this.vidas - num;
    },
    impulsar: function () {
        cc.audioEngine.playEffect(res.sonido_turbo_mp3);
        this.turbos--;
        this.gameLayer.tiempoTurbo = 1;
        this.body.applyImpulse(cp.v(6000, 0), cp.v(0, 0));
    }


});
