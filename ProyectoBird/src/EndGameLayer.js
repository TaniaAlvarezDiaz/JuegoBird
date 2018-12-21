var EndGameLayer = cc.LayerColor.extend({
    ctor:function () {
        this._super();
        this.init();
    },
    init:function () {
        // Color de fondo para toda la capa
        // Sin color son transparentes.
        this._super(cc.color(0, 0, 0, 180));
        var winSize = cc.director.getWinSize();
        var size = cc.winSize;

        //Etiqueta de felicidades
        this.etiquetaFelicidades = new cc.LabelTTF("¡Felicidades!", "Helvetica", 40);
        this.etiquetaFelicidades.setPosition(cc.p(size.width/2, size.height/2+100));
        this.etiquetaFelicidades.fillStyle = new cc.Color(255, 255, 255, 255);
        this.addChild(this.etiquetaFelicidades);

        this.etiquetaFelicidades2 = new cc.LabelTTF("¡Has superado todos los niveles!", "Helvetica", 40);
        this.etiquetaFelicidades2.setPosition(cc.p(size.width/2, size.height/2-100));
        this.etiquetaFelicidades2.fillStyle = new cc.Color(255, 255, 255, 255);
        this.addChild(this.etiquetaFelicidades2);

    }
});