# -*- coding: utf-8 -*-
import pyodbc
cn = pyodbc.connect("DSN=PostgreSQL35W")
cur = cn.cursor()
for t in ['fct__events','dim__eventsMetrics','dim__eventsTags']:
    cur.execute("""
      SELECT column_name, data_type FROM information_schema.columns
      WHERE table_schema='dbt_prd' AND table_name=? ORDER BY ordinal_position
    """, (t,))
    print("====", t, "====")
    for r in cur.fetchall():
        print(f"  {r[0]} :: {r[1]}")
cn.close()
