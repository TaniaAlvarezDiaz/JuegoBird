var tipoLimite = 1;
var tipoJugador = 2;
var tipoEnemigo = 4;
var tipoEnemigoDerecha = 5;
var tipoEnemigoIzquierda = 6;
var tipoPieJugador = 7;
var tipoVida = 8;
var tipoDisparoJugador = 9;
var tipoDisparoEnemigo = 10;
var tipoModoControl = 11;
var tipoHuevo = 12;

var nivel = 1;

var controles = {};
var teclas = [];

var GameLayer = cc.Layer.extend({
    ctor: function () {
        this._super();
        var size = cc.winSize;
        console.log("nivel: " + nivel);

        // Zona de cache
        cc.spriteFrameCache.addSpriteFrames(res.jugador_plist);
        cc.spriteFrameCache.addSpriteFrames(res.vida_plist);
        cc.spriteFrameCache.addSpriteFrames(res.jugador_saltar_plist);
        cc.spriteFrameCache.addSpriteFrames(res.jugador_impactado_plist);
        // nivel cielo
        cc.spriteFrameCache.addSpriteFrames(res.nubeBlanca_plist);
        cc.spriteFrameCache.addSpriteFrames(res.nubeNegra_plist);
        cc.spriteFrameCache.addSpriteFrames(res.huevoOro_plist);
        cc.spriteFrameCache.addSpriteFrames(res.buitre_plist);
        // nivel bosque
        cc.spriteFrameCache.addSpriteFrames(res.bat_plist);
        cc.spriteFrameCache.addSpriteFrames(res.dragon_plist);

        // Inicializar Space
        this.space = new cp.Space();
        this.space.gravity = cp.v(0, -350);

        // Depuración
        //this.depuracion = new cc.PhysicsDebugNode(this.space);
        //this.addChild(this.depuracion, 10);

        this.vidas = [];
        this.modosControl = [];
        this.enemigos = [];
        this.enemigosConDisparo = [];
        this.enemigosVoladores = [];
        this.huevosOro = [];
        this.disparosJugador = [];
        this.disparosEnemigo = [];
        this.huevosEliminar = [];
        this.vidasEliminar = [];
        this.enemigosEliminar = [];
        this.disparosEnemigosEliminar = [];
        this.modosControlEliminar = [];
        this.tiempoTurbo = 0;
        this.numVecesSaltar = 0;
        this.numVecesDisparo = 0;
        this.numVecesPicotazo = 0;
        this.imagenDisparoJugador = null;
        this.imagenDisparoEnemigo = null;
        this.imagenEnemigoParabola = null;
        this.imagenEnemigoVolador = null;
        this.framesEnemigoVolador = null;
        this.numIteraccionesDisparos = 0;
        this.numIteraccionesParabolas = 0;
        this.numIteraccionesEnemigosVoladores = 0;

        this.jugador = new Jugador(this, cc.p(50, 150));

        // true = SPACE = SALTANDO
        // false = W = JetPack
        this.modoControl = true;

        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed: this.procesarKeyPressed.bind(this),
            onKeyReleased: this.procesarKeyReleased.bind(this)
        }, this);

        this.cargarMapa();
        this.scheduleUpdate();

        // Zona de escuchadores de colisiones

        // Suelo y Jugador (en lugar de con toda la caja que envuelve al jugador, solo tendré en cuenta el "pie")
        /*this.space.addCollisionHandler(tipoSuelo, tipoJugador,
            null, null, this.collisionSueloConJugador.bind(this), this.finCollisionSueloConJugador.bind(this));*/

        // Suelo y pie del jugador
        /*this.space.addCollisionHandler(tipoSuelo, tipoPieJugador,
            null, null, this.collisionSueloConJugador.bind(this), this.finCollisionSueloConJugador.bind(this));*/
        this.space.addCollisionHandler(tipoLimite, tipoPieJugador,
            null, this.collisionSueloConJugador.bind(this), null, this.finCollisionSueloConJugador.bind(this));

        // Jugador y huevo
        // IMPORTANTE: Invocamos el método antes de resolver la colisión (realmente no habrá colisión por la propiedad SENSOR del Huevo).
        this.space.addCollisionHandler(tipoJugador, tipoHuevo,
            null, this.collisionJugadorConHuevo.bind(this), null, null);

        // Jugador y vida
        this.space.addCollisionHandler(tipoJugador, tipoVida,
            null, this.collisionJugadorConVida.bind(this), null, null);

        //Enemigo y jugador (y con pictazo)
        this.space.addCollisionHandler(tipoEnemigo, tipoJugador,
            null, null, this.collisionEnemigoConJugador.bind(this), null);

        //DisparoEnemigo y jugador
        this.space.addCollisionHandler(tipoDisparoEnemigo, tipoJugador,
            null, null, this.collisionDisparoEnemigoConJugador.bind(this), null);

        //DisparoJugador y enemigo
        this.space.addCollisionHandler(tipoDisparoJugador, tipoEnemigo,
            null, null, this.collisionDisparoJugadorConEnemigo.bind(this), null);

        //DisparoEnemigo y disparoJugador
        this.space.addCollisionHandler(tipoDisparoEnemigo, tipoDisparoJugador,
            null, null, this.collisionDisparoEnemigoConDisparoJugador.bind(this), null);

        //Cambiar modo de juego
        this.space.addCollisionHandler(tipoModoControl, tipoJugador,
            null, null, this.collisionModoControlConJugador.bind(this), null);

        // Jugador y pinchos
        /*this.space.addCollisionHandler(tipoJugador, tipoPincho,
            null, this.collisionJugadorConPincho.bind(this), null, null);*/

        // Nota: Las colisiones de las patas las he hecho de manera distinta al guión.
        // En el guión se gestionaba en el Enemigo, pero solamente afectaba al último enemigo que se colocaba,
        // ya que el manejador se machacaba cada vez que se creaba un nuevo enemigo.

        // Pata izquierda del enemigo con el suelo
        this.space.addCollisionHandler(tipoLimite, tipoEnemigoIzquierda,
            null, null, null, this.enemigoNoSueloIzquierda.bind(this));

        // Pata derecha del enemigo con el suelo
        this.space.addCollisionHandler(tipoLimite, tipoEnemigoDerecha,
            null, null, null, this.enemigoNoSueloDerecha.bind(this));

        return true;
    },
    update: function (dt) {
        this.procesarControles();

        // Control del tiempo del turbo
        if (this.tiempoTurbo > 0) {
            this.tiempoTurbo = this.tiempoTurbo - dt;
        }

        if (this.tiempoTurbo < 0) {
            this.tiempoTurbo = 0;
        }

        this.jugador.actualizar();

        this.space.step(dt);

        //Limites de la pantalla
        var posX1 = this.jugador.body.p.x - this.getContentSize().width/4;
        var posX2 = posX1 + this.getContentSize().width;

        var posY1 = this.jugador.body.p.y - this.getContentSize().height/4;
        var posY2 = posY1 + this.getContentSize().height;

        // Generar disparos enemigo
        this.numIteraccionesDisparos ++;
        if (this.numIteraccionesDisparos > 75) {
            var arrayEnemigosEnPantalla = [];
            for(j=0; j < this.enemigosConDisparo.length; j++){
                if(this.enemigosConDisparo[j].body.p.x < posX2 && this.enemigosConDisparo[j].body.p.x > posX1){
                    arrayEnemigosEnPantalla.push(j);
                }
            }
            if(arrayEnemigosEnPantalla[0] != undefined){
                var r = Math.floor(Math.random() *(arrayEnemigosEnPantalla.length));
                var enemigo = arrayEnemigosEnPantalla[r];
                var d = new Disparo(this,cc.p(this.enemigosConDisparo[enemigo].body.p.x-35,this.enemigosConDisparo[enemigo].body.p.y),
                    tipoDisparoEnemigo, this.imagenDisparoEnemigo);
                this.disparosEnemigo.push(d);
                this.numIteraccionesDisparos = 0;
            }
        }

        //Generar enemigos con parabolas (escoge aleatoriamente velocidades para X e Y -> diferentes parabolas)
        this.numIteraccionesParabolas ++;
        if (this.numIteraccionesParabolas > 175) {
            //numero random del eje X, entre el limite de la pantalla y el jugador
            var r = Math.floor(Math.random() *(posX2 - (this.jugador.body.p.x + 150)) + (this.jugador.body.p.x + 150));
            var arrayVelocidad = [];
            var velocidadX_menos = Math.floor(Math.random() *(1500 - 600) + 600);
            var velocidadX_mas = Math.floor(Math.random() *(1500 - 600) + 600);
            arrayVelocidad.push(-velocidadX_menos);
            arrayVelocidad.push(velocidadX_mas);
            var velocidadX = Math.round(Math.random());
            var velocidadY = Math.floor(Math.random() *(3000 - 2000) + 2000);
            var enemigoParabola = new EnemigoParabola(this,this.imagenEnemigoParabola,cc.p(r,-20),arrayVelocidad[velocidadX],velocidadY);
            this.enemigos.push(enemigoParabola);
            this.numIteraccionesParabolas = 0;
        }

        //Crear y actualizar enemigos que vuelan
        this.numIteraccionesEnemigosVoladores ++;
        if (this.numIteraccionesEnemigosVoladores > 200) {
            var volador = new EnemigoVolador(this,cc.p(this.jugador.body.p.x +this.getContentSize().width,this.jugador.body.p.y),
                this.imagenEnemigoVolador, this.framesEnemigoVolador);
            this.enemigosVoladores.push(volador);
            this.numIteraccionesEnemigosVoladores = 0;
        }
        for(i=0; i < this.enemigosVoladores.length; i++) {
            if (this.numIteraccionesEnemigosVoladores > 50) {
                this.enemigosVoladores[i].actualizar(0,50);
            }
            else{
                this.enemigosVoladores[i].actualizar(-40, 10);
            }
            if(this.enemigosVoladores[i].body.p.x < posX1){ //Si esta fuera de la pantalla
                this.enemigosVoladores[i].eliminar();
                this.enemigosVoladores.splice(i, 1);
            }
        }

        //Actualizar disparos enemigo
        for (var i = 0; i < this.disparosEnemigosEliminar.length; i++) {
            var shape = this.disparosEnemigosEliminar[i];
            for(j=0; j < this.disparosEnemigo.length; j++){
                if (this.disparosEnemigo[j].shape == shape) {
                    this.disparosEnemigo[j].eliminar();
                    this.disparosEnemigo.splice(j, 1);
                }
            }
            for(j=0; j < this.disparosJugador.length; j++){ //Eliminamos los disparos del jugador cuando choca con disparos de enemigo
                if (this.disparosJugador[j].shape == shape) {
                    this.disparosJugador[j].eliminar();
                    this.disparosJugador.splice(j, 1);
                }
            }
        }
        this.disparosEnemigosEliminar = [];
        for(i=0; i < this.disparosEnemigo.length; i++){
            this.disparosEnemigo[i].actualizar(-100);
            if(this.disparosEnemigo[i].body.p.x > posX2 || this.disparosEnemigo[i].body.p.x < posX1){ //Si esta fuera de la pantalla
                this.disparosEnemigo[i].eliminar();
                this.disparosEnemigo.splice(i, 1);
            }
        }

        //Crear disparos jugador
        if(this.jugador.disparo == estadoDisparando){
            if(this.numVecesDisparo < 1){
                var d = new Disparo(this,cc.p(this.jugador.body.p.x+15,this.jugador.body.p.y),
                    tipoDisparoJugador, this.imagenDisparoJugador);
                this.disparosJugador.push(d);
                this.numVecesDisparo++;
            }
        }
        //Actualizar disparos jugador
        for(i=0; i < this.disparosJugador.length; i++){
            this.disparosJugador[i].actualizar(100);
            if(this.disparosJugador[i].body.p.x > posX2 || this.disparosJugador[i].body.p.x < posX1){ //Si esta fuera de la pantalla
                this.disparosJugador[i].eliminar();
                this.disparosJugador.splice(i, 1);
            }
        }

        // Scroll
        // Eje X
        var camaraEjeX = this.jugador.body.p.x - this.getContentSize().width / 6;
        if (camaraEjeX < 0) {
            camaraEjeX = 0;
        }
        if ( camaraEjeX > this.mapaAncho - this.getContentSize().width ){
            camaraEjeX = this.mapaAncho - this.getContentSize().width;
        }

        //Eje Y
        var camaraEjeY = this.jugador.body.p.y - this.getContentSize().height / 1.25;
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

        // Eliminar huevos
        for (var i = 0; i < this.huevosEliminar.length; i++) {
            var shape = this.huevosEliminar[i];
            for (var j = 0; j < this.huevosOro.length; j++) {
                if (this.huevosOro[j].shape === shape) {
                    this.huevosOro[j].eliminar();
                    this.huevosOro.splice(j, 1);
                }
            }
        }
        this.huevosEliminar = [];

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
            for (var j = 0; j < this.enemigosConDisparo.length; j++) {
                if (this.enemigosConDisparo[j].shape === shape) {
                    this.enemigosConDisparo[j].eliminar();
                    this.enemigosConDisparo.splice(j, 1);
                }
            }
            for (var j = 0; j < this.enemigosVoladores.length; j++) {
                if (this.enemigosVoladores[j].shape === shape) {
                    this.enemigosVoladores[j].eliminar();
                    this.enemigosVoladores.splice(j, 1);
                }
            }
        }
        this.enemigosEliminar = [];

        //Eliminar modo control
        for (var i = 0; i < this.modosControlEliminar.length; i++) {
            var shape = this.modosControlEliminar[i];
            for (var j = 0; j < this.modosControl.length; j++) {
                if (this.modosControl[j].shape === shape) {
                    this.modosControl[j].eliminar();
                    this.modosControl.splice(j, 1);
                }
            }
        }
        this.modosControlEliminar = [];

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

        //Pasar al siguiente nivel
        if(this.jugador.body.p.x >= 0.99 * this.mapaAncho){
            if(nivel == 3){
                //nivel = 1;
                cc.director.pause();
                this.getParent().addChild(new EndGameLayer());
            }
            else{
                nivel++;
                cc.director.pause();
                this.getParent().addChild(new GameNextLayer());
            }
        }
    },
    cargarMapa: function () {
        if(nivel == 1){
            this.mapa = new cc.TMXTiledMap(res.mapaCielo_tmx);
            this.imagenDisparoJugador = res.boomerang_png;
            this.imagenDisparoEnemigo = res.rayo_png;
            this.imagenEnemigoParabola = res.pelota;
            this.imagenEnemigoVolador = "animacion_buitre_0";
            this.framesEnemigoVolador = 8;
        }
        else if(nivel == 2){ //Cambiar para el nivel 2
            this.mapa = new cc.TMXTiledMap(res.mapaBosque_tmx);
            this.imagenDisparoJugador = res.arrow_png;
            this.imagenDisparoEnemigo = res.fire_png;
            this.imagenEnemigoParabola = res.kite_png;
            this.imagenEnemigoVolador = "bat_0";
            this.framesEnemigoVolador = 3;
            //Meter en el array this.enemigosConDisparo los enemigos que tengan disparo
            //Meter el resto de enemigos en this.enemigos
        }
        else if(nivel == 3){ //Cambiar para el nivel 3
            this.mapa = new cc.TMXTiledMap(res.mapaCielo_tmx);
            this.imagenDisparoJugador = res.boomerang_png
            this.imagenDisparoEnemigo = res.rayo_png;
            this.imagenEnemigoParabola = res.pelota;
            this.imagenEnemigoVolador = "animacion_buitre_0";
            this.framesEnemigoVolador = 8;
            //Meter en el array this.enemigosConDisparo los enemigos que tengan disparo
            //Meter el resto de enemigos en this.enemigos
        }
        // Añadirlo a la Layer
        this.addChild(this.mapa);
        // Ancho del mapa
        this.mapaAncho = this.mapa.getContentSize().width;
        this.mapaAlto = this.mapa.getContentSize().height;

        // Solicitar los objeto dentro de la capa Suelos
        var grupoLimites = this.mapa.getObjectGroup("Limites");
        var limitesArray = grupoLimites.getObjects();

        // Los objetos de la capa suelos se transforman a formas estáticas de Chipmunk ( SegmentShape ).
        for (var i = 0; i < limitesArray.length; i++) {
            var limite = limitesArray[i];
            var puntos = limite.polylinePoints;
            for (var j = 0; j < puntos.length - 1; j++) {
                var bodyLimite = new cp.StaticBody();
                var shapeLimite = new cp.SegmentShape(bodyLimite,
                    cp.v(parseInt(limite.x) + parseInt(puntos[j].x),
                        parseInt(limite.y) - parseInt(puntos[j].y)),
                    cp.v(parseInt(limite.x) + parseInt(puntos[j + 1].x),
                        parseInt(limite.y) - parseInt(puntos[j + 1].y)),
                    10);
                shapeLimite.setCollisionType(tipoLimite);
                this.space.addStaticShape(shapeLimite);
            }
        }
        if(nivel == 1){ //Para el nivel cielo
            // Cargar nubes blancas
            var grupoNubesBlancas = this.mapa.getObjectGroup("NubesBlancas");
            var nubesBlancasArray = grupoNubesBlancas.getObjects();
            for (var i = 0; i < nubesBlancasArray.length; i++) {
                var nube = new NubeBlanca(this, cc.p(nubesBlancasArray[i]["x"], nubesBlancasArray[i]["y"]));
                this.enemigos.push(nube);
                /*var nube = new Obstaculo(this, cc.p(nubesBlancasArray[i]["x"], nubesBlancasArray[i]["y"], "#Animación-Nube-Est_01.png", "Animación-Nube-Est_0", 7, true, nivel));
                this.enemigos.push(nube);*/
            }
            // Cargar nubes negras
            var grupoNubesNegra = this.mapa.getObjectGroup("NubesNegras");
            var nubesNegrasArray = grupoNubesNegra.getObjects();
            for (var i = 0; i < nubesNegrasArray.length; i++) {
                var nube = new EnemigoDisparador(this, cc.p(nubesNegrasArray[i]["x"], nubesNegrasArray[i]["y"]), "#Animación-Nube-Ataque_01.png", "Animación-Nube-Ataque_0", 8);
                this.enemigosConDisparo.push(nube);
            }
        }
        else if(nivel == 2){
            //Cargar árboles (troncos)
            var grupoTroncos = this.mapa.getObjectGroup("Troncos");
            var troncosArray = grupoTroncos.getObjects();
            /*for (var i = 0; i < troncosArray.length; i++) {
                var tronco = new Obstaculo(this, cc.p(troncosArray[i]["x"], troncosArray[i]["y"], res.tronco_png , res.tronco_png, 1, false, nivel));
                this.enemigos.push(tronco);
            }*/

            //Cargar dragones
            var grupoDragones = this.mapa.getObjectGroup("Dragones");
            var dragonesArray = grupoDragones.getObjects();
            for (var i = 0; i < dragonesArray.length; i++) {
                var dragon = new EnemigoDisparador(this, cc.p(dragonesArray[i]["x"], dragonesArray[i]["y"]), "#dragon_01.png", "dragon_0", 3);
                this.enemigosConDisparo.push(dragon);
            }
        }
        else if(nivel == 3){
            //Implementar para el nivel 3
        }
        // Cargar huevos de oro
        var grupohuevos = this.mapa.getObjectGroup("Huevos");
        var huevosArray = grupohuevos.getObjects();
        for (var i = 0; i < huevosArray.length; i++) {
            var huevo = new HuevoOro(this, cc.p(huevosArray[i]["x"], huevosArray[i]["y"]));
            this.huevosOro.push(huevo);
        }
        // Cargar modos de control
        var grupomodoControl = this.mapa.getObjectGroup("ModoControl");
        var modoControlArray = grupomodoControl.getObjects();
        for (var i = 0; i < modoControlArray.length; i++) {
            var control = new ModoControl(this, cc.p(modoControlArray[i]["x"], modoControlArray[i]["y"]));
            this.modosControl.push(control);
        }

    },
    collisionSueloConJugador: function (arbiter, space) {
        this.jugador.tocaSuelo();
    },
    finCollisionSueloConJugador: function (arbiter, space) {
        this.jugador.dejaDeTocarSuelo();
        //this.jugador.estado = estadoSaltando;
    },
    collisionJugadorConHuevo: function (arbiter, space) {
        // Emisión de partículas
        /*this._emitter.setEmissionRate(5);
        this.tiempoEfecto = 3;

        // Impulso extra
        this.jugador.body.applyImpulse(cp.v(300, 0), cp.v(0, 0));*/

        // Marcar el huevo para eliminarla
        var shapes = arbiter.getShapes();
        // shapes[0] es el jugador
        this.huevosEliminar.push(shapes[1]);
        var capaControles =
            this.getParent().getChildByTag(idCapaControles);
        capaControles.agregarHuevos();

    },
    collisionEnemigoConJugador: function (arbiter, space) {
        if(this.jugador.picotazo != estadoPicotazo){
            this.jugador.impactado();
            console.log("IMPACTADO");
            var shapes = arbiter.getShapes();
            this.enemigosEliminar.push(shapes[0]);
            if (this.jugador.vidas === 0) {
                this.restaurarJugador();
            }
            else{
                this.notificarCambioVidas();
            }
        }
        else if(this.jugador.picotazo == estadoPicotazo){
            // Eliminar al enemigo
            var shapes = arbiter.getShapes();
            this.enemigosEliminar.push(shapes[0]);
        }
    },
    collisionDisparoEnemigoConJugador: function (arbiter, space) {
        this.jugador.impactado();
        var shapes = arbiter.getShapes();
        this.disparosEnemigosEliminar.push(shapes[0]);
        if (this.jugador.vidas == 0) {
            this.restaurarJugador();
        } else {
            this.notificarCambioVidas();
        }
    },
    collisionDisparoJugadorConEnemigo: function (arbiter, space) {
    var shapes = arbiter.getShapes();
    this.disparosEnemigosEliminar.push(shapes[0]);
    this.enemigosEliminar.push(shapes[1]);
    },
    collisionDisparoEnemigoConDisparoJugador: function (arbiter, space) {
        var shapes = arbiter.getShapes();
        this.disparosEnemigosEliminar.push(shapes[0]);
        this.disparosEnemigosEliminar.push(shapes[1]);
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
    collisionModoControlConJugador: function (arbiter, space) {
        if(this.modoControl == true){
            this.modoControl = false;
        }
        else{
            this.modoControl = true;
        }
        var shapes = arbiter.getShapes();
        this.modosControlEliminar.push(shapes[0]);
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
        this.jugador.estado = estadoSaltando;
        this.tiempoTurbo = 0;
    },
    collisionJugadorConPincho: function () {
        // Al pincharse, el jugador pierde directamente
        this.restaurarJugador();
    },
    procesarKeyPressed:function(keyCode){
        var posicion = teclas.indexOf(keyCode);
        if (posicion == -1 ) {
            teclas.push(keyCode);
            switch (keyCode ){
                case 32:
                    // saltar - barra espaciadora
                    if(this.modoControl == true){
                        controles.saltar = 1;
                    }
                    break;
                case 87:
                    // jetpack - tecla W
                    if(this.modoControl  == false){
                        controles.jetpack = 1;
                    }
                    break;
                case 68:
                    // disparo - tecla D
                    controles.disparo = 1;
                    break;
                case 83:
                    // picotazo - tecla S
                    controles.picotazo = 1;
                    break;
            }
        }
    },
    procesarKeyReleased(keyCode){
        var posicion = teclas.indexOf(keyCode);
        teclas.splice(posicion, 1);
        switch (keyCode){
            case 32:
                //saltar - barra espaciadora
                if (controles.saltar == 1){
                    controles.saltar = 0;
                    this.numVecesSaltar = 0; //reseteamos variable (para asegurarnos que solo salta una vez)
                }
                break;
            case 87:
                //jetpack - tecla W
                if (controles.jetpack == 1){
                    controles.jetpack = 0;
                }
                break;
            case 68:
                // disparo - tecla D
                if (controles.disparo == 1){
                    controles.disparo = 0;
                    this.numVecesDisparo = 0; //contador para que solo dispare una vez al darle a la tecla
                }
                break;
            case 83:
                // picotazo - tecla S
                if (controles.picotazo == 1){
                    controles.picotazo = 0;
                    this.numVecesPicotazo = 0; //contador para que solo de picotazo una vez al darle a la tecla
                }
                break;
        }
    },
    procesarControles:function(){
        this.jugador.saltar(controles.saltar);
        this.jugador.jetpack(controles.jetpack);
        this.jugador.disparar(controles.disparo);
        this.jugador.darPicotazo(controles.picotazo);
    }

});

var idCapaJuego = 1;
var idCapaControles = 2;

var GameScene = cc.Scene.extend({
    onEnter: function () {
        this._super();
        var layer = new GameLayer();
        cc.director.resume();
        this.addChild(layer, 0, idCapaJuego);
        var controlesLayer = new ControlesLayer();
        this.addChild(controlesLayer, 0, idCapaControles);
    }
});
