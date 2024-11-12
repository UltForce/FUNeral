// api/webhook.js
export default async function handler(req, res) {
  if (req.method === "POST") {
    const { queryResult } = req.body;

    // Example: extract intent name and send a response
    const intentName = queryResult.intent.displayName;

    let responseMessage = "";

    if (intentName === "Welcome") {
      responseMessage = "Hello! How can I help you today?";
    } else {
      responseMessage = "Sorry, I didn't understand that.";
    }

    res.status(200).json({
      fulfillmentText: responseMessage,
    });
  } else {
    res.status(405).send("Method Not Allowed");
  }
}
