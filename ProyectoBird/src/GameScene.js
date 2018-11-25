var tipoSuelo = 1;
var tipoJugador = 2;
var tipoMoneda = 3;
var tipoEnemigo = 4;
var tipoEnemigoDerecha = 5;
var tipoEnemigoIzquierda = 6;
var tipoPieJugador = 7;
var tipoVida = 8;
var tipoPincho = 9;

var GameLayer = cc.Layer.extend({
    ctor: function () {
        this._super();
        var size = cc.winSize;

        // Zona de cache
        cc.spriteFrameCache.addSpriteFrames(res.moneda_plist);
        cc.spriteFrameCache.addSpriteFrames(res.jugador_caminar_plist);
        cc.spriteFrameCache.addSpriteFrames(res.jugador_saltar_plist);
        cc.spriteFrameCache.addSpriteFrames(res.jugador_impactado_plist);
        cc.spriteFrameCache.addSpriteFrames(res.animacion_cuervo_plist);
        cc.spriteFrameCache.addSpriteFrames(res.vida_plist);

        // Inicializar Space
        this.space = new cp.Space();
        this.space.gravity = cp.v(0, -350);

        // Depuración
        //this.depuracion = new cc.PhysicsDebugNode(this.space);
        //this.addChild(this.depuracion, 10);

        this.vidas = [];
        this.monedas = [];
        this.enemigos = [];
        this.pinchos = [];
        this.monedasEliminar = [];
        this.vidasEliminar = [];
        this.enemigosEliminar = [];
        this.tiempoTurbo = 0;

        this.jugador = new Jugador(this, cc.p(50, 150));

        this.cargarMapa();
        this.scheduleUpdate();

        // Zona de escuchadores de colisiones

        // Suelo y Jugador (en lugar de con toda la caja que envuelve al jugador, solo tendré en cuenta el "pie")
        /*this.space.addCollisionHandler(tipoSuelo, tipoJugador,
            null, null, this.collisionSueloConJugador.bind(this), this.finCollisionSueloConJugador.bind(this));*/

        // Suelo y pie del jugador
        /*this.space.addCollisionHandler(tipoSuelo, tipoPieJugador,
            null, null, this.collisionSueloConJugador.bind(this), this.finCollisionSueloConJugador.bind(this));*/
        this.space.addCollisionHandler(tipoSuelo, tipoPieJugador,
            null, this.collisionSueloConJugador.bind(this), null, this.finCollisionSueloConJugador.bind(this));

        // Jugador y moneda
        // IMPORTANTE: Invocamos el método antes de resolver la colisión (realmente no habrá colisión por la propiedad SENSOR de la Moneda).
        this.space.addCollisionHandler(tipoJugador, tipoMoneda,
            null, this.collisionJugadorConMoneda.bind(this), null, null);

        // Jugador y vida
        this.space.addCollisionHandler(tipoJugador, tipoVida,
            null, this.collisionJugadorConVida.bind(this), null, null);

        // Enemigo y jugador
        this.space.addCollisionHandler(tipoEnemigo, tipoJugador,
            null, null, this.collisionEnemigoConJugador.bind(this), null);

        // Jugador y pinchos
        this.space.addCollisionHandler(tipoJugador, tipoPincho,
            null, this.collisionJugadorConPincho.bind(this), null, null);

        // Nota: Las colisiones de las patas las he hecho de manera distinta al guión.
        // En el guión se gestionaba en el Enemigo, pero solamente afectaba al último enemigo que se colocaba,
        // ya que el manejador se machacaba cada vez que se creaba un nuevo enemigo.

        // Pata izquierda del enemigo con el suelo
        this.space.addCollisionHandler(tipoSuelo, tipoEnemigoIzquierda,
            null, null, null, this.enemigoNoSueloIzquierda.bind(this));

        // Pata deracha del enemigo con el suelo
        this.space.addCollisionHandler(tipoSuelo, tipoEnemigoDerecha,
            null, null, null, this.enemigoNoSueloDerecha.bind(this));

        // Declarar emisor de particulas (parado)
        this._emitter = new cc.ParticleGalaxy.create();
        this._emitter.setEmissionRate(0);
        //this._emitter.texture = cc.textureCache.addImage(res.fire_png);
        this._emitter.shapeType = cc.ParticleSystem.STAR_SHAPE;
        this.tiempoEfecto = 0;
        this.addChild(this._emitter, 10);

        return true;
    },
    update: function (dt) {
        // Control de emisor de partículas
        if (this.tiempoEfecto > 0) {
            this.tiempoEfecto = this.tiempoEfecto - dt;
            this._emitter.x = this.jugador.body.p.x;
            this._emitter.y = this.jugador.body.p.y;
        }

        if (this.tiempoEfecto < 0) {
            this._emitter.setEmissionRate(0);
            this.tiempoEfecto = 0;
        }

        // Control del tiempo del turbo
        if (this.tiempoTurbo > 0) {
            this.tiempoTurbo = this.tiempoTurbo - dt;
        }

        if (this.tiempoTurbo < 0) {
            this.tiempoTurbo = 0;
        }

        this.jugador.actualizar();

        for (i = 0; i < this.enemigos.length; i++) {
            this.enemigos[i].actualizar();
        }

        this.space.step(dt);

        // Scroll
        // Eje X
        var camaraEjeX = this.jugador.body.p.x - this.getContentSize().width / 6;

        if (camaraEjeX < 0) {
            camaraEjeX = 0;
        }

        //Eje Y
        var camaraEjeY = this.jugador.body.p.y - this.getContentSize().height / 2;

        if (camaraEjeY < 0) {
            camaraEjeY = 0;
        }

        if (camaraEjeY > this.mapaAlto - this.getContentSize().height) {
            camaraEjeY = this.mapaAlto - this.getContentSize().height;
        }

        // Mover la capa para que se vea al jugador
        this.setPosition(cc.p(-camaraEjeX, -camaraEjeY));

        // Caída, si cae vuelve a la posición inicial
        if (this.jugador.body.p.y < -100) {
            this.restaurarJugador();
        }

        // Eliminar monedas
        for (var i = 0; i < this.monedasEliminar.length; i++) {
            var shape = this.monedasEliminar[i];

            for (var j = 0; j < this.monedas.length; j++) {
                if (this.monedas[j].shape === shape) {
                    this.monedas[j].eliminar();
                    this.monedas.splice(j, 1);
                }
            }
        }
        this.monedasEliminar = [];

        // Eliminar vidas
        for (var i = 0; i < this.vidasEliminar.length; i++) {
            var shape = this.vidasEliminar[i];

            for (var j = 0; j < this.vidas.length; j++) {
                if (this.vidas[j].shape === shape) {
                    this.vidas[j].eliminar();
                    this.vidas.splice(j, 1);
                }
            }
        }
        this.vidasEliminar = [];

        // Eliminar enemigos
        for (var i = 0; i < this.enemigosEliminar.length; i++) {
            var shape = this.enemigosEliminar[i];

            for (var j = 0; j < this.enemigos.length; j++) {
                if (this.enemigos[j].shape === shape) {
                    this.enemigos[j].eliminar();
                    this.enemigos.splice(j, 1);
                }
            }
        }
        this.vidasEliminar = [];


        // Controlar el angulo (son radianes) max y min.
        if (this.jugador.body.a > 0.44) {
            this.jugador.body.a = 0.44;
        }
        if (this.jugador.body.a < -0.44) {
            this.jugador.body.a = -0.44;
        }
        // controlar la velocidad X , max y min
        if (this.jugador.body.vx < 250) {
            //this.jugador.body.vx = 250;
            this.jugador.body.applyImpulse(cp.v(300, 0), cp.v(0, 0));
        }
        if (this.tiempoTurbo === 0) {
            if (this.jugador.body.vx > 400) {
                this.jugador.body.vx = 400;
            }
        }
        // controlar la velocidad Y , max
        if (this.jugador.body.vy > 450) {
            this.jugador.body.vy = 450;
        }

    },
    cargarMapa: function () {
        this.mapa = new cc.TMXTiledMap(res.mapa1_tmx);
        // Añadirlo a la Layer
        this.addChild(this.mapa);
        // Ancho del mapa
        this.mapaAncho = this.mapa.getContentSize().width;
        this.mapaAlto = this.mapa.getContentSize().height;

        // Solicitar los objeto dentro de la capa Suelos
        var grupoSuelos = this.mapa.getObjectGroup("Suelos");
        var suelosArray = grupoSuelos.getObjects();

        // Los objetos de la capa suelos se transforman a formas estáticas de Chipmunk ( SegmentShape ).
        for (var i = 0; i < suelosArray.length; i++) {
            var suelo = suelosArray[i];
            var puntos = suelo.polylinePoints;
            for (var j = 0; j < puntos.length - 1; j++) {
                var bodySuelo = new cp.StaticBody();

                var shapeSuelo = new cp.SegmentShape(bodySuelo,
                    cp.v(parseInt(suelo.x) + parseInt(puntos[j].x),
                        parseInt(suelo.y) - parseInt(puntos[j].y)),
                    cp.v(parseInt(suelo.x) + parseInt(puntos[j + 1].x),
                        parseInt(suelo.y) - parseInt(puntos[j + 1].y)),
                    10);
                shapeSuelo.setCollisionType(tipoSuelo);

                this.space.addStaticShape(shapeSuelo);
            }
        }
        // Cargar las monedas
        var grupoMonedas = this.mapa.getObjectGroup("Monedas");
        var monedasArray = grupoMonedas.getObjects();
        for (var i = 0; i < monedasArray.length; i++) {
            var moneda = new Moneda(this, cc.p(monedasArray[i]["x"], monedasArray[i]["y"]));
            this.monedas.push(moneda);
        }

        // Cargar enemigos
        var grupoEnemigos = this.mapa.getObjectGroup("Enemigos");
        var enemigosArray = grupoEnemigos.getObjects();
        for (var i = 0; i < enemigosArray.length; i++) {
            var enemigo = new Enemigo(this, cc.p(enemigosArray[i]["x"], enemigosArray[i]["y"]));
            this.enemigos.push(enemigo);
        }

        // Cargar vidas
        var grupoVidas = this.mapa.getObjectGroup("Vidas");
        var vidasArray = grupoVidas.getObjects();
        for (var i = 0; i < vidasArray.length; i++) {
            var vida = new Vida(this, cc.p(vidasArray[i]["x"], vidasArray[i]["y"]));
            this.vidas.push(vida);
        }

        // Cargar pinchos
        var grupoPinchos = this.mapa.getObjectGroup("Pinchos");
        var pinchosArray = grupoPinchos.getObjects();
        for (var i = 0; i < pinchosArray.length; i++) {
            var pincho = new Pincho(this, cc.p(pinchosArray[i]["x"], pinchosArray[i]["y"]));
            this.pinchos.push(pincho);
        }

    },
    collisionSueloConJugador: function (arbiter, space) {
        this.jugador.tocaSuelo();
    },
    finCollisionSueloConJugador: function (arbiter, space) {
        this.jugador.dejaDeTocarSuelo();
        //this.jugador.estado = estadoSaltando;
    },
    collisionJugadorConMoneda: function (arbiter, space) {
        // Emisión de partículas
        this._emitter.setEmissionRate(5);
        this.tiempoEfecto = 3;

        // Impulso extra
        this.jugador.body.applyImpulse(cp.v(300, 0), cp.v(0, 0));

        // Marcar la moneda para eliminarla
        var shapes = arbiter.getShapes();
        // shapes[0] es el jugador
        this.monedasEliminar.push(shapes[1]);
        var capaControles =
            this.getParent().getChildByTag(idCapaControles);
        capaControles.agregarMoneda();

    },
    collisionEnemigoConJugador: function (arbiter, space) {
        this.jugador.impactado();

        // Eliminar al enemigo
        var shapes = arbiter.getShapes();
        this.enemigosEliminar.push(shapes[0]);
        this.jugador.restarVida();

        // El jugador vuelve a la posición inicial en caso de perder todas las vidas
        // No se reinicia el nivel, solo lo coloco de nuevo en el principio y le asigno 3 vidas
        if (this.jugador.vidas === 0) {
            this.restaurarJugador();
        } else {
            this.notificarCambioVidas();
        }

    },
    enemigoNoSueloDerecha: function (arbiter, space) {
        var shapes = arbiter.getShapes();
        var pataDerecha = shapes[1];
        for (var i = 0; i < this.enemigos.length; i++) {
            if (pataDerecha === this.enemigos[i].shapeDercha) {
                this.enemigos[i].orientacion = -1;
            }
        }
    },
    enemigoNoSueloIzquierda: function (arbiter, space) {
        var shapes = arbiter.getShapes();
        var pataIzquierda = shapes[1];
        for (var i = 0; i < this.enemigos.length; i++) {
            if (pataIzquierda === this.enemigos[i].shapeIzquierda) {
                this.enemigos[i].orientacion = 1;
            }
        }
    },
    collisionJugadorConVida: function (arbiter, space) {
        var shapes = arbiter.getShapes();
        this.vidasEliminar.push(shapes[1]);
        this.jugador.sumarVida();
        this.notificarCambioVidas();
    },
    notificarCambioVidas: function () {
        var capaControles =
            this.getParent().getChildByTag(idCapaControles);
        capaControles.actualizarInterfazVidas();
    },
    restaurarJugador: function () {
        this.jugador.body.p = cc.p(50, 150);
        this.jugador.vidas = 3;
        this.jugador.turbos = 3;
        var capaControles = this.getParent().getChildByTag(idCapaControles);
        capaControles.actualizarInterfazVidas();
        capaControles.actualizarInterfazTurbos();
        this.jugador.estado = estadoCaminando;
        this.tiempoTurbo = 0;
    },
    collisionJugadorConPincho: function () {
        // Al pincharse, el jugador pierde directamente
        this.restaurarJugador();
    }


});

var idCapaJuego = 1;
var idCapaControles = 2;

var GameScene = cc.Scene.extend({
    onEnter: function () {
        this._super();
        var layer = new GameLayer();
        this.addChild(layer, 0, idCapaJuego);
        var controlesLayer = new ControlesLayer();
        this.addChild(controlesLayer, 0, idCapaControles);
    }
});
