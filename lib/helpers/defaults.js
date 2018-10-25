"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.contentTypes = undefined;
exports.JSONtoObject = JSONtoObject;
exports.hash = hash;
exports.createRandomID = createRandomID;

var _fixers = require("./fixers");

var _crypto = require("crypto");

/**
 * Json'u objeye dönüştürme (parsing)
 * @param {string} str Dönüştürülecek json verisi
 * @return {object} JSON objesi | { } (boş obje)
 */
// Bağımlılıklar
function JSONtoObject(str) {
    try {
        const object = JSON.parse(str);
        return object;
    } catch (e) {
        return {};
    }
}

/**
 * Dizgiyi şifreleme (hashing)
 * @param {string} str Şifrelenecek dizgi
 * @return {string} Şifrelenmiş dizgi
 */
function hash(str) {
    str = (0, _fixers.fixString)(str);
    if (str) {
        return (0, _crypto.createHash)("sha256").update(str).digest("hex");
    } else {
        return false;
    }
}

/**
 * Rastgele kimlik oluşturma
 * @param {number} idSize Kimlik uzunluğu
 * @return {boolean | string} Oluşturulan kimlik verisi
 */
function createRandomID(idSize) {
    // Kimlik uzunluğunu düzeltme
    idSize = (0, _fixers.fixNumber)(idSize);
    if (idSize) {
        // Olası karakterler
        const possibleChars = "abcdefghijklmnopqrstuvwxyz0123456789";

        // Oluşturalacak olan kimlik
        let id = "";

        // Rastgele olası harf olma ve ekleme
        for (let i = 0; i < idSize; i++) {
            let randomChar = possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
            id += randomChar;
        }

        return id;
    } else {
        return false;
    }
}

/**
 * Uzantı türlerine göre, başlık tipleri
 */
const contentTypes = exports.contentTypes = {
    json: 'application/json',
    js: 'application/javascript',
    html: 'text/html',
    css: 'text/css',
    plain: 'text/plain',
    favicon: 'image/x-icon',
    png: 'image/png',
    jpg: 'image/jpg'
};
//# sourceMappingURL=defaults.js.map