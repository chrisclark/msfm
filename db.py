from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
from sqlalchemy.ext.declarative import declarative_base
import config

msfmEngine = create_engine(config.connection_string, convert_unicode=True)
db_session = scoped_session(sessionmaker(autocommit=False,
                                         autoflush=False,
                                         bind=msfmEngine))
Base = declarative_base()
Base.query = db_session.query_property()

def init_db(full_drop=None):
    # import all modules here that might define models so that
    # they will be registered properly on the metadata.  Otherwise
    # you will have to import them first before calling init_db()

    #if full_drop:
    #    conn = db_session.connection()
    #    conn.execute('drop table votes;')
    #    conn.execute('playlist_items;')
    #    conn.execute('table tracks;')
    #    conn.execute('table locations;')
    #    conn.execute('table users;')
    
    import location
    import track
    import user
    import playlistitem
    import vote
    
    Base.metadata.create_all(bind=msfmEngine)
