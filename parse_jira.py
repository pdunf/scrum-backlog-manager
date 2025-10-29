from bs4 import BeautifulSoup
import json
import re
from datetime import datetime

def parse_jira_html(html_file_path, output_json_path):
    """
    Parse Jira HTML export and convert to structured JSON
    """

    with open(html_file_path, 'r', encoding='utf-8') as f:
        html_content = f.read()

    soup = BeautifulSoup(html_content, 'html.parser')

    # Find the main issue table
    issue_table = soup.find('table', {'id': 'issuetable'})

    if not issue_table:
        print("Error: Could not find issue table")
        return

    # Get all header columns
    headers = []
    header_row = issue_table.find('thead').find('tr', class_='rowHeader')
    for th in header_row.find_all('th'):
        data_id = th.get('data-id', '')
        headers.append(data_id)

    print(f"Found {len(headers)} columns")

    # Parse all rows
    issues = []
    tbody = issue_table.find('tbody')

    for row in tbody.find_all('tr', class_='issuerow'):
        issue_data = {}
        cells = row.find_all('td')

        for idx, cell in enumerate(cells):
            if idx >= len(headers):
                break

            header = headers[idx]

            # Extract text content, handling nested elements
            if header == 'issuekey':
                link = cell.find('a', class_='issue-link')
                issue_data['key'] = link.text.strip() if link else ''
                issue_data['url'] = link.get('href', '') if link else ''
            elif header == 'summary':
                # Get summary text, excluding parent issue span
                summary_p = cell.find('p')
                if summary_p:
                    # Remove parent issue span if present
                    parent_span = summary_p.find('span', class_='parentIssue')
                    if parent_span:
                        parent_span.decompose()
                    issue_data['summary'] = summary_p.get_text(strip=True)
                else:
                    issue_data['summary'] = cell.get_text(strip=True)
            elif header == 'subtasks':
                # Extract subtask keys
                subtask_text = cell.get_text(strip=True)
                subtasks = [s.strip() for s in subtask_text.split(',') if s.strip()]
                issue_data['subtasks'] = subtasks
            elif header == 'status':
                # Extract status from span
                status_span = cell.find('span')
                issue_data['status'] = status_span.get_text(strip=True) if status_span else ''
            elif header == 'statusCategory':
                # Extract status category
                status_span = cell.find('span')
                issue_data['statusCategory'] = status_span.get_text(strip=True) if status_span else ''
            else:
                # Default: get text content
                text = cell.get_text(strip=True)
                # Clean up special characters
                text = text.replace('\xa0', '').replace('Â£', 'Σ')

                # Handle empty cells
                if text in ['&nbsp;', '', 'Unresolved', 'Unassigned']:
                    text = None
                elif text.startswith('<em>') and text.endswith('</em>'):
                    text = None

                issue_data[header] = text

        # Add parsed data
        issues.append(issue_data)

    print(f"Parsed {len(issues)} issues")

    # Organize data by type
    organized_data = {
        'epics': [],
        'stories': [],
        'subtasks': [],
        'other': []
    }

    for issue in issues:
        issue_type = issue.get('issuetype', '').strip()

        if issue_type == 'Epic':
            organized_data['epics'].append(issue)
        elif issue_type == 'Story':
            organized_data['stories'].append(issue)
        elif issue_type == 'Subtask':
            organized_data['subtasks'].append(issue)
        else:
            organized_data['other'].append(issue)

    # Create summary
    summary = {
        'total_issues': len(issues),
        'epics': len(organized_data['epics']),
        'stories': len(organized_data['stories']),
        'subtasks': len(organized_data['subtasks']),
        'other': len(organized_data['other']),
        'export_date': datetime.now().isoformat()
    }

    # Combine into final structure
    output_data = {
        'summary': summary,
        'issues': issues,
        'organized': organized_data
    }

    # Write to JSON file
    with open(output_json_path, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)

    print(f"\n✓ Successfully exported to {output_json_path}")
    print(f"  - {summary['epics']} Epics")
    print(f"  - {summary['stories']} Stories")
    print(f"  - {summary['subtasks']} Subtasks")
    print(f"  - {summary['other']} Other issues")

    return output_data

if __name__ == "__main__":
    # Update these paths to match your file locations
    html_file = "GoFast Traffic Light Automation System.html"
    json_file = "jira_backlog.json"

    print("Starting Jira HTML parser...")
    parse_jira_html(html_file, json_file)
    print("\nDone!")
