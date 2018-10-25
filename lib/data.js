'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getBasePath = getBasePath;
exports.getDirPath = getDirPath;
exports.getFilePath = getFilePath;
exports.createData = createData;
exports.readData = readData;
exports.updateData = updateData;
exports.deleteData = deleteData;

var _fs = require('fs');

var _path = require('path');

var _defaults = require('./helpers/defaults');

var _util = require('util');

// Hata ayıklama mesajı
// Bağımlılıklar
const debug = (0, _util.debuglog)("data");

const _data = {};

/**
 * Ana dizini alma
 * @return {string} Ana dizin
 */
function getBasePath() {
    return (0, _path.join)(__dirname, "/../database/");
}

/**
 * Dosya dizni alma
 * @param {string} dir Dosyanın bulunduğu dizinin ismi
 * @return {string} Dosya dizininin yolu
 */
function getDirPath(dir) {
    return `${getBasePath()}${dir}`;
}

/**
 * Dosyanın yolunu alma
 * @param {string} dir Dosyanın bulunduğu dizin
 * @param {string} fileName Dosyanın ismi
 * @param {string} fileType Dosyanın türü (uzantısı)
 * @return {string} Dosya yolu
 */
function getFilePath(dir, fileName, fileType) {
    return `${getDirPath(dir)}\\${fileName}.${fileType}`;
}

/**
 * Veri oluşturma
 * @param {string} dir Dosyanın oluşturulacağı dizin / klasör ismi
 * @param {string} fileName Verilerin içinde bulunacağı dosya'nın ismi *(kimlik)*
 * @param {object} data Dosyaya kayıt edilecek veri
 * @param {function(boolean, string):void} callback İşlemler bittiği zaman verilen yanıt
 ** arg0: İşlem sırasında oluşan hata, yoksa false
 */
function createData(dir, fileName, data, callback) {
    _data.createDir(dir);

    // Dosyayı yazmak için açma
    (0, _fs.open)(getFilePath(dir, fileName, 'json'), 'wx', (err, fileDescriptor) => {
        // Hata yok ve dosya tanımlayıcısı varsa
        if (!err && fileDescriptor) {
            // Veriyi dizgiye çeviriyoruz
            const dataString = JSON.stringify(data);

            // Dosyaya veriyi yazma
            _data.writeFile(fileDescriptor, dataString, callback);
        } else {
            callback('Dosya oluşturulamadı, zaten mevcut olabilir :(');
        }
    });
}

/**
 * Veri okuma
 * @param {string} dir Dosyanın okunacağı dizin / klasör ismi
 * @param {string} fileName Verilerin içinde bulunacağı dosya'nın ismi *(kimlik)*
 * @param {function(string | boolean, object):void} callback İşlemler bittiği zaman verilen yanıt
 ** arg0: İşlem sırasında oluşan hata (yoksa false)
 ** arg1: Okunmak istenen veri / dosya
 */
function readData(dir, fileName, callback) {
    (0, _fs.readFile)(getFilePath(dir, fileName, 'json'), "utf8", (err, data) => {
        // Eğer hata yok ve veri varsa
        if (!err && data) {
            // JSON'u objeye dönüştürüyoruz
            const dataObject = (0, _defaults.JSONtoObject)(data);

            // Veriyi ve hata olmadığını geri çağırma
            callback(false, dataObject);
        } else {
            // Hata varsa, hatayı ve veriyi geri çağırma
            callback('Dosya okumada hata meydana geldi :(', data);
            debug("\x1b[31m%s\x1b[0m", "Dosya okumada hata meydana geldi :(\n\t\t" + err);
        }
    });
}

/**
 * Verileri güncelleme metodu
 *
 * @param {string} dir Dosyanın oluşturulacağı dizin / klasör ismi
 * @param {string} fileName Güncellenecek dosyanın ismi *(kimliği)*
 * @param {object} data Dosyaya kayıt edilecek veri
 * @param {function(boolean, string):void} callback İşlemler bittiği zaman verilen yanıt
 ** arg0: İşlem sırasında oluşan hata, yoksa false
 */
function updateData(dir, fileName, data, callback) {
    // Dosyayı açma
    (0, _fs.open)(getFilePath(dir, fileName, 'json'), 'r+', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            // JSON'u string yapıyoruz
            const dataString = JSON.stringify(data);

            // Dosyayı kırpma
            (0, _fs.ftruncate)(fileDescriptor, err => {
                if (!err) {
                    // Dosyayı güncelleme
                    _data.writeFile(fileDescriptor, dataString, callback);
                    debug("\x1b[32m%s\x1b[0m", "Dosya güncelleme başarılı :).\n\t\t" + getFilePath(dir, fileName, 'json'));
                } else {
                    callback('Dosya kırpmada hata meydana geldi :(');
                    debug("\x1b[31m%s\x1b[0m", "Dosya kırpmada hata meydana geldi :(.\n\t\t" + err);
                }
            });
        } else {
            callback('Güncellenecek dosya bulunamadı :(');
            debug("\x1b[31m%s\x1b[0m", "Güncellenecek dosya bulunamadı :(.\n\t\t" + err);
        }
    });
}

/**
 * Veriyi silmek
 *
 * @param {string} dir Dosyanın bulunduğu dizin
 * @param {string} fileName Verilerin içinde bulunacağı dosya'nın ismi *(kimlik)*
 * @param {function(boolean, string):void} callback İşlemler bittiği zaman verilen yanıt
 ** arg0: İşlem sırasında oluşan hata, yoksa false
 */
function deleteData(dir, fileName, callback) {
    // Dosya bağlantısını kaldırma
    (0, _fs.unlink)(getFilePath(dir, fileName, 'json'), err => {
        if (!err) {
            callback(false);
        } else {
            callback('Veri silinirken hata meydana geldi :(');
        }
    });
}

/**
 * Dosyaya yazma
 * @param {object} fileDescriptor Dosya tanımlayıcısı
 * @param {string} dataString Veri dizgisi
 * @param {function(boolean, string):void} callback Geri çağırma
 * * args0: İşlemler sırasında oluşan hata, yoksa false
 */
_data.writeFile = (fileDescriptor, dataString, callback) => {
    (0, _fs.writeFile)(fileDescriptor, dataString, err => {
        if (!err) {
            (0, _fs.close)(fileDescriptor, err => {
                if (!err) {
                    callback(false);
                } else {
                    callback('Dosyayı kapatırken hata meydana geldi :(');
                }
            });
        } else {
            callback('Dosya yazma işleminde hata meydana geldi :(');
        }
    });
};

/**
 * Gereken dizinlerin oluşturulması
 * @param {string} dir Dizin ismi
 */
_data.createDir = dir => {
    // Ana dizin yoksa oluşturma
    if (!(0, _fs.existsSync)(getBasePath())) {
        (0, _fs.mkdirSync)(getBasePath());
    }
    if (!(0, _fs.existsSync)(getDirPath(dir))) {
        (0, _fs.mkdirSync)(getDirPath(dir));
    }
};
//# sourceMappingURL=data.js.map