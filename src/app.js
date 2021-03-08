const btn = document.querySelector('button')
const textArea = document.getElementById("textarea");

async function fetchData(url) {
    let req = await fetch(url)
    let res = req.json()
    console.log(res)

    return res
}

btn.addEventListener('click', (e) => {
    fetchData('/api/url')
        .then((res) => {
            for (let i = 0; ; i++) {
                let summ = res + i
                let verifiable = sha256(String(summ))

                if ((verifiable[verifiable.length - 1] == 0) && (verifiable[verifiable.length - 2] == 0) && (verifiable[verifiable.length - 3] == 0) && (verifiable[verifiable.length - 4] == 0)) {
                    return result = i
                }

            }

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

            console.log(res);
            if (textArea.value) {
                alert('Вы смайнили 1vETH')}
            else {
                alert('Вы не авторизировались , введите ваш privateKey')
            }


            return res

        })

    e.preventDefault()
})


