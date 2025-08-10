const { Client, LocalAuth } = require("whatsapp-web.js");
//axios
const axios = require("axios");

const qrcode = require("qrcode-terminal");

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu'
    ],
    headless: true
  }
});

const fs = require("fs");

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: false }, (qrcodeString) => {
    fs.writeFileSync("qr.txt", qrcodeString);
    console.log("QR kod qr.txt faylında saxlanıldı.");
  });
});

client.on("ready", () => {
  console.log("Client is ready!");
});

client.on("message_create", async (msg) => {
  console.log("MESSAGE RECEIVED", msg, msg.from, msg.to, msg.body, msg.author);

  // Ignore messages sent by me to myself no.  
  if (msg.id.fromMe) {
    console.log("Ignore : Message sent by me");
    return;
  }

  // Add your whitelisted whatsapp numbers - Bot will be activated to those numbers only
  let white_list_responders = ["994517332060@c.us","994513630069@c.us","994504441713@c.us"];

  // if msg.from contains @g.us - its from group , else its from contact
  if (msg.from.includes("@g.us")) {
    console.log("Group message");
    //check if the message is from a white listed user //mentionedIds
    let mentionedIds = msg.mentionedIds;
    console.log("Mentioned Ids", mentionedIds);
    //if mentioned ids are present in the white list then respond
    let is_white_listed = false;
    if (mentionedIds) {
      mentionedIds.forEach((id) => {
        if (white_list_responders.includes(id) && white_list_responders.includes(msg.from)) {
          is_white_listed = true;
          respond_to_message(msg);
        }
      });
    } 
  } else {
    console.log("Personal message");
    //check if the message is from a white listed user
    if (white_list_responders.includes(msg.from)) {
      console.log("White listed user");
      //send a message to the user
      respond_to_message(msg);
      //client.sendMessage(msg.from, 'This is a response from n8n');
    } else {
      console.log("Not a white listed user");
    }
  }
});

client.initialize();

// filepath: c:\Users\Məzahir\Desktop\whatsapp-ai-bot-main (1)\whatsapp-ai-bot-main\index.js
// ...existing code...
respond_to_message = async (msg) => {
  if (msg.body) {
    let data = { msg: msg.body, from: msg.from, from_name: msg._data.notifyName };
    console.log("Data to n8n", data);
    try {
      let response = await axios.post("https://hook.eu2.make.com/7jhcf23vqfsk50vb9ltitdufs3329zv5", data);
      console.log("Response from n8n", response.data.output);
      if (response.data.output) {
        msg.reply(response.data.output);
      } else {
        console.log("No response from n8n");
      }
    } catch (error) {
      console.error("Error sending to webhook:", error.message);
    }
  } else {
    console.log("No message body");
  }
};

