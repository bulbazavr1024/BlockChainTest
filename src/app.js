const btn = document.querySelector('button')
const textArea = document.getElementById("textarea");

// Получение данных с сервера
async function fetchData(url) {
    let req = await fetch(url)
    let res = req.json()

    return res
}

btn.addEventListener('click', (e) => {
    //Получаем текущую задачу с сервера по /api/url , затем подбираем решение текущей задачи
    fetchData('/api/url')
        .then((res) => {
            for (let i = 0; ; i++) {
                let summ = res + i
                let verifiable = sha256(String(summ))
                if ((verifiable[verifiable.length - 1] == 0) && (verifiable[verifiable.length - 2] == 0) && (verifiable[verifiable.length - 3] == 0) && (verifiable[verifiable.length - 4] == 0)) {
                    return result = i
                }

            }
// Отправляем решение текущей задачи на сервер для проверки
        })
        .then(async () => {
            const req = await fetch('/api/url2', {
                method: 'POST',
                headers: {
                    'Content-type': 'Application/json',
                    'Authorization': `Bearer ${textArea.value}`
                },
                body: JSON.stringify({result: result, privateKey: textArea.value})
            })

            const res = req.json()
            if (!textArea.value) {
                alert('Заполните поле privateKey')
            } else if (req.status == 403) {
                alert('Вы ввели некорретный privateKey')
            } else {
                alert('Вы добыли 1vEHT. Поздравляем!')
            }


            return res

        })

    e.preventDefault()
})


