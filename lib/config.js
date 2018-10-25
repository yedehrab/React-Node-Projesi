'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
/**
 * Ortam değişkenlerini oluşturma.
 * * Örnek: *'set NODE_ENV=prodcut node index.js' yazılırsa,
 *  5000 portundan çalışır.*
 */
const environment = {};

// Varsayılan ortam değişkeni
environment.stagging = {
    httpPort: 5000,
    idLength: 25,
    sessionTimeoutMs: 1000 * 60 * 60,
    'templateGlobals': {
        appName: 'Yemreak',
        companyName: 'Yemreak, Inc',
        releaseDate: '2019',
        baseUrl: "http://localhost:3000/"
    }
};

environment.production = {
    httpPort: process.env.PORT || 5000,
    idLength: 25,
    sessionTimeoutMs: 1000 * 60 * 60,
    'templateGlobals': {
        appName: 'EloBoost',
        companyName: 'Yemreak, Inc',
        releaseDate: '2019',
        baseUrl: "https://yemreboost.herokuapp.com/"
    }
};

/**
 * Hangi ortamın, command-line argumanı olacağına karar veriyoruz.
 * * Not: *'NODE_ENV' olan bir değişken ismidir, değiştirilemez ! (Türkçeleştirilemez)*
 */
const currentEnv = typeof process.env.NODE_ENV == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

/**
 * Şu anki ortamı kontrol ediyoruz, eğer yukarıdakilerden biri değile
 * varsayılanı tanımlıyoruz.
 */
const envToExport = typeof environment[currentEnv] == 'object' ? environment[currentEnv] : environment['stagging'];

// Değişkenlerin aktarılması
const httpPort = envToExport.httpPort,
      idLength = envToExport.idLength,
      sessionTimeoutMs = envToExport.sessionTimeoutMs,
      templateGlobals = envToExport.templateGlobals;

// Varsayılan aktarma

exports.httpPort = httpPort;
exports.idLength = idLength;
exports.sessionTimeoutMs = sessionTimeoutMs;
exports.templateGlobals = templateGlobals;
exports.default = envToExport;
//# sourceMappingURL=config.js.map