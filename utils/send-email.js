const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

//oAuth Client for Nodemailer
const oauth2Client = new OAuth2(
  process.env.oauth_clientid, // ClientID
  process.env.oauth_client_secret, // Client Secret
  "https://developers.google.com/oauthplayground" // Redirect URL
);
oauth2Client.setCredentials({
  refresh_token: process.env.oauth_refresh_token,
});

//getting the accessToken from oAuth
const accessToken = oauth2Client.getAccessToken();

//nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: "prasoongama@gmail.com",
    clientId: process.env.oauth_clientid,
    clientSecret: process.env.oauth_client_secret,
    refreshToken: process.env.oauth_refresh_token,
    accessToken: accessToken,
  },
});

/**
 *
 * @param {*} activation_code : OTP
 * @param {*} email
 * @description sends email to the user email address with the OTP for signing in
 */
const sendEmail = async (activation_code, email) => {
  //Email structure
  const output = `
                <h2>Please use the below code to activate your account</h2>
                <h2>${activation_code}</h2>
                <p><b>NOTE: </b> The above code expires in 10 minutes.</p>
                <p>Thanks</p>
                <p>Loan Manager Team</p>
                `;
  // send mail with defined transport object
  const mailOptions = {
    from: '"Loan Manager Admin" <loanmanager@gmail.com>', // sender address
    to: email, // email of the receiver
    subject: "Account Verification✔ for Loan Manager", // Subject line
    generateTextFromHTML: true,
    html: output, // html body
  };
  return await transporter.sendMail(mailOptions);
};

const sendEmailToAdmins = async (adminGroup) => {
  //Email structure
  const output = `
                <h3>Dear Admin</h3>
                <h3>A new loan application is pending for your approval. Please visit the admin dashboard to approve loan application</h3>
                <h3> <a href=${process.env.client_url} target="_blank"> Go to Dashboard </a> </h3>
                <p>Thanks</p>
                <p>Loan Manager Admin</p>
                `;
  // send mail with defined transport object
  const mailOptions = {
    from: '"Loan Manager Admin" <loanmanager@gmail.com>', // sender address
    to: adminGroup, // email of the receiver
    subject: "Loan approval notification", // Subject line
    generateTextFromHTML: true,
    html: output, // html body
  };
  return await transporter.sendMail(mailOptions);
};

exports.sendEmail = sendEmail;
exports.sendEmailToAdmins = sendEmailToAdmins;
