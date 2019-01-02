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
        this.etiquetaFelicidades2.setPosition(cc.p(size.width/2, size.height/2+25));
        this.etiquetaFelicidades2.fillStyle = new cc.Color(255, 255, 255, 255);
        this.addChild(this.etiquetaFelicidades2);

        var botonAgain = new cc.MenuItemSprite(
            new cc.Sprite(res.boton_VolverAJugar_png),
            new cc.Sprite(res.boton_VolverAJugar_png),
            this.pulsarReiniciar, this);
        var menu = new cc.Menu(botonAgain);
        menu.setPosition(winSize.width / 2, winSize.height / 2 - 50);
        this.addChild(menu);

    },
    pulsarReiniciar:function (sender) {
        nivel = 1;
        cc.director.runScene(new GameScene());
    }
});