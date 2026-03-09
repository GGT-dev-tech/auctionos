from typing import Any, List, Dict
from fastapi import APIRouter
import os
import re

router = APIRouter()

def parse_state_contacts() -> List[Dict[str, str]]:
    results = []
    file_path = os.path.join(os.path.dirname(__file__), "../../../../data/contacts_state.md")
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return results

    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    # skip header
    for line in lines[1:]:
        line = line.strip()
        if not line:
            continue
            
        # Parse logic: State Name <URL> optional text
        match = re.match(r'^([^<]+)<([^>]+)>(.*)$', line)
        if match:
            state = match.group(1).strip()
            url = match.group(2).strip()
            results.append({
                "state": state,
                "url": url
            })
    return results

@router.get("/contacts", response_model=List[Dict[str, str]])
def get_state_contacts() -> Any:
    """
    Retrieve contact information/urls for all states from the local markdown file.
    """
    return parse_state_contacts()
