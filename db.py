from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
from sqlalchemy.ext.declarative import declarative_base
import config
from juggernaut import Juggernaut

msfmEngine = create_engine(config.connection_string, convert_unicode=True)
db_session = scoped_session(sessionmaker(autocommit=False,
                                         autoflush=False,
                                         bind=msfmEngine))
Base = declarative_base()
Base.query = db_session.query_property()
jug = Juggernaut()

def init_db():
    # import all modules here that might define models so that
    # they will be registered properly on the metadata.  Otherwise
    # you will have to import them first before calling init_db()

    #if full_drop:
    #conn = db_session.connection()
    #conn.execute('drop table votes;')
    #conn.execute('alter table locations drop foreign key fk_locations_currently_playing_pli_id;')
    #conn.execute('drop table playlist_items;')
    #conn.execute('drop table tracks;')
    #conn.execute('drop table locations;')
    #conn.execute('drop table users;')
    
    import location
    import track
    import user
    import playlistitem
    import vote
    
    Base.metadata.create_all(bind=msfmEngine)
