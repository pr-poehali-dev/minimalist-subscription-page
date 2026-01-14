import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    """API для управления подписчиками"""
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    
    try:
        if method == 'GET':
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("""
                    SELECT id, email, push_enabled, 
                           created_at, updated_at 
                    FROM subscribers 
                    ORDER BY created_at DESC
                """)
                subscribers = cur.fetchall()
                
                for sub in subscribers:
                    sub['created_at'] = sub['created_at'].isoformat() if sub['created_at'] else None
                    sub['updated_at'] = sub['updated_at'].isoformat() if sub['updated_at'] else None
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'subscribers': subscribers})
                }
        
        elif method == 'POST':
            data = json.loads(event.get('body', '{}'))
            email = data.get('email')
            push_enabled = data.get('pushEnabled', False)
            
            if not email:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Email обязателен'})
                }
            
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO subscribers (email, push_enabled) 
                    VALUES (%s, %s) 
                    ON CONFLICT (email) 
                    DO UPDATE SET push_enabled = EXCLUDED.push_enabled, 
                                  updated_at = CURRENT_TIMESTAMP
                    RETURNING id
                """, (email, push_enabled))
                subscriber_id = cur.fetchone()[0]
                conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'id': subscriber_id, 'message': 'Подписка оформлена'})
            }
        
        elif method == 'DELETE':
            query_params = event.get('queryStringParameters') or {}
            subscriber_id = query_params.get('id')
            
            if not subscriber_id:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'ID обязателен'})
                }
            
            with conn.cursor() as cur:
                cur.execute("DELETE FROM subscribers WHERE id = %s", (subscriber_id,))
                conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'message': 'Подписчик удален'})
            }
    
    finally:
        conn.close()
    
    return {
        'statusCode': 405,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': 'Метод не поддерживается'})
    }
