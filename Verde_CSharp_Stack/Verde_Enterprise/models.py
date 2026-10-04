from sqlalchemy import Column, Integer, String
from database import Base, engine

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    status = Column(String)

Base.metadata.create_all(bind=engine)
