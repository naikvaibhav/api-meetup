const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const moment = require('moment');
const time = require('./timeLib');

let emailOnMeetingCreation = (
  email,
  name,
  startDate,
  purpose,
  endDate,
  location
) => {
  let meetingDate = time.converToLocalDayDate(startDate);
  let startTime = time.convertToLocalHoursMinutes(startDate);
  let endTime = time.convertToLocalHoursMinutes(endDate);
  const msg = {
    to: email,
    from: 'naikvaibhav@angularweb.tech',
    template_id: 'd-8519e8bc934243d4bb51e074388519a5',
    dynamic_template_data: {
      userName: name,
      date: meetingDate,
      purpose: purpose,
      startTime: startTime,
      endTime: endTime,
      location: location,
      footer: 'This is confirmation mail please do not reply to this email'
    }
  };
  sgMail.send(msg).then(
    () => {},
    error => {
      console.error(error);

      if (error.response) {
        console.error(error.response.body);
      }
    }
  );
};

let emailOnEditingMeeting = (
  email,
  name,
  startDate,
  purpose,
  endDate,
  location
) => {
  let meetingDate = time.converToLocalDayDate(startDate);
  let startTime = time.convertToLocalHoursMinutes(startDate);
  let endTime = time.convertToLocalHoursMinutes(endDate);
  const msg = {
    to: email,
    from: 'naikvaibhav@angularweb.tech',
    template_id: 'd-5a85dcc478b9411fb42eab7c969bbc29',
    dynamic_template_data: {
      userName: name,
      date: meetingDate,
      purpose: purpose,
      startTime: startTime,
      endTime: endTime,
      location: location,
      footer: 'This is confirmation mail please do not reply to this email'
    }
  };
  sgMail.send(msg).then(
    () => {},
    error => {
      console.error(error);

      if (error.response) {
        console.error(error.response.body);
      }
    }
  );
};

let emailOnMeetingReminder = (email, name, purpose) => {
  const msg = {
    to: email,
    from: 'naikvaibhav@angularweb.tech',
    template_id: 'd-9e5f9715316f46c0aa8ab2f5425b4cd9',
    dynamic_template_data: {
      userName: name,
      purpose: purpose,
      footer: 'This is confirmation mail please do not reply to this email'
    }
  };
  sgMail.send(msg).then(
    () => {},
    error => {
      console.error(error);

      if (error.response) {
        console.error(error.response.body);
      }
    }
  );
};

let emailOnResetPassword = (email, link) => {
  console.log('email', email, 'link', link);
  const msg = {
    to: email,
    from: 'naikvaibhav@angularweb.tech',
    template_id: 'd-518013bb28264acb8442e65b9516b549',
    dynamic_template_data: {
      link: link
    }
  };
  sgMail.send(msg).then(
    () => {},
    error => {
      console.error(error);

      if (error.response) {
        console.error(error.response.body);
      }
    }
  );
};

module.exports = {
  emailOnMeetingCreation: emailOnMeetingCreation,
  emailOnEditingMeeting: emailOnEditingMeeting,
  emailOnMeetingReminder: emailOnMeetingReminder,
  emailOnResetPassword: emailOnResetPassword
};
