import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    """API для получения статистики"""
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Метод не поддерживается'})
        }
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT COUNT(*) as total FROM subscribers")
            total_subscribers = cur.fetchone()['total']
            
            cur.execute("SELECT COUNT(*) as total FROM subscribers WHERE push_enabled = true")
            push_enabled_count = cur.fetchone()['total']
            
            cur.execute("SELECT COUNT(*) as total FROM contact_messages")
            total_messages = cur.fetchone()['total']
            
            cur.execute("SELECT COUNT(*) as total FROM contact_messages WHERE read = false")
            unread_messages = cur.fetchone()['total']
            
            cur.execute("""
                SELECT DATE(created_at) as date, COUNT(*) as count 
                FROM subscribers 
                WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
                GROUP BY DATE(created_at) 
                ORDER BY date
            """)
            growth_data = cur.fetchall()
            
            for item in growth_data:
                item['date'] = item['date'].isoformat() if item['date'] else None
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'totalSubscribers': total_subscribers,
                    'pushEnabledCount': push_enabled_count,
                    'totalMessages': total_messages,
                    'unreadMessages': unread_messages,
                    'growthData': growth_data
                })
            }
    
    finally:
        conn.close()
