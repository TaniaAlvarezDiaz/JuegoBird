
var GameNextLayer = cc.LayerColor.extend({
    ctor:function () {
        this._super();
        this.init();
    },
    init:function () {
        // Color de fondo para toda la capa
        // Sin color son transparentes.
        this._super(cc.color(0, 0, 0, 180));
        var winSize = cc.director.getWinSize();

        // Creamos los botones - MenuItemSprite
        var botonNext = new cc.MenuItemSprite(
            new cc.Sprite(res.boton_siguiente),
            new cc.Sprite(res.boton_siguiente),
            this.pulsarReiniciar, this);

        // Creamos el menu - Menú
        var menu = new cc.Menu(botonNext);
        // Agregamos los botones al menú
        menu.setPosition(winSize.width / 2, winSize.height / 2);

        // Agregamos el menú a la capa
        this.addChild(menu);
    },
    pulsarReiniciar:function (sender) {
        // Volver a ejecutar la escena Prinicpal
        cc.director.runScene(new GameScene());

    }
});