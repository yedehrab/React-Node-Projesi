'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.fixString = fixString;
exports.fixObject = fixObject;
exports.fixNumber = fixNumber;
exports.fixUsername = fixUsername;
exports.fixPassword = fixPassword;
exports.fixEmail = fixEmail;
exports.fixPhone = fixPhone;
exports.fixId = fixId;
exports.fixExtend = fixExtend;
exports.fixTosAgreement = fixTosAgreement;
exports.fixStatusCode = fixStatusCode;
exports.fixContentType = fixContentType;
exports.fixFullName = fixFullName;
exports.fixPayload = fixPayload;
exports.fixPayloadForJSON = fixPayloadForJSON;
exports.fixPayloadForHTML = fixPayloadForHTML;
exports.fixPayloadForDefault = fixPayloadForDefault;

var _config = require('../config');

/**
 * Yük (bilgayar verisi) düzeltme tipleri
 * * Not: *fixPayload içerisinde kullanılır*
 */
const payloadFixTypes = {
    json: fixPayloadForJSON,
    html: fixPayloadForHTML,
    default: fixPayloadForDefault

    /**
     * Dizgiyi zorlama olmaksızın düzeltme
     * @param {string} str Dizgi
     * @param {boolean} force Dizgi olmaya zorlanmalı mı (varsayılan false)
     * @return {string | boolean} Dizgi düzgün ise kendisi, değilse false veya boş dizgi
     */
};function fixString(str, force = false) {
    return typeof str == 'string' && str.trim().length > 0 ? str.trim() : force ? '' : false;
}

/**
 * Objeyii zorlama olmaksızın düzeltme
 * @param {string} obj Dizgi
 * @param {boolean} force Obje olmaya zorlanmalı mı (varsayılan false)
 * @return {string | boolean} Obje düzgün ise kendisi, değilse false veya boş obje
 */
function fixObject(obj, force = false) {
    return typeof obj == 'object' && obj != null ? obj : force ? {} : false;
}

/**
 * Sayı düzeltme
 * @param {number} num Sayı
 * @return {number | boolean} Sayı düzgün ise kendisi, değilse false
 */
function fixNumber(num) {
    return typeof num == "number" && num > 0 ? num : false;
}

/**
 * Kullanıcı adı düzeltmesi
 * @param {string} username Kullanıcı adı
 * @return {boolean | string} Hata varsa false yoksa kullanıcı adını döndürür
 */
function fixUsername(username) {
    // const possibleChars = "abcdefghijklmnopqrstuvwxyz0123456789_-";
    return typeof username == 'string' && username.trim().length < 15 ? username.trim() : false;
}

/**
 * Şifre düzeltmesi
 * @param {string} password şifre
 * @return {boolean | string} Hata varsa false yoksa şifreyi döndürür
 */
function fixPassword(password) {
    return typeof password == 'string' && password.trim().length > 0 ? password.trim() : false;
}

/**
 * Email düzeltmesi
 * @param {string} email Email
 * @return {boolean | string} Hata varsa false yoksa emaili döndürür
 */
function fixEmail(email) {
    return typeof email == 'string' && email.indexOf('@') > -1 ? email : false;
}

/**
 * Telefon düzeltmesi
 * @param {string} phone Telefon
 * @return {boolean | string} Hata varsa false yoksa telefonu döndürür
 */
function fixPhone(phone) {
    return typeof phone == 'string' && phone.trim().length == 10 ? phone.trim() : false;
}

/**
 * Id düzeltmesi
 * @param {string} id Kimlik (id)
 * @return {boolean | string} Hata varsa false yoksa id'yi döndürür
 */
function fixId(id) {
    return typeof id == "string" && id.trim().length == _config.idLength ? id.trim() : false;
}

/**
 * Süre uzatma düzeltmesi
 * @param {boolean} extend Süre uzatılsın mı değeri (true, false)
 * @return {boolean} Hata varsa false yoksa süre uzatılsın mı değerini döndürür
 */
function fixExtend(extend) {
    return typeof extend == 'boolean' ? extend : false;
}

/**
 * Koşul kabulü düzeltmesi
 * @param {boolean} tos Koşullar kabul edildi mi değeri (true, false)
 * @return {boolean} Hata varsa false yoksa koşullar kabul edilsin mi değerini döndürür
 */
function fixTosAgreement(tos) {
    return typeof tos == 'boolean' ? tos : false;
}

/**
 * Durum kodu düzeltmesi
 * @param {number} statusCode Durum kodu (200, 404)
 * @return {number | boolean} Hata varsa false yoksa durum kodunu döndürür
 */
function fixStatusCode(statusCode) {
    return typeof statusCode == 'number' ? statusCode : 200;
}

/**
 * İçerik tipi düzeltmesi
 * @param {string} contentType İçerik tipi (json, html, css..)
 * @return {string | boolean} Hata varsa false yoksa içerik tipini döndürür
 */
function fixContentType(contentType) {
    return typeof contentType == 'string' ? contentType : 'json';
}

/**
 * Tam isim düzeltmesi
 * @param {string} fullName Tam isim
 * @return {string | boolean} Hata varsa false yoksa tam döndürür
 */
function fixFullName(fullName) {
    return typeof fullName == 'string' && fullName.trim().length > 0 ? fullName.trim() : false;
}

/**
 * Yükü düzeltme
 * @param {string} contentType İçerik tipi (json, html, css..) 
 * @param {object} payload Yük objesi
 * @return {string} Yük dizgisi
 */
function fixPayload(contentType, payload) {
    // İçerik türüne göre yük (bilgisayar) verisi işleme
    return typeof payloadFixTypes[contentType] !== 'undefined' ? payloadFixTypes[contentType](payload) : payloadFixTypes['default'](payload);
}

/**
 * Yükü JSON için düzeltme
 * @param {object} payload Yük objesi
 * @return {string} JSON dizgisi
 */
function fixPayloadForJSON(payload) {
    payload = typeof payload == 'object' ? payload : {};

    return JSON.stringify(payload);
}

/**
 * Yükü HTML için düzeltme
 * @param {object} payload Yük objesi
 * @return {string} Yük dizgisi
 */
function fixPayloadForHTML(payload) {
    return typeof payload == 'string' ? payload : '';
}

/**
 * Yükü varsayılan olarak düzeltme
 * @param {object} payload Yük objesi
 * @return {string} Yük dizgisi
 */
function fixPayloadForDefault(payload) {
    return typeof payload !== 'undefined' ? payload : '';
}
//# sourceMappingURL=fixers.js.map