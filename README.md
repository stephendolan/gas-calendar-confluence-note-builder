# Setting up this script on your Google account

1. [Install the CLASP command line tool](https://github.com/google/clasp/#install)
1. Run `clasp login` to get your Google credentials set up
1. Create the project from `clasp` in your [Google Scripts](script.google.com) using `clasp create {project-name-that-you-pick`.
1. Update the following values in the `defineUserProperties` function appropriately:
   - CONFLUENCE_API_BASE_URL - The base URL of your instance's Confluence API, like `https://yourcompany.atlassian.net/wiki/rest/api`
   - CONFLUENCE_API_USER - The user to authenticate against the Confluence API, like `you@company.com`
   - CONFLUENCE_API_TOKEN - The token created in [your Atlassian account](https://id.atlassian.com/manage-profile/security/api-tokens), like `123918yhf2jfga238fa2`
   - CONFLUENCE_TEMPLATE_ID - The ID of the template to use for meeting notes
   - CONFLUENCE_PARENT_PAGE_ID - Which page to use as the parent for all meeting notes
1. Run `clasp push` to push the new user properties you've just defined up to the script
1. Set up an [Apps Script schedule](https://developers.google.com/apps-script/guides/triggers/installable#time-driven_triggers) for the project you've created.
1. Enjoy!
