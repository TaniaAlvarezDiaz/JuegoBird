var tipoLimite = 1;
var tipoJugador = 2;
var tipoEnemigoExplosivo = 3;
var tipoEnemigo = 4;
var tipoVida = 5;
var tipoDisparoJugador = 6;
var tipoDisparoEnemigo = 7;
var tipoModoControl = 8;
var tipoHuevo = 9;
var tipoRecolectableInmune = 10;
var tipoRecolectableCongelar = 11;

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
        cc.spriteFrameCache.addSpriteFrames(res.jugador_impactado_plist);
        cc.spriteFrameCache.addSpriteFrames(res.jugador_inmune_plist);
        cc.spriteFrameCache.addSpriteFrames(res.recolectable_inmune_plist);
        cc.spriteFrameCache.addSpriteFrames(res.enemigo_bomba_plist);
        // nivel cielo
        cc.spriteFrameCache.addSpriteFrames(res.nubeBlanca_plist);
        cc.spriteFrameCache.addSpriteFrames(res.nubeNegra_plist);
        cc.spriteFrameCache.addSpriteFrames(res.huevoOro_plist);
        cc.spriteFrameCache.addSpriteFrames(res.buitre_plist);
        // nivel bosque
        cc.spriteFrameCache.addSpriteFrames(res.bat_plist);
        cc.spriteFrameCache.addSpriteFrames(res.dragon_plist);
        //nivel agua
        cc.spriteFrameCache.addSpriteFrames(res.pez_plist);

        // Inicializar Space
        this.space = new cp.Space();
        if (nivel === 1) {
            this.space.gravity = cp.v(0, -300); // Cuando más arriba, menor es la fuerza de la gravedad
        } else if (nivel === 2) {
            this.space.gravity = cp.v(0, -350);
        } else if (nivel === 3) {
            this.space.gravity = cp.v(0, -250); // Bajo el agua un cuerpo se hunde lentamente
        }


        // Depuración
        //this.depuracion = new cc.PhysicsDebugNode(this.space);
        //this.addChild(this.depuracion, 10);

        this.iniciarJuego = false;
        this.vidas = [];
        this.modosControl = [];
        this.enemigos = [];
        this.enemigosConDisparo = [];
        this.enemigosVoladores = [];
        this.huevosOro = [];
        this.recolectablesInmune = [];
        this.disparosJugador = [];
        this.disparosEnemigo = [];
        this.huevosEliminar = [];
        this.vidasEliminar = [];
        this.recolectablesInmuneEliminar = [];
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
        this.record = 0;
        this.tiempoRefrescarRecord = 0.5;
        this.recolectablesCongelar = [];
        this.recolectablesCongelarEliminar = [];
        this.enemigosExplosivos = [];
        this.enemigosExplosivosEliminar = [];
        this.tiempoCongelacion = 0;

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

        // Jugador y huevo
        // IMPORTANTE: Invocamos el método antes de resolver la colisión (realmente no habrá colisión por la propiedad SENSOR del Huevo).
        this.space.addCollisionHandler(tipoJugador, tipoHuevo,
            null, this.collisionJugadorConHuevo.bind(this), null, null);

        // Jugador y vida
        this.space.addCollisionHandler(tipoJugador, tipoVida,
            null, this.collisionJugadorConVida.bind(this), null, null);

        //Jugador y recolectable inmune
        this.space.addCollisionHandler(tipoJugador, tipoRecolectableInmune,
            null, this.collisionJugadorConRecolectableInmune.bind(this), null, null);

        //Jugador y recolectable congelar
        this.space.addCollisionHandler(tipoJugador, tipoRecolectableCongelar,
            null, this.collisionJugadorConRecolectableCongelar.bind(this), null, null);

        //Jugador y bomba
        this.space.addCollisionHandler(tipoJugador, tipoEnemigoExplosivo,
            null, this.collisionJugadorConEnemigoExplosivo.bind(this), null, null);

        //Enemigo y jugador (y con pictazo)
        this.space.addCollisionHandler(tipoEnemigo, tipoJugador,
            null, this.collisionEnemigoConJugador.bind(this), null, null);

        //DisparoEnemigo y jugador
        this.space.addCollisionHandler(tipoDisparoEnemigo, tipoJugador,
            null, this.collisionDisparoEnemigoConJugador.bind(this), null, null);

        //DisparoJugador y enemigo
        this.space.addCollisionHandler(tipoDisparoJugador, tipoEnemigo,
            null, null, this.collisionDisparoJugadorConEnemigo.bind(this), null);

        //DisparoJugador y enemigoExplosivo
        this.space.addCollisionHandler(tipoDisparoJugador, tipoEnemigoExplosivo,
            null, null, this.collisionDisparoJugadorConEnemigoExplosivo.bind(this), null);

        //DisparoEnemigo y disparoJugador
        this.space.addCollisionHandler(tipoDisparoEnemigo, tipoDisparoJugador,
            null, null, this.collisionDisparoEnemigoConDisparoJugador.bind(this), null);

        //Cambiar modo de juego
        this.space.addCollisionHandler(tipoModoControl, tipoJugador,
            null, this.collisionModoControlConJugador.bind(this), null, null);

        return true;
    },
    update: function (dt) {
        if(this.iniciarJuego == true) {

            this.procesarControles();

            // Record
            var posicionActual = Math.floor(this.jugador.body.p.x / 32);
            if (posicionActual > this.record) {
                this.record = posicionActual;
            }
            if (this.tiempoRefrescarRecord < 0) {
                this.notificarCambioRecord();
                this.tiempoRefrescarRecord = 0.5;
            } else {
                this.tiempoRefrescarRecord = this.tiempoRefrescarRecord - dt;
            }

            // Control del tiempo del turbo
            if (this.tiempoTurbo > 0) {
                this.tiempoTurbo = this.tiempoTurbo - dt;
            }

            if (this.tiempoTurbo < 0) {
                this.tiempoTurbo = 0;
            }

            if (this.tiempoCongelacion > 0) {
                this.tiempoCongelacion--;
            } else {
                this.tiempoCongelacion = 0;
            }

            this.jugador.actualizar();

            this.space.step(dt);

            //Limites de la pantalla
            var posX1 = this.jugador.body.p.x - this.getContentSize().width / 4;
            var posX2 = posX1 + this.getContentSize().width;

            var posY1 = this.jugador.body.p.y - this.getContentSize().height / 4;
            var posY2 = posY1 + this.getContentSize().height;

            if (this.tiempoCongelacion <= 0) {

                // Generar disparos enemigo
                this.numIteraccionesDisparos++;
                if (this.numIteraccionesDisparos > 75) {
                    var arrayEnemigosEnPantalla = [];
                    for (j = 0; j < this.enemigosConDisparo.length; j++) {
                        if (this.enemigosConDisparo[j].body.p.x < posX2 && this.enemigosConDisparo[j].body.p.x > posX1) {
                            arrayEnemigosEnPantalla.push(j);
                        }
                    }
                    if (arrayEnemigosEnPantalla[0] != undefined) {
                        var r = Math.floor(Math.random() * (arrayEnemigosEnPantalla.length));
                        var enemigo = arrayEnemigosEnPantalla[r];
                        var d = new Disparo(this, cc.p(this.enemigosConDisparo[enemigo].body.p.x - 35, this.enemigosConDisparo[enemigo].body.p.y),
                            tipoDisparoEnemigo, this.imagenDisparoEnemigo);
                        this.disparosEnemigo.push(d);
                        this.numIteraccionesDisparos = 0;
                    }
                }

                //Generar enemigos con parabolas (escoge aleatoriamente velocidades para X e Y -> diferentes parabolas)
                this.numIteraccionesParabolas++;
                if (this.numIteraccionesParabolas > 175) {
                    //numero random del eje X, entre el limite de la pantalla y el jugador
                    var r = Math.floor(Math.random() * (posX2 - (this.jugador.body.p.x + 150)) + (this.jugador.body.p.x + 150));
                    var arrayVelocidad = [];
                    var velocidadX_menos = Math.floor(Math.random() * (1500 - 600) + 600);
                    var velocidadX_mas = Math.floor(Math.random() * (1500 - 600) + 600);
                    arrayVelocidad.push(-velocidadX_menos);
                    arrayVelocidad.push(velocidadX_mas);
                    var velocidadX = Math.round(Math.random());
                    var velocidadY = Math.floor(Math.random() * (3000 - 2000) + 2000);
                    var enemigoParabola = new EnemigoParabola(this, this.imagenEnemigoParabola, cc.p(r, -20), arrayVelocidad[velocidadX], velocidadY);
                    enemigoParabola.permiteClonacion = true;
                    this.enemigos.push(enemigoParabola);
                    this.numIteraccionesParabolas = 0;
                }

                // Clonación de enemigos con parábolas, el enemigo original desaparece y genera dos clones
                for (var i = 0; i < this.enemigos.length; i++) {
                    var enemigo = this.enemigos[i];
                    if (enemigo.tipo && enemigo.tipo === "enemigoParabolico" && !enemigo.clonado && enemigo.permiteClonacion && enemigo.body.p.y > 150) {
                        enemigo.clonado = true;
                        //console.log("Generar clones");
                        this.enemigosEliminar.push(enemigo.shape);
                        var direccionEnemigo = 1; // Dcha por defecto
                        if (enemigo.body.vx < 0) {
                            direccionEnemigo = -1; // Izq
                        }
                        var primerClon = new EnemigoParabola(this, this.imagenEnemigoParabola, cc.p(enemigo.body.p.x, enemigo.body.p.y + 25), enemigo.body.vx + 500 * direccionEnemigo, enemigo.body.vy + 1000);
                        var segundoClon = new EnemigoParabola(this, this.imagenEnemigoParabola, cc.p(enemigo.body.p.x, enemigo.body.p.y - 25), enemigo.body.vx + 200 * direccionEnemigo, enemigo.body.vy + 600);
                        this.enemigos.push(primerClon);
                        this.enemigos.push(segundoClon);
                    }
                }

                //Crear y actualizar enemigos que vuelan
                this.numIteraccionesEnemigosVoladores++;
                if (this.numIteraccionesEnemigosVoladores > 200) {
                    var volador = new EnemigoVolador(this, cc.p(this.jugador.body.p.x + this.getContentSize().width, this.jugador.body.p.y),
                        this.imagenEnemigoVolador, this.framesEnemigoVolador);
                    this.enemigosVoladores.push(volador);
                    this.numIteraccionesEnemigosVoladores = 0;
                }
                for (i = 0; i < this.enemigosVoladores.length; i++) {
                    if (this.numIteraccionesEnemigosVoladores > 50) {
                        this.enemigosVoladores[i].actualizar(0, 50);
                    }
                    else {
                        this.enemigosVoladores[i].actualizar(-40, 10);
                    }
                    if (this.enemigosVoladores[i].body.p.x < posX1) { //Si esta fuera de la pantalla
                        this.enemigosVoladores[i].eliminar();
                        this.enemigosVoladores.splice(i, 1);
                    }
                }

                // Explosion enemigos
                for (var i = 0; i < this.enemigosExplosivos.length; i++) {
                    var posEnemigo = this.enemigosExplosivos[i].sprite.getPosition();
                    //Si esta en pantalla
                    var posXInicio = this.jugador.body.p.x - this.getContentSize().width / 4;
                    var posXFin = posXInicio + this.getContentSize().width;
                    if (posEnemigo.x > posXInicio && posEnemigo.x < posXFin) {
                        //Si esta cerca el jugador
                        var distanciaExplosion = cc.pSub(posEnemigo, this.jugador.body.p);
                        if (distanciaExplosion.x < 100 && (distanciaExplosion.y > -100 && distanciaExplosion.y < 100)) {
                            this.enemigosExplosivos[i].explotar();
                            this.jugador.impactado(2);
                            if (this.jugador.vidas <= 0) {
                                this.restaurarJugador();
                            }
                            else {
                                this.notificarCambioVidas();
                            }
                            this.enemigosExplosivosEliminar.push(this.enemigosExplosivos[i].shape);
                        }
                    }
                }
            }

            //Actualizar disparos enemigo
            for (var i = 0; i < this.disparosEnemigosEliminar.length; i++) {
                var shape = this.disparosEnemigosEliminar[i];
                for (j = 0; j < this.disparosEnemigo.length; j++) {
                    if (this.disparosEnemigo[j].shape == shape) {
                        this.disparosEnemigo[j].eliminar();
                        this.disparosEnemigo.splice(j, 1);
                    }
                }
                for (j = 0; j < this.disparosJugador.length; j++) { //Eliminamos los disparos del jugador cuando choca con disparos de enemigo
                    if (this.disparosJugador[j].shape == shape) {
                        this.disparosJugador[j].eliminar();
                        this.disparosJugador.splice(j, 1);
                    }
                }
            }
            this.disparosEnemigosEliminar = [];
            for (i = 0; i < this.disparosEnemigo.length; i++) {
                this.disparosEnemigo[i].actualizar(-100);
                if (this.disparosEnemigo[i].body.p.x > posX2 || this.disparosEnemigo[i].body.p.x < posX1) { //Si esta fuera de la pantalla
                    this.disparosEnemigo[i].eliminar();
                    this.disparosEnemigo.splice(i, 1);
                }
            }

            //Crear disparos jugador
            if (this.jugador.disparo == estadoDisparando) {
                if (this.numVecesDisparo < 1) {
                    var d = new Disparo(this, cc.p(this.jugador.body.p.x + 15, this.jugador.body.p.y),
                        tipoDisparoJugador, this.imagenDisparoJugador);
                    this.disparosJugador.push(d);
                    this.numVecesDisparo++;
                }
            }
            //Actualizar disparos jugador
            for (i = 0; i < this.disparosJugador.length; i++) {
                this.disparosJugador[i].actualizar(100);
                if (this.disparosJugador[i].body.p.x > posX2 || this.disparosJugador[i].body.p.x < posX1) { //Si esta fuera de la pantalla
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
            if (camaraEjeX > this.mapaAncho - this.getContentSize().width) {
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
                // Se recargan todos elementos del nivel, para que se juege siempre en las mismas condiciones
                this.recargarElementos();
                this.restaurarJugador();


            }

            // Eliminar recolectables inmunes
            for (var i = 0; i < this.recolectablesInmuneEliminar.length; i++) {
                var shape = this.recolectablesInmuneEliminar[i];
                for (var j = 0; j < this.recolectablesInmune.length; j++) {
                    if (this.recolectablesInmune[j].shape === shape) {
                        this.recolectablesInmune[j].eliminar();
                        this.recolectablesInmune.splice(j, 1);
                    }
                }
            }
            this.recolectablesInmuneEliminar = [];

            // Eliminar recolectables congelar
            for (var i = 0; i < this.recolectablesCongelarEliminar.length; i++) {
                var shape = this.recolectablesCongelarEliminar[i];
                for (var j = 0; j < this.recolectablesCongelar.length; j++) {
                    if (this.recolectablesCongelar[j].shape === shape) {
                        this.recolectablesCongelar[j].eliminar();
                        this.recolectablesCongelar.splice(j, 1);
                    }
                }
            }
            this.recolectablesCongelarEliminar = [];

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

            // Eliminar enemigos explosivos
            for (var i = 0; i < this.enemigosExplosivosEliminar.length; i++) {
                var shape = this.enemigosExplosivosEliminar[i];
                for (var j = 0; j < this.enemigosExplosivos.length; j++) {
                    if (this.enemigosExplosivos[j].shape === shape) {
                        this.enemigosExplosivos[j].eliminar();
                        this.enemigosExplosivos.splice(j, 1);
                    }
                }
            }
            this.enemigosExplosivosEliminar = [];

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
            if (this.jugador.body.p.x >= 0.99 * this.mapaAncho) {
                if (nivel == 3) {
                    //nivel = 1;
                    cc.director.pause();
                    this.getParent().addChild(new EndGameLayer());
                }
                else {
                    nivel++;
                    cc.director.pause();
                    this.getParent().addChild(new GameNextLayer());
                }
            }
        }
    },
    cargarNubesBlancas: function () {
        // Cargar nubes blancas
        var grupoNubesBlancas = this.mapa.getObjectGroup("NubesBlancas");
        var nubesBlancasArray = grupoNubesBlancas.getObjects();
        for (var i = 0; i < nubesBlancasArray.length; i++) {
            var nube = new NubeBlanca(this, cc.p(nubesBlancasArray[i]["x"], nubesBlancasArray[i]["y"]));
            this.enemigos.push(nube);
        }
    },
    cargarNubesNegras: function () {
        // Cargar nubes negras
        var grupoNubesNegra = this.mapa.getObjectGroup("NubesNegras");
        var nubesNegrasArray = grupoNubesNegra.getObjects();
        for (var i = 0; i < nubesNegrasArray.length; i++) {
            var nube = new EnemigoDisparador(this, cc.p(nubesNegrasArray[i]["x"], nubesNegrasArray[i]["y"]), "#Animación-Nube-Ataque_01.png", "Animación-Nube-Ataque_0", 8);
            this.enemigosConDisparo.push(nube);
        }
    },
    cargarTroncos: function () {
        //Cargar árboles (troncos)
        var grupoTroncos = this.mapa.getObjectGroup("Troncos");
        var troncosArray = grupoTroncos.getObjects();
        for (var i = 0; i < troncosArray.length; i++) {
            var tronco = new Tronco(this, cc.p(troncosArray[i]["x"], troncosArray[i]["y"]));
            this.enemigos.push(tronco);
        }
    },
    cargarDragones: function () {
        //Cargar dragones
        var grupoDragones = this.mapa.getObjectGroup("Dragones");
        var dragonesArray = grupoDragones.getObjects();
        for (var i = 0; i < dragonesArray.length; i++) {
            var dragon = new EnemigoDisparador(this, cc.p(dragonesArray[i]["x"], dragonesArray[i]["y"]), "#dragon_01.png", "dragon_0", 3);
            this.enemigosConDisparo.push(dragon);
        }
    },
    cargarAnzuelos: function () {
        var grupoAnzuelos = this.mapa.getObjectGroup("Anzuelos");
        var anzuelosArray = grupoAnzuelos.getObjects();
        for (var i = 0; i < anzuelosArray.length; i++) {
            var anzuelo = new Anzuelo(this, cc.p(anzuelosArray[i]["x"], anzuelosArray[i]["y"]));
            this.enemigos.push(anzuelo);
        }
    },
    cargarSubmarinos: function () {
        var grupoSubmarinos = this.mapa.getObjectGroup("Submarinos");
        var submarinosArray = grupoSubmarinos.getObjects();
        for (var i = 0; i < submarinosArray.length; i++) {
            var submarino = new Submarino(this, cc.p(submarinosArray[i]["x"], submarinosArray[i]["y"]));
            this.enemigosConDisparo.push(submarino);
        }
    },
    cargarHuevosDeOro: function () {
        // Cargar huevos de oro
        var grupohuevos = this.mapa.getObjectGroup("Huevos");
        var huevosArray = grupohuevos.getObjects();
        for (var i = 0; i < huevosArray.length; i++) {
            var huevo = new HuevoOro(this, cc.p(huevosArray[i]["x"], huevosArray[i]["y"]));
            this.huevosOro.push(huevo);
        }
    },
    cargarRecolectablesInmune: function () {
        //Cargar recolectables inmune
        var grupoRecolectablesInmune = this.mapa.getObjectGroup("RecolectablesInmune");
        var recolectablesInmuneArray = grupoRecolectablesInmune.getObjects();
        for (var i = 0; i < recolectablesInmuneArray.length; i++) {
            var recInmune = new RecolectableInmune(this, cc.p(recolectablesInmuneArray[i]["x"], recolectablesInmuneArray[i]["y"]));
            this.recolectablesInmune.push(recInmune);
        }
    },
    cargarRecolectablesCongelar: function() {
        //Cargar recolectables congelar
        var grupoRecolectablesCongelar = this.mapa.getObjectGroup("RecolectablesCongelar");
        var recolectablesCongelarArray = grupoRecolectablesCongelar.getObjects();
        for (var i = 0; i < recolectablesCongelarArray.length; i++) {
            var recCongelar = new RecolectableCongelar(this, cc.p(recolectablesCongelarArray[i]["x"], recolectablesCongelarArray[i]["y"]));
            this.recolectablesCongelar.push(recCongelar);
        }
    },
    cargarModosDeControl: function () {
        // Cargar modos de control
        var grupomodoControl = this.mapa.getObjectGroup("ModoControl");
        var modoControlArray = grupomodoControl.getObjects();
        for (var i = 0; i < modoControlArray.length; i++) {
            var control = new ModoControl(this, cc.p(modoControlArray[i]["x"], modoControlArray[i]["y"]));
            this.modosControl.push(control);
        }
    },
    cargarVidas: function () {
        // Cargar vidas
        var grupoVidas = this.mapa.getObjectGroup("Vidas");
        var vidasArray = grupoVidas.getObjects();
        for (var i = 0; i < vidasArray.length; i++) {
            var vida = new Vida(this, cc.p(vidasArray[i]["x"], vidasArray[i]["y"]));
            this.vidas.push(vida);
        }
    },
    cargarEnemigosExplosivos: function () {
        // Cargar bombas
        var grupoBombas = this.mapa.getObjectGroup("Bombas");
        var bombasArray = grupoBombas.getObjects();
        for (var i = 0; i < bombasArray.length; i++) {
            var bomba = new EnemigoExplosivo(this, cc.p(bombasArray[i]["x"], bombasArray[i]["y"]));
            this.enemigosExplosivos.push(bomba);
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
        else if(nivel == 2){
            this.mapa = new cc.TMXTiledMap(res.mapaBosque_tmx);
            this.imagenDisparoJugador = res.arrow_png;
            this.imagenDisparoEnemigo = res.fire_png;
            this.imagenEnemigoParabola = res.kite_png;
            this.imagenEnemigoVolador = "bat_0";
            this.framesEnemigoVolador = 3;
        }
        else if(nivel == 3) {
            this.mapa = new cc.TMXTiledMap(res.mapaAgua_tmx);
            this.imagenDisparoJugador = res.burbuja_png;
            this.imagenDisparoEnemigo = res.torpedo_png;
            this.imagenEnemigoParabola = res.ballena_png;
            this.imagenEnemigoVolador = "pez_0";
            this.framesEnemigoVolador = 6;
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
        if(nivel == 1){
            this.cargarNubesBlancas();
            this.cargarNubesNegras();
        }
        else if(nivel == 2){
            this.cargarTroncos();
            this.cargarDragones();
        }
        else if(nivel == 3){
            this.cargarAnzuelos();
            this.cargarSubmarinos();
        }

        this.cargarHuevosDeOro();
        this.cargarModosDeControl();
        this.cargarVidas();
        this.cargarRecolectablesInmune();
        this.cargarRecolectablesCongelar();
        this.cargarEnemigosExplosivos();

    },
    collisionJugadorConHuevo: function (arbiter, space) {
        cc.audioEngine.playEffect(res.sonido_recoger_huevo_mp3);
        // Marcar el huevo para eliminarlo
        var shapes = arbiter.getShapes();
        // shapes[0] es el jugador
        this.huevosEliminar.push(shapes[1]);
        var capaControles = this.getParent().getChildByTag(idCapaControles);
        capaControles.agregarHuevos();

    },
    collisionJugadorConEnemigoExplosivo: function (arbiter, space) {
        if (this.tiempoCongelacion <= 0) {
            var shapes = arbiter.getShapes();
            this.enemigosExplosivosEliminar.push(shapes[1]);
        }
    },
    collisionEnemigoConJugador: function (arbiter, space) {
        if (this.tiempoCongelacion <= 0) {
            if (this.tiempoTurbo > 0) {
                var shapes = arbiter.getShapes();
                this.enemigosEliminar.push(shapes[0]);
            } else {
                if(this.jugador.picotazo != estadoPicotazo){
                    this.jugador.impactado(1);
                    var shapes = arbiter.getShapes();
                    this.enemigosEliminar.push(shapes[0]);
                    if (this.jugador.vidas <= 0) {
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
            }
        }
    },
    collisionDisparoEnemigoConJugador: function (arbiter, space) {
        if (this.tiempoTurbo > 0) {
            var shapes = arbiter.getShapes();
            this.disparosEnemigosEliminar.push(shapes[0]);
        } else {
            this.jugador.impactado(1);
            var shapes = arbiter.getShapes();
            this.disparosEnemigosEliminar.push(shapes[0]);
            if (this.jugador.vidas <= 0) {
                this.restaurarJugador();
            } else {
                this.notificarCambioVidas();
            }
        }
    },
    collisionDisparoJugadorConEnemigo: function (arbiter, space) {
        var shapes = arbiter.getShapes();
        this.disparosEnemigosEliminar.push(shapes[0]);
        this.enemigosEliminar.push(shapes[1]);
    },
    collisionDisparoJugadorConEnemigoExplosivo: function (arbiter, space) {
        var shapes = arbiter.getShapes();
        this.disparosEnemigosEliminar.push(shapes[0]);
        this.enemigosExplosivosEliminar.push(shapes[1]);
    },
    collisionDisparoEnemigoConDisparoJugador: function (arbiter, space) {
        var shapes = arbiter.getShapes();
        this.disparosEnemigosEliminar.push(shapes[0]);
        this.disparosEnemigosEliminar.push(shapes[1]);
    },
    collisionJugadorConVida: function (arbiter, space) {
        var shapes = arbiter.getShapes();
        this.vidasEliminar.push(shapes[1]);
        this.jugador.sumarVida();
        this.notificarCambioVidas();
    },
    collisionJugadorConRecolectableInmune: function (arbiter, space) {
        var shapes = arbiter.getShapes();
        this.recolectablesInmuneEliminar.push(shapes[1]);
        this.jugador.inmune();
    },
    collisionJugadorConRecolectableCongelar: function (arbiter, space) {
        var shapes = arbiter.getShapes();
        this.recolectablesCongelarEliminar.push(shapes[1]);
        if (this.tiempoCongelacion <= 0) {
            this.tiempoCongelacion = 500;
        }
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
    notificarCambioTurbos: function () {
        var capaControles =
            this.getParent().getChildByTag(idCapaControles);
        capaControles.actualizarInterfazTurbos();
    },
    notificarCambioRecord: function () {
        var capaControles =
            this.getParent().getChildByTag(idCapaControles);
        capaControles.actualizarInterfazRecord();
    },
    restaurarJugador: function () {
        this.jugador.body.p = cc.p(50, 150);
        this.jugador.vidas = 5;
        this.jugador.turbos = 3;
        var capaControles = this.getParent().getChildByTag(idCapaControles);
        capaControles.actualizarInterfazVidas();
        capaControles.actualizarInterfazTurbos();
        capaControles.borrarHuevos();
        this.jugador.estado = estadoSaltando;
        this.tiempoTurbo = 0;
        this.tiempoCongelacion = 0;
        
        this.iniciarJuego = false;
    },
    recargarElementosComunes: function () {
        //Eliminar recolectables inmune
        for (var i = 0; i < this.recolectablesInmune.length; i++) {
            this.recolectablesInmune[i].eliminar();
        }
        this.recolectablesInmune = [];
        //Cargar recolectables inmune
        this.cargarRecolectablesInmune();

        //Eliminar recolectables congelar
        for (var i = 0; i < this.recolectablesCongelar.length; i++) {
            this.recolectablesCongelar[i].eliminar();
        }
        this.recolectablesCongelar = [];
        //Cargar recolectables congelar
        this.cargarRecolectablesCongelar();

        // Eliminar huevos de oro
        for (var i = 0; i < this.huevosOro.length; i++) {
            this.huevosOro[i].eliminar();
        }
        this.huevosOro = [];
        // Cargar huevos de oro
        this.cargarHuevosDeOro();

        // Eliminar modos de control
        for (var i = 0; i < this.modosControl.length; i++) {
            this.modosControl[i].eliminar();
        }
        this.modosControl = [];
        // Cargar modos de control
        this.cargarModosDeControl();

        // Eliminar vidas
        for (var i = 0; i < this.vidas.length; i++) {
            this.vidas[i].eliminar();
        }
        this.vidas = [];
        // Cargar vidas
        this.cargarVidas();

        // Eliminar bombas
        for (var i = 0; i < this.enemigosExplosivos.length; i++) {
            this.enemigosExplosivos[i].eliminar();
        }
        this.enemigosExplosivos = [];
        //Cargar enemigos explosivos
        this.cargarEnemigosExplosivos();
    },
    recargarElementos: function () {
        if(nivel == 1){
            // Eliminar nubes blancas
            for (var i = 0; i < this.enemigos.length; i++) {
                this.enemigos[i].eliminar();
            }
            this.enemigos = [];
            // Cargar nubes blancas
            this.cargarNubesBlancas();

            // Eliminar nubes negras
            for (var i = 0; i < this.enemigosConDisparo.length; i++) {
                this.enemigosConDisparo[i].eliminar();
            }
            this.enemigosConDisparo = [];
            // Cargar nubes negras
           this.cargarNubesNegras();
        }
        else if(nivel == 2){
            // Eliminar troncos
            for (var i = 0; i < this.enemigos.length; i++) {
                this.enemigos[i].eliminar();
            }
            this.enemigos = [];
            //Cargar troncos
            this.cargarTroncos();

            // Eliminar dragones
            for (var i = 0; i < this.enemigosConDisparo.length; i++) {
                this.enemigosConDisparo[i].eliminar();
            }
            this.enemigosConDisparo = [];
            //Cargar dragones
            this.cargarDragones();
        }
        else if(nivel == 3){
            // Eliminar anzuelos
            for (var i = 0; i < this.enemigos.length; i++) {
                this.enemigos[i].eliminar();
            }
            this.enemigos = [];
            // Cargar anzuelos
            this.cargarAnzuelos();

            // Eliminar submarinos
            for (var i = 0; i < this.enemigosConDisparo.length; i++) {
                this.enemigosConDisparo[i].eliminar();
            }
            this.enemigosConDisparo = [];
            // Cargar nubes negras
            this.cargarSubmarinos();

        }

        this.recargarElementosComunes();
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
                    //Iniciar juego con barra espaciadora
                    this.iniciarJuego = true;
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
                case 65:
                    // Turbo - tecla A
                    if (this.jugador.turbos > 0) {
                        this.jugador.impulsar();
                        this.notificarCambioTurbos();
                    }
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
