/**
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 'use strict';

 const functions = require('firebase-functions');
 const nodemailer = require('nodemailer');
 // Configure the email transport using the default SMTP transport and a GMail account.
 // For other types of transports such as Sendgrid see https://nodemailer.com/transports/
 // TODO: Configure the `gmail.email` and `gmail.password` Google Cloud environment variables.
 const gmailEmail = functions.config().gmail.email;
 const gmailPassword = functions.config().gmail.password;
 const mailTransport = nodemailer.createTransport({
   service: 'gmail',
   auth: {
     user: gmailEmail,
     pass: gmailPassword,
   },
 });
 
 // Sends an email confirmation when a user books a desk.
 exports.sendEmailConfirmation = functions.database.ref('/users/{uid}/bookings/{fbid}').onCreate((snapshot, context) => {
 
   const val = snapshot.val();
   functions.logger.log('Data Change',val)
 
   const mailOptions = {
     from: '"Desk Request" <noreply@deskrequest.com>',
     to:  val.email
   };

   const bookingref = val.dbookid
 
    // Building Email message.
   mailOptions.subject = 'Desk Request Booking Confirmation ' + val.dbookid;
   mailOptions.text = 'Thanks you for your desk booking. Your booking reference is: ' + val.dbookid +
                      '\nDesk Booked: ' + val.deskid +
                      '\nDate: ' + val.d_date +
                      '\nDuration:  ' + val.d_duration +
                      '\n\n\nRegards \nThe Desk Request Booking Team'
   
   try {
     mailTransport.sendMail(mailOptions);
     functions.logger.log('Confirmation email sent to:', val.email);
   } catch(error) {
     functions.logger.error(
       'There was an error while sending the email:',
       error
     );
   }
   return null;
 });

 // Sends an email confirmation when a user books a room.
 exports.sendRoomEmailConfirmation = functions.database.ref('/users/{uid}/roombookings/{fbid}').onCreate((snapshot, context) => {
 
  const val = snapshot.val();
  functions.logger.log('Data Change',val)

  const mailOptions = {
    from: '"Desk Request" <noreply@deskrequest.com>',
    to:  val.email
  };

  const bookingref = val.rbookid

   // Building Email message.
  mailOptions.subject = 'Desk Request Booking Confirmation ' + val.rbookid;
  mailOptions.text = 'Thanks you for your Room booking. Your booking reference is: ' + val.rbookid +
                     '\nRoom Booked: ' + val.roomname +
                     '\nRoom Type: ' + val.roomtype +
                     '\nDate: ' + val.d_date +
                     '\nDuration:  ' + val.d_duration +
                     '\n\n\nRegards \nThe Desk Request Booking Team'
  
  try {
    mailTransport.sendMail(mailOptions);
    functions.logger.log('Confirmation email sent to:', val.email);
  } catch(error) {
    functions.logger.error(
      'There was an error while sending the email:',
      error
    );
  }
  return null;
});

 // Sends an email confirmation when a user cancels a desk booking.
 exports.sendEmailCancellation = functions.database.ref('/users/{uid}/bookings/{fbid}').onDelete((snapshot, context) => {
 
  const val = snapshot.val();
  functions.logger.log('Data Deleted',val)

  const mailOptions = {
    from: '"Desk Request" <noreply@deskrequest.com>',
    to:  val.email
  };

  const bookingref = val.dbookid

   // Building Email message.
  mailOptions.subject = 'Desk Request Booking Cancellation ' + val.dbookid;
  mailOptions.text = 'Your desk booking ref: ' + val.dbookid + ' has now been cancelled' +
                     '\nDesk Booked: ' + val.deskid +
                     '\nDate: ' + val.d_date +
                     '\nDuration:  ' + val.d_duration +
                     '\n\n\nRegards \nThe Desk Request Booking Team'
  
  try {
    mailTransport.sendMail(mailOptions);
    functions.logger.log('Cancellation email sent to:', val.email);
  } catch(error) {
    functions.logger.error(
      'There was an error while sending the email:',
      error
    );
  }
  return null;
});

 // Sends an email confirmation when a user cancels a room booking.
 exports.sendRoomEmailCancellation = functions.database.ref('/users/{uid}/roombookings/{fbid}').onDelete((snapshot, context) => {
 
  const val = snapshot.val();
  functions.logger.log('Data Deleted',val)

  const mailOptions = {
    from: '"Desk Request" <noreply@deskrequest.com>',
    to:  val.email
  };

  const bookingref = val.rbookid

   // Building Email message.
  mailOptions.subject = 'Desk Request Booking Cancellation ' + val.rbookid;
  mailOptions.text = 'Your Room booking ref: ' + val.rbookid + ' has now been cancelled' +
                     '\nRoom Booked: ' + val.roomname +
                     '\nRoom Type: ' + val.roomtype +
                     '\nDate: ' + val.d_date +
                     '\nDuration:  ' + val.d_duration +
                     '\n\n\nRegards \nThe Desk Request Booking Team'
  
  try {
    mailTransport.sendMail(mailOptions);
    functions.logger.log('Cancellation email sent to:', val.email);
  } catch(error) {
    functions.logger.error(
      'There was an error while sending the email:',
      error
    );
  }
  return null;
});

// Sends an email confirmation when a user changes booking duration.
exports.sendEmailDeskChange = functions.database.ref('/users/{uid}/bookings/{fbid}').onWrite(async (change) => {
  // Early exit if the 'subscribedToMailingList' field has not changed
  if (change.after.child('d_duration').val() === change.before.child('d_duration').val()) {
    return null;
  }

  const preval = change.before.val();
  const val = change.after.val();

  const mailOptions = {
    from: '"Desk Request" <noreply@deskrequest.com>',
    to: val.email,
  };

    // Building Email message.
    mailOptions.subject = 'Desk Request Desk Booking Change Confirmation ' + val.dbookid;
    mailOptions.text = 'Your desk booking ref : ' + val.dbookid +
                       '\nDesk Booked: ' + val.deskid +
                       '\nDate: ' + val.d_date +
                       '\nDuration from: ' + preval.d_duration +
                       '\nDuration to:  ' + val.d_duration +
                       '\n\n\nRegards \nThe Desk Request Booking Team'
  
    try {
      mailTransport.sendMail(mailOptions);
      functions.logger.log('Change email sent to:', val.email);
    } catch(error) {
      functions.logger.error(
        'There was an error while sending the email:',
        error
      );
  }
  return null;
});

// Sends an email confirmation when a user changes a room booking duration.
exports.sendEmailRoomChange = functions.database.ref('/users/{uid}/roombookings/{fbid}').onWrite(async (change) => {
  // Early exit if the 'subscribedToMailingList' field has not changed
  if (change.after.child('d_duration').val() === change.before.child('d_duration').val()) {
    return null;
  }

  const preval = change.before.val();
  const val = change.after.val();

  const mailOptions = {
    from: '"Desk Request" <noreply@deskrequest.com>',
    to: val.email,
  };

    // Building Email message.
    mailOptions.subject = 'Desk Request Room Booking Change Confirmation ' + val.rbookid;
    mailOptions.text = 'Your Room booking ref : ' + val.rbookid +
                        '\nRoom Booked: ' + val.roomname +
                        '\nRoom Type: ' + val.roomtype +
                        '\nDate: ' + val.d_date +
                        '\nDuration from:  ' + preval.d_duration +
                        '\nDuration to:  ' + val.d_duration +
                       '\n\n\nRegards \nThe Desk Request Booking Team'
  
  try {
    mailTransport.sendMail(mailOptions);
    functions.logger.log('Changes email sent to:', val.email);
  } catch(error) {
    functions.logger.error(
      'There was an error while sending the email:',
      error
    );
  }
  return null;
});