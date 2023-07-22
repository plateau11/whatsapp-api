"use strict";

// Access token for your app
const token = "EAAywaywuNK8BANh4ZBxaW72L6pJgbeZAHgwvcxXAAbfy4gx1csLhgfuwZAf3Rd16f1zrtw2EVOHo09VcieFNm2dFeXb106CpIEZB5HkLZCMoZAFI54DF5oRhPgTjiSCv2pvPZAM3ZAr6kVTbBFWiZBsY6Cu1wM04AIYWRBKRggxefIuZAZCx8cem8IFcglJ3JUlTUkP8rksLGfPioPR7gLWna9I";
const path = require('path')


// Imports dependencies and set up http server
const express = require("express");
const body_parser = require("body-parser");
const axios = require("axios").default;
const app = express().use(body_parser.json()); // creates express http server
const directory = path.join(__dirname,'../public')


app.use(express.static(directory));
const port = process.env.PORT || 3001

// Sets server port and logs message on success

app.listen(port, () => {
  console.log(`Server is up on port ${port}!`)
})

app.get('',(req,res)=>{
    res.render('index')
})


// Accepts POST requests at /webhook endpoint
app.post("/webhook", (req, res) => {
  // Parse the request body from the POST
  let body = req.body;

  // Check the Incoming webhook message
  console.log(JSON.stringify(req.body, null, 2));

  // Check if the request has the necessary data for sending a response
  if (
    body.entry &&
    body.entry[0].changes &&
    body.entry[0].changes[0] &&
    body.entry[0].changes[0].value.messages &&
    body.entry[0].changes[0].value.messages[0]
  ) {
    const phoneNumberId = body.entry[0].changes[0].value.from;
    const messageText = body.entry[0].changes[0].value.messages[0].text;

    axios
      .post(
        `https://graph.facebook.com/v12.0/${phoneNumberId}/messages?access_token=${token}`,
        {
          messaging_product: "whatsapp",
          to: "+918967083743", // Change the phone number here
          message: {
            text: "Hi, this is a response message.",
          },
        }
      )
      .then((response) => {
        console.log("Message sent:", response.data);
        res.sendStatus(200);
      })
      .catch((error) => {
        console.error("Error sending message:", error);
        res.sendStatus(500);
      });
  } else {
    // Return a '404 Not Found' if event is not from a WhatsApp API
    res.sendStatus(404);
  }
});


// app.get('/',(req,res)=>{
//   res.render('index.html')
// })



// Accepts GET requests at the /webhook endpoint. You need this URL to setup webhook initially.
// info on verification request payload: https://developers.facebook.com/docs/graph-api/webhooks/getting-started#verification-requests
app.get("/webhook", (req, res) => {
  /**
   * UPDATE YOUR VERIFY TOKEN
   * This will be the Verify Token value when you set up webhook
   **/
  const verify_token = "HAPPY";

  // Parse params from the webhook verification request
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  // Check if a token and mode were sent
  if (mode && token) {
    // Check the mode and token sent are correct
    if (mode === "subscribe" && token === verify_token) {
      // Respond with 200 OK and challenge token from the request
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});
