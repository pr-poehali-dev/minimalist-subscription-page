import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

export default function Index() {
  const [email, setEmail] = useState('');
  const [pushEnabled, setPushEnabled] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Введите email');
      return;
    }
    toast.success('Подписка оформлена!');
    setEmail('');
  };

  const handleContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) {
      toast.error('Заполните все поля');
      return;
    }
    toast.success('Сообщение отправлено!');
    setContactName('');
    setContactEmail('');
    setContactMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-purple-100">
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-purple-100">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Notify</h1>
          <div className="hidden md:flex gap-8">
            <a href="#home" className="text-sm font-medium hover:text-primary transition-colors">Главная</a>
            <a href="#about" className="text-sm font-medium hover:text-primary transition-colors">О сервисе</a>
            <a href="#contact" className="text-sm font-medium hover:text-primary transition-colors">Контакты</a>
          </div>
        </div>
      </nav>

      <section id="home" className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-4xl text-center animate-fade-in">
          <h2 className="text-5xl md:text-7xl font-bold mb-6 text-gray-900">
            Будьте в курсе<br />всегда
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Получайте мгновенные уведомления о новом контенте и эксклюзивных предложениях
          </p>

          <Card className="max-w-md mx-auto p-8 shadow-2xl bg-white/90 backdrop-blur animate-scale-in">
            <form onSubmit={handleSubscribe} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email адрес</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
                <div className="flex items-center gap-3">
                  <Icon name="Bell" className="text-primary" size={20} />
                  <span className="text-sm font-medium">Push-уведомления</span>
                </div>
                <Switch checked={pushEnabled} onCheckedChange={setPushEnabled} />
              </div>

              <Button type="submit" size="lg" className="w-full h-12 text-base">
                Подписаться
              </Button>
            </form>
          </Card>
        </div>
      </section>

      <section id="about" className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-5xl">
          <h3 className="text-4xl font-bold text-center mb-16 text-gray-900">О сервисе</h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8 hover:shadow-xl transition-shadow bg-gradient-to-br from-purple-50 to-white">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-6">
                <Icon name="Mail" className="text-white" size={24} />
              </div>
              <h4 className="text-2xl font-bold mb-4 text-gray-900">Email уведомления</h4>
              <p className="text-gray-600 leading-relaxed">
                Получайте красиво оформленные письма о новых статьях, обновлениях и специальных предложениях прямо на вашу почту
              </p>
            </Card>

            <Card className="p-8 hover:shadow-xl transition-shadow bg-gradient-to-br from-purple-50 to-white">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-6">
                <Icon name="Smartphone" className="text-white" size={24} />
              </div>
              <h4 className="text-2xl font-bold mb-4 text-gray-900">Push-уведомления</h4>
              <p className="text-gray-600 leading-relaxed">
                Мгновенные уведомления на ваше устройство. Будьте первыми, кто узнает о важных событиях и новостях
              </p>
            </Card>

            <Card className="p-8 hover:shadow-xl transition-shadow bg-gradient-to-br from-purple-50 to-white">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-6">
                <Icon name="Settings" className="text-white" size={24} />
              </div>
              <h4 className="text-2xl font-bold mb-4 text-gray-900">Гибкие настройки</h4>
              <p className="text-gray-600 leading-relaxed">
                Выбирайте тип уведомлений и частоту их получения. Полный контроль над вашей подпиской
              </p>
            </Card>

            <Card className="p-8 hover:shadow-xl transition-shadow bg-gradient-to-br from-purple-50 to-white">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-6">
                <Icon name="Zap" className="text-white" size={24} />
              </div>
              <h4 className="text-2xl font-bold mb-4 text-gray-900">Мгновенная доставка</h4>
              <p className="text-gray-600 leading-relaxed">
                Технология real-time доставки гарантирует, что вы получите уведомление в течение нескольких секунд
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section id="contact" className="py-20 px-6 bg-gradient-to-br from-purple-50 to-white">
        <div className="container mx-auto max-w-2xl">
          <h3 className="text-4xl font-bold text-center mb-4 text-gray-900">Контакты</h3>
          <p className="text-center text-gray-600 mb-12">
            Есть вопросы? Напишите нам, и мы ответим в течение 24 часов
          </p>

          <Card className="p-8 shadow-xl bg-white">
            <form onSubmit={handleContact} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Имя</Label>
                <Input
                  id="name"
                  placeholder="Ваше имя"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-email">Email</Label>
                <Input
                  id="contact-email"
                  type="email"
                  placeholder="your@email.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Сообщение</Label>
                <Textarea
                  id="message"
                  placeholder="Ваше сообщение..."
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  className="min-h-32 resize-none"
                />
              </div>

              <Button type="submit" size="lg" className="w-full h-12">
                Отправить
              </Button>
            </form>
          </Card>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h4 className="text-2xl font-bold mb-2">Notify</h4>
              <p className="text-gray-400">Будьте в курсе всегда</p>
            </div>
            
            <div className="flex gap-6">
              <a href="#home" className="text-gray-400 hover:text-white transition-colors">Главная</a>
              <a href="#about" className="text-gray-400 hover:text-white transition-colors">О сервисе</a>
              <a href="#contact" className="text-gray-400 hover:text-white transition-colors">Контакты</a>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
            © 2026 Notify. Все права защищены
          </div>
        </div>
      </footer>
    </div>
  );
}
