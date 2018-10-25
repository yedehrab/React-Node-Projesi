"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.api = api;

var _users = require("./api/users");

var _tokens = require("./api/tokens");

/**
 * Arkaplan işleyicileri, kullanıcı işlemleri için metot
 *
 * @param {object} data Index.js"te tanımlanan veri objesidir. İstekle gelir.
 * @param {function(number, object):void} callback İşlemler bittiği zaman verilen yanıt
 ** arg0: HTTP varsayılan durum kodları
 ** arg1: Ek bilgiler, açıklamalar {Info, ?Detail}
 */
// Bağımlılıklar 
function api(data, callback) {
    // Kabul edilen metotlardan biri mi kontrolü
    if (_validMethods.includes(data.method.toLowerCase())) {
        // İstenilen dosya ismini kırpılmış yoldan alma
        const apiProcess = data.trimmedPath.replace('api/', '').trim();
        if (apiProcess.length > 0) {
            // Uygun ise gerekli işleme aktarma
            _functions[apiProcess][data.method.toLowerCase()](data, callback);
        } else {
            callback(404, {
                Info: 'İstenen api işlemi geçersiz veya bulunamadı :('
            });
        }
    } else {
        // Uygun değilse hata döndürme
        callback(405, {
            Info: "HTML isteğinin metodu uygun değildir :(",
            Detail: "handlers/back-end/users"
        });
    }
}

const _validMethods = ['post', 'get', 'put', 'delete'];

const _functions = {
    users: {
        'post': _users.createUser,
        'get': _users.findUser,
        'put': _users.updateUser,
        'delete': _users.deleteUser
    },
    tokens: {
        'post': _tokens.createToken,
        'get': _tokens.findToken,
        'put': _tokens.updateToken,
        'delete': _tokens.deleteToken
    }
};
//# sourceMappingURL=api.js.map