function urlDeletedEmailTemplate(shortUrl) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          padding: 20px;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: auto;
          background: white;
          padding: 20px;
          border-radius: 10px;
        }
        h2 {
          color: #2c3e50;
        }
        .message {
          font-size: 16px;
          color: #333;
        }
        .footer {
          margin-top: 20px;
          font-size: 14px;
          color: #888;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>URL Deleted</h2>
        <p class="message">We wanted to inform you that the following shortened URL has been deleted:</p>
        <p class="message">Shortened URL: <a href="${shortUrl}">${shortUrl}</a></p>
        <p class="message">If you did not request this deletion, please contact support immediately.</p>
        <div class="footer">- URL Shortener Support Team</div>
      </div>
    </body>
    </html>
  `;
}

module.exports = urlDeletedEmailTemplate;
