from .search_geo_location_tool import search_geo_location
from .search_jobs_tool import search_jobs
from .search_hiring_managers_tool import search_hiring_managers
from .check_connection_status_tool import check_connection_status
from .send_connection_request_tool import send_connection_request
from .fetch_profile_details_tool import fetch_profile_details
from .get_company_details_tool import get_company_details


def get_linkedin_tools():
    """Return function map for AutoGen agents."""
    return {
        "search_geo_location": search_geo_location,
        "search_jobs": search_jobs,
        "search_hiring_managers": search_hiring_managers,
        "check_connection_status": check_connection_status,
        "send_connection_request": send_connection_request,
        "fetch_profile_details": fetch_profile_details,
        "get_company_details": get_company_details,
    }
