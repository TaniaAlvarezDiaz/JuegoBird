var ControlesLayer = cc.Layer.extend({
    ctor: function () {
        this._super();
        var size = cc.winSize;

        // Contador Monedas
        this.monedas = 0;
        this.etiquetaMonedas = new cc.LabelTTF("Monedas: 0", "Helvetica", 20);
        this.etiquetaMonedas.setPosition(cc.p(size.width - 80, size.height - 20));
        this.etiquetaMonedas.fillStyle = new cc.Color(0, 0, 0, 0);
        this.addChild(this.etiquetaMonedas);

        // Contador Vidas
        this.etiquetaVidas = new cc.LabelTTF("Vidas: 3", "Helvetica", 20);
        this.etiquetaVidas.setPosition(cc.p(size.width - size.width / 4, size.height - 20));
        this.etiquetaVidas.fillStyle = new cc.Color(0, 0, 0, 0);
        this.addChild(this.etiquetaVidas);

        // Contador Turbos
        this.etiquetaTurbos = new cc.LabelTTF("Turbos: 3", "Helvetica", 20);
        this.etiquetaTurbos.setPosition(cc.p(size.width - size.width / 3 - 40, size.height - 20));
        this.etiquetaTurbos.fillStyle = new cc.Color(0, 0, 0, 0);
        this.addChild(this.etiquetaTurbos);

        // Botón turbo
        this.spriteBotonTurbo = cc.Sprite.create(res.boton_turbo_png);
        this.spriteBotonTurbo.setPosition(cc.p(size.width * 0.92, size.height * 0.35));
        this.addChild(this.spriteBotonTurbo);

        // Registrar Mouse Down
        cc.eventManager.addListener({
            event: cc.EventListener.MOUSE,
            onMouseDown: this.procesarMouseDown.bind(this)
        }, this);

        this.scheduleUpdate();
        return true;
    },
    update: function (dt) {

    },
    procesarMouseDown: function (event) {
        var areaBotonTurbo = this.spriteBotonTurbo.getBoundingBox();

        // La pulsación cae dentro del botón turbo
        if (cc.rectContainsPoint(areaBotonTurbo,
            cc.p(event.getLocationX(), event.getLocationY()))) {
            var gameLayer = this.getParent().getChildByTag(idCapaJuego);
            if (gameLayer.jugador.turbos > 0) {
                gameLayer.jugador.impulsar();
                this.actualizarInterfazTurbos();
            }
        }
    },
    agregarMoneda: function () {
        this.monedas++;
        this.etiquetaMonedas.setString("Monedas: " + this.monedas);
    },
    actualizarInterfazVidas: function () {
        var gameLayer = this.getParent().getChildByTag(idCapaJuego);
        this.etiquetaVidas.setString("Vidas: " + gameLayer.jugador.vidas);
    },
    actualizarInterfazTurbos: function () {
        var gameLayer = this.getParent().getChildByTag(idCapaJuego);
        this.etiquetaTurbos.setString("Turbos: " + gameLayer.jugador.turbos);
    }


});
