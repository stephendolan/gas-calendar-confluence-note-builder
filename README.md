# Setting up this script on your Google account

1. [Install the CLASP command line tool](https://github.com/google/clasp/#install)
1. Run `clasp login` to get your Google credentials set up
1. Create the project from `clasp` in your [Google Scripts](script.google.com) using `clasp create gas-calendar-note-builder`.
1. Update the following user properties appropriately:
   - CONFLUENCE_API_USER
   - CONFLUENCE_API_TOKEN
   - CONFLUENCE_MEETING_NOTE_TEMPLATE_ID
   - CONFLUENCE_PARENT_PAGE_ID
1. Set up an [Apps Script schedule](https://developers.google.com/apps-script/guides/triggers/installable#time-driven_triggers)
1. ???
1. Profit
