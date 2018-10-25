"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.start = start;

var _http = require("http");

var _url = require("url");

var _string_decoder = require("string_decoder");

var _defaults = require("./helpers/defaults");

var _fixers = require("./helpers/fixers");

var _util = require("util");

var _config = require("./config");

var _api = require("./handlers/api");

var _asset = require("./handlers/asset");

var _template = require("./handlers/template");

// Hata ayıklama durumunda iken konsola yazı yazdırma
// Bağımlılıklar
const debug = (0, _util.debuglog)('server');

/**
 * Sunucu alt işlemleri
 */


// Varsayılan işleyiciler
const _server = {};

/**
 * Sunucuyu başlatma
 */
function start() {
    _server.httpServer.listen(_config.httpPort, () => {
        console.log("\x1b[36m%s\x1b[0m", `Sunucu ${_config.httpPort} portundan dinleniyor.`);
    });
}

// HTTP sunucusu oluşturma
_server.httpServer = (0, _http.createServer)((request, response) => {
    _server.unifiedServer(request, response);
});

/**
 * Birleşik sunucu metodu
 * @param {string} request İstemciden gelen istek
 * @param {string} response Sunucudan verilen yanıt
 */
_server.unifiedServer = (request, response) => {
    /**
     * Url ayrıştırma işlemi (obje olarak alıyoruz)
     * * Örnek: *{... query: {}, pathname: "/ornek" ... } şeklinde bir url classı*
     */
    const parsingUrl = (0, _url.parse)(request.url, true);

    /**
     * Sorgu kelimesini (query string) obje olarak almak.
     * * Örnek: *"curl localhost:3000/foo?test=testtir" ise { test : "testtir" }*
     * * Not: *"?test=testtir" sorgu dizgisidir.*
     */
    const queryStringObject = parsingUrl.query;

    /**
     * Ayrıştırılan urldeki pathname değişkenindeki değeri yol'a alıyorz.
     * * Örnek: *"curl localhost:3000/ornek/test/" => yolu "/ornek/test/"*
     * * Not: *sorgu dizgileri ele alınmaz ( "curl localhost:3000/ornek?foo=bar" => yolu "/ornek" )*
     */
    const path = parsingUrl.pathname;

    /**
     * Replace içinde verilen işaretler çıkartılarak alınan yol.
     * * Örnek: *["/ornek" -> "ornek"] veya ["/ornek/test/" -> "ornek/test/"] olarak kırpılmakta.*
     * * Not: *Sadece ilk karakter kırpılıyor (?)*
     */
    const trimmedPath = path.replace(/^\/+|\+$/g, "");

    /**
     * HTTP metodu alma
     * * Örnek: *GET, POST, PUT, DELETE ...*
     * * Not: *Küçük harfe çevirip alıyoruz.*
     */
    const method = request.method.toLowerCase();

    /**
     * İsteğin içindeki başlıkları (header keys) obje olarak almak.
     * * Not: *Postman ile headers sekmesinde gönderilen anahtarları (keys)
     * ve değerlerini (the value of them) içerir.*
     */
    const headers = request.headers;

    /**
     * ASCI kodlarını çözümlemek için kod çözücü tanımlama
     * * Not: *"utf-8" çözümleme yöntemidir*
     */
    const decoder = new _string_decoder.StringDecoder("utf-8");
    // Yükleri kayıt edeceğimiz tamponu oluşturuyoruz.
    let buffer = "";

    // İstekte veri geldiği anda yapılacak işlemler
    request.on("data", data => {
        /**
         * ASCI kodlarını "utf-8" formatında çözümlüyoruz.
         * * Ornek: *42 75 -> Bu [ 42 = B, 75 = u]*
         */
        buffer += decoder.write(data);
    });

    // İstek sonlandığı anda yapılacak işlemler
    request.on("end", () => {
        // Kod çözümlemeyi kapatıyoruz.
        buffer += decoder.end();

        /**
         * İşleyiciye gönderilen veri objesi oluşturma
         * * Not: *Her dosyada kullanılan veri objesidir.*
         * * Örnek: *{ "kırpılmışYol" = "ornek", "sorguDizgisiObjeleri" = {}, "metot" = "post",
         *   "yükler" = {"isim" : "Yunus Emre"} [Body içindeki metinler] vs.}*
         */
        const requestData = {
            trimmedPath: trimmedPath,
            queryStringObject: queryStringObject,
            method: method,
            headers: headers,
            payload: (0, _defaults.JSONtoObject)(buffer)
        };

        // Yanıt oluşturma
        _server.createResponse(requestData, response);
    });
};

/**
 * Sunucu tarafından verilecek yanıtı oluşturma
 * @param {object} requestData İstek verileri
 * @param {string} response Yanıt dizgisi
 */
_server.createResponse = (requestData, response) => {
    // Seçilmiş işleyiciyi ayarlama
    const chosenHandler = requestData.trimmedPath.includes('.') ? _asset.asset : requestData.trimmedPath.includes('api/') ? _api.api : _template.template;

    /* const chosenHandler = requestData.trimmedPath.includes('public/') | requestData.trimmedPath.includes('favicon.ico') ? asset :
        requestData.trimmedPath.includes('api/') ? api : template;
        */

    chosenHandler(requestData, (statusCode, payload, contentType) => {
        // Değişkenleri düzenleme
        statusCode = (0, _fixers.fixStatusCode)(statusCode);
        contentType = (0, _fixers.fixContentType)(contentType);

        // Yanıt için başlıkları ayarlama
        response.setHeader("Content-Type", _defaults.contentTypes[contentType]);

        // Yük dizgisini ayarlama
        const payloadString = (0, _fixers.fixPayload)(contentType, payload);

        // Yanıt için durum kodunu ve geri dönüş yüklerini ayarlama
        response.writeHead(statusCode);
        response.end(payloadString);

        // Yanıt hakkında bilgi gösterme (debug)
        _server.showResponseInfos(statusCode, requestData);
    });
};

/**
 * Sunucu yanıtı hakkında bilgilendirme
 * @param {number} statusCode Sunucu durum kodu
 * @param {object} requestData Sunucuya gönderilen istek verisi
 */
_server.showResponseInfos = (statusCode, requestData) => {
    // İşlem yanıtı olumlu ise yeşil, değilse kırmızı yazma
    if (statusCode == 200) {
        debug("\x1b[32m%s\x1b[0m", `${requestData.method} /${requestData.trimmedPath} ${statusCode}`);
    } else {
        debug("\x1b[31m%s\x1b[0m", `${requestData.method} /${requestData.trimmedPath} ${statusCode}`);
    }
};
//# sourceMappingURL=server.js.map