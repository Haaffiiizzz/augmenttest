import psycopg2
from psycopg2 import sql, OperationalError

def test_db():
    try:
        conn = psycopg2.connect(
            "postgresql://postgres:bucketWater1.@db.jexiiyiwqkoztduaakir.supabase.co:5432/postgres?sslmode=require"
        )
        cur = conn.cursor()
        cur.execute("SELECT NOW();")
        result = cur.fetchone()
        print("Connected! Server time is:", result[0])
        cur.close()
        conn.close()
    except OperationalError as e:
        print("Connection failed:", e)

if __name__ == "__main__":
    test_db()
