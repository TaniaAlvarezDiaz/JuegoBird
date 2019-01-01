var InfoLayer = cc.LayerColor.extend({
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

        // Fondo
        var spriteFondoInfo = new cc.Sprite(res.info_png);
        spriteFondoInfo.setPosition(cc.p(size.width / 2, size.height / 2));
        spriteFondoInfo.setScale(size.height / spriteFondoInfo.height);
        this.addChild(spriteFondoInfo);

        // Creamos los botones - MenuItemSprite
        var botonContinuar = new cc.MenuItemSprite(
            new cc.Sprite(res.boton_continuar_png),
            new cc.Sprite(res.boton_continuar_png),
            this.iniciarJuego, this);
        var menu = new cc.Menu(botonContinuar);
        menu.setPosition(cc.p(size.width * 0.68, size.height * 0.10));
        this.addChild(menu);
    },
    iniciarJuego:function (sender) {
        cc.director.runScene(new GameScene());

    }
});