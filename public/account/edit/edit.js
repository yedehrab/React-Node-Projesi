// Sayfa yüklendiğinde yapılacak eylemler
window.onload = () => {
    // Varsayılan eylemleri başlatma
    app.init();

    // Verileri yükleme
    loadData();

    // Bütün formları seçme
    const editForms = document.querySelectorAll("form");

    for (let i = 0; i < editForms.length; i++) {
        editForms[i].addEventListener("submit", event => {
            // Varsayılan işlemini yapmasını engelliyoruz.
            event.preventDefault();

            // Verileri alma
            const {
                id: formId,
                action: path,
                elements
            } = editForms[i];

            // Formun içindeki öesajları görünmez kılma
            document.querySelector(`#${formId} .formError`).style.display = 'none';
            document.querySelector(`#${formId} .formSuccess`).style.display = 'none';


            // Yükü (bilgisayar verilerini) ve metodu oluşturma
            let payload = {};
            let method = "get";
            for (let i = 0; i < elements.length; i++) {
                // Sadece input ögeleri bize lazım.
                if (elements[i].tagName == "INPUT" && !elements[i].name.includes("display")) {
                    if (elements[i].name == "_method") {
                        method = elements[i].value; 
                    } else {
                        payload[elements[i].name] = elements[i].value;
                    }
                }
            }

            app.client.request(undefined, path, method, {username: payload.username}, payload, (statusCode, response) => {
                if (statusCode == 200) {
                    document.querySelector(`#${formId} .formSuccess`).style.display = "block";

                    // Hesap silinirse kullanıcıyı sistemden çıkarma
                    if (formId == "accountEdit3") {
                        app.logUserOut();

                        // Ana sayfaya yönlendirme
                        window.location = "/";
                    }

                } else {
                    document.querySelector(`#${formId} .formError`).innerHTML == response.Info;
                    document.querySelector(`#${formId} .formError`).style.display = "block";
                }
            })
        });
    }
}

/**
 * Sayfadaki formlar için gerekli verileri yükleme
 */
const loadData = () => {
    // Kullanıcı adı verisini ayarlama
    const username = typeof app.config.sessionToken.username == "string" ? app.config.sessionToken.username : false;
    if (username) {
        // Kullanıcı adı varsa, veriler için istek yollama
        app.client.request(undefined, "api/users", "get", { username: username }, undefined, (statusCode, response) => {
            if (statusCode == 200) {
                // Gizli verileri ayarlama
                const hiddenUsernameInputs = document.querySelectorAll("input.hiddenUsernameInput");
                for (let i in hiddenUsernameInputs) {
                    hiddenUsernameInputs[i].value = response.username;
                }

                // Görünür verileri ayarlama
                document.querySelector("#accountEdit1 .displayUsernameInput").value = response.username;
                document.querySelector("#accountEdit1 .fullNameInput").value = response.fullName;
                document.querySelector("#accountEdit1 .emailInput").value = response.email;
                document.querySelector("#accountEdit2 .phoneInput").value = response.phone;
            } else {
                // Sunucudan kaynaklı hatadan ötürü kullanıcı oturumunu kapatıyoruz.
                app.logUserOut();
            }
        });
    } else {
        // Kullanıcı oturum açmamış
        app.logUserOut();
    }
}