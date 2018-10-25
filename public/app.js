/**
 * Uygulama için Front-End
 */

const help = "Admin için konsol arayüzü"

const app = {};

// Yapılandırma
app.config = {
    sessionToken: false
};

// AJAX istemcisi
app.client = {};

/**
 * API istekleri yapma
 * @param {object} headers Başlıklar
 * @param {string} path Yol
 * @param {stirng} methos Metot
 * @param {object} queryStringObject Sorgu dizgisi objesi
 * @param {object} payload Yük (bilgisayar) verileri
 * @param {function(boolean, object | boolean):void} callback Geri çağırma
 * * arg0: *Durum kodu*
 * * arg1: *Yanıt*
 */
app.client.request = (headers, path, method, queryStringObject, payload, callback) => {
    // Verilerin düzenlenmesi
    headers = typeof(headers) == 'object' && headers !== null ? headers : {};
    path = typeof(path) == 'string' ? path : '/';
    method = typeof(method) == 'string' && ['post', 'get', 'put', 'delete'].includes(method.toLowerCase()) ? method.toLowerCase() : 'get';
    queryStringObject = typeof(queryStringObject) == 'object' && queryStringObject !== null ? queryStringObject : {};
    payload = typeof(payload) == 'object' && payload !== null ? payload : {};
    callback = typeof(callback) == 'function' ? callback : false;

    // Her bir sorgu dizgisi objesini, istek yoluna ekliyoruz.
    let requestUrl = path + '?';
    let counter = 0;
    for (let queryKey in queryStringObject) {
        if (queryStringObject.hasOwnProperty(queryKey)) {
            counter++;
            // Eğer birden fazla sorgu dizgisi varsa, ampersan karakteri ile ayırıyoruz.
            if (counter > 1) {
                requestUrl += '&';
            }

            // İsteğe sorgu dizgisi ile anahtarını ekliyoruz.
            requestUrl += `${queryKey}=${queryStringObject[queryKey]}`;
        }
    }

    // HTTP isteğini JSON'a dönüştürme
    const xhr = new XMLHttpRequest();
    xhr.open(method, requestUrl, true);
    xhr.setRequestHeader("Content-type", 'application/json');

    // Her bir başlığı isteğin başlığına ekliyoruz
    for (let headerKey in headers) {
        if (headers.hasOwnProperty(headerKey)) {
            xhr.setRequestHeader(headerKey, headers[headerKey]);
        }
    }

    // Eğer açılmış bir oturum varsa, isteğin başlığına ekleme
    if (app.config.sessionToken) {
        xhr.setRequestHeader("token", app.config.sessionToken.id);
    }

    // İstek geri geldiğinde, yanıtı işleme
    xhr.onreadystatechange = () => {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            // Durum kodunu ve yanıt dizgisini alma
            const statusCode = xhr.status;
            const response = xhr.responseText;

            // Eğer gerekliyse geri çağırma
            if (callback) {
                try {
                    // Durum kodunu ve objeleştirilmiş yanıtı ve geri çağırma
                    const responseObject = JSON.parse(response);
                    callback(statusCode, responseObject);
                } catch (err) {
                    // Durum kodunu ve hatayı geri çağırma
                    callback(statusCode, err);
                }
            }
        }
    }

    // Yükü (bilgisayarı) JSON olarak gönderme
    const payloadString = JSON.stringify(payload);
    xhr.send(payloadString);
}

/**
 * Oturum değişikliğinde oturum belirtecini ayarlama
 * @param {object} token Oturum belirteçi
 */
app.setSessionToken = (token) => {
    // Belirteci ayarlama
    app.config.sessionToken = token;

    // Belirteci dizgi olarak yerel depoda saklama
    const tokenString = JSON.stringify(token);
    localStorage.setItem('tokenString', tokenString);

    // Eğer belirtec geçerliyse giriş yapılması ve olası işlemler (kayıt ol gibi butonların kalıdırılması)
    app.bindLogEvents(token == 'object');
}

/**
 * Varsa oturum belirtecini alma
 * Not: *Oturum belirteci sayfa değiştiğinde kaybolur. Bu sebeple her sayfa güncellenmesinde 
 * oturum değişkenini de güncelemek gerekir.*
 */
app.getSessionToken = () => {
    // Yerel depoda varsa belirtec dizgisini alma ve işleme
    const tokenString = localStorage.getItem('tokenString');
    if (typeof tokenString == 'string') {
        try {
            // Dizgiden obje elde etme
            const token = JSON.parse(tokenString);
            // Belirteci gerekli yere atama
            app.config.sessionToken = token;

            // Giriş yapıldıktan sonraki eylemleri yapma
            app.bindLogEvents(typeof token == 'object');
        } catch (err) {
            // Hata durumunda, oturumu kapatıyoruz
            app.config.sessionToken = false;

            // Oturum kapatıldığında olacak eylemleri tetikleme
            app.bindLogEvents(false);
        }
    } else {
        // Oturum kapatıldığında olacak eylemleri tetikleme
        app.bindLogEvents(false);
    }
}

/**
 * Giriş - Çıkış yapıldıktan sonra yapılacak eylemler
 * @param {boolean} isLoggedIn Giriş yapıldı mı
 */
app.bindLogEvents = (isLoggedIn) => {
    if (isLoggedIn) {
        // Giriş yapılması durumunda
        app.setClassVisiblity("is-login", true);
        app.setClassVisiblity("is-logout", false);
    } else {
        // Çıkış yapılması durumunda
        app.setClassVisiblity("is-login", false);
        app.setClassVisiblity("is-logout", true);
    }
}

app.setClassVisiblity = (className, isVisible) => {
    const elements = document.getElementsByClassName(className);

    for (let i = 0; i < elements.length; i++) {
        if (isVisible) {
            elements[i].classList.remove("is-hidden");
        } else {
            elements[i].classList.add("is-hidden");
        }

    }
}


/**
 * Oturum açma butonunun olayını ayarlama
 */
app.bindLogoutButton = () => {
    document.getElementById("logoutButton").addEventListener("click", event => {
        // Herhangi bir yere yöneltmesini veya sıradan yaptığı işi engelleme
        event.preventDefault();

        // Kullanıcı oturumu kapatma
        app.logUserOut();
    });
}

/**
 * Kullanıcının oturumu kapatma işlemi
 */
app.logUserOut = () => {
    // Şu anki oturum belirtecini alma
    const tokenId = typeof app.config.sessionToken.id == "string" ? app.config.sessionToken.id : false;

    // Sorgu dizgisi objesi oluşturma
    const queryStringObject = {
        id: tokenId
    }

    // Oturum belirteci silme isteğinde bulunma
    app.client.request(undefined, 'api/tokens', 'delete', queryStringObject, undefined, (statusCode, response) => {
        // Oturum belitecini güncelleme
        app.setSessionToken(false);

        // Kullanıcı oturum "kapatıldı" sayfasına yönlendirme
        window.location = "session/deleted";
    })
};

app.renewToken = (callback) => {
    // Anlık oturumu alma ve işleme
    const currentToken = typeof app.config.sessionToken == 'object' ? app.config.sessionToken : false;
    if (currentToken) {
        // Yük oluşturma
        const payload = {
            id: currentToken.id,
            extend: true
        };

        // İstek yollama
        app.client.request(undefined, 'api/tokens', 'PUT', undefined, payload, statusCode => {
            if (statusCode == 200) {
                // Get the new token details
                app.client.request(undefined, 'api/tokens', 'GET', { 'id': currentToken.id }, undefined, function(statusCode, response) {
                    if (statusCode == 200) {
                        app.setSessionToken(response);
                        callback(false);
                    } else {
                        app.setSessionToken(false);
                        callback(true);
                    }
                });
            } else {
                app.setSessionToken(false);
                callback(true);
            }
        });
    } else {
        app.setSessionToken(false);
        callback(true);
    }
}

app.tokenRenewalLoop = () => {
    setInterval(() => {
        app.renewToken(err => {
            if (!err)
                console.log("Oturum yenilendi :)", Date.now());
            else 
            console.log(err);
        })
    }, 1000 * 60);
};

/**
 * Uygulama için gerekli metotların çalıştırılması
 */
app.init = () => {
    /**
     * Oturum belirtecini alma (app.config.sessionToken'e). Oturum belirteci sayfa değiştiğinde kaybolur. 
     * Bu sebeple her sayfa güncellenmesinde oturum değişkenini de güncelemek gerekir.
     */
    app.getSessionToken();

    // Oturum kapatma butonunun olayını ayarlama
    app.bindLogoutButton();

    // Oturum yenileme döngüsü
    app.tokenRenewalLoop();
}