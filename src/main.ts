// Expected format from a Confluence Template GET request:
// https://developer.atlassian.com/cloud/confluence/rest/#api-api-template-contentTemplateId-get
interface ConfluenceTemplate {
  templateId: string;
  editorVersion: string;
  description: string;
  templateType: string;
  name: string;
  body: {
    storage: {
      representation: string;
      value: string;
    };
  };
}

// Expected format from a Confluence Content GET request:
// https://developer.atlassian.com/cloud/confluence/rest/#api-api-content-id-get
interface ConfluencePage {
  id: string;
  type: string;
  title: string;
  templateType: string;
  name: string;
  space: {
    key: string;
  };
}

// Set up the user-specific information referenced throughout the script
function defineUserProperties(): void {
  const userProperties = PropertiesService.getUserProperties();
  userProperties.setProperty("CONFLUENCE_API_BASE_URL", "https://yourcompany.atlassian.net/wiki/rest/api");
  userProperties.setProperty("CONFLUENCE_API_USER", "you@company.com");
  userProperties.setProperty("CONFLUENCE_API_TOKEN", "1j23k4j289jfk32j");
  userProperties.setProperty("CONFLUENCE_MEETING_NOTE_TEMPLATE_ID", "1234567899");
  userProperties.setProperty("CONFLUENCE_PARENT_PAGE_ID", "123091401");
}

function confluenceAuthorizationHeaders(): GoogleAppsScript.URL_Fetch.HttpHeaders {
  const userProperties = PropertiesService.getUserProperties();
  const username = userProperties.getProperty("CONFLUENCE_API_USER");
  const token = userProperties.getProperty("CONFLUENCE_API_TOKEN");

  return { Authorization: `Basic ${Utilities.base64Encode(`${username}:${token}`)}` };
}

function confluenceParentPage(): ConfluencePage {
  const userProperties = PropertiesService.getUserProperties();
  const baseUrl = userProperties.getProperty("CONFLUENCE_API_BASE_URL");
  const pageId = userProperties.getProperty("CONFLUENCE_PARENT_PAGE_ID");

  const options = { headers: confluenceAuthorizationHeaders(), contentType: "application/json" };
  const response = UrlFetchApp.fetch(`${baseUrl}/content/${pageId}`, options);

  return JSON.parse(response.getContentText());
}

function confluenceTemplate(): ConfluenceTemplate {
  const userProperties = PropertiesService.getUserProperties();
  const baseUrl = userProperties.getProperty("CONFLUENCE_API_BASE_URL");
  const templateId = userProperties.getProperty("CONFLUENCE_MEETING_NOTE_TEMPLATE_ID");

  const options = { headers: confluenceAuthorizationHeaders(), contentType: "application/json" };
  const response = UrlFetchApp.fetch(`${baseUrl}/template/${templateId}`, options);

  return JSON.parse(response.getContentText());
}

function createConfluenceNote(event: GoogleAppsScript.Calendar.CalendarEvent): number {
  const userProperties = PropertiesService.getUserProperties();
  const baseUrl = userProperties.getProperty("CONFLUENCE_API_BASE_URL");
  const parentPage = confluenceParentPage();

  const formattedEventDate = event.getStartTime().toLocaleDateString();
  const params = {
    title: `${formattedEventDate} -- ${event.getTitle()}`,
    type: "page",
    space: { key: parentPage.space.key },
    ancestors: [{ id: parentPage.id }],
    body: confluenceTemplate().body,
  };

  const options = {
    method: <"post">"post",
    headers: confluenceAuthorizationHeaders(),
    contentType: "application/json",
    payload: JSON.stringify(params),
    muteHttpExceptions: true,
  };

  const response = UrlFetchApp.fetch(`${baseUrl}/content`, options);
  return response.getResponseCode();
}

// Print out some helpful information regarding how the calendar events are filtered.
function logRunCriteria(
  calendar: GoogleAppsScript.Calendar.Calendar,
  date: Date,
  statuses: GoogleAppsScript.Calendar.GuestStatus[],
  includeSolo: Boolean,
  includeRecurring: Boolean,
  includeAllDay: Boolean
): void {
  Logger.log("Searching for calendar events matching the following criteria:");
  Logger.log(`\tCalendar '${calendar.getName()}'`);
  Logger.log(`\tDate '${date.toLocaleDateString()}'`);
  Logger.log(`\tStatuses '${statuses.map((status) => status.toString()).join(", ")}'`);
  Logger.log(`\t${includeRecurring ? "Recurring events included" : "No recurring events"}`);
  Logger.log(`\t${includeAllDay ? "All day events included" : "No all day events"}`);
  Logger.log(`\t${includeSolo ? "Solo events included" : "No solo events"}`);
}

function calendarEvents(): GoogleAppsScript.Calendar.CalendarEvent[] {
  const calendar = CalendarApp.getDefaultCalendar();

  const today = new Date();

  const validAttendanceStatuses = [
    CalendarApp.GuestStatus.OWNER,
    CalendarApp.GuestStatus.MAYBE,
    CalendarApp.GuestStatus.YES,
  ];

  const includeRecurring = false;
  const includeAllDay = false;
  const includeSolo = false;

  logRunCriteria(calendar, today, validAttendanceStatuses, includeSolo, includeRecurring, includeAllDay);

  let events = calendar
    .getEventsForDay(today, { statusFilters: validAttendanceStatuses })
    .filter((event) => event.isRecurringEvent() === includeRecurring)
    .filter((event) => event.isAllDayEvent() === includeAllDay)
    .filter((event) => (event.getGuestList(false).length === 0) === includeSolo);

  Logger.log(`Found ${events.length} valid events in the search criteria.`);

  return events;
}

function main() {
  defineUserProperties();

  calendarEvents().forEach((event) => {
    Logger.log(`Processing event '${event.getTitle()}'...`);
    const responseStatusCode = createConfluenceNote(event);

    if (responseStatusCode !== 200) {
      Logger.log("\tFailed to create Confluence notes for event.");
      Logger.log(`\tReceived HTTP status code ${responseStatusCode} from Confluence API.`);
      throw new Error("Failed to create Confluence notes");
    }

    Logger.log("\tSuccessfully created Confluence note for event.");
  });
}
