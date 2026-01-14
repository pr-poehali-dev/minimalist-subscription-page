import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface Subscriber {
  id: number;
  email: string;
  push_enabled: boolean;
  created_at: string;
}

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  message: string;
  read: boolean;
  created_at: string;
}

interface Stats {
  totalSubscribers: number;
  pushEnabledCount: number;
  totalMessages: number;
  unreadMessages: number;
  growthData: Array<{ date: string; count: number }>;
}

const API_BASE = 'https://functions.poehali.dev';
const SUBSCRIBERS_URL = `${API_BASE}/b02c986c-dea4-4742-9868-6b4b04a7eb62`;
const CONTACTS_URL = `${API_BASE}/7751e128-f451-447a-8a00-29c5a0a94b98`;
const STATS_URL = `${API_BASE}/7cd4f545-1f13-4137-be98-334274d725c3`;

export default function Admin() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'subscribers' | 'messages'>('dashboard');
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);

  const loadStats = async () => {
    try {
      const response = await fetch(STATS_URL);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      toast.error('Ошибка загрузки статистики');
    }
  };

  const loadSubscribers = async () => {
    setLoading(true);
    try {
      const response = await fetch(SUBSCRIBERS_URL);
      const data = await response.json();
      setSubscribers(data.subscribers || []);
    } catch (error) {
      toast.error('Ошибка загрузки подписчиков');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    setLoading(true);
    try {
      const response = await fetch(CONTACTS_URL);
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      toast.error('Ошибка загрузки сообщений');
    } finally {
      setLoading(false);
    }
  };

  const deleteSubscriber = async (id: number) => {
    try {
      await fetch(`${SUBSCRIBERS_URL}?id=${id}`, { method: 'DELETE' });
      toast.success('Подписчик удален');
      loadSubscribers();
      loadStats();
    } catch (error) {
      toast.error('Ошибка удаления');
    }
  };

  const toggleMessageRead = async (id: number, currentRead: boolean) => {
    try {
      await fetch(CONTACTS_URL, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, read: !currentRead })
      });
      toast.success('Статус обновлен');
      loadMessages();
      loadStats();
    } catch (error) {
      toast.error('Ошибка обновления');
    }
  };

  useEffect(() => {
    loadStats();
    if (activeTab === 'subscribers') loadSubscribers();
    if (activeTab === 'messages') loadMessages();
  }, [activeTab]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
      <nav className="bg-white border-b border-purple-100">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon name="Shield" className="text-primary" size={28} />
            <h1 className="text-2xl font-bold text-gray-900">Админ-панель</h1>
          </div>
          <Button variant="outline" asChild>
            <a href="/">На сайт</a>
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <div className="flex gap-4 mb-8">
          <Button
            variant={activeTab === 'dashboard' ? 'default' : 'outline'}
            onClick={() => setActiveTab('dashboard')}
          >
            <Icon name="BarChart3" size={18} className="mr-2" />
            Статистика
          </Button>
          <Button
            variant={activeTab === 'subscribers' ? 'default' : 'outline'}
            onClick={() => setActiveTab('subscribers')}
          >
            <Icon name="Users" size={18} className="mr-2" />
            Подписчики
          </Button>
          <Button
            variant={activeTab === 'messages' ? 'default' : 'outline'}
            onClick={() => setActiveTab('messages')}
          >
            <Icon name="Mail" size={18} className="mr-2" />
            Сообщения
            {stats && stats.unreadMessages > 0 && (
              <Badge className="ml-2" variant="destructive">{stats.unreadMessages}</Badge>
            )}
          </Button>
        </div>

        {activeTab === 'dashboard' && stats && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <div className="flex items-center justify-between mb-4">
                  <Icon name="Users" size={32} />
                  <div className="text-3xl font-bold">{stats.totalSubscribers}</div>
                </div>
                <div className="text-purple-100">Подписчиков</div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <div className="flex items-center justify-between mb-4">
                  <Icon name="Bell" size={32} />
                  <div className="text-3xl font-bold">{stats.pushEnabledCount}</div>
                </div>
                <div className="text-blue-100">Push включен</div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
                <div className="flex items-center justify-between mb-4">
                  <Icon name="MessageSquare" size={32} />
                  <div className="text-3xl font-bold">{stats.totalMessages}</div>
                </div>
                <div className="text-green-100">Всего сообщений</div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                <div className="flex items-center justify-between mb-4">
                  <Icon name="AlertCircle" size={32} />
                  <div className="text-3xl font-bold">{stats.unreadMessages}</div>
                </div>
                <div className="text-orange-100">Непрочитанных</div>
              </Card>
            </div>

            {stats.growthData.length > 0 && (
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-6 text-gray-900">Рост базы за 30 дней</h3>
                <div className="space-y-2">
                  {stats.growthData.map((item) => (
                    <div key={item.date} className="flex items-center gap-4">
                      <div className="text-sm text-gray-600 w-32">{formatDate(item.date)}</div>
                      <div className="flex-1 bg-gray-200 h-8 rounded-lg overflow-hidden">
                        <div
                          className="bg-primary h-full flex items-center px-3 text-white text-sm font-medium"
                          style={{ width: `${(item.count / Math.max(...stats.growthData.map(d => d.count))) * 100}%` }}
                        >
                          +{item.count}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'subscribers' && (
          <Card className="p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Подписчики</h3>
              <Button onClick={loadSubscribers} variant="outline" size="sm">
                <Icon name="RefreshCw" size={16} className="mr-2" />
                Обновить
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-500">Загрузка...</div>
            ) : subscribers.length === 0 ? (
              <div className="text-center py-12 text-gray-500">Подписчиков пока нет</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Push</TableHead>
                    <TableHead>Дата подписки</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscribers.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium">{sub.email}</TableCell>
                      <TableCell>
                        {sub.push_enabled ? (
                          <Badge variant="default">Включен</Badge>
                        ) : (
                          <Badge variant="secondary">Выключен</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-600">{formatDate(sub.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteSubscriber(sub.id)}
                        >
                          <Icon name="Trash2" size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        )}

        {activeTab === 'messages' && (
          <Card className="p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Сообщения обратной связи</h3>
              <Button onClick={loadMessages} variant="outline" size="sm">
                <Icon name="RefreshCw" size={16} className="mr-2" />
                Обновить
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-500">Загрузка...</div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12 text-gray-500">Сообщений пока нет</div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <Card key={msg.id} className={`p-4 ${!msg.read ? 'bg-purple-50 border-purple-200' : ''}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="font-bold text-gray-900">{msg.name}</div>
                          <div className="text-sm text-gray-500">{msg.email}</div>
                          {!msg.read && <Badge variant="default">Новое</Badge>}
                        </div>
                        <p className="text-gray-700 mb-2">{msg.message}</p>
                        <div className="text-xs text-gray-500">{formatDate(msg.created_at)}</div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleMessageRead(msg.id, msg.read)}
                      >
                        <Icon name={msg.read ? 'Eye' : 'EyeOff'} size={16} />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
