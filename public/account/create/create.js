// Sayfa açıldığında formun olayını oluşturma
window.onload = () => {
    // Ana js'i başlatma
    app.init();

    document.querySelector("form").addEventListener("submit", function(event) {
        // Varsayılan submit işlemini yapmasını engelliyoruz.
        event.preventDefault();

        // Verileri alma
        const formId = this.id;
        const path = this.action;
        const method = this.method.toUpperCase();

        // Hata mesajını gizleme
        document.querySelector(`#${formId} .formError`).style.display = 'hidden';

        // Yük (bilgisayar) verileri ayarlama
        let payload = {};
        const elements = this.elements;
        for (let i = 0; i < elements.length; i++) {
            // Formdaki her girdinin değerini belirleyip, yük'e ekleme
            const valueOfElement = elements[i].type !== 'checkbox' ? elements[i].value : elements[i].checked;
            payload[elements[i].name] = valueOfElement;
        }

        app.client.request(undefined, path, method, undefined, payload, (statusCode, response) => {
            // Eğer gerekliyse form üzerinde hata mesajı gösterme
            if (statusCode !== 200) {
                // Hata mesajını belirleme ve gerekli yere yazıp, görünür kılma
                const errMsg = typeof response.Info == 'string' ? response.Info : 'Belirlenemeyen bir hata oluştu :(';
                document.querySelector(`#${formId} .formError`).innerHTML = errMsg;
                document.querySelector(`#${formId} .formError`).style.display = 'block';
            } else {
                // Oturum açmak için verileri ayarlama
                const logInData = {
                    username: payload.username,
                    password: payload.password
                }

                // Oturum açma
                app.client.request(undefined, 'api/tokens', 'post', undefined, logInData, (statusCode, response) => {
                    // Eğer gerekliyse form üzerinde hata mesajı gösterme
                    if (statusCode !== 200) {
                        // Hata mesajını belirleme ve gerekli yere yazıp, görünür kılma
                        const errMsg = typeof response.Info == 'string' ? response.Info : 'Belirlenemeyen bir hata oluştu :(';
                        document.querySelector(`#${formId} .formError`).innerHTML = errMsg;
                        document.querySelector(`#${formId} .formError`).style.display = 'block';
                    } else {
                        // Oturum belirtecini ayarlama
                        app.setSessionToken(response.data);

                        // Ana menüye dönme
                        window.location = '/';
                    }
                });
            }
        });

    });
};