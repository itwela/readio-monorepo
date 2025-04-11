Here is an example:



# [Managing notification categories (interactive notifications)](https://docs.expo.dev/versions/latest/sdk/notifications/#managing-notification-categories-interactive-notifications)

Notification categories allow you to create interactive push notifications, so that a user can respond directly to the incoming notification either via buttons or a text response. A category defines the set of actions a user can take, and then those actions are applied to a notification by specifying the `categoryIdentifier` in the `<a class="ag ir" href="https://docs.expo.dev/versions/latest/sdk/notifications/#notificationcontent" rel="noopener ugc nofollow" target="_blank">NotificationContent</a>`.

```
Notifications.setNotificationCategoryAsync("welcome", [
  {
    buttonTitle: "Start",
    identifier: "first",
    options: {
      opensAppToForeground: true,
    },
  },

  {
    buttonTitle: "Reject",
    identifier: "second",
    options: {
      opensAppToForeground: false,
    },
  },
 {
    buttonTitle: 'Respond with text',
    identifier: 'third',
    textInput: {
      submitButtonTitle: 'Submit button',
      placeholder: 'Placeholder text',
     },
   },
]);
```

Add this functionality above functional components. This categories the notification with two buttons and one text-input, where specific actions was triggered when user interacts with them.

Add these identifier ‘welcome’ in* scheduleNotificationAsync* in content to identify the category of notification.

```
content: {
        autoDismiss: true,
        title: "Exercise Time!!!",
        body: " WELCOME . ",
        color: "blue",
        sound: "default",
        vibrate: [0, 255, 255, 255],
        categoryIdentifier: "welcome",
        data: {
         {data:'goes here'} // you can customise data according to your requirement from notification object
       },
```

*INTERACTING WITH SPECIFIC CATEGORIES:*

Now, we will recieve the notification something like this…
