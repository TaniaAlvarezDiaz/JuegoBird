var estadoQuieto = 1;
var estadoExplosivo = 2;

var EnemigoExplosivo = cc.Class.extend({
    gameLayer:null,
    sprite:null,
    shape:null,
    ctor:function (gameLayer, posicion) {
        this.gameLayer = gameLayer;
        this.estado = estadoQuieto;
        this.exploto = false;

        this.sprite = new cc.PhysicsSprite("#enemy_bomb_01.png");
        this.body = new cp.StaticBody();
        this.body.setPos(posicion);
        this.sprite.setBody(this.body);
        this.shape = new cp.BoxShape(this.body,
            this.sprite.getContentSize().width,
            this.sprite.getContentSize().height);
        this.shape.setCollisionType(tipoEnemigoExplosivo);
        gameLayer.space.addStaticShape(this.shape);
        gameLayer.addChild(this.sprite,10);

        // Animacion quieto
        var framesAnimacion = [];
        var str = "enemy_bomb_01.png";
        var frame = cc.spriteFrameCache.getSpriteFrame(str);
        framesAnimacion.push(frame);

        var animacion = new cc.Animation(framesAnimacion, 0.1);
        this.aQuieto = new cc.Repeat(new cc.Animate(animacion),1);
        this.aQuieto.retain();

        // Animacion explosion
        var framesAnimacionExplosion = [];
        var str = "enemy_bomb_02.png";
        var frame = cc.spriteFrameCache.getSpriteFrame(str);
        framesAnimacionExplosion.push(frame);

        var animacionExplosion = new cc.Animation(framesAnimacionExplosion, 0.1);
        this.aExplotar = new cc.Repeat(new cc.Animate(animacionExplosion),1);
        this.aExplotar.retain();

        // Animaión actual
        this.animacion = this.aQuieto;

        // Ejecutar la animación actual
        this.sprite.runAction(this.animacion);
    },
    actualizar : function (){
        switch (this.estado) {
            case estadoQuieto:
                 if (this.animacion != this.aQuieto) {
                    this.animacion = this.aQuieto;
                    this.sprite.stopAllActions();
                    this.sprite.runAction(this.animacion);
                }
                break;
            case estadoExplosivo:
                if (this.animacion != this.aExplotar) {
                    this.animacion = this.aExplotar;
                    this.sprite.stopAllActions();
                    this.sprite.runAction(this.animacion);
                }
                break;

        }
    },
    eliminar: function (){
        this.gameLayer.space.removeShape(this.shape);
        this.gameLayer.removeChild(this.sprite);

    },
    explotar : function () {
        this.sonidoId = cc.audioEngine.playEffect(res.sonido_explosion_mp3);
        this.estado = estadoExplosivo;
        this.actualizar();
    }
});