"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getFullTemplate = getFullTemplate;
exports.getTemplate = getTemplate;
exports.getPublicAsset = getPublicAsset;
exports.getStaticAsset = getStaticAsset;
exports.figureContentType = figureContentType;

var _fixers = require("./fixers");

var _fs = require("fs");

var _path = require("path");

var _util = require("util");

var _config = require("../config");

var _defaults = require("./defaults");

;


// Hata ayıklama modundaki (debug mode) mesajları göstermek için kullanılacak 
const debug = (0, _util.debuglog)('templates');

// Kalıpların yolu
const _publicDir = (0, _path.join)(__dirname, '/../../public/');

/**
 * Sayfa kalıbının dizgisine anahtar verilerini ve header - footer verilerini iliştirir
 * @param {string} templateDir Kalıbın dizini
 * @param {function(boolean | string, string=)} callback İşlemler bittiği zaman geri çağırılan metot
 * * arg0: *Varsa hata mesajı yoksa false*
 * * arg1: *Kalıb dizgisi (hata varsa undefined)*
 */
function getFullTemplate(templateDir, callback) {
    // Kalıp yolunu düzeltme
    templateDir = (0, _fixers.fixString)(templateDir);
    if (templateDir) {
        // Dosya yolunu alma (uzantısız)
        const split = templateDir.split('/');
        const fileName = templateDir + '/' + split[split.length - 1];

        getPublicAsset(fileName + '.html', (err, templateString) => {
            if (!err && templateString) {
                _addUniversalTemplates(templateString, (err, fullTamplateString) => {
                    if (!err && fullTamplateString) {
                        _interpolateKeys(fullTamplateString, fileName, string => {
                            callback(false, string);
                        });
                    } else {
                        // Evrensel kalıplar eklenemedi
                        callback('Evrensel kalıplar eklenemedi');
                    }
                });
            } else {
                // HTML alınamadı
                callback('HTML alınamadı');
            }
        });
    } else {
        // Düzenle
        callback('Dizin geçersiz');
    }
}

/**
 * Sayfa kalıbının digisine anahtar verilerini verilerini iliştirir
 * @param {string} templateDir Kalıbın dizini
 * @param {function(boolean | string, string=)} callback İşlemler bittiği zaman geri çağırılan metot
 * * arg0: *Varsa hata mesajı yoksa false*
 * * arg1: *Kalıb dizgisi (hata varsa undefined)*
 */
function getTemplate(templateDir, callback) {
    // Kalıp yolunu düzeltme
    templateDir = (0, _fixers.fixString)(templateDir);
    if (templateDir) {
        // Dosya yolunu alma (uzantısız)
        const split = templateDir.split('/');
        const fileName = templateDir + '/' + split[split.length - 1];

        getPublicAsset(fileName + '.html', (err, templateString) => {
            if (!err && templateString) {
                _interpolateKeys(templateString, fileName, string => {
                    callback(false, string);
                });
            } else {
                // HTML alınamadı
                callback('HTML alınamadı');
            }
        });
    } else {
        // Düzenle
        callback('Dizin geçersiz');
    }
}

/**
 * GUI için gereken HTML kalıbına alt ve üst bilgi kalıbını ekler
 * @param {string} templateString Evrensel kalıpların ekleneceği kalıp dizgisi
 * @param {function (string | boolean , string): void} callback İşlemler bittiği zaman verilen yanıt
 ** arg0: *İşlem sırasında oluşan hatanın açıklaması (hata yoksa false)*
 ** arg0: *Evrensel kalıpların eklendiği kalıp dizgisi*
 */
const _addUniversalTemplates = (templateString, callback) => {
    // Kalıp dizgisini düzeltme
    templateString = (0, _fixers.fixString)(templateString, true);

    // Üstbilgi kalıbını alma
    getPublicAsset('header.html', (err, headerString) => {
        if (!err && headerString) {
            // Altbilgi kalıbını alma
            getPublicAsset('footer.html', (err, footerString) => {
                if (!err && footerString) {
                    // Evrensel kalıpları ekleyip geri çağırma
                    callback(false, headerString + templateString + footerString);
                } else {
                    callback('Altbilgi kalıbı bulunamadı :(');
                }
            });
        } else {
            callback('Üstbilgi kalıbı bulunamadı :(');
        }
    });
};

/**
 * Public dosyasındaki varlıkları alma
 * @param {stirng} assetPath İstenen varlığın yolu
 * @param {function(boolean | string, string=):void} callback Geriçağırma
 * * args0: Varsa hata mesajı, yoksa false
 * * args1: İstenilen varlık verisi
 */
function getPublicAsset(assetPath, callback) {
    // Genel varlık ismini düzeltme
    assetPath = (0, _fixers.fixString)(assetPath);
    if (assetPath) {
        (0, _fs.readFile)(_publicDir + assetPath, 'utf8', (err, data) => {
            if (!err && data) {
                // Geri çağırma
                callback(false, data);
            } else if (err) {
                debug('\x1b[33m%s\x1b[0m', `'${assetPath}' okunurken hata oluştu: ${err}`);
                callback('Yol okunurken hata oluştu :(');
            } else {
                debug('\x1b[33m%s\x1b[0m', `'${assetPath}' içinde veri bulunmamakta`);
                callback('Okunan verinin içi boş :(');
            }
        });
    } else {
        debug('\x1b[31m%s\x1b[0m', `'${assetPath}' geçerli bir yol değil :(`);
        callback('Varlık yolu geçerli bir dizgi değil :(');
    }
}

/**
 * Public dosyasındaki varlıkları alma
 * @param {stirng} assetPath İstenen varlığın yolu
 * @param {function(boolean | string, string=):void} callback Geriçağırma
 * * args0: Varsa hata mesajı, yoksa false
 * * args1: İstenilen varlık verisi
 */
function getStaticAsset(assetPath, callback) {
    // Genel varlık ismini düzeltme
    assetPath = (0, _fixers.fixString)(assetPath);
    if (assetPath) {
        (0, _fs.readFile)(_publicDir + assetPath, (err, data) => {
            if (!err && data) {
                // Geri çağırma
                callback(false, data);
            } else if (err) {
                debug('\x1b[33m%s\x1b[0m', `'${assetPath}' okunurken hata oluştu: ${err}`);
                callback('Yol okunurken hata oluştu :(');
            } else {
                debug('\x1b[33m%s\x1b[0m', `'${assetPath}' içinde veri bulunmamakta`);
                callback('Okunan verinin içi boş :(');
            }
        });
    } else {
        debug('\x1b[31m%s\x1b[0m', `'${assetPath}' geçerli bir yol değil :(`);
        callback('Varlık yolu geçerli bir dizgi değil :(');
    }
}

// Düzenle
const _interpolateKeys = (string, fileName, callback) => {
    // Direk getPublicAsset siz yap
    // Anahtarların verilerini alma
    getPublicAsset(fileName + '.json', (err, keysString) => {
        // Anahtarların verilerini ayarları
        const keysData = !err ? (0, _defaults.JSONtoObject)(keysString) : {};

        // Dosyaya özgü anahtar verileri ayarlama
        keysData['head.script'] = fileName;
        keysData['head.style'] = fileName;

        // Evrensel kalıp anahtarlarını da anahtar verilerine ekliyoruz
        for (let keyName in _config.templateGlobals) {
            // Eğer anahtar ismine ait bir özelliğe sahipse, o değeri anahtar verilerine ekleme
            if (_config.templateGlobals.hasOwnProperty(keyName)) {
                keysData[`global.${keyName}`] = _config.templateGlobals[keyName];
            }
        }

        // Her bir anahtar verisini, aldığımız kalıp dizgisinde uygun yerlere koyuyoruz
        for (let key in keysData) {
            if (keysData.hasOwnProperty(key) && typeof keysData[key] == 'string') {
                // Anahtarları bulma ve değiştirme
                const replace = keysData[key];
                const find = `{${key}}`;

                // Dizgiyi güncelleme
                string = string.replace(find, replace);
            }
        }

        // Geri çağırma
        callback(string);
    });
};

/**
 * Varlık isminin uzantısına göre içerik türüne karar verme
 * @param {string} assetName Varlık ismi
 * @return {string} Varlığın içerik türü
 */
function figureContentType(assetName) {
    if (assetName.includes('.css')) {
        return 'css';
    } else if (assetName.includes('.png')) {
        return 'png';
    } else if (assetName.includes('.jpg')) {
        return 'jpg';
    } else if (assetName.includes('.ico')) {
        return 'favicon';
    } else if (assetName.includes('.js')) {
        return 'js';
    }
    return 'plain';
}
//# sourceMappingURL=templates.js.map