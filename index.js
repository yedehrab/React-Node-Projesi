'use strict';

var _server = require('./lib/server');

// Uygulamanın kendisi
const app = {};

/**
 * Uygulamayı başlatma
 */
// Bağımlılıklar
app.start = () => {
    // Sunucuyu başlatma
    (0, _server.start)();

    // Arkaplan işlemleri
};

// Uygulamayı başlatıyoruz 
app.start();
//# sourceMappingURL=index.js.map