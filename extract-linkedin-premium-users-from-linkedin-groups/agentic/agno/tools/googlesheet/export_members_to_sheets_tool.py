import json
from typing import Optional
from tools.googlesheet.google_sheets_tool import google_sheets_tool

def export_members_to_sheets(
    workflow_result: str,
    spreadsheet_title: Optional[str] = None,
    spreadsheet_id: Optional[str] = None,
    sheet_name: str = "LinkedIn Members"
) -> str:
    """
    Export members from a workflow result to Google Sheets.
    This tool accepts the JSON string output from complete_group_members_workflow
    or fetch_all_linkedin_group_members and exports the members to a Google Sheet.
    
    Args:
        workflow_result: JSON string containing 'members' array from workflow tools
        spreadsheet_title: Title for a new spreadsheet
        spreadsheet_id: Existing spreadsheet ID to update
        sheet_name: Name of the sheet tab (default: 'LinkedIn Members')
    
    Returns:
        JSON string with export results
    """
    try:
        # Parse the workflow result
        data = json.loads(workflow_result)
        
        # Extract members array
        members = data.get("members", [])
        
        if not members:
            return json.dumps({
                "success": False,
                "error": "No members found in workflow result",
                "summary": "Workflow result contains no members to export"
            })
        
        # Call the actual google_sheets_tool with the parsed members
        return google_sheets_tool(
            members=members,
            spreadsheet_title=spreadsheet_title,
            spreadsheet_id=spreadsheet_id,
            sheet_name=sheet_name
        )
        
    except json.JSONDecodeError as e:
        return json.dumps({
            "success": False,
            "error": f"Invalid JSON in workflow_result: {str(e)}",
            "summary": "Failed to parse workflow result"
        })
    except Exception as e:
        return json.dumps({
            "success": False,
            "error": str(e),
            "summary": f"Failed to export members: {str(e)}"
        })

