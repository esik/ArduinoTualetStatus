#include <SPI.h>
#include <Ethernet.h>

/*Настройки подключения*/

byte mac[] = { 0x90, 0xA2, 0xDA, 0x0D, 0x85, 0xD9 };    // mac
byte ip[] = { 192, 168, 0, 105 };                       // ip 
byte subnet[] = { 255, 255, 255, 0 };                   // Маска
byte gateway[] = { 192, 168, 0, 1 };                    // Шлюз
EthernetServer server(80);                              // Порт


void setup()
{
  Ethernet.begin(mac,ip,gateway,subnet);    // Инициалзация Ethernet 
  server.begin();                           // Прослушивание клиентов
  pinMode(8, INPUT);                        // Входной вывод для кнопки
}

void loop()
{
  EthernetClient client = server.available();    // Поиск клиента

/*Послать заголовок http ответа*/

  client.println("HTTP/1.1 200 OK");
  client.println("Content-Type: text/html");
  client.println("Connnection: close");
  client.println();

/*Web-страница, которая будет послана клиенту*/

  client.println("<!DOCTYPE html>");  
  client.println("<html>");
  client.println("<head>");
  client.println("<title>Tualet Status</title>");
  client.println("<meta http-equiv=\"refresh\" content=\"1\">");    //Обновления страницы каждую секунду
  client.println("<style>");
  client.println("#centerLayer {");
  client.println("position: absolute;"); 
  client.println("width: 280px;"); 
  client.println("height: 180px;"); 
  client.println("left: 50%;"); 
  client.println("top: 50%;"); 
  client.println("margin-left: -150px;"); 
  client.println("margin-top: -100px;"); 
  client.println("text-align: center;");
  client.println("overflow: auto;"); 
  client.println("</style>");  
  client.println("</head>");
  client.println("<body>"); 
  client.println("<div id='centerLayer'>");
  client.print("<h1>Tualet closed?</h1>");

  if (digitalRead(8))
  {
    client.println("<h2>YES</h2>");
  }
  else
  {
    client.println("<h2>NO</h2>");
  }

  client.println("</div>");
  client.println("</body>");
  client.println("</html>");

  delay(1);              // Время,приема данных

  client.stop();        //Останавливаем клиента,чтобы при следующем запуске цикла искать соединение EthernetClient client = server.available();

}
