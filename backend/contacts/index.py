import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    """API для управления сообщениями обратной связи"""
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
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
                    SELECT id, name, email, message, read, created_at 
                    FROM contact_messages 
                    ORDER BY created_at DESC
                """)
                messages = cur.fetchall()
                
                for msg in messages:
                    msg['created_at'] = msg['created_at'].isoformat() if msg['created_at'] else None
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'messages': messages})
                }
        
        elif method == 'POST':
            data = json.loads(event.get('body', '{}'))
            name = data.get('name')
            email = data.get('email')
            message = data.get('message')
            
            if not all([name, email, message]):
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Все поля обязательны'})
                }
            
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO contact_messages (name, email, message) 
                    VALUES (%s, %s, %s) 
                    RETURNING id
                """, (name, email, message))
                message_id = cur.fetchone()[0]
                conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'id': message_id, 'message': 'Сообщение отправлено'})
            }
        
        elif method == 'PATCH':
            data = json.loads(event.get('body', '{}'))
            message_id = data.get('id')
            read = data.get('read')
            
            if message_id is None or read is None:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'ID и статус обязательны'})
                }
            
            with conn.cursor() as cur:
                cur.execute("""
                    UPDATE contact_messages 
                    SET read = %s 
                    WHERE id = %s
                """, (read, message_id))
                conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'message': 'Статус обновлен'})
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
