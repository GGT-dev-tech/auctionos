from pydantic import BaseModel

class LocationBase(BaseModel):
    fips: str
    name: str
    state: str

class Location(LocationBase):
    class Config:
        from_attributes = True
