'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.asset = asset;

var _templates = require('../helpers/templates');

/**
 * Örnek: localhost:3000/indeks yazıldığında bu fonksiyon çalışır.
 *
 * Not: ornek, yönlendirici 'nin bir objesidir.
 *
 * @param {object} data Index.js'te tanımlanan veri objesidir. İstekle gelir.
 * @param {function(number, string, string):void} callback İşlemler bittiği zaman verilen yanıt
 ** arg0: HTTP varsayılan durum kodları
 ** arg0: HTTP yanıtı veya tanımsızlık
 ** arg1: İçerik tipi (Content-type) [http, json vs.]
 */
function asset(data, callback) {
    // Sadece get metodu ile çalışacağız
    if (data.method.toLowerCase() == 'get') {
        // İstenilen dosya ismini kırpılmış yoldan alma
        const assetName = data.trimmedPath.trim();
        if (assetName.length > 0) {
            (0, _templates.getStaticAsset)(assetName, (err, asset) => {
                if (!err && asset) {
                    // İçerik türüne karar verme ve geri çağırma
                    callback(200, asset, (0, _templates.figureContentType)(assetName));
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
            callback(404, {
                Info: 'İstenen dosya ismi geçersiz veya bulunamadı :('
            }, 'json');
        }
    } else {
        callback(405, {
            Info: 'İstekle gelen metot hatalıdır :('
        }, 'json');
    }
}
//# sourceMappingURL=asset.js.map