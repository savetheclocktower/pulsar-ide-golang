## 0.0.3

* Updated to latest `@savetheclocktower/atom-languageclient`, giving us…
  * Integration with `busy-signal` for server-initiated task reporting.
  * New hooks for filtering what is shown as a notification via `window/showMessage`.
* Added ability to ignore certain notifications via the new “Notifications” section of package settings.
* Filtered out useless errors logged to the console when `findReferences` requests fail for harmless reasons.
