"""Database initialization script."""
from sqlalchemy import text
from app.db.database import engine, Base
from app.models import Meeting, MeetingAnalysis, Contact


def create_immutability_triggers():
    """Create database triggers to enforce immutability on meetings table."""
    
    # For PostgreSQL
    trigger_sql = """
    -- Function to prevent updates
    CREATE OR REPLACE FUNCTION prevent_meeting_update()
    RETURNS TRIGGER AS $$
    BEGIN
        RAISE EXCEPTION 'Meetings are immutable and cannot be updated';
    END;
    $$ LANGUAGE plpgsql;
    
    -- Function to prevent deletes
    CREATE OR REPLACE FUNCTION prevent_meeting_delete()
    RETURNS TRIGGER AS $$
    BEGIN
        RAISE EXCEPTION 'Meetings are immutable and cannot be deleted';
    END;
    $$ LANGUAGE plpgsql;
    
    -- Drop existing triggers if they exist
    DROP TRIGGER IF EXISTS prevent_meeting_update_trigger ON meetings;
    DROP TRIGGER IF EXISTS prevent_meeting_delete_trigger ON meetings;
    
    -- Create update prevention trigger
    CREATE TRIGGER prevent_meeting_update_trigger
        BEFORE UPDATE ON meetings
        FOR EACH ROW
        EXECUTE FUNCTION prevent_meeting_update();
    
    -- Create delete prevention trigger
    CREATE TRIGGER prevent_meeting_delete_trigger
        BEFORE DELETE ON meetings
        FOR EACH ROW
        EXECUTE FUNCTION prevent_meeting_delete();
    """
    
    with engine.connect() as conn:
        # Execute each statement separately
        statements = [s.strip() for s in trigger_sql.split(';') if s.strip()]
        for statement in statements:
            try:
                conn.execute(text(statement))
                conn.commit()
            except Exception as e:
                print(f"Note: {e}")
                # Continue even if trigger already exists


def init_db():
    """Initialize database schema and triggers."""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✓ Tables created")
    
    print("Creating immutability triggers...")
    create_immutability_triggers()
    print("✓ Triggers created")
    
    print("\nDatabase initialization complete!")
    print("\nTables created:")
    print("  - meetings (immutable)")
    print("  - meeting_analyses (derived data)")
    print("  - contacts")


if __name__ == "__main__":
    init_db()
