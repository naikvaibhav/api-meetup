# api-meetup
A api for the Meet Up (Meeting Planner) Application

# Description about the application
The Meet Up app is a MEAN stack application. The actual name of the project is Meeting Planner. The name of this application is given by the developer as Meet Up. This app is used to schedule or organize meetings. This acts like a Google calendar with much more intuitive design and easy to use UI.

## Features of the app:
1.	A user has to provide credentials such as his first name, last name, email, mobile number while signing up for the Meet Up app.
2.	A user can either be a normal user or admin. An admin will schedule the meetings among the normal users.
3.	The user has to provide his registered email address and password while logging in to the app.
4.	If the user forgets his password he can opt for a reset password. A link is send to his registered email address. The user can reset his password by clicking on the link.
5.	The user gets his planner similar to Google calendar.
6.	Overlapped meetings are highlighted with a different color.
7.	Normal user cannot create, edit or delete his meetings on his own. Only the admin has the access to do this task. The user can only view his meeting details.
8.	 Whenever a meeting is organized by the admin among the respective normal users, each of these users will receive an email notification. Email notification is also send to the respective users if the meeting date or time is changed.
9.	If the user is online while the admin is either creating or editing the meeting, then a notification is sent to use in real time along with the meeting name and the admin who created or edited the meeting.
10.	A notification is sent to the client through email as well as an alert notification just 1 min before the start of the meeting. The user has an option to either snooze the reminder for 5 seconds or stop the reminder.
11.	A notification ring is triggered when an alert/reminder notification arrives on the users app. Along with the ring a nice animated bell is displayed to make the UI for engaging.
12.	The admin has an option to check users who are currently online.
13.	The reset password link has duration. Once the duration expires the reset password link is invalid. This is done to improve the security.

## Sample login credentials
login credentials for admin
email: robertjones@email.com
password: Password@123

## Technical details of the app:
1.	For frontend Bootstrap 4 is used as the CSS framework along with HTML5 and CSS3. Angular is used as the frontend Javascript framework. The app is responsive and works well on Desktop. Laptop, Tablets as well as smartphones.
2.	For backend ExpressJS is used as the backend Javascript framework on top of NodeJs. For real time communication such as sending notifications to the clients on their app Socket.IO is used.
3.	MongoDB is used for storing the data.

