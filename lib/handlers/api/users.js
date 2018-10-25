'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createUser = createUser;
exports.deleteUser = deleteUser;
exports.findUser = findUser;
exports.updateUser = updateUser;

var _data = require('../../data');

var _tokens = require('./tokens');

var _defaults = require('../../helpers/defaults');

var _fixers = require('../../helpers/fixers');

var _util = require('util');

// Hata ayıklama mesajları
const debug = (0, _util.debuglog)('users');

/**
 * Kullanıcı oluşturma metodu
 * * Gerekli Veriler: *username, email, password, tosAgreement*
 * * Not: *phone* kimlik yerine kullanılmaktadır.
 * * Kullanım şekli: *Yükler ile kullanılır (Body içindeki JSON verileri) (localhost:3000/users)*
 * @param {object} data Index.js"te tanımlanan veri objesi. İstekle gelir.
 * @param {function(number, object):void} callback İşlemler bittiği zaman verilen yanıt
 ** arg0: HTTP varsayılan durum kodları
 ** arg1: Ek açıklamalar objesi {Info, ?Detail}
 */
// Bağımlılıklar
function createUser(data, callback) {
    // Gerekli verileri kontrol etme ve düzenleme
    const username = (0, _fixers.fixUsername)(data.payload.username);
    const email = (0, _fixers.fixEmail)(data.payload.email);
    const password = (0, _fixers.fixPassword)(data.payload.password);
    const tosAgreement = (0, _fixers.fixTosAgreement)(data.payload.tosAgreement);

    // Hata mesajı oluşturma
    let err = "Hatalı veya eksik alanlar: ";

    if (!username) err += "Kullanıcı Adı, ";
    if (!email) err += "Email, ";
    if (!password) err += "Şifre, ";
    if (!tosAgreement) err += "Koşul Kabulü, ";

    // Eğer ',' içermezse hata yoktur
    if (!err.includes(',')) {
        // Hata yoksa, kullancının yeni olup olmadığını kontrol etme
        (0, _data.readData)('users', username, err => {
            // Hata yoksa, kullanıcıyı oluşturma
            if (err) {
                // Şifreyi gizleme
                const hashedPassword = (0, _defaults.hash)(password);

                // Şifre başarıyla gizlendiyse devam edeceğiz
                if (hashedPassword) {
                    // Kullanıcı objesi
                    const userObject = {
                        username: username,
                        email: email,
                        hashedPassword: hashedPassword,
                        tosAgreement: tosAgreement
                    };

                    // Kullanıcı verisi oluşturma
                    (0, _data.createData)('users', username, userObject, err => {
                        if (!err) {
                            callback(200, {
                                Info: 'Kullanıcı oluşturuldu :)'
                            });
                        } else {
                            callback(500, {
                                Info: 'Kullanıcı oluşturulamadı :(',
                                Detail: err
                            });
                        }
                    });
                } else {
                    callback(500, {
                        Info: 'Kullanıcı şifresi gizlenemedi :('
                    });
                }
            } else {
                callback(400, {
                    Info: 'Bu kullanıcı adı zaten kullanımda :('
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
 * Kullanıcı verileri güncelleme
 * * Gerekli Veriler: *username*
 * * Not: *Sadece kimliği onaylanmış kişiler, kendi bilgilerini değiştirebilir. (Diğerlerine erişemez)*
 * * Kullanım Şekli: *localhost:3000/kullanıcılar?telefonNo=... (Sorgu Verisi)*
 * @param {object} data Index.js"te tanımlanan veri objesi. İstekle gelir.
 * @param {function(number, object):void} callback İşlemler bittiği zaman verilen yanıt
 ** arg0: HTTP varsayılan durum kodları
 ** arg1: Ek bilgiler, açıklamalar
 */
function deleteUser(data, callback) {
    // Telefon numarasını kontrol edip, düzenliyoruz
    const username = (0, _fixers.fixUsername)(data.queryStringObject.username);
    const password = (0, _fixers.fixPassword)(data.payload.password);

    // Telefon numarası geçerliyse devam edeceğiz
    if (username) {
        // Oturum Onaylama
        const token = typeof data.headers.token == 'string' ? data.headers.token : false;
        (0, _tokens.verifyToken)(token, username, err => {
            // Hata yoksa, kullanıcıyı silme işlemini deniyoruz
            if (!err) {
                // Kullanıcıyı kayıtlarda bulma
                (0, _data.readData)('users', username, (err, userData) => {
                    if (!err) {
                        if ((0, _defaults.hash)(password) == userData.hashedPassword) {
                            (0, _data.deleteData)('users', username, err => {
                                if (!err) {
                                    callback(200, {
                                        Info: 'Kullanıcı başarıyla silindi :)'
                                    });
                                } else {
                                    callback(500, {
                                        Info: 'Kullanıcı silinemedi :(',
                                        Detail: err
                                    });
                                }
                            });
                        } else {
                            callback(400, {
                                Info: "Şifre doğru değil :("
                            });
                        }
                    } else {
                        callback(404, {
                            Info: 'Silinecek kullanıcı bulunamadı veya hata meydana geldi :(',
                            Detail: err
                        });
                    }
                });
            } else {
                callback(401, {
                    Info: err
                });
            }
        });
    } else {
        callback(400, {
            Info: 'Telefon numarası geçerli değil :('
        });
    }
}

/**
 * Kullanıcı girişi
 * * Gerekli Veriler: *username*
 * * Not: *Sadece kimliği onaylanmış kişiler, kendi biligilerine erişebilir. (Diğerlerine erişemez)*
 * * Kullanım Şekli: *localhost:3000/kullanıcılar?telefonNo=... (Sorgu Verisi)*
 * @param {object} data Index.js"te tanımlanan veri objesi. İstekle gelir.
 * @param {function(number, object):void} callback İşlemler bittiği zaman verilen yanıt
 ** arg0: HTTP varsayılan durum kodları
 ** arg1: Kullanıcı bilgileri, ek bilgiler veya açıklamalar
 */
function findUser(data, callback) {
    // Kullanıcı adı verisini düzenleyip alma
    const username = (0, _fixers.fixUsername)(data.queryStringObject.username);

    // Eğer kullanıcı adı geçerliyse, oturumu kontrol edeceğiz
    if (username) {
        // Oturumu verisini düzenleyip alma ve kontrol etme
        const token = typeof data.headers.token == 'string' ? data.headers.token : false;
        (0, _tokens.verifyToken)(token, username, err => {
            // Oturum onaylandıysa kullanıcı bilgilerini alacağız
            if (!err) {
                // Kullanıcı dosyasından kullanıcıyı arıyoruz
                (0, _data.readData)('users', username, (err, userData) => {
                    // Hata yok ve kullanıcı verisi var ise kullanıcıyı geri döndüreceğiz
                    if (!err && userData) {
                        // Gizlenmiş şifreyi kaldırıyoruz
                        delete userData.hashedPassword;

                        callback(200, userData);
                    } else {
                        callback(404, {
                            Info: 'Kullanıcı bulunamadı :(',
                            Detail: err
                        });
                    }
                });
            } else {
                callback(401, {
                    Info: err
                }, 'json');
            }
        });
    } else {
        callback(400, {
            Info: 'Kullanıcı adı geçerli değil :('
        });
    }
}

/**
 * Kullanıcı verileri güncelleme
 * * Gerekli veriler: *username*
 * * Not: *Sadece kimliği onaylanmış kişiler, kendi bilgilerini değiştirebilir. (Diğerlerine erişemez)*
 * * Kullanım şekli: *Yükler ile kullanılır (Bzody içindeki JSON verileri) (localhost:3000/kullanicilar)*
 * @param {object} data Index.js"te tanımlanan veri objesi. İstekle gelir.
 * @param {function(number, object):void} callback İşlemler bittiği zaman verilen yanıt
 ** arg0: HTTP varsayılan durum kodları
 ** arg1: Ek bilgiler, açıklamalar
 */
function updateUser(data, callback) {
    // Gerekli verileri kontrol etme ve düzenleme
    const username = (0, _fixers.fixUsername)(data.payload.username);
    const fullName = (0, _fixers.fixFullName)(data.payload.fullName);
    const email = (0, _fixers.fixEmail)(data.payload.email);
    const phone = (0, _fixers.fixPhone)(data.payload.phone);
    const password = (0, _fixers.fixPassword)(data.payload.password);

    // Veriler istendiği gibi ise diğer verileri kontrol ediyoruz
    if (username) {
        if (fullName || phone || password || email) {
            // Oturum belirtecini kontrol etme
            const token = typeof data.headers.token == 'string' ? data.headers.token : false;
            (0, _tokens.verifyToken)(token, username, err => {
                // Hata yoksa güncellenecek kullancıyı arama
                if (!err) {
                    // Kullanıcıyı arıyoruz
                    (0, _data.readData)('users', username, (err, userData) => {
                        // Hata yoksa ve kullanıcı objesi boş değilse devam ediyoruz
                        if (!err && userData) {
                            // Başarı mesajı
                            let succesMsg = "Başarıyla güncellenen alanlar: ";
                            if (fullName) {
                                userData.fullName = fullName;
                                succesMsg += 'İsim, ';
                            }
                            if (email) {
                                userData.email = email;
                                succesMsg += 'Email, ';
                            }
                            if (password) {
                                userData.hashedPassword = (0, _defaults.hash)(password);
                                succesMsg += 'Şifre, ';
                            }
                            if (succesMsg.includes(',')) {
                                succesMsg = succesMsg.slice(0, succesMsg.length - 2);
                            }

                            // Verileri güncelleme
                            (0, _data.updateData)('users', username, userData, err => {
                                if (!err) {
                                    callback(200, {
                                        Info: succesMsg
                                    });
                                } else {
                                    callback(500, {
                                        Info: 'Kullanıcı güncellenemedi :(',
                                        Detail: err
                                    });
                                }
                            });
                        } else {
                            callback(404, {
                                Info: 'Kullanıcı bulunamadı :(',
                                Detail: err
                            });

                            // Hata ayıklama
                            debug("\x1b[31m%s\x1b[0m", "Kullanıcı bulunamadı :(\n\t\t" + err);
                        }
                    });
                } else {
                    callback(401, {
                        Info: err
                    });
                }
            });
        } else {
            callback(400, {
                Info: 'Girilen hiçbir veri kabul edilebilir değil :('
            });

            // Hata ayıklama
            debug("\x1b[31m%s%o\x1b[0m", "Değiştirilmek istenen hiçbir veri kabul edilebilir değil :(\n\t\t" + "Veriler: ", data.payload);
        }
    } else {
        callback(400, {
            Info: 'Kullanıcı adı geçerli değil :('
        });

        // Hata ayıklama
        debug("\x1b[31m%s\x1b[0m", "Kullanıcı adı geçerli değil :(\n\t\t" + "Kullanıcı Adı: " + data.payload.username);
    }
}
//# sourceMappingURL=users.js.map