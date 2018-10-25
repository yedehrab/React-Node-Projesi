"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.verifyToken = verifyToken;
exports.createToken = createToken;
exports.deleteToken = deleteToken;
exports.findToken = findToken;
exports.updateToken = updateToken;

var _fixers = require("../../helpers/fixers");

var _data = require("../../data");

var _defaults = require("../../helpers/defaults");

var _config = require("../../config");

/**
 * Belirteçleri onaylamak için kullanılan metot.
 * @param {string} token Onaylanacak belirtecin kimliği
 * @param {string} username Kullanıcı adı
 * @param {function(boolean):void} callback İşlemler bittiği zaman verilen yanıt
 ** arg0: Varsa hata mesajı yoksa false
 */
// Bağımlılıklar
function verifyToken(token, username, callback) {
    if (token) {
        // Beliteci dosyada bulma
        (0, _data.readData)('tokens', token, (err, tokenData) => {
            if (!err && tokenData) {
                // Belirteç verileri doğrulama
                if (tokenData.username == username && tokenData.timeout > Date.now()) {
                    callback(false);
                } else {
                    callback('Oturum onaylanamadı :(');
                }
            } else {
                callback('Oturum bulunamadı :(');
            }
        });
    } else {
        callback('Oturum belirteci geçersiz :(');
    }
}

/**
 * Belirteç oluşturma metodu
 * * Gerekli veriler: *username, password*
 * * Kullanım şekli: *Yükler ile kullanılır (Body içindeki JSON verileri) (localhost:3000/belitecler)*
 * @param {object} data Index.js"te tanımlanan veri objesi. İstekle gelir.
 * @param {function(number, object):void} callback İşlemler bittiği zaman verilen yanıt
 ** arg0: HTTP varsayılan durum kodları
 ** arg1: Belirtec objesi veya ek bilgiler, açıklamalar
 */
function createToken(data, callback) {
    // Gerekli verileri kontrol etme
    const username = (0, _fixers.fixUsername)(data.payload.username);
    const password = (0, _fixers.fixPassword)(data.payload.password);

    // Hata mesajı oluşturma
    let err = "Hatalı veya eksik alanlar: ";

    if (!username) err += "Kullanıcı Adı, ";
    if (!password) err += "Şifre, ";

    // Eğer hata varsa, ',' içerir
    if (!err.includes(',')) {
        // Kullanıcıyı veriler arasında arama
        (0, _data.readData)('users', username, (err, userData) => {
            if (!err && userData) {
                // Eğer şifreler uyuşuyorsa oturum kotrolü
                if ((0, _defaults.hash)(password) == userData.hashedPassword) {
                    // Hali hazırda oturum açık mı
                    // readData('tokens', id, )

                    // Oluşturulacak belirteç (oturum) verileri
                    const tokenData = {
                        id: (0, _defaults.createRandomID)(_config.idLength),
                        username: username,
                        timeout: Date.now() + _config.sessionTimeoutMs

                        // Belirteç (oturum) oluşturma
                    };(0, _data.createData)('tokens', tokenData.id, tokenData, err => {
                        if (!err) {
                            // Berliteci geri çağırma
                            callback(200, {
                                data: tokenData,
                                Info: 'Oturum başarıyla oluşturuldu :)'
                            });
                        } else {
                            callback(500, {
                                Info: 'Oturum oluşturulamadı :(',
                                Detail: err
                            });
                        }
                    });
                } else {
                    callback(404, {
                        Info: 'Belirten kullanıcı için girilen şifre yanlış :('
                    });
                }
            } else {
                callback(404, {
                    Info: 'Belirtilen kullanıcı bulunamadı :(',
                    Detail: err
                });
            }
        });
    } else {
        // Son 2 karakteri kaldırma ", " ve hatayı geri çağırma
        callback(400, {
            Info: err.slice(0, err.length - 2)
        });
    }
}

/**
 * Belirteç silme metodu
 * * Gerekli Veriler: *id*
 * * Kullanım Şekli: *localhost:3000/belirteçler?kimlik=... (Sorgu verisi)*
 * @param {object} data Index.js"te tanımlanan veri objesi. İstekle gelir.
 * @param {function(number, object):void} callback İşlemler bittiği zaman verilen yanıt
 ** arg0: HTTP varsayılan durum kodları
 ** arg1: Ek bilgiler, açıklamalar
 */
function deleteToken(data, callback) {
    // Kimlik kontrolü
    const id = (0, _fixers.fixId)(data.queryStringObject.id);

    // Kimlik geçerliyse devam edeceğiz
    if (id) {
        // Oturumu bulma
        (0, _data.readData)('tokens', id, (err, tokenData) => {
            if (!err && tokenData) {
                // Oturumu silme
                (0, _data.deleteData)('tokens', id, err => {
                    if (!err) {
                        callback(200, {
                            Info: 'Başarıyla çıkış yapıldı :)'
                        });
                    } else {
                        callback(500, {
                            Info: 'Oturum kapatılamadı :(',
                            Detail: err
                        });
                    }
                });
            } else {
                callback(404, {
                    Info: 'Kapatılacak oturum bulunamadı, zaten çıkış yapmışsınız :('
                });
            }
        });
    } else {
        callback(400, {
            Info: 'Oturum kapatmak için oturum kimliği geçersiz :('
        });
    }
}

/**
 * Belirteç (oturum) alma metodu
 * * Gerekli veriler: *id*
 * * Kullanım Şekli: *localhost:3000/belirteçler?kimlik=... (Sorgu verisi)*
 * @param {object} data Index.js"te tanımlanan veri objesi. İstekle gelir.
 * @param {function(number, object):void} callback İşlemler bittiği zaman verilen yanıt
 ** arg0: HTTP varsayılan durum kodları
 ** arg1: Ek bilgiler, açıklamalar
 */
function findToken(data, callback) {
    // Kimlik kontorlü
    const id = (0, _fixers.fixId)(data.queryStringObject.id);

    if (id) {
        // Belirtec bulma
        (0, _data.readData)('tokens', id, (err, tokenData) => {
            if (!err && tokenData) {
                callback(200, tokenData);
            } else {
                callback(404, {
                    Info: 'Aranan belirteç bulunmadı :('
                });
            }
        });
    } else {
        callback(400, {
            Info: 'Oturum kimliği geçerli değil :('
        });
    }
}

/**
 * Belirteç güncelleme meto
 * du
 * * Gerekli Veriler: *id, extend*
 * * Kullanım şekli: *Yükler ile kullanılır (Body içindeki JSON verileri) (localhost:3000/belirtecler)*
 * @param {object} data Index.js"te tanımlanan veri objesi. İstekle gelir.
 * @param {function(number, object):void} callback İşlemler bittiği zaman verilen yanıt
 ** arg0: HTTP varsayılan durum kodları
 ** arg1: Ek bilgiler, açıklamalar
 */
function updateToken(data, callback) {
    // Gerekli verilerin kontorlü
    const id = (0, _fixers.fixId)(data.payload.id);
    const extend = (0, _fixers.fixExtend)(data.payload.extend);

    // Hata mesajını oluşturma
    let errMsg = 'Hatalı olan alanlar: ';
    if (!id) {
        errMsg += 'kimlik, ';
    }
    if (!extend) {
        errMsg += 'süre uzatma, ';
    }

    // ',' içermezse hata yok demektir.
    if (!errMsg.includes(',')) {
        // Belirteç bulma
        (0, _data.readData)('tokens', id, (err, tokenData) => {
            if (!err && tokenData) {
                if (tokenData.timeout > Date.now()) {
                    // Oturum süresini uzatma
                    tokenData.timeout = Date.now() + _config.sessionTimeoutMs;

                    // Belirteci (oturumu) güncelleme
                    (0, _data.updateData)('tokens', id, tokenData, err => {
                        if (!err) {
                            callback(200, {
                                Info: 'Oturum başarıyla güncellendi :)'
                            });
                        } else {
                            callback(500, {
                                Info: 'Oturum güncellenemedi :(',
                                Detail: err
                            });
                        }
                    });
                } else {
                    callback(401, {
                        Info: 'Güncellenmek istenen oturum, sonlanmış :('
                    });
                }
            } else {
                callback(404, {
                    Info: 'Güncellenecek oturum mevcut değil :('
                });
            }
        });
    } else {
        callback(400, {
            Info: errMsg.slice(0, errMsg.length - 2)
        });
    }
}
//# sourceMappingURL=tokens.js.map