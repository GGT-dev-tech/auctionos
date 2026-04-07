import os
import requests
import json

ATTOM_API_KEY = "2b58c3c8510e15f25d468c3ed0b6d7c1"
url = "https://api.gateway.attomdata.com/propertyapi/v1.0.0/property/detail"
headers = {"Accept": "application/json", "apikey": ATTOM_API_KEY}
params = {"address1": "4529 Winona Court", "address2": "Denver, CO"}
response = requests.get(url, headers=headers, params=params)
print(json.dumps(response.json(), indent=2))
