var res = {
    HelloWorld_png: "res/HelloWorld.png",
    CloseNormal_png: "res/CloseNormal.png",
    CloseSelected_png: "res/CloseSelected.png",
    boton_jugar_png: "res/boton_jugar.png",
    menu_png: "res/menu.png",
    tiles32_png: "res/tiles32.png",
    mapa1_tmx: "res/mapa1.tmx",
    jugador_caminar_png: "res/jugador_caminar.png",
    jugador_caminar_plist: "res/jugador_caminar.plist",
    jugador_saltar_png: "res/jugador_saltar.png",
    jugador_saltar_plist: "res/jugador_saltar.plist",
    vida_png: "res/vida.png",
    vida_plist: "res/vida.plist",
    boton_turbo_png: "res/boton_turbo.png",
    pincho: "res/pincho.png",

    modoControl: "res/CambiarModoControl.png",
    picotazoSticker: "res/Sticker_Picotazo.png",
    jugador_inmune_png : "res/pajaro_inmune.png",
    jugador_inmune_plist : "res/pajaro_inmune.plist",
    recolectable_inmune_png : "res/apple.png",
    recolectable_inmune_plist : "res/apple.plist",

    //Nivel cielo
    jugador_png: "res/NivelCielo/pajaro.png",
    jugador_plist: "res/NivelCielo/pajaro.plist",
    jugador_impactado_png: "res/pajaro_impactado.png",
    jugador_impactado_plist: "res/pajaro_impactado.plist",
    tilesNido_png: "res/NivelCielo/nido_tiles.png",
    tilesCielo_png: "res/NivelCielo/cielo_tiles.png",
    huevoNido_png: "res/NivelCielo/huevoNido.png",
    mapaCielo_tmx: "res/NivelCielo/CieloMapa.tmx",
    nubeNegra_png: "res/NivelCielo/nubeNegra.png",
    nubeNegra_plist: "res/NivelCielo/nubeNegra.plist",
    nubeBlanca_png: "res/NivelCielo/nubeBlanca.png",
    nubeBlanca_plist: "res/NivelCielo/nubeBlanca.plist",
    huevoOro_png: "res/NivelCielo/huevoOro.png",
    huevoOro_plist: "res/NivelCielo/huevoOro.plist",
    buitre_png: "res/NivelCielo/buitre.png",
    buitre_plist: "res/NivelCielo/buitre.plist",
    rayo_png: "res/NivelCielo/rayo.png",
    pelota: "res/NivelCielo/pelota.png",
    boomerang_png: "res/NivelCielo/Boomerang.png",
    boton_siguiente: "res/boton_siguiente.png",

    //Nivel bosque
    mapaBosque_tmx: "res/NivelBosque/mapaBosque.tmx",
    tilesNidoBosque_png : "res/NivelBosque/nido_tiles.png",
    huevoNidoBosque_png : "res/NivelBosque/huevoNido.png",
    tilesBosque_png : "res/NivelBosque/bosque_tiles.png",
    dragon_png : "res/NivelBosque/dragon.png",
    dragon_plist : "res/NivelBosque/dragon.plist",
    bat_png : "res/NivelBosque/bat.png",
    bat_plist : "res/NivelBosque/bat.plist",
    arrow_png : "res/NivelBosque/arrow.png",
    fire_png : "res/NivelBosque/fire.png",
    tronco_png : "res/NivelBosque/tronco.png",
    kite_png : "res/NivelBosque/kite.png",

    // Nivel Agua
    tilesAgua: "res/NivelAgua/fondo_marino_tiles.png",
    tilesTubo: "res/NivelAgua/tubo_bajo_agua_tiles.png",
    tilesHuevoNidoBajoAgua: "res/NivelAgua/huevoNido.png",
    mapaAgua_tmx: "res/NivelAgua/FondoMaritimoMapa.tmx",
    anzuelo_png: "res/NivelAgua/anzuelo.png",
    ballena_png: "res/NivelAgua/ballena.png",
    burbuja_png: "res/NivelAgua/burbuja.png",
    pez_png: "res/NivelAgua/pez.png",
    pez_plist: "res/NivelAgua/pez.plist",
    submarino_png: "res/NivelAgua/submarino.png",
    torpedo_png: "res/NivelAgua/torpedo.png",

    // Sonidos
    sonido_turbo_mp3 : "res/sonido_turbo.mp3",
    sonido_sumar_vida_mp3: "res/sonido_sumar_vida.mp3",


};

var g_resources = [];
for (var i in res) {
    g_resources.push(res[i]);
}