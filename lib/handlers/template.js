'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.template = template;

var _templates = require('../helpers/templates');

/**
 * Site kalıplarının işleyicisi 
 * Örnek: *localhost:3000/<templateName> yazıldığında bu fonksiyon çalışır.*
 * Not: *templateName, adres çubuğuna yazılan kalıp ismidir. (index, account/create)*
 * @param {object} data Index.js"te tanımlanan veri objesidir. İstekle gelir.
 * @param {function(number, string, string):void} callback İşlemler bittiği zaman verilen yanıt
 ** arg0: HTTP varsayılan durum kodları
 ** arg0: HTTP yanıtı veya ilgili ek açıklamalar {Info, Detail?}
 ** arg1: İçerik tipi (Content-type) [http, json vs.]
 */
function template(data, callback) {
    if (data.method.toLowerCase() == 'get') {
        // Kalıp ismini ayarlama
        const templateName = data.trimmedPath == '' ? 'index' : data.trimmedPath;

        // Tam sayfayı almak
        (0, _templates.getFullTemplate)(templateName, (err, templateString) => {
            if (!err && templateString) {
                // Sayfayı html olarak geri döndürme
                callback(200, templateString, 'html');
            } else {
                // Düzenlenecek
                (0, _templates.getTemplate)('notFound', (err, templateString) => {
                    if (!err && templateString) {
                        // Sayfayı html olarak geri döndürme
                        callback(200, templateString, 'html');
                    } else {
                        callback(500, {
                            Info: 'Sayfa bulunamadı sayfası alınırken bir hata oluştur :(',
                            Detail: err
                        });
                    }
                });
            }
        });
    } else {
        callback(405, {
            Info: 'İstekle gelen metot hatalıdır :(',
            Detail: `Metot: ${data.method} /${data.trimmedPath}`
        }, 'json');
    }
}

const _keysDatas = {
    index: {
        'head.title': "Elo Boost",
        'head.script': 'index',
        'body.description': 'Ucuz ve bağımsız elo boost hizmeti'
    },
    notFound: {
        'head.title': 'Sayfa bulunamadı :(',
        'body.description': 'Yanlış yerlerde geziyorsun'
    },
    'account/create': {
        'head.title': "Hesap Oluştur",
        'head.script': 'account/create',
        'body.description': 'Ücretsiz hesap oluşturma'
    },
    'session/create': {
        'head.title': "Oturum Oluştur",
        'head.script': 'session/create',
        'body.description': 'Ücretsiz hesap oluşturma'
    }
};
//# sourceMappingURL=template.js.map