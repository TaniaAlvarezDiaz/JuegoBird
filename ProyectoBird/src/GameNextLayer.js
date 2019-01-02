
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
        var size = cc.winSize;

        //Etiqueta de haber superado nivel
        this.etiquetaNivelSuperado = new cc.LabelTTF("¡Nivel superado!", "Helvetica", 50);
        this.etiquetaNivelSuperado.setPosition(cc.p(size.width/2, size.height/2+100));
        this.etiquetaNivelSuperado.fillStyle = new cc.Color(255, 255, 255, 255);
        this.addChild(this.etiquetaNivelSuperado);

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
        cc.director.runScene(new GameScene());
    }
});