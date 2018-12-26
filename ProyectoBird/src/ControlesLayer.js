var ControlesLayer = cc.Layer.extend({
    ctor: function () {
        this._super();
        var size = cc.winSize;

        // Contador Huevos
        this.huevos = 0;
        this.etiquetaHuevos = new cc.LabelTTF("Huevos: 0", "Helvetica", 20);
        this.etiquetaHuevos.setPosition(cc.p(size.width - 80, size.height - 20));
        this.etiquetaHuevos.fillStyle = new cc.Color(0, 0, 0, 0);
        this.addChild(this.etiquetaHuevos);

        // Contador Vidas
        this.etiquetaVidas = new cc.LabelTTF("Vidas: 5", "Helvetica", 20);
        this.etiquetaVidas.setPosition(cc.p(size.width - size.width / 4, size.height - 20));
        this.etiquetaVidas.fillStyle = new cc.Color(0, 0, 0, 0);
        this.addChild(this.etiquetaVidas);

        // Contador Turbos
        this.etiquetaTurbos = new cc.LabelTTF("Turbos: 3", "Helvetica", 20);
        this.etiquetaTurbos.setPosition(cc.p(size.width - size.width / 2, size.height - 20));
        this.etiquetaTurbos.fillStyle = new cc.Color(0, 0, 0, 0);
        this.addChild(this.etiquetaTurbos);

        // Picotazo sticker
        this.picotazoSticker = cc.Sprite.create(res.picotazoSticker);
        this.picotazoSticker.setPosition(cc.p(size.width * 0.92,  size.height - 80));

        this.scheduleUpdate();
        return true;
    },
    update: function (dt) {

    },
    agregarHuevos: function () {
        this.huevos++;
        this.etiquetaHuevos.setString("Huevos: " + this.huevos);
    },
    borrarHuevos: function () {
        this.huevos = 0;
        this.etiquetaHuevos.setString("Huevos: " + this.huevos);
    },
    actualizarInterfazVidas: function () {
        var gameLayer = this.getParent().getChildByTag(idCapaJuego);
        this.etiquetaVidas.setString("Vidas: " + gameLayer.jugador.vidas);
    },
    actualizarInterfazTurbos: function () {
        var gameLayer = this.getParent().getChildByTag(idCapaJuego);
        this.etiquetaTurbos.setString("Turbos: " + gameLayer.jugador.turbos);
    },
    addStickerPicotazo: function () {
        this.addChild(this.picotazoSticker);
    },
    removeStickerPicotazo: function () {
        this.removeChild(this.picotazoSticker);
    },

});
