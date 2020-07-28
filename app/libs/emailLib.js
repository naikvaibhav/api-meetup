const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const moment = require("moment");
const time = require("./timeLib");
const nodemailer = require("nodemailer");

var transporter = nodemailer.createTransport({
  host: "smtp.zoho.eu",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.email, // your domain email address
    pass: process.env.password, //  password for the application
  },
});

let emailOnMeetingCreation = function (
  email,
  name,
  startDate,
  purpose,
  endDate,
  location
) {
  let meetingDate = time.converToLocalDayDate(startDate);
  let startTime = time.convertToLocalHoursMinutes(startDate);
  let endTime = time.convertToLocalHoursMinutes(endDate);
  var createMeetingEmail = transporter.templateSender(
    {
      subject: "Meeting Created",
      html: `<body>
      <div
        style="
          text-align: center;
          background-color: #eaeded;
          padding-bottom: 4%;
          font-family: georgia, garamond, serif;
          font-size: 16px;
        "
      >
        <div
          style="background-color: #002651 !important; color: #fff; padding: 1%;"
        >
          <h4 style="font-weight: 700; font-size: 25px;">Meet Up</h4>
        </div>
        <p>
          Hi <strong>${name}</strong>
        </p>
        <p>
          You have a meeting arranged on <strong>${meetingDate}</strong
          >, the purpose of the meeting is: <strong>${purpose}</strong>
        </p>
        <p>
          The meeting will start at <strong>${startTime}</strong> and end at
          <strong>${endTime}</strong>
        </p>
        <p>
          Location of the meeting is <strong>${location}</strong>
        </p>
      </div>
    </body>`,
    },
    {
      from: "meetup@naikvaibhav.online",
    }
  );

  // use template based sender to send a message
  createMeetingEmail(
    {
      to: email,
    },
    function (err, info) {
      if (err) {
        console.log("Error");
      } else {
        console.log("Meeting created mail sent");
      }
    }
  );
};

let emailOnEditingMeeting = function (
  email,
  name,
  startDate,
  purpose,
  endDate,
  location
) {
  let meetingDate = time.converToLocalDayDate(startDate);
  let startTime = time.convertToLocalHoursMinutes(startDate);
  let endTime = time.convertToLocalHoursMinutes(endDate);
  var editMeetingEmail = transporter.templateSender(
    {
      subject: "Meeting Edited",
      html: `<body>
      <div
        style="
          text-align: center;
          background-color: #eaeded;
          padding-bottom: 4%;
          font-family: georgia, garamond, serif;
          font-size: 16px;
        "
      >
        <div
          style="background-color: #002651 !important; color: #fff; padding: 1%;"
        >
          <h4 style="font-weight: 700; font-size: 25px;">Meet Up</h4>
        </div>
        <p>
          Hi <strong>${name}</strong>
        </p>
        <p>You'r arranged meeting on <strong>${purpose}</strong> has been edited.</p>
        <p>The meeting will start on <strong>${meetingDate}</strong> at <strong>${startTime}</strong> and end at <strong>${endTime}</strong></p>
        <p>
          Location of the meeting is <strong>${location}</strong>
        </p>
      </div>
    </body>`,
    },
    {
      from: "naikvaibhav@angularweb.tech",
    }
  );

  // use template based sender to send a message
  editMeetingEmail(
    {
      to: email,
    },
    function (err, info) {
      if (err) {
        console.log("Error");
      } else {
        console.log("Meeting edited mail sent");
      }
    }
  );
};

let emailOnMeetingReminder = function (email, name, purpose) {
  var meetingReminderEmail = transporter.templateSender(
    {
      subject: "Meeting Reminder Email",
      html: `<body>
      <div
        style="
          text-align: center;
          background-color: #eaeded;
          padding-bottom: 4%;
          font-family: georgia, garamond, serif;
          font-size: 16px;
        "
      >
        <div
          style="background-color: #002651 !important; color: #fff; padding: 1%;"
        >
          <h4 style="font-weight: 700; font-size: 25px;">Meet Up</h4>
        </div>
        <p>Hi <strong>${name}</strong> a gentle reminder from Meet up</p>
        <p>You'r arranged meeting on <strong>${purpose}</strong> will begin within 1 min from now </p>
      </div>
    </body>`,
    },
    {
      from: "naikvaibhav@angularweb.tech",
    }
  );

  // use template based sender to send a message
  meetingReminderEmail(
    {
      to: email,
    },
    function (err, info) {
      if (err) {
        console.log("Error");
      } else {
        console.log("Meeting reminder mail sent");
      }
    }
  );
};

let emailOnResetPassword = function (email, link) {
  var passwordResetEmail = transporter.templateSender(
    {
      subject: "Reset Password Link",
      html: `<body>
      <div style="background-color:#EAEDED;padding-bottom:4%;font-family:georgia,garamond,serif;font-size:16px;">
      <div style="background-color: #002651!important;color:#fff;padding:1%;">
      <h4 style="text-align:center;font-weight:700;font-size:25px">Meet Up</h4>
     </div>
      <div style="padding-right:1%;padding-left:1%">
      <p>You are receiving this email because you have requested the reset of the password for your account.</p>
      <p>Please click on the following link, or past this into your browser within 15 minutes of receiving it: <a href="${link}" target="_blank" >${link}</a>
      <p>If you did not request this, please ignore this email and your password will remain unchanged</p>
      </div>
   </div>
    </body>`,
    },
    {
      from: "naikvaibhav@angularweb.tech",
    }
  );

  // use template based sender to send a message
  passwordResetEmail(
    {
      to: email,
    },
    function (err, info) {
      if (err) {
        console.log("Error");
      } else {
        console.log("Password reset mail sent");
      }
    }
  );
};

// let emailOnMeetingCreation = (
//   email,
//   name,
//   startDate,
//   purpose,
//   endDate,
//   location
// ) => {
//   let meetingDate = time.converToLocalDayDate(startDate);
//   let startTime = time.convertToLocalHoursMinutes(startDate);
//   let endTime = time.convertToLocalHoursMinutes(endDate);
//   const msg = {
//     to: email,
//     from: "naikvaibhav@angularweb.tech",
//     template_id: "d-8519e8bc934243d4bb51e074388519a5",
//     dynamic_template_data: {
//       userName: name,
//       date: meetingDate,
//       purpose: purpose,
//       startTime: startTime,
//       endTime: endTime,
//       location: location,
//       footer: "This is confirmation mail please do not reply to this email",
//     },
//   };
//   sgMail.send(msg).then(
//     () => {},
//     (error) => {
//       console.error(error);

//       if (error.response) {
//         console.error(error.response.body);
//       }
//     }
//   );
// };

// let emailOnEditingMeeting = (
//   email,
//   name,
//   startDate,
//   purpose,
//   endDate,
//   location
// ) => {
//   let meetingDate = time.converToLocalDayDate(startDate);
//   let startTime = time.convertToLocalHoursMinutes(startDate);
//   let endTime = time.convertToLocalHoursMinutes(endDate);
//   const msg = {
//     to: email,
//     from: "naikvaibhav@angularweb.tech",
//     template_id: "d-5a85dcc478b9411fb42eab7c969bbc29",
//     dynamic_template_data: {
//       userName: name,
//       date: meetingDate,
//       purpose: purpose,
//       startTime: startTime,
//       endTime: endTime,
//       location: location,
//       footer: "This is confirmation mail please do not reply to this email",
//     },
//   };
//   sgMail.send(msg).then(
//     () => {},
//     (error) => {
//       console.error(error);

//       if (error.response) {
//         console.error(error.response.body);
//       }
//     }
//   );
// };

// let emailOnMeetingReminder = (email, name, purpose) => {
//   const msg = {
//     to: email,
//     from: "naikvaibhav@angularweb.tech",
//     template_id: "d-9e5f9715316f46c0aa8ab2f5425b4cd9",
//     dynamic_template_data: {
//       userName: name,
//       purpose: purpose,
//       footer: "This is confirmation mail please do not reply to this email",
//     },
//   };
//   sgMail.send(msg).then(
//     () => {},
//     (error) => {
//       console.error(error);

//       if (error.response) {
//         console.error(error.response.body);
//       }
//     }
//   );
// };

// let emailOnResetPassword = (email, link) => {
//   console.log("email", email, "link", link);
//   const msg = {
//     to: email,
//     from: "naikvaibhav@angularweb.tech",
//     template_id: "d-518013bb28264acb8442e65b9516b549",
//     dynamic_template_data: {
//       link: link,
//     },
//   };
//   sgMail.send(msg).then(
//     () => {},
//     (error) => {
//       console.error(error);

//       if (error.response) {
//         console.error(error.response.body);
//       }
//     }
//   );
// };

module.exports = {
  emailOnMeetingCreation: emailOnMeetingCreation,
  emailOnEditingMeeting: emailOnEditingMeeting,
  emailOnMeetingReminder: emailOnMeetingReminder,
  emailOnResetPassword: emailOnResetPassword,
};
