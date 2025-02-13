const { TelegramClient, Api } = require("telegram");
const { StringSession } = require("telegram/sessions");
const readline = require("readline");
const { authorization } = require("./authorization.js");

const stringSession = new StringSession(""); // Заполнится после логина

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});


async function addContact(client, phoneNumber, firstName, lastName) {
    try {
        const result = await client.invoke(
            new Api.contacts.ImportContacts({
                contacts: [
                    new Api.InputPhoneContact({
                        clientId: Math.floor(Math.random() * 100000),
                        phone: phoneNumber,
                        firstName: firstName,
                        lastName: lastName,
                    }),
                ],
            })
        );

        console.log(`Контакт ${firstName} ${lastName} добавлен.`);
        
        if (result.users.length > 0) {
            return result.users[0].id;
        } else {
            console.error("Ошибка: пользователь не найден.");
            return null;
        }
    } catch (err) {
        console.error(`Ошибка добавления контакта ${firstName} ${lastName}:`, err);
        return null;
    }
}

async function sendMessage(client, userId, message) {
    try {
        await client.sendMessage(userId, { message });
        console.log(`Сообщение отправлено пользователю ${userId}: "${message}"`);
    } catch (err) {
        console.error(`Ошибка при отправке сообщения:`, err);
    }
}

(async () => {
    console.log("Загрузка интерактивного примера...");
    const client = new TelegramClient(stringSession, authorization.apiId, authorization.apiHash, {
        connectionRetries: 5,
    });

    await client.start({
        phoneNumber: async () =>
        new Promise((resolve) => rl.question("Введите ваш номер телефона: ", resolve)),
        password: async () =>
        new Promise((resolve) => rl.question("Введите ваш пароль: ", resolve)),
        phoneCode: async () =>
        new Promise((resolve) => rl.question("Введите код который вы получили: ", resolve)),
        onError: (err) => console.log(err),
    });

    console.log("Теперь вы должны быть подключены.");
    console.log(client.session.save()); 

    const userId = await addContact(client, "+79625603653", "Вадим", "Муравьев");

    if (userId) {
        await sendMessage(client, userId, "Привет, Вадим!");
    }


	//    rl.close();
    })();
