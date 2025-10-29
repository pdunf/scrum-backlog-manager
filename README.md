## Scrummage

This is a Next.js application designed to create and manage a SCRUM backlog.

### Importing from Jira

Given an HTML export of the Jira project backlog, this application can extract and parse the data into JSON.

To import HTML from Jira:
- Navigate to `util/`
- Copy your Jira HTML document to the `util/` directory (on the same level as `parse_jira.py`)
- Run `parse_jira.py`
- Move the resulting `jira_backlog.json` file to `public/`
- Run the application using `npm run dev`

### Known Issues

- HTML Hydration error originating from `components/Navigation.tsx`, specifically from the `projectInfo` handling. I believe this error results from building the HTML before finding/retrieving the locally-stored project name. 