var estadoQuieto = 1;
var estadoExplosivo = 2;

var EnemigoExplosivo = cc.Class.extend({
    gameLayer:null,
    sprite:null,
    shape:null,
    ctor:function (gameLayer, posicion) {
        this.gameLayer = gameLayer;
        this.estado = estadoQuieto;
        this.tiempoExplosion = 100;

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

        var animacion = new cc.Animation(framesAnimacion, 0.2);
        this.aQuieto = new cc.RepeatForever(new cc.Animate(animacion));
        this.aQuieto.retain();

        // Animacion explosion
        var framesAnimacionExplosion = [];
        var str = "enemy_bomb_02.png";
        var frame = cc.spriteFrameCache.getSpriteFrame(str);
        framesAnimacionExplosion.push(frame);

        var animacionExplosion = new cc.Animation(framesAnimacionExplosion, 0.4);
        this.aExplotar = new cc.Repeat(new cc.Animate(animacionExplosion),2);
        this.aExplotar.retain();

        // Animaión actual
        this.animacion = this.aQuieto;

        // Ejecutar la animación actual
        this.sprite.runAction(this.animacion);
    },
    actualizar : function (){
        if (this.estado == estadoExplosivo && this.tiempoExplosion > 0) {
            this.tiempoExplosion--;
        }
        console.log("ESTADO : " + this.estado);
        switch (this.estado) {
            case estadoQuieto:
                /*if (this.tiempoExplosion > 0) {
                    if (this.animacion != this.aExplotar) {
                        this.animacion = this.aExplotar;
                        this.sprite.stopAllActions();
                        this.sprite.runAction(this.animacion);
                    }
                }else {*/
                    if (this.animacion != this.aQuieto) {
                        this.animacion = this.aQuieto;
                        this.sprite.stopAllActions();
                        this.sprite.runAction(this.animacion);
                    }
               // }

                break;
            case estadoExplosivo:
                console.log("TIEMPO EXPLOSION: " + this.tiempoExplosion);
                if (this.tiempoExplosion > 0) {
                    if (this.animacion != this.aExplotar) {
                        this.animacion = this.aExplotar;
                        this.sprite.stopAllActions();
                        this.sprite.runAction(this.animacion);
                        console.log("estado explotar");
                    }
                }
                break;

        }
    },
    eliminar: function (){
        this.gameLayer.space.removeShape(this.shape);
        this.gameLayer.removeChild(this.sprite);
    },
    explotar : function () {
       /* if (this.tiempoExplosion <= 0) {
            this.tiempoExplosion = 100;
        }*/
        cc.audioEngine.playEffect(res.sonido_explosion_mp3);
        console.log("*************************");
        this.estado = estadoExplosivo;
    }
});